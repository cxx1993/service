/**
 * 公共方法
 * @author:chenxin
 */

// 取本机local的ip
const getIPAdress = function() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
};

exports.global = {
  IP: getIPAdress(), // 本机ip
  port: process.env.PORT || 3000, // 端口号
  timeout: 60 * 60 * 0.5    //token过期时间
};
