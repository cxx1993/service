/**
 * 事件分类 控制模块
 * 增删改查
 * @author：chenxin
 */

const mongoose = require('mongoose');
const Users = require('../models/users.m');
const response = require('./module/response');
const static = require('./module/static');
const until = require('../untils/common');

// 增加一条记录
// 未进行查重
exports.add = function(req, res, next) {
  const users = new Users(req.body);

  users
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
  Users.findByIdAndRemove(id)
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
  // 传入字段ids检测
  // try {
  //   let { ids } = req.body;
  //   if (until.isEmpty(ids)) {
  //     throw 'ids不能为空';
  //   }
  //   // console.log("======")
  //   // console.log(ids)
  //   const idsArr = JSON.parse(ids); // ids不符合要求
  //   // console.log(idsArr)
  // } catch (err) {
  //   res.json(
  //     response.error({
  //       message: 'ids不符合要求'
  //     })
  //   );
  // }

  const idsArr = JSON.parse(req.body.ids);

  // new Promise((resolve, reject) => {
  // https://cnodejs.org/topic/56af666a24b0c1ec628ff13f
  Users.remove({ _id: { $in: idsArr } })
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
          payload: { message: err || '删除失败!' },
          tk: { api_tk: req.api_tk }
        })
      );
    });

  // })
  // .then(data => {
  // res.json(
  //   response.success({
  //     message: data || '删除成功！'
  //   })
  // );
  // })
  // .catch(err => {
  //   res.json(
  //     response.error({
  //       message: err || '删除失败！'
  //     })
  //   );
  // });
};

// 修改一条记录 by ID
exports.update = function(req, res, next) {
  const id = req.params.id;
  Users.findByIdAndUpdate(id, { $set: req.body })
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
exports.findById = function(req, res, next) {
  Users.findById(req.params.id)
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

// 查找单条记录 by params
// 如：传入{username:value}，用于检测用户名是否存在
exports.findOne = function(req, res, next) {
  Users.findOne(req.body)
    .then(data => {
      if (data === null) {
        throw '数据不存在！';
      }
      res.json(
        response.success({
          payload: { result: data },
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

// 查找多条数据 by username 模糊匹配
exports.findByName = function(req, res, next) {
  let query = {};
  const { username } = req.body;
  if (username) {
    query.username = new RegExp(username); //模糊查询参数
  }

  Users.find(query, { username: 1, _id: 1 })
    .then(data => {
      // 处理data为前端需要的返回模型
      // [{text:"",value:""},...]
      let result = [];
      // console.log(data)
      for (item of data) {
        result.push({
          text: item.username,
          value: item._id
        });
      }

      let rt = {
        result
      };
      if (data === null) {
        rt = { ...rt, message: '数据不存在！' };
      }

      res.json(
        response.success({
          payload: rt,
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
  const { sdate, edate } = query;
  let qst = {};

  // 时间查询
  if (query && sdate && edate) {
    qst = {
      $and: [{ createDate: { $gt: sdate } }, { createDate: { $lt: edate } }]
    };
  }

  Users.paginate(qst, options)
    .then(data => {
      res.json(
        response.success({
          payload: { result: data },
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
