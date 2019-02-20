var express = require('express');
var router = express.Router();

var fs = require('fs');
var ejs = require('ejs');
var moment = require('moment');

var conn = require('../conndb.js');

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

var genre = [];
conn.query('SELECT * FROM `genre`', function (err, dbres, fields) {
    genre = dbres;
});

var topic = []; //全部読み込むのは負荷がかかるので、あとでジャンル選択時に読み込むように変更？
var autoCompleteData = {};
conn.query('SELECT * FROM `topic`', function (err, res, fields) {
    topic = res;
    for (var row in topic) {
    var key = topic[row].title_ja
    autoCompleteData[key] = topic[row].id;
    }
})

router.get('/', function (req, res) {
    if(req.session.user){
        dbres = '追加してください';
        res.render('add', {title: 'コンテンツ追加画面', genre: genre, dbres: dbres, autoComp: autoCompleteData, user: req.session.user});
    }else{
        res.redirect('/login?redirect=add');
    };
})

//コンテンツ新規追加された時（POST)
router.post('/', function (req, res, next) {
    var elemArray = (req.body.elemArray).split(',');
    var str = '<div id="title">'+ req.body.title_ja + '</div>'
    for (let i = 0; i < elemArray.length - 3; i++) {
        console.log(elemArray[i]);
        console.log(req.body.data[i]);
        str += '<div id="' + elemArray[i] + '">'+ req.body.data[i] + '</div>';
    }


    console.log(str);
    var userid = req.session.id;
    var topicid = req.body.topicid;


    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
    // conn.query('INSERT INTO contents (title_ja, created_at) VALUES ("' + title_ja + '","' + created_at + '")', function (err, dbres, fields) {
    //     fs.writeFile('/var/www/src/user/' + dbres.insertId, data, function (err) {
    //         if (err) {
    //             throw err;
    //         }
    //     });
        res.render('add', {title: '追加完了', genre: genre, dbres: {}, autoComp: {}, user: req.session.user}); //-->will fix to go to list.ejs
    // });
});


module.exports = router;


async function readFile(path) {

    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data)=>{
            if (err) reject(err);
            else resolve(data);
        });
    });
}
