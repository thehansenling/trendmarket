
import React from 'react';
import { render } from 'react-dom';
import {
	BrowserRouter as Router,
	Redirect,
	Route,
	Routes
} from 'react-router-dom';


//import List from './List';
import Home from './home.js'
import Login from './login.js'
import Register from './register.js'
import Stock from './stock.js'
import StandardHeader from './standard_header.js'
import mixpanel from 'mixpanel-browser';
import { MixpanelProvider, MixpanelConsumer } from 'react-mixpanel';
//	<Route path = "/user/:user" exact component={User} />
// <Route path = "/user" exact render={() => (<Home data={{hmm:"what"}}/>)}  />
export default class App extends React.Component {

	constructor(props) {
		super(props)
		mixpanel.init("63586aff50e8055326d4fb5944633383");
	}

	handleClick(e) {
		console.log("CLICKED");
	}

	componentDidMount() {
		if (typeof window !== 'undefined') {
			document.body.style.backgroundColor = "rgb(242, 242, 242)";
			document.body.style.marginTop = "60px";
		}

		//mixpanel.track("An event");
	}
	//#FAFAFA
	render() {
		//mixpanel.init("63586aff50e8055326d4fb5944633383");
		return (
			<div className="App" id='root' style={{ width: '100%', minWidth: '1200px' }}>
				<StandardHeader username={this.props.data.username} notifications={{}} />
				<link rel="stylesheet" href="/styles.css" />
				<Routes>
					<Route exact path="/" element={<Home data={this.props.data} mixpanel={mixpanel} />} />
					<Route exact path="/login" element={<Login data={this.props.data} mixpanel={mixpanel} />} />
					<Route exact path="/register" element={<Register data={this.props.data} mixpanel={mixpanel} />} />
					<Route exact path="/stock/:stock_id" element={<Stock data={this.props.data} mixpanel={mixpanel} />} />
				</Routes>
				<script type="text/javascript" src="../public/bundle.js"> </script>
			</div>
		);
	}
}
