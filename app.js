var express = require('express');
var cheerio = require('cheerio');
var ep = require('eventproxy');
var async = require('async');
var superagent = require('superagent');

var app = express();

app.set('views','views');
app.set('view engine','jade');

app.get('/',function(req, res, next){
  superagent.get('http://daily.zhihu.com/')
  .end(function(err,sres){
    if(err){
      console.error(err);
    }

    var $ = cheerio.load(sres.text);
    var items = [];
    $('.box a').each(function(idx,element){
      var $element = $(element);
      items.push({
        title:$element.children(".title").text(),
        premage:$element.children(".preview-image").attr('src'),
        href:$element.attr('href')
      });
    });

    items.forEach(function(item){
      console.log(item);
    });

    res.render('index',{
      title : '知乎日报爬虫',
      items : items
    });
  });
});



app.listen(3000);

