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
        url = require('url');

// mongo db stuff
var
        mongoose = require('mongoose'),
        db = mongoose.createConnection('localhost', 'test'),
        $ = require('jQuery'),
        newsSchema = mongoose.Schema({
  articleId: Number,
  title: String,
  imgsrc: String,
  desktopLink: String
}),
Article = mongoose.model('Article', newsSchema),
        dbIsOpen = false;

var smu_auth = require('./node/smu-auth');

// module config 
var moduleStore = JSON.parse(fs.readFileSync('module.json'));
// console.log(JSON.stringify(moduleStore, null, 2));

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
  console.log('GET : /');
  
  // initialise the session
  userStore[req.sessionID] = (userStore[req.sessionID] || {});
  
  res.sendfile('./public_html/app.html');
});

app.get('/login', function(req, res) {
  console.log('GET : /login');
  res.sendfile('./public_html/login.html');
});

/*
 * 
 */
app.get('/m/*', function(req, res) {
  console.log('GET : ' + req.originalUrl);

  if (userStore[req.sessionID] === undefined || userStore[req.sessionID] === null) {
    console.log('Attempt to load module prior to home.');
    res.redirect('/');
    return;
  }

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

server.listen(1338);
logger.log('Server started.');
//----------------------------------------- MONGODB SETUP
logger.log('Database setup start')
//checking if database is connected
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  dbIsOpen = true;
});

// ---------------------------------------- SOCKET API 
logger.log('Setup socket.');

io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  //Description : Request the list of apps and select respective data. 

  socket.on('App List', function() {
    var parser = new xml2js.Parser({
      explicitArray: false,
      explicitRoot: false
    });

    var parseString = parser.parseString;
    fs.readFile('./module.xml', function(err, xml) {
      if (err)
        throw err;

      parseString(xml, function(error, obj) {
        if (error)
          throw error;
        var moduleList = new Array();

        var length = obj.module.length;
        for (var i = 0; i < length; i++) {
          moduleList[i] = {
            id: obj.module[i].$.id,
            title: obj.module[i].$.title,
            file: obj.module[i].$.file,
            icon: obj.module[i].$.icon,
            description: obj.module[i]._
          };
        }
        ;
        //console.log(moduleList);
        socket.emit('App List', moduleList);
      });
    });
  });

  socket.on('News Feed List', function() {
    request({uri: 'http://www.smu.ca/'}, function(err, response, body) {


      //Just a basic error check
      if (err && response.statusCode !== 200) {
        console.log('Request error.');
      }
      //Send the body param as the HTML code we will parse in jsdom
      //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
      jsdom.env({
        html: body,
        scripts: ['http://code.jquery.com/jquery-1.6.min.js']
      }, function(err, window) {
        //Use jQuery just as in a regular HTML page
        var $ = window.jQuery;
        var newsList = new Array();

        $("#smuImageRotator .smuImageList li").each(function(index, value) {
          // console.log(index, value);
          newsList[index] = {
            articleId: index,
            title: $(value).find(".smuImageTitleText").text(),
            imgsrc: $(value).find('div img').attr('src'),
            desktopLink: $(value).find('a').attr('href')
          };
          if (dbIsOpen) {
            Article.create({
              articleId: index,
              title: $(value).find(".smuImageTitleText").text(),
              imgsrc: $(value).find('div img').attr('src'),
              desktopLink: $(value).find('a').attr('href')
            }, function(err) {
              if (err)
                logger.log(err);
            });
          }
          else
            logger.log('Database is not open, Cannot save articles');
        });
        socket.emit('News Feed List', newsList);
        //Article.find(function (err, articles) {
        // if (err) logger.log(err);// TODO handle err
        //  console.log(articles)
        //});
        //console.log( JSON.stringify(newsList,null,'\t') );

      });
    });
  });

  socket.on('News Article', function(data) {//$(".templateBodyRightcol")[0].html()
    request({uri: 'http://www.smu.ca/' + data.articleId}, function(err, response, body) {


      //Just a basic error check
      if (err && response.statusCode !== 200) {
        console.log('Request error.');
      }
      //Send the body param as the HTML code we will parse in jsdom
      //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
      jsdom.env({
        html: body,
        scripts: ['http://code.jquery.com/jquery-1.6.min.js']
      }, function(err, window) {
        //Use jQuery just as in a regular HTML page
        var $ = window.jQuery;
        var newsArticle = {
          articleId: data.articleId,
          desktopLink: data.articleId,
          html: $(".templateBodyRightcol").html()
        };
        socket.emit('News Article', newsArticle);
        //console.log( JSON.stringify(newsArticle,null,'\t') );

      });
    });
  });

  socket.on('authenticate', function(data) {
    console.log('On : authenticate');

    console.log(JSON.stringify(data, null, 2));
  });
});

io.set('authorization', function(data, accept) {

  if (data.headers.cookie) {
    // attain the session id
    data.sessionID = connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(data.headers.cookie)), 'm0ng00s3')['mwa.sid'];
    return accept(null, true);
  } else {
    return accept('No cookie transmitted.', false);
  }
});