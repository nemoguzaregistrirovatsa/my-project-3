'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
var Schema = new mongoose.Schema({
  'original_url': String,
  'short_url': String
}, {timestamps: true})
var Model = mongoose.model('Model', Schema);
  

app.use(cors());
app.use(bodyParser.urlencoded());

app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function(req, res) {
  var regex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm;
  if (regex.test(req.body.originalUrl)==true) {
    Model.findOne({'original_url': req.body.originalUrl}, (err, dat) => {
      if (err) res.send('Error reading database!')
      else if (dat == null) {
        var shortUrl = Math.round(Math.random()*100000).toString();
        var data = new Model({
          'original_url': req.body.originalUrl,
          'short_url': shortUrl
        });
        data.save((err) => {
          if (err) res.send('Error saving to database!')
          else res.json(data); 
        })
      } else res.json(dat)
    })
  } else res.json({error: 'Invalid URL'})
});

app.get('/api/shorturl/:new', function(req, res) {
  var d = {};
  Model.findOne({'short_url': req.params.new}, (err, dat) => {
    if (err) res.send('Error reading database!')
    else if (dat == null) res.send('No such URL')
    else res.redirect(dat['original_url']);
  })
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening...');
});