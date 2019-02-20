var express = require('express');
var router = express.Router();

var fs = require('fs');
var ejs = require('ejs');
var moment = require('moment');

var conn = require('../conndb.js');


router.get('/', function(req, res, next) {
    res.render('register', {
        title: '新規アカウント登録'
    });
});

router.post('/', function(req, res, next) {
    var userName = req.body.user_name;
    var email = req.body.email;
    var password = req.body.password;
    var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    var emailExistsQuery = 'SELECT * FROM users WHERE email = "' + email + '" LIMIT 1'; // 追加

    var registerQuery = 'INSERT INTO users (name, email, password, created_at) VALUES ("' + userName + '", ' + '"' + email + '", ' + '"' + password + '", ' + '"' + createdAt + '")'; // 変更
    conn.query(emailExistsQuery, function(err, email) {
        var emailExists = email.length;
        if (emailExists) {
            res.render('register', {
                title: '新規アカウント登録',
                emailExists: '既に登録されているメールアドレスです'
            });
        } else {
            conn.query(registerQuery, function(err, rows) {
                res.redirect('/');
            });
        }
    });
});

module.exports = router;