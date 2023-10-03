var path = require('path');
var express = require('express');
var ReactDOMServer = require('react-dom/server');
var mysql = require('mysql2')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuidv3 = require('uuid');
var bcrypt = require('bcrypt')
const googleTrends = require('google-trends-api');
var saltRounds = 10;
var plotly = require('plotly')("hansenling", "PqeHDbdryi4ZB24Cr24b");

import React from 'react';
const app = express();

const publicPath = express.static(path.join(__dirname, '../'));
const indexPath = path.join(__dirname, '../public/index.html');
import  {BrowserRouter as Router} from 'react-router-dom'

import App from '../components/App.js';
import Home from '../components/Home.js';
import { StaticRouter } from "react-router-dom/server";
import mixpanel from 'mixpanel-browser';
import { MixpanelProvider, MixpanelConsumer } from 'react-mixpanel';

app.use(publicPath);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 

var POST_LIMIT = 5;
var COMMENT_LIMIT = 5;
var RELEVANT_TIMESTAMP_MAX_AMOUNT = 100;
var SCORE_MODIFIER = 2;
var PRIORITY_MODIFIER = 8640 / 4500

var score_sql = " " + SCORE_MODIFIER + " * LOG(ABS(cast(likes as signed) - cast(dislikes as signed))) * SIGN(cast(likes as signed) - cast(dislikes as signed)) + (relevant_timestamp - UNIX_TIMESTAMP() * 1000)/45000000 "

//test database
// var connection = mysql.createConnection({
//   host     : 'us-cdbr-iron-east-01.cleardb.net',
//   user     : 'bc7ebf9f6de242',
//   password : 'aa9b1c1f',
//   database : 'heroku_cdc4ca7b10e1680',
//   multipleStatements: true
// });

//prod database
//var connection = mysql.createConnection({
//  host     : 'us-iron-auto-sfo-03-bh.cleardb.net',
//  user     : 'b82ff0c686544a',
//  password : '52ad3adb',
//  database : 'heroku_4df94195b1d1e6b',
//  multipleStatements: true
//});

//local database
 var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'qwertyman1',
   database : 'trendmarket',
   multipleStatements: true
 });

var context = {};
function renderPage(url, data) {
	var html = ReactDOMServer.renderToString(<StaticRouter location={url} context={context}><App data={data} /></StaticRouter>)
	html = ' <script>window.__DATA__ = ' + JSON.stringify(data) + '</script>' + html
	return html;
}

app.get('/', function (req, res) {
	var data = {
		login_message: "",
		username: req.cookies.username
	}
	var html = renderPage(req.url, data)
	res.send(html);
});


app.get('/login', function(req, res)
{
	var data = {
		login_message: "",
		username: req.cookies.username
	}
	var html = renderPage(req.url, data)
	res.send(html);
});

app.post('/login', function(req, res)
{
	var sql = "SELECT password FROM accounts where LOWER(username) = '" + req.body.username.toLowerCase() + "'";// + "' COLLATE utf8_bin";
	connection.query(sql, function (err, result, fields) {
	    if (err) throw err;
	    var login_message = "Login Failure";
	    if (result.length == 0)
	    {
			var data = {login_message:"Login Failed",
			}
			res.send(data);	    
			return	
	    }
	  	bcrypt.compare(req.body.password, result[0].password, function(err, decrypt_result) {
		    if (decrypt_result)
		    {
				res.cookie('username', req.body.username);
				var data = {login_message:"Login Successful"}
				res.send(data);			
		    }
		    else
		    {
				var data = {login_message:"Login Failed"}
				res.send(data);
		    }	  		
	  	});
  	});
});

app.post('/logout', function(req, res)
{
	res.clearCookie('username')
	res.send({data:1})
});


app.get('/register', function(req, res)
{
	var data = {username: req.cookies.username}
	var html = renderPage(req.url, data)
	res.send(html);
});

app.post('/register', function(req, res)
{
	if (req.body.password == req.body.password_confirm)
	{
		var username_check_sql = "SELECT * from accounts WHERE username = '" + req.body.username + "'";
		var data;
		if (req.body.username.indexOf(' ') != -1)
		{
	  		data = {
				message: "Username cannot contain spaces"
			}
			res.send(data);
			return
		}
		if (req.body.username.length > 32)
		{
	  		data = {
				message: "Username is too long, must be less than 32 characters"
			}
			res.send(data);
			return
		}
		connection.query(username_check_sql, function (err, result) {
			if (result == null || result.length == 0)
			{
				bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
				 	 // Store hash in your password DB.
					var sql = "INSERT INTO accounts (username, password, email) VALUES ('" + req.body.username + "', '" + hash + "', '" + req.body.email + "')";
					connection.query(sql, function (err, result) {
				    	if (err) throw err;
			  		});
			  		data = {
						message: "Registration Successful"
					}
					res.cookie('username', req.body.username);
			  		res.send(data);		
				});
	
			}
			else
			{
		  		data = {
					message: "Username already taken"
				}
				res.send(data);
			}
		});
	}
	else
	{
		data = {
			message: "Passwords don't match"
		}
		res.send(data)
	}
	
}); 

app.post('/', (req, res) => {
	var data = { username: req.cookies.username }
	res.send(data);
})

app.get('/stock/:stock', function (req, res) {
	var user_sql = "SELECT * from accounts WHERE username = '" + req.cookies.username + "'";
	connection.query(user_sql, function (err, result) {
		var funds = result[0].funds
		googleTrends.interestOverTime({ keyword: req.params.stock, startTime: new Date(Date.now() - 2.628e+9), endTime: new Date(), granularTimeResolution: true })
			.then(function (results) {
				//console.log('These results are awesome', results);
				var jsonresults = JSON.parse(results);
				var google_data = jsonresults["default"]["timelineData"]
				var graph_data = []
				console.log(google_data)

				for (let i = 0; i < google_data.length; i++) {
					var entry = google_data[i]
					console.log(entry)
					if (entry.value == undefined) continue
					var date = new Date(parseFloat(entry.time))
					graph_data.push(
						{
							time: entry.formattedTime.slice(0, -6),
							value: entry.value[0]
						}
					)
				}
				var data = {
					graph_data: graph_data,
					stock_name: req.params.stock,
					username: req.cookies.username,
					funds: funds
				}
				//res.send(html);
				console.log(data)
				var html = renderPage(req.url, data)
				res.send(html);
			})
			.catch(function (err) {
				console.error('Oh no there was an error', err);
			});
	});


});

app.post('/buy', function (req, res) {
	console.log(req.body)
	var buy_sql = "INSERT INTO accounts (username, amount, price, operation, ) VALUES ('" + req.cookies.username + "', '" + hash + "', '" + req.body.email + "')";
	connection.query(username_check_sql, function (err, result) {

	})
});

app.post('/get_data', function (req, res) {
	console.log("GETDATA")
	var start_date = new Date(Date.now() - 2.628e+9)
	if (req.body.time == "twelveMonthButton") {
		start_date = new Date(Date.now() - (2.628e+9 * 6))
	} else if (req.body.time == "sixMonthButton") {
		start_date = new Date(Date.now() - (2.628e+9 * 12))
	}
	console.log(req.body)
	googleTrends.interestOverTime({ keyword: req.body.stock, startTime: start_date, endTime: new Date(), granularTimeResolution: true })
		.then(function (results) {
			//console.log('These results are awesome', results);
			var jsonresults = JSON.parse(results);
			var google_data = jsonresults["default"]["timelineData"]
			var graph_data = []
			console.log(google_data)

			for (let i = 0; i < google_data.length; i++) {
				var entry = google_data[i]
				console.log(entry)
				if (entry.value == undefined) continue
				var date = new Date(parseFloat(entry.time))
				graph_data.push(
					{
						time: entry.formattedTime.slice(0, -6),
						value: entry.value[0]
					}
				)
			}
			var data = {
				graph_data: graph_data,
				stock_name: req.body.stock,
				username: req.cookies.username
			}
			//res.send(html);
			console.log(data)
			res.send({ graph_data: graph_data })
		})
		.catch(function (err) {
			console.error('Oh no there was an error', err);
		});
	



})

module.exports = app;