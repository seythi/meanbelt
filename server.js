var express = require('express');
// Create an Express App
var app = express();
var bcrypt = require('bcrypt');
var mngo = require('mongoose');
var ObjectId = mngo.Schema.Types.ObjectId;
mngo.connect('mongodb://localhost/mongoosetest');
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.json({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
app.use('/bower_components', express.static(__dirname +'/bower_components'));
app.use('/client', express.static(__dirname +'/client'));
//generate schemas
var UserSchema = new mngo.Schema({
 name: {type: String,
        reqired: [true, 'You have to have a name']}
})
var ChoiceSchema = new mngo.Schema({
  optname: {type: String, minlength: [3, 'Options have to be at least 3 characters']},
  vcount: Number,
})
var PollSchema = new mngo.Schema({
  title: {type: String, minlength: [8, 'The Question has to be at least 8 characters']},
  createdAt: Date,
  _poster: {type: ObjectId, ref: 'User'},
  choices: [ChoiceSchema],
})
mngo.model('User', UserSchema);
var User = mngo.model('User');
mngo.model('Poll', PollSchema);
var Poll = mngo.model('Poll');

// User.remove({}, function(err) { console.log(err) });

//var lnr = require('./helpers/lnr.js');
// Routes
// Root Request
app.get('/', function(req, res) {
    res.sendFile(__dirname +'/client/static/index.html')
    
})
app.post('/retuser', function(req, res){ //req has name
  User.findOne({'name':req.body.name}, 'name', function(err, user){
      if(user)
      {
        res.json({name: user.name});
      } else {
        var nuser = new User({name: req.body.name});
        nuser.save(function(error) {
          if(error) {
            console.log(error);
            res.json(error);
          } else {
            console.log(nuser);
            res.json({name: nuser.name})
          }
        })
      }
    })
});

app.post('/pose', function(req, res){ //req has name, title, o0-3
  User.findOne({'name': req.body.name}, function(err, user)
  {
    if(user)
    {
      var npoll = new Poll({title: req.body.title, createdAt: new Date(), _poster: user._id, choices: [
          {optname: req.body.o0, vcount: 0},
          {optname: req.body.o1, vcount: 0},
          {optname: req.body.o2, vcount: 0},
          {optname: req.body.o3, vcount: 0},
        ]})
      npoll.save(function(error) {
          if(error) {
            console.log(error);
            res.json({success: false, err: error});
          } else {
            res.json({success: true});
          }
        })
    }
    else{res.json({success: false, err: error})}
  })
})

app.post('/populateDash', function(req, res){
  Poll.find().select('title createdAt _poster').populate('_poster').exec(function(err, polls){
    if(err){res.json(err)}
      else{res.json(polls)}
  })
})
app.post('/vote', function(req, res){
  Poll.findById(req.body.targ, function(err, poll){
    if(err){res.json(err)}
      else{
        poll.choices[req.body.choice].vcount += 1;
        poll.save();
        res.json(poll);
      }
  })
})
app.post('/populateTarg', function(req, res){
  Poll.findById(req.body.targ, function(err, poll){
    if(err){res.json(err)}
      else{
        res.json(poll);
      }
  })
})
app.post('/delete', function(req, res){
  Poll.findOneAndRemove({_id: req.body.targ}, function(err, target){});
})

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})