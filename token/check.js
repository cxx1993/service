/*
 * 查询前检查token是否存在
 * @author：chenxin
 */

const jwt = require('jsonwebtoken'); //用来创建和确认用户信息摘要
const overTime = require('../untils/global').global.timeout;
const response = require('../controllers/module/response');

// 检查用户会话
module.exports = function(req, res, next) {
  // 检查post的信息或者url查询参数或者头信息
  var token =
    req.body.token || req.query.token || req.headers['x-access-token'];


  new Promise((resolve, reject) => {
    resolve()
    if (!token) {
      reject({ message: 'token未传入！', tk: 0 });
    }
    // 解析 token
    jwt.verify(token, 'secret', function(err, decoded) {
      if (err) {
        reject({ message: 'token信息错误或已过期!', tk: 0 });
      } else {
        // 检查是否过期
        let nowDate = new Date().getTime();
        if (decoded.exp - nowDate > overTime) {
          reject({ message: 'token超时，重新登录!', tk: 0 });
        }
        resolve(decoded);
      }
    });
  })
    .then(decoded => {
      // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
      // req.api_tk = decoded.data;
      next();
    })
    .catch(err => {
      res.json(
        response.fail({
          payload: err
        })
      );
    });
};
