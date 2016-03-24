
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
 ,https = require('http')
 , fs = require('fs')
 , xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
 var parser = new xml2js.Parser();

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/test',function(req,res){
 parser.on('error', function(err) { console.log('Parser error', err); });

 var data = '';
 https.get("http://www.matchendirect.fr/rss/info.xml", function(res) {
     if (res.statusCode >= 200 || res.statusCode < 400) {
       res.on('data', function(data_) { data += data_.toString(); });
       res.on('end', function() {
         console.log('data', data);
parseString(data, function (err, data) {
    console.dir(JSON.stringify(data));
fs.writeFile('output.json', JSON.stringify(data, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');


});
});
   
      
       });
     }
   });
 res.send('<html><body><h1>OK<h1></body></html>');
});
var port = Number (process.env.PORT || 3000)
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

