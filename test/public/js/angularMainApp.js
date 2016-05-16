var myApp = angular.module('myApp', ['ui.router', 'myControllers']);
// route
myApp.config(function($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');
    // Now set up the states
    $stateProvider.
    state(
        '/', {
            url: '/',
            templateUrl: '/temps/login.html',
            controller: 'loginControl'
        }
    ).
    state(
        'main', {
            url: '/main',
            templateUrl: '/temps/main.html',
            controller: 'mainControl'
        }
    ).
    state(
        'main.equipList', {
            url: '/equipList',
            templateUrl: '/temps/equipList.html',
            controller: 'equipControl'
        }
    ).
    state(
        'main.borrowList', {
            url: '/borrowList',
            templateUrl: '/temps/borrowList.html',
            controller: 'borrowControl'
        }
    ).
    state(
        'main.userList', {
            url: '/userList',
            templateUrl: '/temps/userList.html',
            controller: 'uListControl'
        }
    ).
    state(
        'user', {
            url: '/user',
            templateUrl: '/temps/user.html',
            controller: 'userControl'
        }
    ).
    state(
        'user.equipCanUse', {
            url: '/equipCanUse',
            templateUrl: '/temps/equipCanUse.html',
            controller: 'equipCanUseControl'

        }
    ).
    state(
        'user.equipByBorrow', {
            url: '/equipByBorrow',
            templateUrl: '/temps/equipByBorrow.html',
            controller: 'equipByBorrowControl'

        }
    ).
    state(
        'user.userSet', {
            url: '/userSet',
            templateUrl: '/temps/userSet.html',
            controller: 'userSetControl'

        }
    );

});
