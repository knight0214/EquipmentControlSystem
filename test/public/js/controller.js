var myControllers = angular.module('myControllers', ['ui.date', 'ngDialog', 'tm.pagination']);

// myControllers.config(function($httpProvider) {
//     $httpProvider.defaults.headers.common = { 'usertoken' : sessionStorage.getItem('userToken') }
// })

// 定义基本后台逻辑
myControllers.factory('BaseService', ['$http', function($http) {
    var headers = {
        headers: {
            'usertoken': sessionStorage.getItem('userToken')
        }
    };
    var list = function(ajaxUrl, postData) {
        return $http.post(ajaxUrl, postData, headers);
    }

    return {
        list: function(ajaxUrl, postData) {
            return list(ajaxUrl, postData);
        }
    }
}]);



// 定义基本处理逻辑
var baseDo = function(resq, $state, ngDialog, stateUrl) {
    alert(resq.msg);
    if (ngDialog) {
        ngDialog.close();
    }
    stateUrl ? $state.reload(stateUrl) : $state.reload();
};

var baseAjax = function(ajaxUrl, data, stateUrl, BaseService, $state, ngDialog) {

        var f = BaseService.list(ajaxUrl, data)
            .success(
                function(resq) {
                    baseDo(resq, $state, ngDialog, stateUrl);
                });
        return f;
    }
    // 定义ngDialog的基本类型
var CreatNgDialog = function(temp, scope, fn) {
    var o = {};
    o.template = temp;
    o.className = 'ngdialog-theme-plain';
    o.showClose = false;
    o.closeByDocument = false;
    o.scope = scope;
    o.controller = fn;
    return o;
}

//set controllers

// 登录控制
myControllers.controller('loginControl', function($scope, $http, $state) {
    $scope.uname = '';
    $scope.pwd = '';
    $scope.usersubmit = function() {
        if ($scope.uname == '' || $scope.pwd == '') {
            return false;
        } else {
            $http.post('/users/userCheck', {
                    uname: $scope.uname,
                    pwd: $scope.pwd
                })
                .success(function(resq) {
                    if (resq.result == 'failed') {
                        alert(resq.msg);
                        $state.reload();
                    } else if (resq.result == 'success') {
                        sessionStorage.setItem("userToken", resq.token);
                        sessionStorage.setItem("userName", $scope.uname);
                        (resq.admin === '1') ? $state.go('main'): $state.go('user');
                    }


                });
        }

    }
});

// 管理员登录
myControllers.controller('mainControl', function($scope, $http, BaseService, $state) {
    // 用户登出
    $scope.logout = function() {
        var ajaxUrl = '/users/logout';
        var postData = {
            user: sessionStorage.getItem('userName')
        };
        BaseService.list(ajaxUrl, postData).
        success(function(resq) {
            if (resq.result == 'success') {
                alert(resq.msg);
                sessionStorage.clear();
                $state.go('/');

            }
        })
    };
    // 权限判定
    $http.get('/users/tokenCheck', {
            headers: {
                'usertoken': sessionStorage.getItem('userToken')
            }
        })
        .success(function(resq) {
            if (resq.token) {
                sessionStorage.setItem("userToken", resq.token);
            }
            if (resq.result == 'failed') {
                $state.go('/');
                return;
            } else if (resq.result == 'success' && !resq.admin) {
                $state.go('user');
            } else {
                $scope.uname = sessionStorage.getItem("userName");
                $state.go('main.equipList');

            }
        });
});

// 设备管理列表
myControllers.controller('equipControl', function($scope, $http, $state, BaseService, ngDialog) {
    // 定义页面标题
    $scope.title = "设备信息管理";
    // 定义设备显示列表
    $scope.equipList = [];
    $scope.equip = {};
    // 定义用户列表
    $scope.userList = [];
    // 定义警告信息
    $scope.warnMsg = {
        etypeMsg: '',
        eidMsg: '',
        enameMsg: '',
        estateMsg: '',
        unameMsg:'',
        borrowDateMsg:'',
        dueDateMsg:''
    };
    // 定义ajax地址
    $scope.ajaxUrl = {
            addUrl: 'equips/addEquip',
            updateUrl: 'equips/updateEquip',
        }
    // 定义时间插件格式
    $scope.dateOptions = {
        dateFormat: 'yy-mm-dd',
    };
    // 定义分页插件参数
    $scope.paginationConf = {
        currentPage: 1,
        itemsPerPage: 15
    };
    var getEquipByPage = function() {
        var postData = {
            pageIndex: $scope.paginationConf.currentPage,
            pageSize: $scope.paginationConf.itemsPerPage,
            type: 'allEquips'
        };
        BaseService.list('equips/allEquips', postData)
            .success(function(resq) {
                console.log(resq);
                $scope.paginationConf.totalItems = resq.counter;
                $scope.equipList = resq.thems;
            })


    };

    $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', getEquipByPage);

    // 定义方法
    var stateUrl = 'main.equipList';
    var isEid = function(data) {
        var patrn = /^(dy|ty|gp|lum|pm)[0-9]{3}$/;
        (!patrn.exec(data)) ? (result = false) : (result = true);
        return result;
    };

    var fn = function($scope, $http, $state, ngDialog) {

        // 提交设备
        $scope.equipSubmit = function(equip, Url) {
                console.log(equip);
                if (equip.estate && equip.estate !== '已借出') {
                    equip.uname = '';
                    equip.borrowDate = '';
                    equip.dueDate = '';
                }
                if (!equip.etype) {
                    $scope.warnMsg.etypeMsg = '请选择设备类别';
                    return
                } else if (!equip.eid) {
                    $scope.warnMsg.eidMsg = '请输入设备编号';
                    return
                } else if (!isEid(equip.eid)) {
                    $scope.warnMsg.eidMsg = '设备编号填写错误,请遵循‘设备前缀’+‘三位数字’（如dy001）的写法';
                    return
                } else if (!equip.ename) {
                    $scope.warnMsg.enameMsg = '请输入设备名称';
                    return
                } else if (!equip.estate) {
                    $scope.warnMsg.estateMsg = '请选择设备状态';
                    return
                } else {
                    $scope.warnMsg.etypeMsg = '';
                    $scope.warnMsg.eidMsg = '';
                    $scope.warnMsg.enameMsg = '';
                    $scope.warnMsg.estateMsg = '';
                    baseAjax(Url, equip, stateUrl, BaseService, $state, ngDialog);
                }

            }
        //表单内容变更
        $scope.contentCheck = function() {
                if ($scope.equip.etype) {
                    $scope.warnMsg.etypeMsg = '';
                }
                if ($scope.equip.ename) {
                    $scope.warnMsg.enameMsg = '';
                }
                if ($scope.equip.estate) {
                    $scope.warnMsg.estateMsg = '';
                }
                if ($scope.equip.uname) {
                    $scope.warnMsg.unameMsg = '';
                }
                if ($scope.equip.borrowDate) {
                    $scope.warnMsg.borrowDateMsg = '';
                }
                if ($scope.equip.dueDate) {
                    $scope.warnMsg.dueDateMsg = '';
                }


            };
        // eid唯一性检查
        $scope.eidCheck = function() {
            BaseService.list('equips/eid', {
                    eid: $scope.equip.eid
                })
                .success(function(resq) {
                    console.log(resq);
                    (resq != '') ? ($scope.warnMsg.eidMsg = '此编号已使用!请重新输入') : ($scope.warnMsg.eidMsg = '');
                })
        };


        // 确认借出设备
        $scope.borrowTheEquip = function(equip) {
            if (!equip.uname) {
                $scope.warnMsg.unameMsg='请选择借出人';
            }else if(!equip.borrowDate){
                $scope.warnMsg.borrowDateMsg = '请选择借出日期';
            }else if (!equip.dueDate) {
                $scope.warnMsg.dueDateMsg = '请选择归还日期';
            }else{
                baseAjax('/equips/borrowEquip', equip, stateUrl, BaseService, $state, ngDialog);
            }
            
        };

        // 确认删除设备
        $scope.delTheEquip = function(equip) {
            baseAjax('equips/deleEquip', equip, stateUrl, BaseService, $state, ngDialog);
        };

        // 返回
        $scope.turnBack = function() {
            ngDialog.close();
            $state.reload('main.equipList');



        };
    };
    // 设备新增
    $scope.addEquip = function() {
        ngDialog.open(CreatNgDialog('temps/addEquip.html', $scope, fn));

    };

    // 设备编辑
    $scope.editEquip = function(equip) {
        $scope.equip = equip;
        if ($scope.equip.borrowDate != '' && $scope.equip.dueDate != '') {
            $scope.equip.borrowDate = new Date($scope.equip.borrowDate);
            $scope.equip.dueDate = new Date($scope.equip.dueDate);
        }
        ngDialog.open(CreatNgDialog('temps/editEquip.html', $scope, fn));
    };

    // 设备借出
    $scope.borrowEquip = function(equip) {
        $scope.equip = equip;
        ngDialog.open(CreatNgDialog('temps/borrowEquip.html', $scope, fn));
    };



    // 设备删除
    $scope.delEquip = function(equip) {
        $scope.equip = equip;
        ngDialog.open(CreatNgDialog('temps/delEquip.html', $scope, fn));
    };




    $http.get('/users/all', {
            headers: {
                'usertoken': sessionStorage.getItem('userToken')
            }

        })
        .success(function(resq) {
            console.log(resq);
            $scope.userList = resq;
        })

});





// 已借出设备管理
myControllers.controller('borrowControl', function($scope, $http, $state, BaseService, ngDialog) {
    $scope.title = '借出设备一览';
    $scope.equipList = [];
    $scope.equip = {};

    // 定义分页插件参数
    $scope.paginationConf = {
        currentPage: 1,
        itemsPerPage: 15
    };
    var getEquipByPage = function() {
        var postData = {
            pageIndex: $scope.paginationConf.currentPage,
            pageSize: $scope.paginationConf.itemsPerPage,
            type: 'borrow'
        };
        BaseService.list('/equips/allEquips', postData)
            .success(function(resq) {
                console.log(resq);
                $scope.paginationConf.totalItems = resq.counter;
                $scope.equipList = resq.thems;
            })


    };

    $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', getEquipByPage);

    // 定义方法
    var stateUrl = 'main.borrowList';
    var fn = function($scope, $http, $state, ngDialog) {
        // 确认通知归还
        $scope.emailTo = function(equip) {
            baseAjax('/equips/emailToReturn', equip, stateUrl, BaseService, $state, ngDialog);
        };
        // 确认归还单个设备
        $scope.returnTheEquip = function(equip) {
            baseAjax('/equips/returnEquip', equip, stateUrl, BaseService, $state, ngDialog);
        };
        // 确认归还所有设备
        $scope.returnAllEquip = function(equip) {
            baseAjax('/equips/returnAllEquip', equip, stateUrl, BaseService, $state, ngDialog);
        };
    };

    // 通知归还
    $scope.emailToReturn = function(equip) {
        $scope.equip = equip;
        BaseService.list('/users/uname', {
                uname: equip.uname
            })
            .success(function(resq) {
                $scope.equip.uemail = resq[0].email;
            });
        ngDialog.open(CreatNgDialog('temps/emailToReturn.html', $scope, fn));
    }

    // 设备归还 
    $scope.returnEquip = function(equip) {
        $scope.equip = equip;
        ngDialog.open(CreatNgDialog('temps/returnEquip.html', $scope, fn));
    };



});


// 用户管理
myControllers.controller('uListControl', function($scope, $http, BaseService, ngDialog, $state) {
    // 定义标题
    $scope.title = '用户信息管理';
    // 定义用户列表
    $scope.userList = [];
    $scope.user = {};
    // 定义警告信息
    $scope.warnMsg = {
        unameMsg: '',
        pwdMsg: '',
        emailMsg: '',
        adminMsg: ''
    };
    $scope.userCheck = sessionStorage.getItem('userName');

     // 定义ajax地址
    $scope.ajaxUrl = {
            addUrl: 'users/addUser',
            updateUrl: 'users/updateUser',
        }

    // 定义分页插件参数
    $scope.paginationConf = {
        currentPage: 1,
        itemsPerPage: 15
    };

    var getUserByPage = function() {
        var postData = {
            pageIndex: $scope.paginationConf.currentPage,
            pageSize: $scope.paginationConf.itemsPerPage,
            type: 'allUsers'
        };
        BaseService.list('/users/allUsers', postData)
            .success(function(resq) {
                console.log(resq);
                $scope.paginationConf.totalItems = resq.counter;
                $scope.userList = resq.thems;
            })


    };

    $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', getUserByPage);

    // 定义方法
    var stateUrl = 'main.userList';
    var fn = function($scope, $http, $state, ngDialog) {
        // 信息提交
        $scope.userSubmit = function(user,ajaxUrl) {
            console.log(user);
            if (!user.uname) {
                $scope.warnMsg.unameMsg = '请输入用户姓名';
                return
            }else if(!user.pwd){
                $scope.warnMsg.pwdMsg = '请输入用户密码';
                return
            }else if (!user.email){
                $scope.warnMsg.emailMsg = '请输入用户电子邮箱';
                return
            }else if(!user.admin){
                $scope.warnMsg.adminMsg = '请选择用户权限身份';
                return
            }else{
                $scope.warnMsg.unameMsg = '';
                $scope.warnMsg.pwdMsg = '';
                $scope.warnMsg.emailMsg = '';
                $scope.warnMsg.adminMsg = '';
                baseAjax(ajaxUrl, user, stateUrl, BaseService, $state, ngDialog);
            }
            
        };
        $scope.userUpdate = function(user) {
            console.log(user);
            baseAjax('users/updateUser', user, stateUrl, BaseService, $state, ngDialog);
        };
        $scope.userDelete = function(user) {
            console.log(user);
            baseAjax('users/deleUser', user, stateUrl, BaseService, $state, ngDialog);
        }
        $scope.turnBack = function() {
            ngDialog.close();
            $state.reload('main.userList');
        };
        
        //表单内容变更
        $scope.contentCheck = function() {
                if ($scope.user.pwd) {
                    $scope.warnMsg.pwdMsg = '';
                }
                if ($scope.user.email) {
                    $scope.warnMsg.emailMsg = '';
                }
                if ($scope.user.admin) {
                    $scope.warnMsg.adminMsg = '';
                }

            };

        // 用户名检查
        $scope.unameCheck = function() {
            console.log($scope.user.uname);
            BaseService.list('users/uname', {
                    uname: $scope.user.uname
                })
                .success(function(resq) {
                    console.log(resq);
                    (resq != '') ? ($scope.warnMsg.unameMsg = '此姓名已使用!请重新输入') : ($scope.warnMsg.unameMsg = '');
                })
        }
    };

    // 添加用户
    $scope.addUser = function() {
        // $scope.user ={};
        ngDialog.open(CreatNgDialog('temps/addUser.html', $scope, fn));

    };
    // 编辑用户
    $scope.updateUser = function(user) {
        $scope.user = user;
        ngDialog.open(CreatNgDialog('temps/updateUser.html', $scope, fn));
    };
    // 删除用户
    $scope.deleUser = function(user) {
        $scope.user = user;
        ngDialog.open(CreatNgDialog('temps/delUser.html', $scope, fn));
    }


});


// 一般用户登录
myControllers.controller('userControl', function($scope, $http, BaseService, $state) {
    // 用户登出
    $scope.logout = function() {
        var ajaxUrl = '/users/logout';
        var postData = {
            user: sessionStorage.getItem('userName')
        };
        BaseService.list(ajaxUrl, postData).
        success(function(resq) {
            if (resq.result == 'success') {
                alert(resq.msg);
                sessionStorage.clear();
                $state.go('/');

            }
        })
    };

    // 权限检查
    $http.get('/users/tokenCheck', {
            headers: {
                'usertoken': sessionStorage.getItem('userToken')
            }
        })
        .success(function(resq) {
            if (resq.token) {
                sessionStorage.setItem("userToken", resq.token);
            }
            if (resq.result == 'failed') {
                $state.go('/');
                return;
            } else if (resq.result == 'success' && resq.admin) {
                $state.go('main');
            } else {
                $scope.uname = sessionStorage.getItem("userName");
                $state.go('user.equipCanUse');

            }
        });
});

// 可用设备
myControllers.controller('equipCanUseControl', function($scope, $http, BaseService, ngDialog, $state) {
    $scope.title = '可用设备一览';
    $scope.equipList = [];
    // 定义分页插件参数
    $scope.paginationConf = {
        currentPage: 1,
        itemsPerPage: 15
    };

    var getEquipsByPage = function() {
        var postData = {
            pageIndex: $scope.paginationConf.currentPage,
            pageSize: $scope.paginationConf.itemsPerPage,
            type: 'canUse'
        };
        BaseService.list('/equips/canUse', postData)
            .success(function(resq) {
                console.log(resq);
                $scope.paginationConf.totalItems = resq.counter;
                $scope.equipList = resq.thems;
            })


    };

    $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', getEquipsByPage);

});

// 用户已借设备
myControllers.controller('equipByBorrowControl', function($scope, $http, BaseService, $state) {
    $scope.title = '用户已借设备';
    $scope.equipList = [];
    // 定义分页插件参数
    $scope.paginationConf = {
        currentPage: 1,
        itemsPerPage: 15
    };
    $scope.msgList = [];

    var getEquipsByPage = function() {
        var postData = {
            pageIndex: $scope.paginationConf.currentPage,
            pageSize: $scope.paginationConf.itemsPerPage,
            type: 'borrowByUser',
            user: sessionStorage.getItem('userName')
        };
        BaseService.list('/equips/borrowByUser', postData)
            .success(function(resq) {
                console.log(resq);
                $scope.paginationConf.totalItems = resq.counter;
                $scope.equipList = resq.thems;
                for (var i in $scope.equipList) {
                    var today = new Date;
                    (today - new Date($scope.equipList[i].dueDate) >= 0) ? ($scope.msgList[i] = {
                        msg: '该设备已到期,请尽快归还'
                    }) : ($scope.msgList[i] = {
                        msg: ''
                    });
                }

            })


    };

    $scope.$watch('paginationConf.currentPage + paginationConf.itemsPerPage', getEquipsByPage);

});

// 用户设置
myControllers.controller('userSetControl', function($scope, $http, BaseService, ngDialog, $state) {
    $scope.title = '用户设置';
    $scope.equipList = [];
    $scope.user = {};
     // 定义警告信息
    $scope.warnMsg = {
        pwdMsg: '',
        emailMsg: ''
    };
    var postData = {
        uname: sessionStorage.getItem('userName')
    };
    BaseService.list('users/uname', postData)
        .success(function(resq) {
            console.log(resq);
            $scope.user = resq[0];
        });
    var stateUrl = 'main.userList';
    var fn = function($scope, $http, $state, ngDialog) {
        $scope.userUpdate = function(user) {
            console.log(user);
            if (!user.pwd) {
                $scope.warnMsg.pwdMsg='请输入用户密码';
                return
            }else if (!user.email) {
                $scope.warnMsg.emailMsg='请输入用户电子邮箱';
            }else{
               baseAjax('users/setByUser', user, stateUrl, BaseService, $state, ngDialog); 
            }
            
        };
        $scope.turnBack = function() {
            ngDialog.close();
            $state.reload('user.userSet');
        };
        //表单内容变更
        $scope.contentCheck = function() {
                if ($scope.user.pwd) {
                    $scope.warnMsg.pwdMsg = '';
                }
                if ($scope.user.email) {
                    $scope.warnMsg.emailMsg = '';
                }
            };

    };

    // 编辑用户
    $scope.setByUser = function() {
        ngDialog.open(CreatNgDialog('temps/setByUser.html', $scope, fn));
    };



});
