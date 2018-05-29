'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var server = require('http').Server(app);
const manifestHunter_1 = require("./manifestHunter");
var Mhunter = new manifestHunter_1.default();
const manifestUpdater_1 = require("./manifestUpdater");
var io = require("socket.io")(server);
class webServer {
    emmitChange() {
        io.emit('status', { actions: 'changed' });
    }
    constructor(port) {
        app.get('/getgraph', function (req, res) {
            console.log("getGr");
            try {
                Mhunter.jsonToGrpah(req.query.service, (allData) => {
                    allData = JSON.stringify({ status: 200, error: "", data: allData });
                    allData = allData.replace(/'/g, '\\\\\'');
                    res.status(200).send(allData);
                });
            }
            catch (err) {
                console.log(err);
                let data;
                if (err.err && err.path)
                    data = { status: 500, error: err.err, path: err.path };
                else
                    data = { status: 500, error: "invjson" };
                res.status(200).send(JSON.stringify(data));
            }
        });
        app.get('/getmanifests', function (req, res) {
            try {
                Mhunter.servicesList((allData) => {
                    allData = JSON.stringify({ status: 201, error: "", data: allData });
                    allData = allData.replace(/'/g, '\\\\\'');
                    res.status(200).send(allData);
                });
            }
            catch (err) {
                console.log(err);
                let data;
                if (err.err && err.path)
                    data = { status: 500, error: err.err, path: err.path };
                else
                    data = { status: 500, error: "invjson" };
                res.status(200).send(JSON.stringify(data));
            }
        });
        app.use(express.static(__dirname));
        app.get('/hello', function (req, res) {
            res.status(200).send("Hello World!");
        });
        app.post('/updatemanifest', function (req, res) {
            req.setEncoding('utf8');
            var body = '';
            req.on('data', (chunk) => {
                body = chunk.toString();
            });
            req.on('end', () => {
                var callback = (data) => {
                    res.status(200).send(JSON.stringify(data));
                    // res.end(JSON.stringify(data));
                };
                let update = JSON.parse(body);
                manifestUpdater_1.default.save(update.path, update.jsonPath, update.data, callback);
            });
        });
        io.on('connection', function (socket) {
            // console.log('Alguien se ha conectado con Sockets');
            //  socket.emit('messages', messages);
            socket.on('new-message', function (data) {
                console.log("NEW MESSAGE");
                console.log(data);
                //messages.push(data);
                // io.sockets.emit('messages', messages);
            });
        });
        server.listen(port, function () {
            console.log("Servidor corriendo en http://localhost:" + port);
        });
    }
}
exports.default = webServer;
