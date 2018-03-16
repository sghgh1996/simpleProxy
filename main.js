const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const express = require('./express/index.js'); //your express app
let mainWindow;

// function createWindow () {
//     // Create the browser window.
//     win = new BrowserWindow({width: 800, height: 600});
//
//     // and load the index.html of the app.

// }
//
// app.on('ready', createWindow);


app.on('ready', function() {
    express();
    mainWindow = new BrowserWindow({
        width: 720,
        height: 600,
        autoHideMenuBar: true,
        useContentSize: true,
        resizable: false
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // mainWindow.loadURL('http://localhost:8080/');
    mainWindow.focus();

});