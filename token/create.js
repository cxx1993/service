/**
 * 生成token
 * @author：chenxin
 */

const jwt = require('jsonwebtoken');

const overTime = require('../untils/global').global.timeout;

exports.create = function(data = {}, secret = 'secret') {
  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + overTime,
      data
    },
    secret
  );
  return token;
};
