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
    $ = require('jQuery'),
    GlobalID = 0;
    
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
//----------------------------------------- MONGODB SETUP
logger.log('Database setup start');
var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection,
    newsSchema = mongoose.Schema({
    articleId: Number,
    title: String,
    imgsrc: String,
    desktopLink: String
    }),
    Article = mongoose.model('Article', newsSchema);
    //function for getting news list from smu.ca
    function NewsFeedListGetter ()
    {
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
                                   articleId: GlobalID,
                                   title: $(value).find(".smuImageTitleText").text(),
                                   imgsrc: $(value).find('div img').attr('src'),
                                   desktopLink: $(value).find('a').attr('href')
                               };
                               var pat = /^https?:\/\//i;
                               if (pat.test(newsList[index].desktopLink));
                               else newsList[index].desktopLink = 'http://www.smu.ca/' + newsList[index].desktopLink;
                               
                               //var tempArticle = new Article(newsList[index]);
                               //tempArticle.save(function(){console.log('Article Saved');});
                               //console.log(newsList[index]);
                               
                               Article.create(newsList[index], function (err) {
                               if (err) console.log(err);
                               //console.log("Article Saved");
                               });
                               
                               GlobalID++;

                        });
                 //socket.emit('News Feed List',newsList);
                 //console.log(newsList);
                //console.log('news article');

            });
    });
    };
//checking if database is connected
db.once('open', function () {
    console.log('Database is up');
    //this updates the news list in the database daily, 86400000 milliseconds in a day
    setInterval(NewsFeedListGetter,86400000);
     });

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
            };
        //console.log(moduleList);
        socket.emit('App List', moduleList);
        });
    });
  });
  
    socket.on('News Feed List', function () {
        Article.find(function (err, articles) {
           if (err) console.log(err);// TODO handle err
           socket.emit('News Feed List',articles);
          });
    });
 
    socket.on('News Article', function (data) {//$(".templateBodyRightcol")[0].html()
        Article.findOne({ articleId : data.articleId }, function (err, news) {
          if (err) console.log(err);
        
        request({uri: news.desktopLink}, function(err, response, body){
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
                        news.html = $(".templateBodyRightcol").html();
                        socket.emit('News Article',news);
                 //console.log( JSON.stringify(newsArticle,null,'\t') );
                });
              });
             });
        });
  });

