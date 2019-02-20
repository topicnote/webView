var conn = require('./conndb.js');
var router = express.Router();

module.exports = function(req, res, next) {
    // if (req.session) {
    //     var userId = req.session.user_id;
        var userId = 1;
        if (userId) {
            var query = 'SELECT id, name FROM users WHERE id = ' + userId;
            console.log(query);
            connection.query(query, function (err, rows) {
                if (!err) {

                    res.locals.user = rows.length ? rows[0] : false;
                }else{
                    console.log(err);
                }
            });
        }
        console.log(next);
    // }
    next();
    console.log('next');
};