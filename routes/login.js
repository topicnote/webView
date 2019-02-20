var express = require('express');
var router = express.Router();

var conn = require('../conndb.js');

//直接/loginをブラウザで表示(GET)した時だけ表示される
router.get('/', function(req, res, next) {

    if(req.session.user){
        if(req.query.redirect) {
            res.redirect('../' + req.query.redirect);
        }else{
            res.redirect('../');
        }
    }else{
        res.render('login', {
            title: 'ログイン',
            status: 'ログインしてください',
            redirect: req.query.redirect
        });
    };
});

//全てのページからの/loginへのPOSTリクエストを受ける
router.post('/', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var query = 'SELECT id, name FROM users WHERE email = "' + email + '" AND password = "' + password + '" LIMIT 1';
    conn.query(query, function(err, rows) {
        var userObj = rows.length? rows[0]: false;
        if (userObj) {
            req.session.user = userObj;　//sessionを保存
            res.redirect(req.originalUrl+'?redirect='+req.body.redirect);
        } else {
            res.render('login', {
                title: 'ログイン',
                status: 'メールアドレスまたはパスワードが誤っています',
                redirect: req.body.redirect
            });
        }
    });
});

module.exports = router;