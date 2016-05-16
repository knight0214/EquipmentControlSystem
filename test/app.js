
// get the packages we need

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var favicon = require('serve-favicon');

var jwt = require('jsonwebtoken');
var xss = require('xss');
var orm = require('orm');
var equips = require('./routes/equips');
var users = require('./routes/users');
var app = express();
var dbconfig = require('./config/dbconfig');
var secret = require('./config/secret');
var dbc = dbconfig.dbName + '://' + dbconfig.userName + ':' + dbconfig.passward + '@' + dbconfig.host + '/' + dbconfig.database;

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(morgan('dev'));
//set our port
var port = process.env.PORT || 3000;
// set secret
app.set('superSecret', secret);
// set public
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set dbconect
app.use(orm.express(dbc, {
    define: function(db, models, next) {
        models.Users = db.define("users", {
            uid: {
                type: 'serial',
                key: true
            },
            uname: String,
            pwd: String,
            email: String,
            admin: String,
        });
        next();
    }
}));

app.use(orm.express(dbc, {
    define: function(db, models, next) {
        models.Equips = db.define("equipmentcontrol", {    
            id:  {
                type: 'serial',
                key: true
            },
            eid:String,
            etype: String,
            ename: String,
            estate: String,
            borrowDate: String,
            dueDate: String,
            uname: String,
        });
        next();
    }
}));
// set route

app.use('/users', users);
app.use('/equips', equips);

// start server
app.listen(port);
console.log('server start on port ' + port);
