var express = require('express');
var router = express.Router();

var $tkCheck = require('../token/check.js');
var controller = require('../controllers/record.c');
var chart_controller = require('../controllers/record.chart.c');

/* GET record listing. */

// 全部都有$tkCheck，暂时去掉

// 增加
// 一条数据
router.post('/add', $tkCheck, controller.add);

// 删除
// 一条数据 by ID
router.delete('/delete/:id', $tkCheck, controller.delete);
// 多条数据
router.delete('/deletes', $tkCheck, controller.deletes);

// 修改
// 一条数据 by ID
router.put('/update/:id', $tkCheck, controller.update);

// 查
// 单条数据 by ID
router.get('/find/:id', $tkCheck, controller.find);
// 多条数据 by 查询条件
router.post('/list', $tkCheck, controller.list);


// 图表分析
// 排行榜
router.post('/rank', $tkCheck, chart_controller.rank);  
// 图表
router.post('/analyze', $tkCheck, chart_controller.analyze);

module.exports = router;
