
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

var url =  req.param('url');
var goalgame = [] ;
var substi = [];
var cardgame = [] ;
request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

var league = $('.shorted.uppercase').text().trim();
var table = $('.estadisticas');
var data = $('.scoreboard');
var goal = $('.list_events.goals').slice(0).eq(0);
var card = $('.list_events.goals').slice(1).eq(0);
var subst = $('.list_events.goals').slice(2).eq(0);
   var Dom = data.find('.sb-team-name').first().text().trim();
   var Ext = data.find('.sb-team-name').last().text().trim();
   var time = data.find('.match-live').text();
   var s = data.find('.board').find('li').first().text();
   var l = s.length;
   var scoreDom = s.substr(l-1, l);
   var scoreExt = data.find('.board').find('li').last().text();
   var possesionDom = table.find('.stats').find('td').first().text().trim();
   var possesionExt= table.find('.stats').find('td').last().text().trim();


   var targetDom= table.find('.stats_1_file').find('td').slice(0).eq(0).text();
   var targetExt= table.find('.stats_1_file').find('td').slice(2).eq(0).text();

   var offtargetDom= table.find('.stats_1_file').find('td').slice(3).eq(0).text();
   var offtargetExt= table.find('.stats_1_file').find('td').slice(5).eq(0).text();


   var SavesDom= table.find('.stats_1_file').find('td').slice(9).eq(0).text();
   var SavesExt= table.find('.stats_1_file').find('td').slice(11).eq(0).text();

   var CornerDom= table.find('.stats_1_file').find('td').slice(12).eq(0).text();
   var CornerExt= table.find('.stats_1_file').find('td').slice(14).eq(0).text();


   var OffsideDom = table.find('.stats_1_file').find('td').slice(15).eq(0).text();
   var OffsideExt = table.find('.stats_1_file').find('td').slice(17).eq(0).text();

   var YellowDom= table.find('.stats_1_file').find('td').slice(18).eq(0).text();
   var YellowExt= table.find('.stats_1_file').find('td').slice(20).eq(0).text();

   var REDDom= table.find('.stats_1_file').find('td').slice(21).eq(0).text();
   var REDExt= table.find('.stats_1_file').find('td').slice(23).eq(0).text();

   var FoalDom= table.find('.stats_1_file').find('td').slice(24).eq(0).text();
   var FoalExt= table.find('.stats_1_file').find('td').slice(26).eq(0).text();
 var json = { League : "" ,TeamDom : "", TeamExt : "", Time : "" , ScoreDom : "" , ScoreExt : "" , PossDom : "" , PossExt : "" , TargetDom : "" ,
  TargetExt : "" , OfftargetDom : "" , OfftargetExt : "" , SavesDom : ""  , SavesExt : "" , CornerDom : "" , CornerExt : "" , OffsideDom : "" ,
   OffsideExt : "" , YellowDom : "" , YellowExt : "" , REDDom : "" , REDExt : "" , FoalDom : "" , FoalExt: "", Goal: "", Card: "", Sub: "" }; 
json.League = league;
json.TeamDom = Dom;
json.TeamExt = Ext;
json.Time = time;
json.ScoreDom = scoreDom;
json.ScoreExt = scoreExt;
json.PossDom = possesionDom;
json.PossExt = possesionExt;
json.TargetDom = targetDom;
json.TargetExt = targetExt;
json.OfftargetDom = offtargetDom;
json.OfftargetExt = offtargetExt;
json.SavesDom = SavesDom;
json.SavesExt = SavesExt;
json.CornerDom = CornerDom;
json.CornerExt = CornerExt;
json.OffsideDom = OffsideDom;
json.OffsideExt= OffsideExt;
json.YellowDom= YellowDom;
json.YellowExt = YellowExt;
json.REDDom= REDDom;
json.REDExt = REDExt;
json.FoalDom= FoalDom;
json.FoalExt = FoalExt;

console.log(league);






goal.children('.row').each(function(index,result){
    var json = { Joueur : "", Time : "" ,Equipe: ""}; 
    var data = $(this);
     var joueur= data.find('h4').text().trim();
     var time = data.find('span').last().text().trim();
     var equipe = '';
     var subtleft = data.find('.box.box-left').text().trim();
if(subtleft.length == 0)
{
equipe = 'Away';
}
else{
equipe = 'Home' ;



}
    json.Joueur = joueur;
    json.Time = time ;
    json.Equipe= equipe ;

 
  
    goalgame.push(json);
  });


card.children('.row').each(function(index,result){
    var json = { Joueur : "", Time : "" ,Type : "" ,Equipe: ""}; 
    var data = $(this);
    var joueur= data.find('h4').text().trim();
    var time = data.find('span').first().text().trim();
    var type = data.find('span').last().text().trim();

   var equipe = '';
     var subtleft = data.find('.box.box-left').text().trim();
if(subtleft.length == 0)
{
equipe = 'Away';
}
else{
equipe = 'Home' ;



}

    json.Joueur = joueur;
    json.Time = time ;
    json.Type = type ;
     json.Equipe= equipe ;
  cardgame.push(json);

  });

subst.children('.row').each(function(index,result){
  var json = { Joueur : "", Time : "" ,Equipe: ""}; 
    var data = $(this);
    var equipe ='' ;
    var subtleft = data.find('.box.box-left').text().trim();
if(subtleft.length == 0)
{
equipe = 'Away';
}
else{
equipe = 'Home' ;



}
    var joueur= data.find('h4').text().trim();
     var time = data.find('span').last().text().trim();
     json.Joueur = joueur;
     json.Time = time ;
      json.Equipe= equipe ;
      console.log(equipe);
      substi.push(json);
  });


      }

json.Goal = goalgame ;
json.Card = cardgame ;
json.Sub = substi ;

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

