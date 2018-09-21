/**
 * 文件上传
 * @author:chenxin
 * ❗️/uploadFile 该级目录应该存在
 */

var express = require('express');
var router = express.Router();
var { global } = require('../untils/global');
var $tkCheck = require('../token/check.js');

//文件上传引用模块
var formidable = require('formidable'),
  http = require('http'),
  util = require('util');
var fs = require('fs');

//上传文件
router.post('/file', $tkCheck, function(req, res, next) {
  //上传文件
  var upFolder = 'public/uploadFile/file'; //存放目录

  // var singleDirPath = cacheFolder;
  //new Date().getTime()+Math.round(Math.random()*1000);
  //文件夹是否存在
  if (!fs.existsSync(upFolder)) {
    fs.mkdirSync(upFolder);
  }

  var form = new formidable.IncomingForm(); //创建上传表单
  form.encoding = 'utf-8'; //设置编辑
  form.uploadDir = upFolder; //设置上传目录
  form.keepExtensions = true; //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
  form.type = true;
  var displayUrl;

  form.parse(req, function(err, fields, files) {
    if (err) {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
      return;
    }

    displayUrl = files.file.path; //vue项目就不需要../../backend/ & public
    displayUrl = displayUrl.replace('public/', '');

    // 上传文件不需要重命名，上传文件的插件已经弄好了新的文件名，不会重名了
    // 而且没有swich类型，无法加后缀，所以不改
    //fs.renameSync(files.filename.path, newPath); //重命名

    // console.log(files.filename)
    res.json(
      response.success({
        payload: {
          result: {
            code: '0', // 状态码，0 代表成功
            imgURL: `http://${global.IP}:${global.port}/${[displayUrl]}` // 图片预览地址
          }
        },
        tk: { api_tk: req.api_tk }
      })
    );
  });
});

//上传图片
router.post('/image', $tkCheck, function(req, res, next) {
  var imgUpFolder = 'public/uploadFile/images'; //中间文件
  // var singleDirPath = cacheFolder;
  //new Date().getTime()+Math.round(Math.random()*1000);
  //文件夹是否存在

  if (!fs.existsSync(imgUpFolder)) {
    fs.mkdirSync(imgUpFolder);
  }

  var form = new formidable.IncomingForm(); //创建上传表单
  form.encoding = 'utf-8'; //设置编辑
  form.uploadDir = imgUpFolder; //设置上传目录
  form.keepExtensions = true; //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
  form.type = true;
  var displayUrl;

  form.parse(req, function(err, fields, files) {
    if (err) {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
      return;
    }
    var extName = ''; //后缀名
    switch (files.file.type) {
      case 'image/pjpeg':
        extName = 'jpg';
        break;
      case 'image/jpeg':
        extName = 'jpg';
        break;
      case 'image/png':
        extName = 'png';
        break;
      case 'image/x-png':
        extName = 'png';
        break;
    }
    if (extName.length === 0) {
      res.send({
        code: 1,
        msg: '只支持png和jpg格式图片'
      });
      return;
    } else {
      var avatarName = '/' + Date.now() + '.' + extName;
      var newPath = form.uploadDir + avatarName;
      //   displayUrl = "../../backend/"+imgUpFolder + avatarName;
      displayUrl = imgUpFolder + avatarName; //vue项目就不需要../../backend/ & public
      displayUrl = displayUrl.replace('public/', '');

      fs.renameSync(files.file.path, newPath); //重命名

      res.json(
        response.success({
          payload: {
            result: {
              code: '0', // 状态码，0 代表成功
              imgURL: `http://${global.IP}:${global.port}/${[displayUrl]}` // 图片预览地址
            }
          },
          tk: { api_tk: req.api_tk }
        })
      );
    }
  });
});

module.exports = router;
