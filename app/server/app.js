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
import { resetWarningCache } from 'prop-types';

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

	var search_date = (Date.now() - 1.577e+10)
	console.log(search_date)
	var transactions_sql = "SELECT DISTINCT stock from transactions ORDER BY timestamp DESC LIMIT 5"
	console.log(transactions_sql)
	connection.query(transactions_sql, function (err, transactions_result) {
		console.log(transactions_result)
		var stocks = []
		for (var i = 0; i < transactions_result.length; i++)
		{
			stocks.push(transactions_result[i].stock)
		}

		var stock_data = {}
		getInterests(stocks, stock_data, 1.577e+10, function () {
			var graph_data = []
			
			console.log(stock_data)
			var stock_names = []
			var stocks_length = 0
			//bad hansen
			for (var key in stock_data) {
				stock_names.push(key)
				stocks_length = stock_data[key].length
			}
			for (var i = 0; i < stocks_length; i++) {
				var entry = {}
				for (var key in stock_data) {
					entry[key] = stock_data[key][i].value[0]
					entry["time"] = stock_data[key][i].time
				}
				graph_data.push(entry)
			}
			var data = { graph_data: graph_data,
					stocks: stock_names }
			console.log(data)
			var html = renderPage(req.url, data)
			res.send(html);

		})
	})


})


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
		console.log(result)
		var funds = 0
		if (result.length > 0) {
			funds = result[0].funds
		}
		var user_stock_sql = "SELECT * from ledger WHERE username = '" + req.cookies.username + "' AND stock = '" + req.params.stock + "'"
		connection.query(user_stock_sql, function (err, result) {
			var user_stock_price = 0 
			var user_stocks = 0
			if (result.length > 0) {
				for (var i = 0; i < result.length; i++) {
					console.log(result)
					user_stock_price += result[i].price * result[i].amount
					user_stocks += result[i].amount
				}
			}
			googleTrends.interestOverTime({ keyword: req.params.stock, startTime: new Date(Date.now() - 8.64e+7), endTime: new Date(), granularTimeResolution: true })
				.then(function (day_results) {
					var day_jsonresults = JSON.parse(day_results);
					var day_google_data = day_jsonresults["default"]["timelineData"]
					var day_graph_data = []
					//console.log(day_google_data)

					for (let i = 0; i < day_google_data.length; i++) {
						var day_entry = day_google_data[i]
						//console.log(day_entry)
						if (day_entry.value == undefined) continue
						var date = new Date(parseFloat(day_entry.time))
						day_graph_data.push(
							{
								time: day_entry.formattedTime.slice(0, -6),
								value: day_entry.value[0]
							}
						)
					}
					googleTrends.interestOverTime({ keyword: req.params.stock, startTime: new Date(Date.now() - 2.628e+9), endTime: new Date(), granularTimeResolution: true })
						.then(function (results) {

							//console.log('These results are awesome', results);
							var jsonresults = JSON.parse(results);
							var google_data = jsonresults["default"]["timelineData"]
							var graph_data = []
							//console.log(google_data)

							for (let i = 0; i < google_data.length; i++) {
								var entry = google_data[i]
								//console.log(entry)
								if (entry.value == undefined) continue
								var date = new Date(parseFloat(entry.time))
								graph_data.push(
									{
										time: entry.formattedTime.slice(0, -6),
										value: entry.value[0]
									}
								)
							}
							console.log(user_stock_price)
							console.log(user_stocks)
							var user_graph_data = []
							for (var i = 0; i < graph_data.length; i++) {
								user_graph_data.push({ ...graph_data[i] })
								graph_data[i].user_value = user_stock_price / user_stocks
							}
							var current_price = 0
							if (graph_data[graph_data.length - 1] != undefined) {
								current_price = graph_data[graph_data.length - 1]
							}
							console.log(graph_data)
							var data = {
								graph_data: graph_data,
								stock_name: req.params.stock,
								username: req.cookies.username,
								current_price: current_price,
								user_stocks: user_stocks,
								funds: funds
							}
							//res.send(html);
							//console.log(graph_data)
							var html = renderPage(req.url, data)
							res.send(html);
						});
				})
				.catch(function (err) {
					console.error('Oh no there was an error', err);
				});
		});
	});


});

app.post('/current_price', function (req, res) {
	googleTrends.interestOverTime({ keyword: req.params.stock, startTime: new Date(Date.now() - 2.628e+9), endTime: new Date(), granularTimeResolution: true })
		.then(function (day_results) {
			var day_jsonresults = JSON.parse(day_results);
			var day_google_data = day_jsonresults["default"]["timelineData"]
			var day_graph_data = []
			console.log(day_google_data)

			for (let i = 0; i < day_google_data.length; i++) {
				var day_entry = day_google_data[i]
				//console.log(day_entry)
				if (day_entry.value == undefined) continue
				var date = new Date(parseFloat(day_entry.time))
				day_graph_data.push(
					{
						time: day_entry.formattedTime.slice(0, -6),
						value: day_entry.value[0]
					}
				)
			}
			res.send({ current_price: day_graph_data[0].value });
		});
});

app.post('/buy', function (req, res) {

	var select_ledger_sql = "SELECT * FROM ledger WHERE username = '" + req.cookies.username + "' and stock = '" + req.body.stock + "'";
	connection.query(select_ledger_sql, function (err, ledger_result) {
		var update_ledger_sql = "INSERT INTO ledger (username, stock, price, type, amount, timestamp) VALUES ('" + req.cookies.username + "', '" + req.body.stock + "', " + req.body.price.toString() + ", '" + req.body.operation + "', " + req.body.amount + ", " + Date.now() + ")"
		if (ledger_result.length > 0) {
			console.log(ledger_result)
			var ledger = ledger_result[0]//JSON.parse(result[0])
			update_ledger_sql = "UPDATE ledger SET amount = " + (parseInt(ledger.amount) + parseInt(req.body.amount)).toString() + " WHERE username = '" + req.cookies.username + "' AND stock = '" + req.body.stock + "'";
		}
		connection.query(update_ledger_sql, function (err, result) {
		})
		console.log(req.body)

		var total_owned = req.body.amount;
		if (ledger_result.length> 0) {
			total_owned += ledger_result[0].amount	
			if (req.body.operation == "SELL") {
				total_owned -= 2 * req.body.amount
			}
		}
		console.log(req.body.amount)
		var funds = req.body.funds - req.body.amount * req.body.price
		var buy_sql = "INSERT INTO transactions (username, stock, amount, price, operation, total_owned, timestamp, funds_remaining) VALUES ('" + 
		req.cookies.username + "', '" + req.body.stock + "', "  + req.body.amount + ", " + req.body.price + ", '" + req.body.operation + "', " + total_owned + ", " + Date.now() +", " + funds + ")";
		console.log(buy_sql)
		connection.query(buy_sql, function (err, result) {
			
			var update_user_sql = "UPDATE accounts SET funds = " + funds + " WHERE username = '" + req.cookies.username + "'";
			console.log(update_user_sql)
			if (funds < 0) {
				res.send({ funds: req.body.funds, message: "FAILURE" })
			} else {
				googleTrends.interestOverTime({ keyword: req.body.stock, startTime: new Date(Date.now() - 2.628e+9), endTime: new Date(), granularTimeResolution: true })
					.then(function (google_results) {
						var jsonresults = JSON.parse(google_results);
						var google_data = jsonresults["default"]["timelineData"]
						var graph_data = []
						//console.log(google_data)

						for (let i = 0; i < google_data.length; i++) {
							var entry = google_data[i]
							//console.log(entry)
							if (entry.value == undefined) continue
							var date = new Date(parseFloat(entry.time))
							graph_data.push(
								{
									time: entry.formattedTime.slice(0, -6),
									value: entry.value[0]
								}
							)
						}
						if (true || graph_data[graph_data.length - 1] == req.body.price) {
							//updateLedger(req.cookies.username, req.body.price, req.body.stock, req.body.amount, req.body.operation)
							connection.query(update_user_sql, function (err, result) {
								res.send({ funds: funds, message: "SUCCESS2" })
							})

						} else {
							res.send({ funds: req.body.funds, message: "FAILURE2" })
						}

					})
			}

		})
	});
});

function getInterests(stocks, stock_data, time, callback) {
	if (stocks.length <= 0) {
		callback(stock_data)
		return;
	}
	console.log(stocks)
	var search_stock = stocks.pop()
	console.log(search_stock)

	googleTrends.interestOverTime({ keyword: search_stock, startTime: new Date(Date.now() - time), endTime: new Date(), granularTimeResolution: true })
		.then(function (results) {
			var jsonresults = JSON.parse(results);

			stock_data[search_stock] = jsonresults["default"]["timelineData"]
			getInterests(stocks, stock_data, time, callback)
		});
}

app.post('/get_data', function (req, res) {
	console.log("GETDATA")
	var start_date = new Date(Date.now() - 2.628e+9)
	if (req.body.time == "twelveMonthButton") {
		start_date = new Date(Date.now() - (2.628e+9 * 6))
	} else if (req.body.time == "sixMonthButton") {
		start_date = new Date(Date.now() - (2.628e+9 * 12))
	}
	console.log(req.body)
	var stock_data = {}
	
	getInterests(req.body.stocks, stock_data, req.body.time, function () {
		//console.log('These results are awesome', results);
		var total_data = {};
		var graph_data = {};
		for (var key in stock_data) {
			//console.log(Object.keys(stock_data))
			//console.log(stock_data[key].length)
			graph_data[key] = []
			for (var i = 0; i < stock_data[key].length; i++) {
				graph_data[key].push({
					value: stock_data[key][i].value[0],
					time: stock_data[key][i].time,
					formattedTime: stock_data[key][i].formattedTime
				})
			}
		}

		//var jsonresults = JSON.parse(results);
		//var google_data = jsonresults["default"]["timelineData"]
		//var graph_data = []
		//console.log(google_data)

		//for (let i = 0; i < google_data.length; i++) {
		//	var entry = google_data[i]
		//	console.log(entry)
		//	if (entry.value == undefined) continue
		//	var date = new Date(parseFloat(entry.time))
		//	graph_data.push(
		//		{
		//			time: entry.formattedTime.slice(0, -6),
		//			value: entry.value[0]
		//		}
		//	)
		//}
		var data = {
			graph_data: graph_data,
			stock_name: req.body.stock,
			username: req.cookies.username
		}
		//res.send(html);
		console.log(data)
		res.send({ data: data })
	})


	//googleTrends.interestOverTime({ keyword: req.body.stocks, startTime: start_date, endTime: new Date(), granularTimeResolution: true })
	//	.then(function (results) {
	//		//console.log('These results are awesome', results);
	//		var jsonresults = JSON.parse(results);
	//		var google_data = jsonresults["default"]["timelineData"]
	//		var graph_data = []
	//		console.log(google_data)

	//		for (let i = 0; i < google_data.length; i++) {
	//			var entry = google_data[i]
	//			console.log(entry)
	//			if (entry.value == undefined) continue
	//			var date = new Date(parseFloat(entry.time))
	//			graph_data.push(
	//				{
	//					time: entry.formattedTime.slice(0, -6),
	//					value: entry.value[0]
	//				}
	//			)
	//		}
	//		var data = {
	//			graph_data: graph_data,
	//			stock_name: req.body.stock,
	//			username: req.cookies.username
	//		}
	//		//res.send(html);
	//		console.log(data)
	//		res.send({ graph_data: graph_data })
	//	})
	//	.catch(function (err) {
	//		console.error('Oh no there was an error', err);
	//	});
})

app.get('/user/:user', function (req, res) {
	var user_sql = "SELECT * from accounts WHERE username = '" + req.params.user + "'";
	var user_data = {}
	connection.query(user_sql, function (err, user_result) {
		var search_date = (Date.now() - 1.577e+10)
		console.log(search_date)
		var transactions_sql = "SELECT* from transactions WHERE username = '" + req.params.user + "' AND timestamp > " + search_date.toString() + " ORDER BY timestamp ASC" 
		console.log(transactions_sql)
		connection.query(transactions_sql, function (err, transactions_result) {
			console.log(transactions_result)
			var transactions_log = [{timestamp:0, funds_remaining: 0}]
			

			for (var i = 0; i < transactions_result.length; i++) {
				var transaction_entry = {}
				transaction_entry["timestamp"] = transactions_result[i].timestamp
				transaction_entry["funds_remaining"] = transactions_result[i].funds_remaining
				var stock_entry = {}
				if (transactions_log[i].stocks == undefined) {
					
					stock_entry[transactions_result[i].stock] = transactions_result[i].amount
					transaction_entry["stocks"] = stock_entry
				} else {
					stock_entry = { ...transactions_log[i]["stocks"] }
					stock_entry[transactions_result[i].stock] = transactions_result[i].amount
					transaction_entry["stocks"] = stock_entry
				}
				transactions_log.push(transaction_entry)
			}
			console.log(transactions_log)
			var user_stock_sql = "SELECT * from ledger WHERE username = '" + req.params.user + "'"
			connection.query(user_stock_sql, function (err, stock_result) {
				var stock_info = {}
				for (var i = 0; i < stock_result.length; i++) {
					if (stock_result[i].stock in stock_info) {
						stock_info[stock_result[i].stock] += stock_result[i].amount
					}
					else {
						stock_info[stock_result[i].stock] = stock_result[i].amount
					}
				}
				var stock_data = {}
				getInterests(Object.keys(stock_info), stock_data, 1.577e+10, function () {
					var total_data = {};
					var graph_data = {}
					//console.log("TEST")
					//console.log(stock_data)
					//console.log(stock_data["taylor swift"])
					for (var key in stock_data) {
						//console.log(Object.keys(stock_data))
						//console.log(stock_data[key].length)
						graph_data[key] = []
						for (var i = 0; i < stock_data[key].length; i++) {
							graph_data[key].push({
								value: stock_data[key][i].value * stock_info[key],
								time: parseInt(stock_data[key][i].time),
								formattedTime: stock_data[key][i].formattedTime
							})
							if (stock_data[key][i].time in graph_data) {
								total_data[stock_data[key][i].time] += stock_data[key][i].value * stock_info[key]
							} else {

								total_data[stock_data[key][i].time] = stock_data[key][i].value * stock_info[key]
							}
						}
					}
					var total_graph_data = []
					for (var key in total_data) {
						var entry = {}
						entry["time"] = key
						entry["formattedTime"] = key
						entry["value"] = total_data[key]
						var jsonentry = JSON.parse(JSON.stringify(entry))
						total_graph_data.push(jsonentry)
					}
					console.log(graph_data["taylor swift"])
					var data = {
						username: req.params.user,
						graph_data: graph_data,
						total_graph_data: total_graph_data,
						stock_info: stock_info,
						transactions_log: transactions_log
					}
					var html = renderPage(req.url, data)
					res.send(html);
				})



			})
		})
	});
});

module.exports = app;