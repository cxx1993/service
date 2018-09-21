/**
 * 用户 模型
 * @author：chenxin
 */

const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

const Users = new mongoose.Schema({
  username: {
    type: String // 用户名
  },
  password: {
    type: String, // 密码
    default: 123456
  },
  signature:{
    type: String, // 关联微信ID
  },
  gender: {
    type: Number, // 性别 0:女 1:男
    default: 1
  },
  mobile: {
    type: String // 联系方式
  },
  email: {
    type: String // 邮箱
  },
  city: {
    type: String // 所在城市
  },
  createDate: {
    // 注册日期
    type: Date,
    default: Date.now
  },
  desc: {
    type: String // 备注
  },
  role:{
    type: Number, // 角色 0：超级管理员 1：管理员 2：系统用户(不能登录manage)
    default: 2
  }
});

Users.plugin(mongoosePaginate);

module.exports = mongoose.model('users', Users);
