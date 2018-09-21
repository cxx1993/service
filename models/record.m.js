/**
 * 记录 模型
 * @author：chenxin
 */

const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

const ObjectId = mongoose.Schema.ObjectId;

const Record = new mongoose.Schema({
  content: {
    type: String // 内容
  },
  type: {
    type: Number, // 类型：0支出 1收入
    default: 0
  },
  balance: {
    type: Number
  },
  userId: {
    type: ObjectId, // 用户ID
    ref: 'users' // 映射到users表
  },
  classifyId: {
    type: ObjectId, // 事件分类ID(对应的小图标)
    ref: 'classify' // 映射classify表
  },
  createDate: {
    // 发表时间
    type: Date,
    default: Date.now
  },
  updateDate: {
    // 更新时间
    type: Date,
    default: Date.now
  }
});

Record.plugin(mongoosePaginate);

module.exports = mongoose.model('record', Record);
