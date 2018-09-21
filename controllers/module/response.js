/**
 * @author:chenxin
 * 请求响应封装
 * 如果返回tk ：0，那么证明前端传来的token有问题，需要重新登录
 */

const $tk_create = require('../../token/create'); // token

// 默认成功值
const succeed = {
  code: 200,
  isSuccess: true,
  message: '',
  result: {}
};

// 默认失败值
const failed = {
  code: 200,
  isSuccess: false,
  message: {},
  result: {}
};

// 默认错误
const errored = {
  code: 500,
  isSuccess: false,
  message: {},
  result: {}
};

// tk:{isRequired:,api_tk:}
// 默认返回新生成的token，除非调用时传入的tk.isRequired指定传入0
// eg: response.success({
//       payload: { result: data },
//       tk: { api_tk: req.api_tk }
//     })
exports.success = function(param) {
  const { payload, tk } = param;
  let token;
  // if (tk) {
  //   const { isRequired, api_tk } = tk;
  //   if (isRequired !== 0 && api_tk) {
  //     token = $tk_create.create(api_tk);
  //     return { ...succeed, ...payload, ...{ token: token } };
  //   }
  // }

  return { ...succeed, ...payload };
};

exports.fail = function(param) {
  const { payload, tk } = param;
  let token;
  // if (tk) {
  //   const { isRequired, api_tk } = tk;
  //   if (isRequired !== 0 && api_tk) {
  //     token = $tk_create.create(api_tk);
  //     return { ...succeed, ...payload, ...{ token: token } };
  //   }
  // }

  return { ...failed, ...payload };
};

exports.error = function(param) {
  const { payload } = param;
  return { ...errored, ...payload };
};
