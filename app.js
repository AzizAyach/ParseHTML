
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
 ,https = require('http')
 , fs = require('fs')
 , xml2js = require('xml2js');
 var request = require('request');
var cheerio = require('cheerio');
var cors = require('cors');
var parseString = require('xml2js').parseString;
 var parser = new xml2js.Parser();

var app = module.exports = express.createServer();
app.use(cors());

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


app.get('/',function(req,rsp){


})


app.get('/news',function(req,respon){
 parser.on('error', function(err) { console.log('Parser error', err); });

 var data = '';
 var resp ;
 var test;
 https.get("http://www.matchendirect.fr/rss/info.xml", function(res) {
     if (res.statusCode >= 200 || res.statusCode < 400) {
       res.on('data', function(data_) { data += data_.toString(); });
       res.on('end', function() {
parseString(data, function (err, data) {
    console.dir(JSON.stringify(data));
    resp =JSON.stringify(data, null, 4);
     respon.send(resp);
});
   
      
       });
     }
   });

});


app.get('/html', function(req, res){

url = 'http://m.besoccer.com/livescore';

request(url, function(error, response, html){
    if(!error){
        var match = [] ;
        var $ = cheerio.load(html);
    var title, release, rating;

    var json = { equipeD : "", equipeE : "", Score : "",Time : "" };

    $('result result-jugandose').filter(function(){
        var data = $(this);
        title = data.children().first().text();            
        release = data.children().last().children().text();
         console.log(title); 

        json.title = title;
        json.release = release;
    })

    $('.result result-jugandose').filter(function(){
        var data = $(this);
        rating = data.text();
console.log(rating); 
        json.rating = rating;
    })
}

// To write to the system we will use the built in 'fs' library.
// In this example we will pass 3 parameters to the writeFile function
// Parameter 1 :  output.json - this is what the created filename will be called
// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
// Parameter 3 :  callback function - a callback function to let us know the status of our function

fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');

})

// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
res.send('Check your console!')

    }) ;
})



var port = Number (process.env.PORT || 3000)
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

