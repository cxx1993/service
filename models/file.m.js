/**
 * 上传文件管理模块 
 * collection：files
 * @author:chenxin
 */
const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
 
var schema = new mongoose.Schema({                                  //schema--数据模型概要
    mark: String,                                                   
    createDate: {                                                  //上传时间
        type: Date,  
        authorId:mongoose.Schema.ObjectId,                          
        default: Date.now  
    },
    url:String,     //文件上传的路径
    size: String,
    path: String,
    name: String,
    type: String,
});



schema.plugin(mongoosePaginate);
 
module.exports = mongoose.model('file',  schema); // 接口暴露
