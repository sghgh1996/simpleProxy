module.exports = () => {
    var app = require('express')();
    var http = require('http').Server(app);
    var request = require('request');
    var port = 8080;
    var fs = require('fs');

    const checkReservedUrl = (url)=>{
        let reservedUrl = [
            '/get_groups',
            '/get_websites',
            '/get_website',
            '/add_group',
            '/add_website',
            '/delete_group',
            '/delete_website',
            '/edit_group',
            '/edit_website'
        ];
        let result = true;
        reservedUrl.map(function (u) {
            if(url.includes(u)) result = false;
        });

        return result;
    };

    http.listen(port, function () {
        console.log('listening on *:' + port);
    });

    app.all('*', function (req, resp, next) {
        // console.log(req.url);

        if(checkReservedUrl(req.url)){
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

        // resp.send('<h1>Hello world</h1>');
    });
    
    app.get('/get_groups', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let groups = JSON.parse(buf.toString()).groups;
            resp.send(JSON.stringify(groups));
            
            // resp.send('<h1>Hello world</h1>');
        });
    });
};






// let obj = {
//     groups:[
//         {name:'work',id: 1},
//         {name:'sport',id:2},
//         {name:'news',id:3},
//         {name:'fun',id:4}
//     ],
//     websites:[
//         {
//             id:1,
//             address:'isna.ir',
//             group_id:3,
//             dataReceived:0
//         },
//         {
//             id:2,
//             address:'iranestekhdam.ir',
//             group_id:1,
//             dataReceived:0
//         },
//         {
//             id:3,
//             address:'varzesh3.com',
//             group_id:2,
//             dataReceived:0
//         },
//         {
//             id:4,
//             address:'farsnews.com',
//             group_id:3,
//             dataReceived:0
//         },
//         {
//             id:5,
//             address:'beytoote.com',
//             group_id:4,
//             dataReceived:0
//         },
//         {
//             id:6,
//             address:'khabarvarzeshi.com',
//             group_id:2,
//             dataReceived:0
//         }
//     ]
// };
// fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
//     if(err) console.log(err);
//     console.log("Successfully Written to File.");
// });