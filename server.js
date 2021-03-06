var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var firebaseHelper = require('./firebaseHelper');
var fs = require( 'fs' );
var app = express();

app.use(express.static('client/build'));
// tell express to use bodyparser -- take the request body and put it as json on the req object
app.use(bodyParser.json());

// INITIALISE FIREBASE
console.log( "Initialising firebase" );
firebaseHelper.init();

// GET HOME
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/build/home.html'));
});


///////////
// ADMIN //
///////////

// GET ADMIN QUIZZES
app.get('/admin/quizzes', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/build/admin/index.html'));
});

// GET QUIZ ADD EDIT
app.get('/admin/quizzes/new', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/build/admin/addQuiz.html'));
});

// GET EDIT QUIZ
app.get('/admin/quizzes/:quiz_id', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/build/admin/addQuiz.html'));
});


//////////
// USER //
//////////

//GET USER QUIZZES
app.get('/user/quizzes', function(req, res){
  res.sendFile(path.join(__dirname + '/client/build/user/index.html'));
});

//GET QUESTIOn
app.get('/user/quizzes/:quiz_id', function( req, res) {
  var quizId = req.params.quiz_id;
  console.log("quiz requested:", quizId);
  res.sendFile(path.join(__dirname + '/client/build/user/quiz.html'));
});

app.get('/user/results', function( req, res ) {
  res.sendFile(path.join(__dirname + '/client/build/user/results.html'));
});

/////////
// API //
/////////

// GET ALL COUNTRIES
app.get('/countries', function(req, res){
  var buffer = fs.readFileSync('data/countries.json');
  var bufferString = buffer.toString();
  var countries = JSON.parse( bufferString );
  res.json( countries );
})

// GET QUIZZES
app.get('/quizzes', function(req, res){
  firebaseHelper.getAllQuizzes(function( allQuizzes ){
    res.json( allQuizzes );
  });
});

// GET QUIZ
app.get('/quizzes/:quiz_id', function( req, res ) {
  var quizId = req.params.quiz_id;
  firebaseHelper.getQuizById( quizId, function( quiz ) {
    if ( quiz ) {
      console.log( "receieved quiz with id", quizId, ":\n", quiz );
      res.json( quiz );
    }
    else {
      console.log( "no quiz with id", quizId, "found" );
      res.status( 404 ).end();
    }
  });
});

// POST QUIZ
app.post('/quizzes', function(req, res){
  console.log( "posting quiz:", req.body );
  firebaseHelper.createQuiz(req.body, function( err ) {
    if ( err ) {
      res.status( 500 ).end();
    }
    else {
      // ending the response, status 200 is succesful
      res.status( 200 ).end();
    }
  });
});

app.put('/quizzes', function( req, res ) {
  console.log( "updating quiz:", req.body.id );
  firebaseHelper.updateQuiz( req.body );
  res.status( 200 ).end();
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Location-based Education listening at http://%s:%s', host, port);
});
