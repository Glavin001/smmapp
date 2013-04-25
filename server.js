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
        jsdom = require('jsdom'),
        request = require('request'),
        url = require('url'),
        $ = require('jQuery'),
        GlobalID = 0,
        connect = require('connect'),
        cookie = require('cookie'),
        mongoose = require('mongoose');

// mongo db stuff
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
//db = mongoose.createConnection('localhost', 'test'),

var
        newsSchema = mongoose.Schema({
  articleId: Number,
  title: String,
  imgsrc: String,
  desktopLink: String
}),
UserSchema = mongoose.Schema({
  user: String,
  pass: String
}),
smadsSchema = mongoose.Schema({
    name : String,
    link : String,
    date : Date,
    priority : Number
});

var
        User = mongoose.model('users', UserSchema),
        Article = mongoose.model('articles', newsSchema),
        Smads = mongoose.model('smads', smadsSchema);

var smu_auth = require('./node/smu-auth');

logger.log('Loading functions.');

var requestEnded = function(error) {
  logger.log('\tRequest ended.');
};

var requestClosed = function(error) {
  logger.log('\tRequest closed.');
};

// ---------------------------------------- EXPRESS SERVER
logger.log('Starting Server.');
var
        app = express(),
        server = http.createServer(app),
        memStore = new express.session.MemoryStore();

var userStore = {}; // object for storing user credentials
var isLoggedIn = function(sid) {
  return (
          userStore[sid] !== undefined &&
          userStore[sid] !== null &&
          userStore[sid].isLoggedIn === true
          );
};

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

  if (userStore[req.sessionID] === undefined || userStore[req.sessionID] === null) {
    // initialise the session
    userStore[req.sessionID] = (userStore[req.sessionID] || {});
    userStore[req.sessionID].isLoggedIn = false;
  }

  /*
   * Load the app which then loads the home. 
   */
  res.sendfile('./public_html/app.html');
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
            data = req.originalUrl.split('?')[1],
            path = req.originalUrl.split('?')[0].split('/'),
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

    } else if (reqType >= 2) {
      console.log('script request'); /*** script (js or css) request ***/

      if (path[1] === 'm') {

        // construct path
        path[1] = 'module';
        path = '.' + path.join('/');
        path = path.split('?')[0];

        // confirm module is present
        fs.exists(path, function(exists) {

          if (exists) { // send the file
            console.log(path);
            res.sendfile(path);
            return;
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

server.listen(1338);
logger.log('Server started.');
//----------------------------------------- MONGODB SETUP
logger.log('Database setup start');


/*
Variable : NewsFeedListGetter
Gets news feed list and saves it to database
returns : null
See Alse : logNFLG
 */
var NewsFeedListGetter = function() {
  logNFLG("News Feed List");
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
          articleId: GlobalID,
          title: $(value).find(".smuImageTitleText").text(),
          imgsrc: $(value).find('div img').attr('src'),
          desktopLink: $(value).find('a').attr('href')
        };
        var pat = /^https?:\/\//i;
        if (pat.test(newsList[index].desktopLink));
        else
          newsList[index].desktopLink = 'http://www.smu.ca/' + newsList[index].desktopLink;

        //var tempArticle = new Article(newsList[index]);
        //tempArticle.save(function(){console.log('Article Saved');});
        //console.log(newsList[index]);

        Article.create(newsList[index], function(err) {
          if (err)
            console.log(err);
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

/*
Variable : logNFLG 
Parameters: message
logs to a file the given message everytime the NewsFeedListGetter is called
Returns : null
See Also : NewsFeedListGetter
*/
var logNFLG = function(message) {
  fs.writeFile("\logs\NFLGlog.txt", message, function(err) {
    if (err)
      console.log(err);
  });
};

//checking if database is connected
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database is up');
  dbIsOpen = true;
  //this updates the news list in the database daily, 86400000 milliseconds in a day
  setInterval(NewsFeedListGetter, 86400000);
});

// ---------------------------------------- SOCKET API 
logger.log('Setup socket.');

io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
  //Description : Request the list of apps and select respective data. 

  socket.on('App List', function() {

    socket.emit('App List', JSON.parse(fs.readFileSync('module.json')));
  });
/*   
Event : News Feed List
 emits every article in the database as an array
returns: articles
 */
  socket.on('News Feed List', function() {
    Article.find(function(err, articles) {
      if (err)
        console.log(err);// TODO handle err
      socket.emit('News Feed List', articles);
    });
  });
/*
Event : News Article
emits a an article object containging the html of given article
returns: article
*/
  socket.on('News Article', function(data) {//$(".templateBodyRightcol")[0].html()
    Article.findOne({articleId: data.articleId}, function(err, news) {
      if (err)
        console.log(err);

      request({uri: news.desktopLink}, function(err, response, body) {
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
          news.html = $(".templateBodyRightcol").html();
          socket.emit('News Article', news);
          //console.log( JSON.stringify(newsArticle,null,'\t') );
        });
      });
    });
  });
/* 
Event : request smads
emits an array containing all of the SMU advertisements in the database
returns: ads
*/
  socket.on('request smads', function() {
    console.log('On: request smads');
    Smads.find(function(err, ads) {
        if (err) console.log(err);
      socket.emit('request smads', ads);
    });
  });

  socket.on('auth', function(user) {
    console.log('On : auth - ' + JSON.stringify(user));

    User.findOne(user, function(err, data) {

      if (err) { // error
        console.log('Error : ' + err);
        socket.emit('auth', null);
      }

      if (data === null) { // no data
        console.log('No data');
        socket.emit('auth', null);
      } else { // data
        console.log(JSON.stringify(data, null, 2));
        
        socket.emit('auth', data);
        userStore[socket.handshake.sessionID] = (userStore[socket.handshake.sessionID] || {});
        userStore[socket.handshake.sessionID].isLoggedIn = true;
      }
    });

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