var express = require('express');
var router = express.Router();
var $tkCheck = require('../token/check.js');
var controller = require('../controllers/classify.c');



// 增加
// 一条数据
router.post('/add', $tkCheck, controller.add);

// 删除
// 一条数据 by ID
router.delete('/delete/:id', $tkCheck, controller.delete);
// 多条数据
router.post('/deletes', $tkCheck, controller.deletes);

// 修改
// 一条数据 by ID
router.put('/update/:id', $tkCheck, controller.update);

// 查
// 单条数据 by ID
router.get('/find/:id', $tkCheck, controller.find);
// 多条数据 by name 模糊匹配
router.post('/find/name', $tkCheck, controller.findByName);
// 多条数据 by 查询条件
router.post('/list', $tkCheck, controller.list);

module.exports = router;
