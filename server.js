/* 
 * Dawson Reid
 * Feb 19, 2013
 */

// ---------------------------------------- CONFIG
var logger = undefined;
try {

  var nodeL = require('./node/nodeL');
  logger = new nodeL.Logger
          (
                  nodeL.LOG_MEDIUM.CONSOLE,
                  nodeL.LOG_TYPE.INFO,
                  nodeL.LOG_LEVEL.LOW
                  );
  logger.log('Logging ...');

} catch (e) {
  console.log("ERROR : Could not setup logger.");
  console.log("\tREASON : " + e);
  process.exit(1);
}

// ---------------------------------------- NODE PACKAGES 
logger.log('Loading modules.');

var
        http = require('http'),
        path = require('path'),
        fs = require('fs'),
        express = require('express'),
        xml2js = require('xml2js');

var
        smu_auth = require('./node/smu-auth');

// module config 
var moduleStore = JSON.parse(fs.readFileSync('module.json'));
console.log(JSON.stringify(moduleStore, null, 2));

logger.log('Loading functions.');

function requestEnded(error) {
  logger.log('\tRequest ended.');
}

function requestClosed(error) {
  logger.log('\tRequest closed.');
}

// ---------------------------------------- EXPRESS SERVER
logger.log('Starting Server.');
var
        app = express(),
        server = http.createServer(app),
        memStore = new express.session.MemoryStore();

var userStore = {}; // object for storing user credentials

app.configure(function() {

  // web server config
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public_html'));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  // session support
  app.use(express.cookieParser());
  app.use(express.session({
    store: memStore,
    secret: 'SmU4pP',
    key: 'smu.app'
  }));

  app.use(app.router);
});

// executed upon each request
app.use(function(req, res, next) {

  logger.log('Request started.');

  req.on('end', function() {
    logger.log('Request ended.');
  });
  req.on('close', function() {
    logger.log('Request closed.');
  });

  next();
});

app.get('/', function(req, res) {
  res.sendfile('./public_html/app.html');
});

app.get('/login', function(req, res) {
  res.sendfile('./public_html/login.html');
});

/*
 * 
 */
app.get('/m/*', function(req, res) {
  console.log('GET : ' + req.originalUrl);

  try {

    var
            path = req.originalUrl.split('/'),
            reqType = req.originalUrl.split('.').length;

    if (reqType === 1) {
      console.log('module request'); /*** module request ***/

      if (path.length === 3) {

        // confirm module is present
        fs.exists('./module/' + path[2] + '/' + path[2] + '.html', function(exists) {

          if (exists) { // send the file
            res.sendfile('./module/' + path[2] + '/' + path[2] + '.html');
          } else {
            console.log('Error : Invalid Module : ' + path[2]);
            res.sendfile('./public_html/404.html');
            return;
          }
        });

      } else {
        throw "Invalid Req : Invalid '//'";
      }

    } else if (reqType === 2) {
      console.log('script request'); /*** script (js or css) request ***/

      if (path[1] === 'm') {
        path[1] = 'module';
        path = '.' + path.join('/');

        // confirm module is present
        fs.exists(path, function(exists) {

          if (exists) { // send the file
            res.sendfile(path);
          } else {
            console.log('Error : Invalid Script : ' + path);
            res.sendfile('./public_html/404.html');
            return;
          }
        });

      } else {
        throw "Invalid Req : request should not be handled here";
      }

    } else {
      throw "Invalid Req : Invalid '.'";
    }

  } catch (ex) { /*** ERROR ***/
    console.log('Error : ' + ex);
    res.sendfile('./public_html/404.html');
    return;
  }

});

app.get('/test', function(req, res) {
  res.sendfile('./public_html/test.html');
});

server.listen(1337);
logger.log('Server started.');

// ---------------------------------------- SOCKET API 
logger.log('Setup socket.');

io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  //Description : Request the list of apps and select respective data. 
  socket.on('App List', function(data) {

  });

  socket.on('authenticate', function(data) {
    console.log('On : authenticate');

    console.log(JSON.stringify(data, null, 2));
  });

  socket.on('', function(data) {

  });
});