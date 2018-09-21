/**
 * 事件类型 模型
 * @author：chenxin
 */

const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

const Classify = new mongoose.Schema({
  name: {
    type: String // 小图标名称
  },
  stName: {
    type: String // 样式名
  },
  imgSrc: {
    type: String // 图标位置  //暂时不用
  },
  createDate: {
    // 发表时间
    type: Date,
    default: Date.now
  },
  level: {
    type: Number, // 优先级
    default: 0
  },
  desc: {
    type: String // 备注
  },
  type: {
    // 记录类型，0-支出 1-收入
    type: Number,
    default: 0
  }
});

Classify.plugin(mongoosePaginate);

module.exports = mongoose.model('classify', Classify);
