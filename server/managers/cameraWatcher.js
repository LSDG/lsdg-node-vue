const EventEmitter = require('events');
const dotAPI = require('../resources/txdot.js');
const _ = require('lodash');

const CAMERA_QUERY_INTERVAL = 5000;

class CameraWatcher extends EventEmitter
{
    constructor()
    {
        super();
        this._cameraCache = [];
        this._setupCameras();
    }

    _setupCameras()
    {
        dotAPI.getCameraList()
            .then((cameraList) => {
                for (let i =0; i < cameraList.length; i++)
                {
                    this._beginCameraMonitoring(cameraList[i]);
                }
            })
            .catch((err) => {
                this.emit('error', err);
            });
    }

    _getCachedCamera(camera)
    {
        let cachedCamera = _.find(this._cameraCache, {id: camera.id});
        if (!cachedCamera)
        {
            cachedCamera = _.clone(camera);
            cachedCamera['snapshot'] = new Buffer('');
            this._cameraCache.push(cachedCamera);
        }
        return cachedCamera;
    }

    _beginCameraMonitoring(camera)
    {
        dotAPI.getCameraSnapshot(camera.id)
            .then((imageBuffer) => {
                let cachedCamera = this._getCachedCamera(camera);

                if (!cachedCamera.snapshot.equals(imageBuffer))
                {
                    cachedCamera.snapshot = imageBuffer;
                    if (imageBuffer.length > 100)
                    {
                        this.emit('snapshot', cachedCamera);
                    }
                }
                setTimeout(() => {
                    this._beginCameraMonitoring(camera);
                }, CAMERA_QUERY_INTERVAL);

            })
            .catch((err) => {
                this.emit('error', err);
            })
    }
}

module.exports = CameraWatcher;