import '../style/index.scss';

// 使用jQuery
import $ from 'jquery';

$(function(){
    $("#indexContainer").html('这是我的第一个页面');
});

var base = require('base-extend-backbone');

var ItemView = Backbone.View.extend({
  tagName: 'li'
});

var BodyView = Backbone.View.extend({
  el: 'body'
});

var item = new ItemView();
var body = new BodyView();

console.log(item.el);
console.log(body.el);

