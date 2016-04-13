
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


app.get('/live', function(req, res){

url = 'http://m.besoccer.com/livescore';

request(url, function(error, response, html){
    if(!error){
        var match = [] ;
        var $ = cheerio.load(html);

   


 $('.table-results.table-results-bets.l').each(function (index,resultat){
var data = $(this);


var cham = data.prev().children().find('strong').text();
 
   var leag  = data.find('.list_partidos.live');
     leag.each(function(index , resultat){
        var data = $(this);
        var s = data.parent().find('.tb-more');
   var temps = data.find('.televisiones').text();
   var score =data.find('.result.result-jugandose').text();
   var D = data.find('.nombre_equipo').first().text();
   var E = data.find('.nombre_equipo').last().text();
   var teamD = D.replace(/\s\s+/g, ' ');
  var teamE = E.replace(/\s\s+/g, ' ');
var u =  data.find('.click').attr('data-href');
var urlmatch ='http:'+u;
console.log(urlmatch);
  var championat = cham;
   var json = { equipeD : "", equipeE : "", score : "",time : "",competition : "",url : ""};
  json.equipeD = teamD;
  json.equipeE = teamE;
  json.score = score ;
  json.time = temps;
  json.competition=championat;
json.url = urlmatch;
  
  match.push(json);
 
}) 

    })
     
}

// To write to the system we will use the built in 'fs' library.
// In this example we will pass 3 parameters to the writeFile function
// Parameter 1 :  output.json - this is what the created filename will be called
// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
// Parameter 3 :  callback function - a callback function to let us know the status of our function

//fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

  //  console.log('File successfully written! - Check your project directory for the output.json file');

//
// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
//res.send('Check your console!')
res.contentType('application/json');
res.send(JSON.stringify(match));

    })
})

app.get('/info',function(req,res){
res.contentType('application/json');
var news = [];

for(var i = 1 ; i <= 2 ;i++)
{

var url = 'http://m.besoccer.com/news/featured/'+i;

request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);
  


  $('.new-item.click').each(function (index,resultat){
var data = $(this);
var figure = data.children('.ni-figure');
var all = data.children('.ni-info');
var da = all.children('.ni-data');
    var date = da.children('.ni-date').text();
 var titre = all.children('.ni-title').text();
 var description = all.children('.ni-subtitle').text();
 var u = figure.attr('href');
 var url = 'http:'+u;
 var image = figure.children('.ni-image').attr('src');

   var json = { titre : "", description : "", date : "",image : "",url : ""};

json.date= date;
json.titre= titre;
json.description= description;
json.image= image;
json.url= url;

      news.push(json);
      console.log(news.length)
})
     
}

        
res.send(JSON.stringify(news));
})
}


})

app.get('/de-info', function(req, res){
 var url = req.param('url');
request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);
   var json = { titre : "", description : "", image : ""}; 
  var image = $('.ni-image').attr('src');
  var title = $('.ni-title').text();
   var description = $('.ni-text-body').find('p').text();
json.titre = title;
json.description = description;
json.image = image;
      }
res.contentType('application/json');
res.send(JSON.stringify(json));
})

})


app.get('/match-day', function(req, res){
 var url = 'http://m.besoccer.com/leagues';
 var league = [];

request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);
 
  $('.logo-name').each(function(index,result){
    var json = { championnat : "", day : ""}; 
var data = $(this);
    var champ= data.children('h4').text();
    var statut = data.children('.league-status');
    var jou = statut.children('.ls-journey');
    var day = jou.children('.ls-actual').text();
    json.championnat = champ;
    json.day = day ;
    league.push(json);
  });
 
      }
res.contentType('application/json');
res.send(JSON.stringify(league));
})

})

app.get('/detail-match',function(req,res){
 req.param('url');
var url = 'http://m.besoccer.com/match/1461-Trabzon/Elazigspor';
request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

   var json = { titre : "", description : "", image : ""}; 
var data = $('.scoreboard');
   var Dom = data.find('.sb-team-name').first().text();
   var Ext = data.find('.sb-team-name').last().text();
   var time = data.find('.match-live').text();
   var score = data.find('.match-status.match-directo').nextAll().text();
console.log(Dom);
console.log(Ext);
console.log(time);
console.log(score);

      }
res.contentType('application/json');
res.send(JSON.stringify(json));
})




});

app.get('/favoris',function(req,res){
url = 'http://m.besoccer.com';

request(url, function(error, response, html){
    if(!error){
        var match = [] ;
        var $ = cheerio.load(html);

 $('.table-results.table-results-bets.l').each(function (index,resultat){
var data = $(this);
var cham = data.prev().children().find('strong').text();
   var leag  = data.find('.list_partidos');
    leag.each(function(index , resultat){
    var data = $(this);
    var s = data.parent().find('.tb-more');
   var temps = data.find('.result.chk_hour.chk_hour').text();
   var score =data.find('.result.result-finalizado').text();
   var D = data.find('.nombre_equipo').first().text();
   var E = data.find('.nombre_equipo').last().text();
   var teamD = D.replace(/\s\s+/g, ' ');
  var teamE = E.replace(/\s\s+/g, ' ');
  var u =  data.find('.click').attr('data-href');
var urlmatch ='http:'+u;

  var championat = cham;
console.log(cham , temps);
   var json = { equipeD : "", equipeE : "", score : "",time : "",competition : "",url : "",date: ""};
  json.equipeD = teamD;
  json.equipeE = teamE;
  json.score = score ;
  json.time = temps;
  json.competition=championat;
json.url = urlmatch;
  
  match.push(json);
 
}) 

    })

}
res.send(JSON.stringify(match));
});
});

var port = Number (process.env.PORT || 3000)
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

