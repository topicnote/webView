var express = require('express');
var router = express.Router();

var fs = require('fs');
var conn = require('../conndb.js');

var moment = require('moment');
moment.locale('ja');

var genre = [];
conn.query('SELECT * FROM `genre`', function (err, dbres, fields) {
    genre = dbres;
});

var topic = []; //全部読み込むのは負荷がかかるので、あとでジャンル選択時に読み込むように変更？
conn.query('SELECT * FROM `topic`', function (err, res, fields) {
    topic = res;

});



// var autoCompleteData = {"apple": null, "microsoft": null};

/* GET home page. */
router.get('/g/:gid', function (req, res) {
    // var contents = [];
    // conn.query('SELECT * FROM `contents` json_contains(`topic`,'+req.params.gid+')', function (err, dbres, fields) { //トピックIDが含まれるコンテンツを検索
    //     contents = dbres;
    if (req.session.user) {
        var userObj = req.session.user;

    } else {
        var userObj = null;
    }
    ;
    res.render('index', {title: 'Express', genre: genre, topic: topic, num: req.params.gid, conn: conn, user: userObj});
    // });
});

router.get('/g/t/:tid', function (req, res) {
    conn.query('SELECT * FROM `contents` where json_contains(`topic`,"' + req.params.tid + '")', async function (err, dbres, fields) { //トピックIDが含まれるコンテンツを検索
        var data = [];
        for (let row of dbres) { //フロント表示用にDB結果を調整（user_id -> user_name, optimize Time for japanese)
            data[row.id] = await readFile('/var/www/src/user/' + row.id);
            conn.query('SELECT name FROM users WHERE id = "' + row.user_id +'"', function (err, name, fields) {
                row.userid = name[0].name;
            });
            row.created_at = moment(row.created_at).format('llll');
        }
        if (req.session.user) {
            var userObj = req.session.user;

        } else {
            var userObj = null;
        }
        res.render('content', {
            title: topic[req.params.tid - 1].title_ja,
            genre: genre,
            contents_list: dbres,
            data: data,
            user: userObj
        });
    });
});

router.get('/', function (req, res) {
    // var contents = [];
    conn.query('SELECT * FROM `contents` json_contains(`topic`,' + 0 + ')', function (err, dbres, fields) { //トピックIDが含まれるコンテンツを検索
        // contents = dbres;
        if (req.session.user) {
            var userObj = req.session.user;

        } else {
            var userObj = null;
        }
        ;
        res.render('index', {
            title: 'Express',
            genre: genre,
            topic: topic,
            num: 1,
            contents: dbres,
            conn: conn,
            user: userObj
        });
    });
});


module.exports = router;


async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}
