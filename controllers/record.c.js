/**
 * 记录控制模块
 * 增删改查
 * @author：chenxin
 */

const mongoose = require('mongoose');
const Record = require('../models/record.m');
const Users = require('../models/users.m.js');
const Classify = require('../models/classify.m');
const response = require('./module/response');
const static = require('./module/static');
var async = require('async');

// 增加一条记录
exports.add = function(req, res, next) {
  const record = new Record(req.body);
  record
    .save()
    .then(function(data) {
      res.json(
        response.success({
          payload: { message: '新增成功!', result: data },
          tk: { api_tk: req.api_tk }
        })
      );
    })
    .catch(function(err) {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
    });
};

// 删除一条记录 by ID
// BUG:找不到数据的时候 err也是null
exports.delete = function(req, res, next) {
  const id = req.params.id;
  Record.findByIdAndRemove(id)
    .then(data => {
      if (data === null) {
        throw '该数据不存在！';
      }

      res.json(
        response.success({
          payload: { message: '删除成功！!', result: data },
          tk: { api_tk: req.api_tk }
        })
      );
    })
    .catch(err => {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
    });
};

// 删除多条数据 by IDArr
exports.deletes = function(req, res, next) {
  // https://cnodejs.org/topic/56af666a24b0c1ec628ff13f
  // const ids = JSON.parse(req.body.ids)
  // Record.remove({"_id",ids})
  const idsArr = JSON.parse(req.body.ids);
  Record.remove({ _id: { $in: idsArr } })
    .then(data => {
      if (data === null) {
        // reject('该数据不存在！');
        throw '该数据不存在！';
      }

      // resolve();
      res.json(
        response.success({
          payload: { message: '删除成功!', result: data },
          tk: { api_tk: req.api_tk }
        })
      );
    })
    .catch(err => {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
    });
};

// 修改一条记录 by ID
exports.update = function(req, res, next) {
  const id = req.params.id;
  Record.findByIdAndUpdate(id, { $set: req.body })
    .then(data => {
      if (data === null) {
        throw '该数据不存在！';
      }

      res.json(
        response.success({
          payload: { message: '修改成功!', result: data },
          tk: { api_tk: req.api_tk }
        })
      );
    })
    .catch(err => {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
    });
};

// 查找单条记录 by ID
exports.find = function(req, res, next) {
  Record.findById(req.params.id)
    .then(data => {
      if (data === null) {
        throw '该数据不存在！';
      }

      res.json(
        response.success({
          payload: { message: '查找成功!', result: data },
          tk: { api_tk: req.api_tk }
        })
      );
    })
    .catch(err => {
      res.json(
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        })
      );
    });
};

// 查找符合条件的list
// collection的对应字段查询 传入query中
// collection的原有的分页查询(page/size/limit...) 传入options中
exports.list = function(req, res, next) {
  const { query } = req.body;
  const options = { ...static.options, ...req.body.options };
  const { sdate, edate } = query || {};
  let qst = {};

  // 时间查询
  if (query && sdate && edate) {
    qst = {
      $and: [{ createDate: { $gt: sdate } }, { createDate: { $lt: edate } }]
    };
  }

  let originalData;
  let originalDoc = [];

  Record.paginate(qst, options).then(data => {
    // res.json(data.docs);
    // .populate({ path: 'classifyId', select: { name: 1, stName: 1, _id: 0 } })
    //   .populate({ path: 'userId', select: { username: 1, _id: 0 } })
    //   .then(result => {
    //     res.json(results);
    //   });

    originalData = data;
    originalDoc = Object.assign([], data.docs);
    userFind();
  });

  // 拼接查找user的fun
  function userFind() {
    let userAsyncFn = [];
    for (let i = 0, len = originalDoc.length; i < len; i++) {
      const { userId } = originalDoc[i];
      userAsyncFn.push(callback => {
        Users.findById(userId, function(err, data) {
          callback(err, data.username);
        });
      });
    }

    // 找到对应用户名
    async.parallel(userAsyncFn, function(err, results) {
      if (err) {
        // todo 失败
        response.fail({
          payload: { message: err },
          tk: { api_tk: req.api_tk }
        });
      }

      // 该字段username添加进doc
      for (let i = 0, len = originalDoc.length; i < len; i++) {
        // console.log('=====start=======');
        let temp = Object.assign({}, originalDoc[i]);
        originalDoc[i] = Object.assign({ username: results[i] }, temp._doc);
        // console.log(originalDoc[i]);
        // console.log('=====end=======');
      }

      classifyFind();
    });
  }

  function classifyFind() {
    let classifyAsyncFn = [];
    for (let i = 0, len = originalDoc.length; i < len; i++) {
      const { classifyId } = originalDoc[i];
      classifyAsyncFn.push(callback => {
        Classify.findById(classifyId, function(err, data) {
          callback(err, data);
        });
      });
    }

    // 找到对应图标名
    async.parallel(classifyAsyncFn, function(err, results) {
      if (err) {
        // todo 失败
        res.json(
          response.fail({
            payload: { message: err },
            tk: { api_tk: req.api_tk }
          })
        );
      }

      // 该字段classifyName,stName添加进doc
      for (let i = 0, len = originalDoc.length; i < len; i++) {
        originalDoc[i] = Object.assign(
          {
            classifyName: results[i].name,
            stName: results[i].stName
          },
          originalDoc[i]
        );
      }

      res.json(
        response.success({
          payload: { result: { ...originalData, ...{ docs: originalDoc } } },
          tk: { api_tk: req.api_tk }
        })
      );
    });
  }
};
