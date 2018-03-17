module.exports = () => {
    var app = require('express')();
    var bodyParser = require('body-parser');
    var http = require('http').Server(app);
    var request = require('request');
    var port = 8080;
    var fs = require('fs');

    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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
    
    const getGroupId = (groups)=>{
        let maxId = 1;
        groups.map(function (g) {
            if(g.id > maxId){
                maxId = g.id;
            }
        });
        return maxId + 1;
    };
    const getWebsiteId = (websites)=>{
        let maxId = 1;
        websites.map(function (w) {
            if(w.id > maxId){
                maxId = w.id;
            }
        });
        return maxId + 1;
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
        });
    });
    app.get('/get_websites/:group_id', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let result = [];
            let websites = JSON.parse(buf.toString()).websites;
            websites.map(function (w) {
                if(w.group_id === parseInt(req.params.group_id, 10)){
                    result.push(w);
                }
            });
            resp.send(JSON.stringify(result));
        });
    });
    app.get('/get_website/:id', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let result = {};
            let websites = JSON.parse(buf.toString()).websites;
            websites.map(function (w) {
                if(w.id === parseInt(req.params.id, 10)){
                    result = w;
                }
            });
            resp.send(JSON.stringify(result));
        });
    });
    
    app.post('/add_group', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            groups.push({
                name: req.body.name,
                id:getGroupId(groups)
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
        });
    });

    app.post('/add_website', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            websites.push({
                id:getWebsiteId(websites),
                address: req.body.address,
                group_id: req.body.group_id,
                dataReceived: 0
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
        });
    });
    app.delete('/delete_website/:id', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            let removedWebsites = websites.filter(function(el) {
                return el.id !== parseInt(req.params.id, 10);
            });

            let obj = {
                groups: groups,
                websites: removedWebsites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
        });
    });
    app.delete('/delete_group/:id', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            let removedGroups = groups.filter(function(el) {
                return el.id !== parseInt(req.params.id, 10);
            });

            let obj = {
                groups: removedGroups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
        });
    });
    app.put('/edit_website', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            websites.map(function (w) {
                if(w.id === parseInt(req.body.id, 10)){
                    w.address = req.body.address;
                    w.group_id = req.body.group_id;
                }
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
        });
    });
    app.put('/edit_group', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            groups.map(function (g) {
                if(g.id === parseInt(req.body.id, 10)){
                    g.name = req.body.name;
                }
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err, data){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
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