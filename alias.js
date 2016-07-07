/**
 * Created by xiangwenwen on 16/4/13.
 * 通用模块,别名定义
 */

var path = require('path');
var containerPath = path.resolve('./');

//  别名列表
var alias = {
  tplEng: path.resolve(containerPath,'./app/link/artTemplate/dist/template'),
};

module.exports = alias;