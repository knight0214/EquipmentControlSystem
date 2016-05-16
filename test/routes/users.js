var express = require('express');
var router = express.Router();
var xss = require('xss');
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
/* GET news listing. */
// 检查用户名和密码是否正确
router.post('/userCheck', function(req, res, next) {
    var uname = xss(req.body.uname);
    var pwd = xss(req.body.pwd);
    if (uname == '' || pwd == '') {
        res.send({
            result: 'failed',
            msg: '请输入用户名和密码'
        });
    } else {
        req.models.Users.find({
            uname: uname
        }, function(err, user) {

            if (err) throw err;
            // res.charSet('utf-8');
            // 找不到该用户
            if (user == '') {
                res.send({
                    result: 'failed',
                    msg: '没有该用户'
                });
                // 用户密码输入错误
            } else if (pwd !== user[0].pwd) {
                console.log(user[0].pwd);
                res.send({
                    result: 'failed',
                    msg: '用户名或密码错误'
                });
                // 用户存在且密码正确
            } else if (pwd === user[0].pwd) {
                var token = jwt.sign(user, secret, {
                    expiresInMinutes: 1440
                });
                res.send({
                    result: 'success',
                    msg: '登录成功',
                    token: token,
                    admin: user[0].admin
                });
            }
        });

    }

});
// token 验证
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
// 用户权限验证
var unameCheck = function(req, res, next) {
    var uname = req.decoded[0].uname;
    req.models.Users.find({
        uname: uname
    }, function(err, user) {
        if (err) throw err;
        // 用户被删除
        if (user == '') {
            res.send({
                result: 'failed',
                msg: '没有该用户或该用户已被删除'
            });
            // 用户的权限被更改
        } else if (req.decoded[0].admin !== user[0].admin) {
            req.decoded[0].admin = user[0].admin;
            var token = jwt.sign(user, secret, {
                expiresInMinutes: 1440
            });
            req.token = token;
            next();
        } else {
            next();
        }
    });
};

router.get('/tokenCheck', unameCheck, function(req, res, next) {
    var isAdmin;
    (req.decoded[0].admin === '1') ? (isAdmin = true) : (isAdmin = false);
    res.send({
        result: 'success',
        admin: isAdmin,
        token: req.token
    });
});

// 用户登出
router.post('/logout', function(req, res, next) {
    var user = xss(req.body.user);
    if (user == '') {
        res.status(403).send({
            result: 'failed',
            msg: '登出失败'
        });
    } else {
        res.send({
            result: 'success',
            msg: '用户' + user + '登出成功'
        });
    }
});

// 查询所有用户
router.get('/all', function(req, res, next) {
    req.models.Users.find({}, ["uid", "Z"], function(err, users) {
        if (err) throw err;
        // res.charSet('utf-8');
        res.type('json');
        res.send(users);
    });

});

var getUserCount = function(req, res, next) {
    var condition = {};
    var type = xss(req.body.type);
    if (type === 'allUsers' || '') {
        condition.find = {};
        condition.sorting = ['uid', 'Z'];
    }

    req.models.Users.find(condition.find, condition.sorting, function(err, users) {
        if (err) throw err;
        req.allEquips = users;
        req.condition = condition;
        next();
    });
}

var getUserBypage = function(req, res, next) {
    var pageIndex = parseFloat(xss(req.body.pageIndex));
    var pageSize = parseFloat(xss(req.body.pageSize));
    console.log({
        pageIndex: pageIndex,
        pageSize: pageSize
    });
    var userList = {};
    userList.counter = req.allEquips.length;
    var condition = req.condition;
    req.models.Users.find(condition.find, {
        offset: (pageIndex - 1) * pageSize
    }, condition.sorting, pageSize, function(err, users) {
        if (err) throw err;
        userList.thems = users;
        res.send(userList);
    });

}
// 查询所有用户
router.post('/allUsers', getUserCount, getUserBypage);

// 查询单个用户
router.post('/uname', function(req, res, next) {
    req.models.Users.find({
        uname: xss(req.body.uname)
    }, function(err, user) {
        if (err) throw err;
        res.send(user);
    });
});

// 添加用户

router.post('/addUser',unameCheck,function(req, res, next) {
    var uname = xss(req.body.uname);
    var pwd = xss(req.body.pwd);
    var email = xss(req.body.email);
    var admin = xss(req.body.admin);
    if (uname == '' || pwd == '' || email == '') {
        res.status(403).send({
            result: 'failed',
            msg: '用户添加失败，请重试'
        });
    } else {
        req.models.Users.create([{
            uname: uname,
            pwd: pwd,
            email: email,
            admin: admin,

        }], function(err, data) {
            if (err) throw err;
            console.log({
                admin: admin
            });
            res.send({
                result: 'success',
                msg: '用户添加成功'
            });
        });
    }


});
// 修改用户

router.post('/updateUser', function(req, res, next) {
    var uid = xss(req.body.uid);
    var uname = xss(req.body.uname);
    var pwd = xss(req.body.pwd);
    var email = xss(req.body.email);
    var admin = xss(req.body.admin);
    if (uid == '' || uname == '' || pwd == '' || email == '') {
        res.status(403).send({
            result: 'failed',
            msg: '用户更新失败，请重试'
        });
    } else {
        req.models.Users.get(uid, function(err, user) {
            user.save({
                uname: uname,
                pwd: pwd,
                email: email,
                admin: admin,

            }, function(err) {
                if (err) throw err;
                res.send({
                    result: 'success',
                    msg: '用户修改成功'
                });
            });
        });
    }

});

// 用户设定

router.post('/setByUser', function(req, res, next) {
    var uid = xss(req.body.uid);
    var uname = xss(req.body.uname);
    var pwd = xss(req.body.pwd);
    var email = xss(req.body.email);
    if (uid == '' || uname == '' || pwd == '' || email == '') {
        res.status(403).send({
            result: 'failed',
            msg: '用户更新失败，请重试'
        });
    } else {
        req.models.Users.get(uid, function(err, user) {
            user.save({
                uname: uname,
                pwd: pwd,
                email: email,

            }, function(err) {
                if (err) throw err;
                res.send({
                    result: 'success',
                    msg: '用户信息修改成功'
                });
            });
        });
    }

});
// 删除用户
var borrowCheck = function(req, res, next) {
    var uname = xss(req.body.uname);
    var isBorrow = '';
    req.models.Equips.find({
        uname: uname
    }, function(err, equip) {
        if (err) throw err;
        console.log(equip.length);
        (equip.length > 0) ? (isBorrow = true) : (isBorrow = false);
        req.isBorrow = isBorrow;
        next();
    });

}

router.post('/deleUser', borrowCheck, function(req, res, next) {
    var uid = xss(req.body.uid);
    var isBorrow = req.isBorrow;
    if (uid == '') {
        res.status(403).send({
            result: 'failed',
            msg: '删除失败，请重试'
        });
    } else if (!isBorrow) {
        req.models.Users.find({
            uid: uid
        }).
        remove(function(err) {
            if (err) throw err;
            res.send({
                result: 'success',
                msg: '用户删除成功'
            });
        });
    } else {
        res.send({
            result: 'failed',
            msg: '该用户名下有借出设备，无法直接删除，请设定归还后再进行删除！！'
        });
    }
});

module.exports = router;
