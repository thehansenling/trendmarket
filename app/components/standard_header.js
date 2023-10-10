var React = require('react');
var ReactDOM = require('react-dom')
import {isMobile} from 'react-device-detect';

class SearchList extends React.Component {

	constructor(props)
	{
		super(props);
		this.search_list = React.createRef();
		this.searchRef = React.createRef();
	}

	handleChange()
	{
		var input = event.target.value;
		var that = this;

	}

	componentDidMount() {
		console.log(this.searchRef)
		var that = this
		this.searchRef.current.addEventListener("keypress", function (event) {
			// If the user presses the "Enter" key on the keyboard
			if (event.key === "Enter") {
				// Cancel the default action, if needed
				event.preventDefault();
				window.location.href = "/stock/" + that.searchRef.current.value
			}
		});
	}

	render ()
	{
		var desktop_search_class = "searchBar"
		var mobile_search_class = "mobileSearchBar"

		var desktop_search_height = {height:"100%"}
		var mobile_search_height = {height:"50%"}

		var search_class = desktop_search_class
		var search_height = desktop_search_height
		if (isMobile)
		{
			search_class = mobile_search_class
			search_height = mobile_search_height
		}
		return(
			<div style = {search_height} className="searchBarContainer">
				<input style={{ height: '100%' }}
					ref={ this.searchRef }
					className={search_class}
					placeholder='Search'
					type='text'
					/>
			</div>
		);

	}
}

export default class StandardHeader extends React.Component {

	constructor (props)
	{
		super(props);
		this.search_list = React.createRef();
		this.dropdownRef = React.createRef();
		this.notificationsRef = React.createRef();
		this.dropdown_content = []
		this.optionsRef = React.createRef();
	  	this.notification_div = ""
	  	this.dropdown_div = ""
	  	this.login_div = ""
	}

	logoutClicked ()
	{
	    fetch('/logout', {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	    })
	    .then(function(response) { return response.json();})
	    .then(function (data) {
	    	location.reload(true);
	 	})
	}


	toggleNotifications()
	{
		if (this.dropdownRef.current.style.display == 'block')
		{
			this.closeNotifications()
		}
		else
		{
			this.showNotifications()
		}
	}

	showNotifications()
	{

		this.dropdownRef.current.style.display = 'block'
		this.forceUpdate();
	}

	closeNotifications()
	{
		this.dropdownRef.current.style.display = 'none'
		this.forceUpdate();
	}

	componentDidMount()
	{
	}

	componentWillUnmount()
	{
		window.removeEventListener('mousedown', this.handleClickOutside.bind(this));
	}

	handleClickOutside(event)
	{
		if (event.type == 'contextmenu')
		{
			return
		}
		if (event.target.className.indexOf("dropdown") != -1 && event.target.className.indexOf("notifications") != -1 && event.target.className.indexOf("dropdownelement") != -1) {
			this.closeNotifications()
		}
		else
		{
		}
	}

	removeNotification(id)
	{
		for (var i = 0; i < this.dropdown_content.length; ++i)
		{
			if (this.dropdown_content[i].props.id == id)
			{
				this.dropdown_content.splice(i, 1)
				this.notification_div = <div className = "notifications" ref = {this.notificationsRef} onClick = {this.toggleNotifications.bind(this)} style = {{marginRight: '10px', fontWeight:'bold', fontSize:'14pt', minWidth:'30px', minHeight:'30px', textAlign:'center'}}> {this.notification_div.props.children[1] -1}</div>
				break
			}
		}
		if (this.dropdown_content.length == 0)
		{
			this.notification_div = ""
			this.closeNotifications();
		}

		this.forceUpdate()
	    fetch('/remove_notification', {
	        method: "POST",
	        headers: {
	        	Accept: 'application/json',
	        	'Authorization': 'Basic',
	        	'Content-Type': 'application/json',
	        },
	        body: JSON.stringify({id:id}),
	    })
	    .then(function(response) { return response.json();})
	    .then(function (data) {
	 	})
	}

	toggleOptions()
	{
		if (this.optionsRef.current.style.display == 'none')
		{
			this.optionsRef.current.style.display = ''
		}
		else
		{
			this.optionsRef.current.style.display = 'none'
		}
	}
	closeOptions()
	{

		this.optionsRef.current.style.display = 'none'
	}
  render() {
		this.dropdown_div = <div className = "dropdown" ref = {this.dropdownRef} style = {{ width:'400px', minHeight:'10px', position: "fixed", right:'124', top:'52px', background:'white', display:'none', fontWeight:'normal', fontSize:'12pt', zIndex:'8'}}>{this.dropdown_content}</div>



	var desktop_header_style = {display:'flex', alignItems:'center'}
	var desktop_home_style = {}
	var desktop_search_class = "searchBar"
	var desktop_header_item_size = ''
	var mobile_header_style = {display:'flex', alignItems:'center', height:'8%'}
	var mobile_home_style = {fontSize:'3em'}
	var mobile_header_item_size = '2.8em'
	var mobile_search_class = "mobileSearchBar"

	var header_style = desktop_header_style
	var home_style = desktop_home_style
	var search_class = desktop_search_class
	var header_item_size = desktop_header_item_size
	if (isMobile)
	{
		header_style = mobile_header_style
		home_style = mobile_home_style
		search_class = mobile_search_class
		header_item_size = mobile_header_item_size
	}

  	let user_login, login_div;
  	if (this.props.username == undefined) {
	  	user_login = (
				<div className="headerLink" style = {{fontSize:header_item_size}} onClick={() => {window.location.href = "/register"}}>Register</div>
			);
			login_div = <div className="headerLink" style = {{fontSize:header_item_size}} onClick={() => {window.location.href = "/login"}}>Login</div>
  	} else {
			user_login = (
				<div className="headerLink" style = {{fontSize:header_item_size}} onClick={() => {window.location.href = "/user/" + this.props.username}}>{this.props.username}</div>
			);
		}

    return (
			<div>
				<head>
					<title>Unheard</title>
					<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>
				</head>
				<header>
					<div className="fixedHeader" style = {header_style}>
						<div style = {home_style} className="headerLink" onClick={() => {window.location.href = "/"}}>Home</div>
						<div style={{flex: '1 0 auto', padding: '0 12px', display:'flex', alignItems:'center', height:'100%'}}>
							<SearchList />
						</div>
						{login_div}
						{user_login}
						{this.notification_div}
						{this.dropdown_div}
						<div className="headerLink" style = {{fontSize:header_item_size, height:'100%'}} onClick={() => {window.location.href = "/random"}}>Random</div>
						<div className="headerMenuArrow">
							<svg className = "options" onClick = {this.toggleOptions.bind(this)} width="18" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M23.0926 1.25L13 14.3606L2.90742 1.25L23.0926 1.25Z" fill="white" stroke="white" strokeWidth="2" />
							</svg>
						</div>
						<div ref = {this.optionsRef} style = {{backgroundColor: '#178275', display:'none', position:'fixed', right:'0px', top:'40px'}}>
							<div className="headerLink" onClick={() => {window.location.href = "/about"}}>About</div>
							<div className="headerLink" onClick={() => {window.location.href = "/contact"}}>Contact</div>
							{this.props.username != null && <div className="headerLink" onClick={this.logoutClicked.bind(this)}>Logout</div>}
						</div>
					</div>
				</header>
			</div>
		);
	}
}
