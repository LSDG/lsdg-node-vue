const http = require('http');

//Global constants
const TXDOTDOMAIN = 'its.txdot.gov';
const NUM_CCTVS_INDEX = 5;
const NUM_CCTV_TOKENS_PER_RECORD = 8;

class TXDOTAPI {
    _makePostRequest(path, postData) {
        return new Promise((resolve, reject) => {
            let postDataString = JSON.stringify(postData);

            let options = {
                hostname: TXDOTDOMAIN,
                path: path,
                port: 80,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postDataString)
                }
            };

            let req = http.request(options, (res) => {
                //console.log(`STATUS: ${res.statusCode}`);
                //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

                const {statusCode} = res;

                let error;
                if (statusCode !== 200) {
                    error = new Error(`Request Failed.\n Status Code: ${statusCode}`);
                }

                if (error) {
                    console.error(error.message);
                    res.resume();
                    reject(error);
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => {
                    rawData += chunk;
                });
                res.on('end', () => {
                    resolve(rawData);
                });
            });

            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                reject(e);
            });

            req.write(postDataString);
            req.end();

        });
    }

    _parseCCTVList(data) {
        let cameraList = [];
        let tokens = data.split(',');
        if (tokens.length > NUM_CCTV_TOKENS_PER_RECORD) {
            // Extract the number of CCTVs
            let numCCTVs = tokens[NUM_CCTVS_INDEX];
            let index = NUM_CCTVS_INDEX + 1;
            let keyIndex = 0;
            for (let cctvIndex = 0; cctvIndex < numCCTVs; cctvIndex++) {
                let name = tokens[index++];
                let id = tokens[index++];
                let status = tokens[index++];
                let mapRegionId = tokens[index++];
                let lat = tokens[index++];
                let lon = tokens[index++];
                let hasSnapshot = tokens[index++];
                let timestamp = tokens[index++];

                let imageViewDirection = tokens[index++];
                let roadway = tokens[index++];
                let direction = tokens[index++];
                index++;
                cameraList.push({
                    id: id,
                    name: name,
                    status: status,
                    mapRegionId: mapRegionId,
                    lat: lat,
                    lon: lon,
                    hasSnapshot: hasSnapshot,
                    direction: direction,
                    roadway: roadway
                });
            }
        }

        return cameraList;

    }

    _parseCCTVSnapshot(responseData)
    {
        let tokens = responseData.split(',');
        if (tokens[4])
        {
            return new Buffer(tokens[4], 'base64');
        }
        else
        {
            console.log(responseData);
            return new Buffer('', 'ascii');
        }
    }

    _makeCacheBuster(length)
    {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    getCameraList() {
        return this._makePostRequest('/ITS_WEB/FrontEnd/svc/DataRequestWebService.svc/GetCctvDataOfArea', {
            arguments: 'LBB,34.295362,-102.315674,33.3189,-101.557617'
        })
        .then((response) => {
            return this._parseCCTVList(response);
        });
    }

    getCameraSnapshot(cameraID)
    {
        return this._makePostRequest(
            `/ITS_WEB/FrontEnd/svc/DataRequestWebService.svc/GetCctvContent?someotherthing=${this._makeCacheBuster(32)}`,
            {
                arguments:`${cameraID},0`
            }
        )
        .then((responseData) => {
            return this._parseCCTVSnapshot(responseData);
        });
    }
}

module.exports = new TXDOTAPI();