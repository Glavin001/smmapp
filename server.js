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
    xml2js = require('xml2js'),
    jsdom = require('jsdom'),
    request = require('request'),
    url = require('url'),
    $ = require('jQuery');

    
var smu_auth = require('./node/smu-auth');

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
var modules = [ { title : 'grades' } ] ;

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

app.get('/m/*', function(req, res) {
  
  var path = req.originalUrl.split('/');
  
  console.log(JSON.stringify(path, null, 2));
  
  // validate the path
  if (path.length !== 3) {
    res.sendfile('./public_html/404.html');
    return;
  }

  // confirm module is present
  console.log('./module/' + path[2] + '/' + path[2] + '.html');
  fs.exists('./module/' + path[2] + '/' + path[2] + '.html', function(exists) {
    if (exists) {
      
      // send the file
      res.sendfile('./module/' + path[2] + '/' + path[2] + '.html'); 
    } else {
      res.sendfile('./public_html/404.html');
      return;
    }
  })
});

app.get('/test', function(req, res) {
  res.sendfile('./public_html/test.html');
});

server.listen(1338);
logger.log('Server started.');

// ---------------------------------------- SOCKET API 
logger.log('Setup socket.');

io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  //Description : Request the list of apps and select respective data. 
  socket.on('App List', function () {
    var parser = new xml2js.Parser({
        explicitArray: false,
        explicitRoot: false
    });
    
    var parseString = parser.parseString;
    fs.readFile('./module.xml', function (err, xml) {
        if (err) throw err;
        
        parseString(xml, function (error, obj) {
            if (error) throw error;
            socket.emit('App List', obj.module);
        });
    });
  });
  
    socket.on('News Feed List', function (data) {
      request({uri: 'http://www.smu.ca/'}, function(err, response, body){
                
		
		//Just a basic error check
                if(err && response.statusCode !== 200){console.log('Request error.');}
                //Send the body param as the HTML code we will parse in jsdom
		//also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
		jsdom.env({
                        html: body,
                        scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                }, function(err, window){
			//Use jQuery just as in a regular HTML page
                        var $ = window.jQuery;
                        var newsList = new Array();
                        
                        $("#smuImageRotator .smuImageList li").each( function( index, value) {
                           // console.log(index, value);
                                newsList[index] = {
                                   articleId: index,
                                   title: $(value).find(".smuImageTitleText").text(),
                                   imgsrc: $(value).find('div img').attr('src'),
                                   desktopLink: $(value).find('a').attr('href')
                               };
                        } );
                 socket.emit('News Feed List',newsList)
                 //console.log( JSON.stringify(newsList,null,'\t') );

                });
        });

  });
  
    socket.on('authenticate', function (data) {
      
  });
});