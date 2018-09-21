/**
 * record 图标分析接口controller
 */

const mongoose = require('mongoose');
const Record = require('../models/record.m');
const Users = require('../models/users.m.js');
const Classify = require('../models/classify.m');
const response = require('./module/response');
const static = require('./module/static');
var async = require('async');
const _ = require('lodash');
const moment = require('moment');

// 图表分析
// 支出排行榜
// 注意传入数据的数据类型
exports.rank = function(req, res, next) {
  const { sdate, edate, type } = req.body;
  let match = {};
  if (type) {
    match.type = { $eq: type };
  }

  if (sdate && edate) {
    const newSdate = new Date(sdate);
    const newEdate = new Date(
      moment(edate)
        .endOf('day')
        .format()
    );

    match.createDate = {
      $gte: newSdate,
      $lt: newEdate
    };
  }

  // 聚合查询
  Record.aggregate([
    // { $project: { balance: 1, type: 1, classifyId: 1, createDate: 1 } },
    {
      $match: match
    },
    { $group: { _id: '$classifyId', count: { $sum: '$balance' } } },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: 'classifies',
        localField: '_id',
        foreignField: '_id',
        as: 'csfy'
      }
    },
    { $project: { name: '$csfy.name', stName: '$csfy.stName', count: 1 } }
  ])
    .then(obj => {
      // 由于lookup关联返回的可能是集合，所以name,stName是[],toString一下
      const objs = _.map(obj, function(v) {
        v.name = v.name.toString();
        v.stName = v.stName.toString();
        return v;
      });

      res.json(objs);
      // res.json(obj);
    })
    .catch(err => {
      res.json(err);
    });

  /*
  // 废弃不用，呜呜呜
  var o = {};
  // 筛选条件
  o.query = {
    type: { $eq: 0 }
  };

  o.map = function() {
    emit(this.classifyId, this.balance);
  };
  o.reduce = function(k, vals) {
    return vals.reduce((total, num) => {
      return total + num;
    });
  };

  // 根据 分类 筛选出每个分类累积的支出/收入值
  Record.mapReduce(o, function(err, { results, stats }) {
    // 根据values降序
    const ls = _.sortBy(results, function(item) {
      return -item.value;
    });

    res.json(ls)
  });
  

  // 关联查询user表和classify表
  Record.find({})
    .populate({ path: 'classifyId', select: { name: 1, stName: 1, _id: 0 } })
    .populate({ path: 'userId', select: { username: 1, _id: 0 } })
    .then(obj => {
      // res.json(obj);
    })
    .catch(err => {
      res.json(err);
    });
  */
};

// 图表分析
exports.analyze = function(req, res, next) {
  const type = Number(req.body.type) || 0; // 默认查询支出分类 0/1
  const { period } = req.body;
  let group = {
    count: { $sum: '$balance' },
    createDate: { $first: '$createDate' }
  };
  let createDate = {};
  let dateRange = {
    year: 2018,
    month: 9
  };

  try {
    switch (period) {
      case 'year':
        group._id = { $month: '$createDate' }; // 按年，返回该日期的月份部分
        dateToString = { format: '%m月', date: '$createDate' }; // 返回第x月
        break;
      case 'month':
        group._id = { $dayOfMonth: '$createDate' }; // 按月，返回该日期是这一个月的第几天
        dateToString = { format: '%m-%d', date: '$createDate' }; // 返回第x日
        break;
      case 'day':
        group._id = { $dayOfWeek: '$createDate' }; // 按年，返回的是这个周的星期几
        dateToString = { format: '周%w', date: '$createDate' }; // 返回第x周
        break;
      default:
        throw 'empty params';
        break;
    }

    Record.aggregate([
      { $match: { type: { $eq: type } } },
      {
        $group: group
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          createDate: {
            $dateToString: dateToString
          },
          count: 1,
          _id: 1 // 转换fn要用
        }
      }
    ]).then(result => {
      // 处理结果
      const rts = formatAnalyze(period, result, dateRange);
      res.json(rts);
      // res.json(result);
    });
  } catch (error) {
    res.json(error);
  }
};

/**
 *
 * @param {*} period 周期类型：year/month/day
 * @param {*} arr
 * @param {*} dateRange 时间范围：{year:xx, month:xx}
 */
function formatAnalyze(period, arr, dateRange) {
  // 时间范围
  const { year, month } = dateRange;
  // 返回的x轴y轴数据，x轴表示时间坐标，y轴表示累计值坐标
  let xAxis = [],
    yAxis = [];
  let formatAxis = []; //x轴默认
  if (!arr.length) {
    return;
  }
  let unit; // 返回的x轴单位

  // 记录月份的位置
  const arr_id = arr.map(v => {
    return v._id;
  });

  // 完整createDate
  switch (period) {
    case 'year':
      formatAxis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; //x轴默认
      unit = '月';
      break;
    case 'month':
      const fate = new Date(year, month, 0).getDate();
      for (let i = 1; i <= fate; i++) {
        formatAxis.push(i);
      }
      unit = '日';
      break;
    case 'day':
      formatAxis = [1, 2, 3, 4, 5, 6, 7]; // y轴默认
      unit = '周';
      break;
    default:
      break;
  }

  formatAxis.forEach((v, i) => {
    let index = arr_id.indexOf(v);
    if (index != -1) {
      yAxis.push(arr[index].count);
    } else {
      yAxis.push(0);
    }
    xAxis.push(formatAxis[i] + unit);
  });

  return { xAxis, yAxis };
}
