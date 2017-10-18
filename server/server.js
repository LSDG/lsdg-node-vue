const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const _ = require('lodash');
const CameraWatcher = require('./managers/cameraWatcher');

class WebServer
{
    constructor()
    {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketio(this.server, {perMessageDeflate: true});
        this.cameraWatcher = new CameraWatcher();
        this._setupRoutes();
        this._setupSockets();
        this._startServer();
        this._startListener();
    }

    _setupRoutes()
    {
        this.app.use(
            express.static('./dist')
        );
    }

    _setupSockets() {

        this.io.on('connection', (socket) => {
            _.forEach(this.cameraWatcher._cameraCache, (camera) => {
                if (camera.snapshot.length > 100)
                {
                    let emitCamera = _.omit(camera, ['snapshot']);
                    emitCamera.snapshot = `data:image/jpeg;base64,${camera.snapshot.toString('base64')}`;
                    socket.emit('snapshot', emitCamera);
                }
            });
        });

        this.io.on('disconnect', (socket) => {
            console.log('user disconnected');
        });
    }

    _startServer() {
        this.server.listen(8080);
    }

    _startListener()
    {
        this.cameraWatcher.on('snapshot', (camera) => {
            let emitCamera = _.omit(camera, ['snapshot']);
            emitCamera.snapshot = `data:image/jpeg;base64,${camera.snapshot.toString('base64')}`;
            this.io.emit('snapshot', emitCamera);
        });


    }
}

new WebServer();