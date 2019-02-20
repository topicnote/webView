//appモジュールを読み込む（このappには、www内ですでにポート番号が登録されているので、ポート番号を取得したことにもなる）
var app = require('../app');

//httpモジュールを読み込んで、サーバーを立ち上げる（createServerと同じ扱い）
var http = require('http');

//必要な三要素を揃えて初めてサーバーを立ち上げられる
var server = http.createServer(app);

//サーバーをlistenしてsocketIOを設定
var io = require('socket.io')(server);

//socketIOモジュール
function socketIO(){
    //サーバーを立ち上げたら実行
    server.listen(app.get('port'), function() {
        console.log('listening!!!');
    });

    //socket処理を記載する
    io.on('connection', function(socket){

        //socket処理
        socket.on('socketName',function(data){
            console.log(data);
            io.sockets.emit('socketName2',data);
        })

    });
};

//export
module.exports = socketIO;