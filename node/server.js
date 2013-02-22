/* 
 * Dawson Reid
 * Feb 19, 2013
 */

// constants
var 
    LOGGING = true,
    DEBUGGING = true;
    
/*
* setup the logger if logging enabled
*/
var logger = undefined;
try {
    
    var nodeL = require('./lib/nodeL');
    logger = new nodeL.Logger
            (
            nodeL.LOG_MEDIUM.CONSOLE,
            nodeL.LOG_TYPE.INFO,
            nodeL.LOG_LEVEL.LOW
            );            
    logger.log('Logging ...');
    
} catch (e) {
    console.log("ERROR : Could not setup logger.");
    console.log("\tREASON : " + e)
    process.exit(1);
}

logger.log('Loading modules.');

var 
    http = require('http'),
    path = require('path'),
    fs = require('fs');

logger.log('Loading functions.');

function requestEnded(error) {
    logger.log('\tRequest ended.');
}

function requestClosed(error) {
    logger.log('\tRequest closed.');
}

function attainContentType(url) {
    
    var 
        extname = path.extname(url),
        contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
    return contentType;
}

function handleRequest(request, response) {
   
    logger.log('\tRequest started.');
     
    // register request events
    request.on('end', requestEnded);
    request.on('close', requestClosed);
     
    fs.exists('../app.html', function(exists) {

            if (exists) {
                fs.readFile('../app.html', function(error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.end(content, 'utf-8');
                    }
                });
            }
            else {
                response.writeHead(404);
                response.end();
            }
    });
};

console.log(__dirname);
logger.log('Starting server.');

// create and init my server
var server = http.createServer();
server.on('request', handleRequest);
server.listen(8080);