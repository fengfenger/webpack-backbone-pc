var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var browser = require('browser-sync');

// 项目的根目录
var ROOT_PATH = path.resolve(__dirname);
// 入口js的文件夹
var APP_PATH = path.resolve(ROOT_PATH, 'app/src');
// 页面的入口文件夹
var WEB = path.resolve(ROOT_PATH, 'app/web');
// 压缩的build的文件夹
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

// 判断 是否是生产环境还是开发环境
const prodMode = process.env.NODE_ENV === 'production';

// 设置文件的根路径
const publicPath = 'http://localhost:8080/';

// 自定义插件
var rmdir = require('./rmdir');
var getEntry = require('./getEntry');
var compileConfig = require('./compile.config.json');
var compile = require('./compile.js');
compileConfig = compile(compileConfig);
var alias = require('./alias');

//  清理www目录
rmdir('build');

// 添加插件
const getPlugins = function() {
    const plugins = [];
    plugins.push(new ExtractTextPlugin('app/style/[contenthash:8].[name].css', {}));
    plugins.push(new webpack.optimize.CommonsChunkPlugin('common', 'common.js'));

    //  处理html
    var pages = getEntry('./app/web/*.jade');

    for (var chunkname in pages) {
        var conf = {
            filename: chunkname + '.html',
            template: pages[chunkname],
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: false
            },
            chunks: ['common', chunkname],
            hash: true,
            complieConfig: compileConfig
        }
        var titleC = compileConfig.title || {};
        var title = titleC[chunkname];
        if (title) {
            conf.title = title;
        }
        plugins.push(new HtmlwebpackPlugin(conf));
    }

    // 判断是否是生产环境
    if (prodMode) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false,
            },
        }));
        plugins.push(new webpack.optimize.OccurenceOrderPlugin());
        plugins.push(new webpack.NoErrorsPlugin());
        plugins.push(new webpack.BannerPlugin('yinyuetai'));
    }
    return plugins;
};



module.exports = {
    entry: {
        index: path.resolve(APP_PATH, 'index.js'),
    },
    output: {
        path: BUILD_PATH,
        filename: '[name].js',
        publicPath
    },
    resolve: {
        alias: alias,
        extensions: ['', '.js', '.css', '.scss', '.jade', '.png', '.jpg']
    },
    externals: {
        jquery: 'window.jQuery',
        backbone: 'window.Backbone',
        underscore: 'window._',
        webim: 'window.webim'
    },
    //启动dev source map，出错以后就会采用source-map的形式直接显示你出错代码的位置。
    devtool: 'eval-source-map',
    //enable dev server
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        //只要配置dev server map这个参数就可以了
        proxy: {
            '/api/*': {
                target: 'localhost:8080',
                secure: false
            }
        }
    },
    //babel重要的loader在这里
    module: {
        loaders: [{
            test: /\.(?:js|jsx)$/,
            include: APP_PATH,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                //添加两个presents 使用这两种presets处理js或者jsx文件
                presets: ['es2015']
            }
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('css!sass'),
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192',
        }, {
            test: /.jade$/,
            loader: 'jade-loader',
            exclude: /(node_modules)/
        }, {
            test: /\.html$/,
            loader: 'raw',
            exclude: /(node_modules)/
        }]
    },
    plugins: getPlugins()
}
