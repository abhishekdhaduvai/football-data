
const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const httpServer = http.createServer(app);
const axios = require('axios');

const credentials = require('./config');
const league = require('./league');

const node_env = process.env.node_env || 'development';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, process.env['base-dir'] ? process.env['base-dir'] : '../')));

var leagues;

var premTables = [];
var seriATables = [];
var ligue1 = [];
var bundesliga = [];

var premGoals = [];

const getLeagues = () => {
  const headers = {
    'X-Auth-Token': credentials.apiKey
  }
  axios.get('http://api.football-data.org/v1/competitions/', {headers})
  .then(res => {
    leagues = res.data;
  })
  .then(() => {
    let ENG1 = leagues.filter(league => league.league === 'PL')[0];
    let ITA1 = leagues.filter(league => league.league === 'SA')[0];
    let FRA1 = leagues.filter(league => league.league === 'FL1')[0];
    let GER1 = leagues.filter(league => league.league === 'BL1')[0];


    league.getTables(ENG1, premTables, premGoals);
    // league.getTables(ITA1, seriATables);
    // league.getTables(FRA1, ligue1);
    // league.getTables(GER1, bundesliga);
  })
  .catch(err => {
    console.log('ERROR GETTING LEAGUES', err);
  });
}

getLeagues();

app.get('/prem', (req, res) => {
  // res.send(premTables);
  res.send(premTables);
});

app.get('/prem/goals', (req, res) => {
  res.send(premGoals)
})


////// error handlers //////
// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler - prints stacktrace
if (node_env === 'development') {
	app.use(function(err, req, res, next) {
		if (!res.headersSent) {
			res.status(err.status || 500);
			res.send({
				message: err.message,
				error: err
			});
		}
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	if (!res.headersSent) {
		res.status(err.status || 500);
		res.send({
			message: err.message,
			error: {}
		});
	}
});

httpServer.listen(process.env.VCAP_APP_PORT || 5000, function () {
	console.log ('Server started on port: ' + httpServer.address().port);
});

module.exports = app;
