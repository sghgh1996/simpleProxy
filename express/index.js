module.exports = () => {
    var app = require('express')();
    var http = require('http').Server(app);
    var request = require('request');
    var port = 8080;
    var fs = require('fs');

    http.listen(port, function () {
        console.log('listening on *:' + port);
    });

    app.all('*', function (req, resp, next) {
        if(req.url !== '/get_groups'){
            console.log(req.url);
            req.pipe(request(req.url)).pipe(resp);

            // var x = request(req.url);
            // req.pipe(x);
            // x.pipe(resp);
            // var url = req.url;
            // var newReq  = request(url);
            // newReq.pipe(resp);
            // req.pipe(request(url)).pipe(resp);
            // resp.send('<h1>Hello world</h1>');
        }
        next();
    });
    
    app.get('/get_groups', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            resp.send(buf.toString());
        });
    });
};