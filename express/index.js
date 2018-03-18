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
            '/get_group',
            '/get_websites',
            '/get_website',
            '/add_group',
            '/add_website',
            '/delete_group',
            '/delete_website',
            '/edit_group',
            '/edit_website',
            '/get_request_log',
            'get_total_data_received'
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
    const increaseWebsiteDataReceived = (url, amount)=>{
        if(amount !== undefined){
            fs.readFile('./express/groups.txt', function(err, buf) {
                if(err) console.log(err);
                let websites = JSON.parse(buf.toString()).websites;
                let groups = JSON.parse(buf.toString()).groups;
                websites.map(function (w) {
                    if(url.includes(w.address)){
                        let currentData = parseInt(w.dataReceived, 10);
                        w.dataReceived = currentData + parseInt(amount);
                    }
                });
                let obj = {
                    groups: groups,
                    websites: websites
                };
                fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
                    if(err) console.log(err);
                });
            });
        }
    };

    const addRequestToLog = (url)=>{
        fs.appendFile('./express/request_log.txt', url.toString()+'\n', function(err){
            if(err) console.log(err);
        });
    };

    const increaseTotalDataReceived = (amount)=>{
        if(amount !== undefined){
            fs.readFile('./express/total_data_received.txt', function(err, buf) {
                if(err) console.log(err);
                let currentData = parseInt(buf.toString(), 10);
                currentData = currentData + parseInt(amount, 10);
                fs.writeFile('./express/total_data_received.txt', currentData, function(err){
                    if(err) console.log(err);
                });
            });
        }
    };

    http.listen(port, function () {
        console.log('listening on *:' + port);
    });

    app.all('*', function (req, resp, next) {
        if(checkReservedUrl(req.url)){
            addRequestToLog(req.url);
            let newReq = request(req.url, function (error, response, body) {
                // console.log('url: '+ req.url + '\nlength: '+ response.headers['content-length']+'\n\n')
                if(response.headers['content-length'] !== undefined){
                    increaseWebsiteDataReceived(req.url, response.headers['content-length']);
                    increaseTotalDataReceived(response.headers['content-length']);   
                }
            });

            req.pipe(newReq).pipe(resp);
        } else {
            next();
        }
    });

    app.get('/get_request_log', function (req, resp) {
        fs.readFile('./express/request_log.txt', function(err, buf) {
            if(err) console.log(err);
            resp.send(buf.toString());
        });
    });

    app.get('/get_total_data_received', function (req, resp) {
        fs.readFile('./express/total_data_received.txt', function(err, buf) {
            if(err) console.log(err);
            resp.send(buf.toString());
        });
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
    app.get('/get_group/:id', function (req, resp) {
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let result = {};
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            let dataReceivedInGroup = 0;
            
            groups.map(function (g) {
                if(g.id === parseInt(req.params.id, 10)){
                    result = g;
                }
            });
            websites.map(function (w) {
                if(w.group_id === result.id){
                    dataReceivedInGroup += w.dataReceived;
                }
            });
            result.dataReceived = dataReceivedInGroup;
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
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
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
                group_id: parseInt(req.body.group_id, 10),
                dataReceived: 0
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
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
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
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
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
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
                    if(req.body.address !== '' && req.body.address !== null)
                        w.address = req.body.address;
                    w.group_id = parseInt(req.body.group_id, 10);
                }
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
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
                    if(req.body.name !== '' && req.body.name !== null)
                        g.name = req.body.name;
                }
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
                if(err) console.log(err);
                resp.send(JSON.stringify({msg: 'ok'}));
            });
        });
    });
};