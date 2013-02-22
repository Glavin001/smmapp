/* 
 * Dawson Reid
 * Feb 19, 2013
 */

var 
    http = require('http'),
    path = require('path'),
    fs = require('fs');

function handleRequest(request, response) {
   
    console.log('request starting...');
     
    var filePath = '.' + request.url;
    if (filePath === './')
        filePath = './index.htm';
     
    path.exists(filePath, function(exists) {

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

// create and init my server
var server = http.createServer();
server.on('request', handleRequest);
server.listen(8080);