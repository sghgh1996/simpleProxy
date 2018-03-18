const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const express = require('./express/index.js'); // express app
var fs = require('fs');
let mainWindow;

app.on('ready', function() {
    express();
    mainWindow = new BrowserWindow({
        width: 900,
        height: 560,
        autoHideMenuBar: true,
        useContentSize: true,
        resizable: false
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.focus();

    mainWindow.on('closed', () => {
        fs.writeFile('./express/request_log.txt', '', function(err){
            if(err) console.log(err);
        });
        fs.writeFile('./express/total_data_received.txt', 0, function(err){
            if(err) console.log(err);
        });
        fs.readFile('./express/groups.txt', function(err, buf) {
            if(err) console.log(err);
            let websites = JSON.parse(buf.toString()).websites;
            let groups = JSON.parse(buf.toString()).groups;
            websites.map(function (w) {
                w.dataReceived = 0;
            });
            let obj = {
                groups: groups,
                websites: websites
            };
            fs.writeFile('./express/groups.txt', JSON.stringify(obj), function(err){
                if(err) console.log(err);
            });
        });
    })
});