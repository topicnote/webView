var express = require('express');
var router = express.Router();
var conn = require('../conndb');
var fs = require('fs');
var gm = require('gm');

//画像アップロード関連
const multer = require('multer')
const path = require('path');

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./awskey.json');
AWS.config.update({region: 'ap-northeast-1'});

var s3 = new AWS.S3();
const upDir = path.join(__dirname, '../../src/tmp'); // 絶対パスにする
const uploadDir = multer({
    dest: upDir, function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)
            cb(null, raw.toString('hex'));
        })
    }
    });　// multerにアップロード先パスを設定

/* GET users listing. */
router.get('/list', function (req, res) {
    if (req.session.user) {
        var userObj = req.session.user;
        conn.query('SELECT * FROM contents WHERE user_id = "' + userObj.id + '"', function (err, dbres, fields) {
            res.render('list', {title: 'コンテンツ管理画面', dbres: dbres, user: userObj, status: ''});
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/list', uploadDir.fields([{ name: 'icon', maxCount: 1 }]), function (req, res) {
    var userObj = req.session.user;
    // var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    //userName 変更
    if (req.body.user_name) {
        conn.query('UPDATE users SET name ="' + req.body.user_name + '"WHERE id =' + '"' + userObj.id + '"', function (err, dbres) {
            if (!err) {
                console.log("Successfully changed your user name.")
            }
        });
    }

    if (req.files['icon']) {
        //jpgに変換してクロップ
        gm(req.files['icon'][0].path)
            .crop(req.body.user_img_w,req.body.user_img_h,req.body.user_img_x,req.body.user_img_y)
            .setFormat("jpg")
            .write(req.files['icon'][0].path,function (err) {
                if(err) console.log(err);
                //AWS S3にアップロード
                var params = {
                    Bucket: "topicnote",
                    Key: "userProfile_"+ userObj.id +".jpg",
                    Tagging: "type=userProfileImage"
                };
                var v = fs.readFileSync(req.files['icon'][0].path);
                params.Body = v;
                s3.putObject(params, function (err, data) {
                    if (err) console.log(err, err.stack);
                    else console.log(data);
                });
            });
    }

    if (req.body.password) {
        //password
        conn.query('SELECT password FROM users WHERE id = "' + userObj.id + '"', function (err, row) {
            console.log(row[0].password);
            if (row[0].password === req.body.oldpassword) {
                conn.query('UPDATE users SET password ="' + req.body.password + '"WHERE id =' + '"' + userObj.id + '"', function (err, dbres) {
                    if (!err) {
                        console.log("Successfully changed your PW.")
                    }
                    ;
                });
            }
        })
    }


    if (req.body.email) {
        //mail address 変更
        var emailExistsQuery = 'SELECT * FROM users WHERE email = "' + req.body.email + '" LIMIT 1'; // 追加
        var registerQuery = 'UPDATE users SET email ="' + req.body.email + '"WHERE id =' + '"' + userObj.id + '"'; // 変更
        conn.query(emailExistsQuery, function (err, email) {
            var emailExists = email.length;
            if (emailExists) {
                res.render('list', {
                    title: '変更失敗', dbres: {}, user: userObj,
                    status: '既に登録されているメールアドレスです'
                });
            } else {
                conn.query(registerQuery, function (err, rows) {

                });
            }
        });
    }

    conn.query('SELECT * FROM contents WHERE user_id = "' + userObj.id + '"', function (err, dbres, fields) {
        res.render('list', {
            title: '変更を受け付けました', dbres: dbres, user: userObj,
            status: '変更の確認内容をメールに送信しました。ご確認ください。'
        });
    });

});

module.exports = router;
