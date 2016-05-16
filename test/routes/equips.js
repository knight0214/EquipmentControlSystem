var express = require('express');
var router = express.Router();

// xss过滤模块
var xss = require('xss');

// jwt验证模块
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');

// 邮件模块
var nodemailer = require('nodemailer');
var mainEmail = require('../config/mainEmail');
// 开启链接池
var smtpTransport = nodemailer.createTransport("SMTP", mainEmail);

// token验证
router.use(function(req, res, next) {
    var token = req.headers['usertoken'];
    if (token) {
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return res.json({
                    result: 'failed',
                    msg: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            result: 'failed',
            msg: 'No token provided.'
        });

    }
});

/* GET equips listing. */

// 设备查询
router.get('/all', function(req, res, next) {
    req.models.Equips.find({}, ["eid", "A"], function(err, equips) {
        if (err) throw err;
        res.type('json');
        res.send(equips);
    });

});

var getCount = function(req, res, next) {
    var condition = {};
    var type = xss(req.body.type);
    if (type === 'allEquips' || '') {
        condition.find = {};
        condition.sorting = ['eid', 'A'];
    }
    if (type === 'borrow') {
        condition.find = {
            estate: "已借出"
        };
        condition.sorting = ['uname', 'A'];

    }
    if (type === 'canUse') {
        condition.find = {
            estate: "可使用"
        };
        condition.sorting = ['eid', 'A'];
    }
    if (type === 'borrowByUser') {
        var user = xss(req.body.user);
        condition.find = {
            uname: user
        };
        condition.sorting = ['eid', 'A'];
    }
    req.models.Equips.find(condition.find, condition.sorting, function(err, equips) {
        if (err) throw err;
        req.allEquips = equips;
        req.condition = condition;
        next();
    });
}

var getBypage = function(req, res, next) {
    var pageIndex = parseFloat(xss(req.body.pageIndex));
    var pageSize = parseFloat(xss(req.body.pageSize));
    var equipList = {};
    equipList.counter = req.allEquips.length;
    var condition = req.condition;
    req.models.Equips.find(condition.find, {
        offset: (pageIndex - 1) * pageSize
    }, condition.sorting, pageSize, function(err, equips) {
        if (err) throw err;
        equipList.thems = equips;
        res.send(equipList);
    });

}

router.post('/allEquips', getCount, getBypage);

// 查询单个设备
router.post('/eid', function(req, res, next) {
    req.models.Equips.find({
        eid: xss(req.body.eid)
    }, function(err, equip) {
        if (err) throw err;
        res.send(equip);
    });
});
// 查询可用设备
router.post('/canUse', getCount, getBypage);

// 查询已借出设备

router.post('/borrow', getCount, getBypage);

// 查询用户所借设备
router.post('/borrowByUser', getCount, getBypage);

// 查询可使用的设备
router.get('/canUse', function(req, res, next) {
    req.models.Equips.find({
        estate: "可使用"
    }, ["eid", "A"], function(err, equips) {
        if (err) throw err;
        res.type('json');
        res.send(equips);
    });

});
// 设备状态判断
var statusCheck = function(req, res, next) {
    var estate = xss(req.body.estate);
    var borrowDate = xss(req.body.borrowDate);
    var dueDate = xss(req.body.dueDate);
    var uname = xss(req.body.uname);
    if (estate == '已借出' && (borrowDate == '' || dueDate == '' || uname == '')) {
        res.send({
            result: 'failed',
            msg: '状态设定有误，请重试'
        });
    } else {
        next();
    }
};
// 设备日期判断
var dateCheck = function(req, res, next) {
    var borrowDate = xss(req.body.borrowDate);
    var dueDate = xss(req.body.dueDate);
    var dateDur = new Date(dueDate) - new Date(borrowDate);
    if ((borrowDate != '' && dueDate != '') && (dateDur <= 0)) {
        res.send({
            result: 'failed',
            msg: '日期设置错误，请重试'
        });
    } else {
        next();
    }
}

// 添加设备

router.post('/addEquip', statusCheck, dateCheck, function(req, res, next) {
    var eid = xss(req.body.eid);
    var etype = xss(req.body.etype);
    var ename = xss(req.body.ename);
    var estate = xss(req.body.estate);
    var borrowDate = xss(req.body.borrowDate);
    var dueDate = xss(req.body.dueDate);
    var uname = xss(req.body.uname);
    if (eid == '' || etype == '' || ename == '' || estate == '') {
        res.status(403).send({
            result: 'failed',
            msg: '添加失败，请重试'
        });
    } else {
        req.models.Equips.create([{
            eid: eid,
            etype: etype,
            ename: ename,
            estate: estate,
            borrowDate: borrowDate,
            dueDate: dueDate,
            uname: uname

        }], function(err, data) {
            if (err) throw err;
            res.send({
                result: 'success',
                msg: '添加成功'
            });
        });
    }


});
// 修改设备

router.post('/updateEquip', statusCheck, dateCheck, function(req, res, next) {
    var EquipsList = req.models.Equips;
    var id = xss(req.body.id);
    var eid = xss(req.body.eid);
    var etype = xss(req.body.etype);
    var ename = xss(req.body.ename);
    var estate = xss(req.body.estate);
    var borrowDate = xss(req.body.borrowDate);
    var dueDate = xss(req.body.dueDate);
    var uname = xss(req.body.uname);
    if (eid == '' || etype == '' || ename == '' || estate == '') {
        res.status(403).send({
            result: 'failed',
            msg: '更新失败，请重试'
        });
    } else {
        EquipsList.get(id, function(err, Equip) {
            Equip.save({
                eid: eid,
                etype: etype,
                ename: ename,
                estate: estate,
                borrowDate: borrowDate,
                dueDate: dueDate,
                uname: uname
            }, function(err) {
                if (err) throw err;
                res.send({
                    result: 'success',
                    msg: '修改成功'
                });
            });
        });

    }

});
// 删除设备

router.post('/deleEquip', function(req, res, next) {
    var eid = xss(req.body.eid);
    var estate = xss(req.body.estate);
    if (eid == '') {
        res.status(403).send({
            result: 'failed',
            msg: '删除失败，请重试'
        });
    } else if (estate == '已借出') {
        res.send({
            result: 'failed',
            msg: '已借出的设备无法直接删除，请设定归还后再执行删除！！'
        });
    } else {
        req.models.Equips.find({
            eid: eid
        }).
        remove(function(err) {
            if (err) throw err;
            res.send({
                result: 'success',
                msg: '删除设备成功'
            });
        });
    }
});
// 设备借出

router.post('/borrowEquip', dateCheck, function(req, res, next) {
    var id = xss(req.body.id);
    var uname = xss(req.body.uname);
    var borrowDate = xss(req.body.borrowDate);
    var dueDate = xss(req.body.dueDate);
    if (id == '' || uname == '' || borrowDate == '' || dueDate == '') {
        res.status(403).send({
            result: 'failed',
            msg: '操作失败'
        });
    } else {
        req.models.Equips.get(id, function(err, Equip) {
            Equip.save({
                estate: '已借出',
                uname: uname,
                borrowDate: borrowDate,
                dueDate: dueDate
            }, function(err) {
                if (err) throw err;
                res.send({
                    result: 'success',
                    msg: '操作成功'
                });
            });
        });
    }
});

// 通知归还
router.post('/emailToReturn', function(req, res, next) {
    var uname = xss(req.body.uname);
    var uemail = xss(req.body.uemail);
    var eid = xss(req.body.eid);
    var ename = xss(req.body.ename);
    if (uname == '' || uemail == '') {
        res.status(403).send({
            result: 'failed',
            msg: '发送失败'
        });
    } else {
        var mail = {
            from: "某某科技有限公司<249649056@qq.com>",
            to: uemail,
            subject: "关于公司研发设备归还事宜",
            html: uname + "你好！" + "<br/>你所借设备<br/>" + "编号:" + eid + "<br/>设备:" + ename + "<br/>现已到期！请尽快归还！"
        };
        smtpTransport.sendMail(mail, function(err) {
            if (err) {
                console.log(err);
                res.send({
                    result:'failed',
                    msg:'发送失败，邮件格式设置有误！'
                });
            } else {
                res.send({
                    result: 'success',
                    msg: '发送成功',
                });
            }

            smtpTransport.close(); // 如果没用，关闭连接池
        });
    }
});

// 设备归还

// 归还所有设备
router.post('/returnAllEquip', function(req, res, next) {
    var uname = xss(req.body.uname);
    if (uname == '') {
        res.status(403).send({
            result: 'failed',
            msg: '操作失败'
        });
    } else {
        req.models.Equips.find({
            uname: uname
        }).
        each(function(equip) {
            equip.estate = "可使用";
            equip.uname = '';
            equip.borrowDate = '';
            equip.dueDate = '';
        }).
        save(function(err) {
            if (err) throw err;
            res.send({
                result: 'success',
                msg: '用户' + uname + '所借所有设备归还已确认'
            });
        });
    }
});


// 归还单个设备
router.post('/returnEquip', function(req, res, next) {
    var id = xss(req.body.id);
    var eid = xss(req.body.eid);
    var uname = xss(req.body.uname);
    if (id == '' || eid == '' || uname == '') {
        res.status(403).send({
            result: 'failed',
            msg: '操作失败'
        });
    } else {
        req.models.Equips.get(id, function(err, Equip) {
            Equip.save({
                estate: '可使用',
                borrowDate: '',
                dueDate: '',
                uname: ''
            }, function(err) {
                if (err) throw err;
                res.send({
                    result: 'success',
                    msg: '用户' + uname + '所借设备' + eid + '归还已确认'
                });
            });
        });
    }
});

module.exports = router;
