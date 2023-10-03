var React = require('react');
var ReactDOM = require('react-dom')
import {isMobile} from 'react-device-detect';

function SortSearch(users, artists, songs, albums)
{
	var search_list = [];

	for (var key in users)
	{
		var user_display = users[key].username;
		var user_url = "/user/" + users[key].username;
		search_list.push([user_display, user_url]);
 	}

 	for (var key in artists)
 	{
	 	var artist_display = artists[key].artist;
	 	var artist_url = "/artist/" + artists[key].artist
	 	search_list.push([artist_display, artist_url]);
	}

	for (var key in songs)
	{
	 	var song_display = songs[key].song;
	 	var song_url = "/post/" + songs[key].artist + "/" + songs[key].song;
	 	search_list.push([song_display, song_url]);
 	}

 	for (var key in albums)
 	{
	 	var album_display = albums[key].album;
	 	var album_url = "/album/" + albums[key].artist + "/" + albums[key].album;
	 	search_list.push([album_display, album_url]);
 	}

    search_list.sort(function(a, b){
    	if (a[0] > b[0])
        {
        	return 1;
        }
        return -1;
    });
    return search_list;
}

class SearchItem extends React.Component {

	constructor(props) {
		super(props);
		this.item_list = [];
	}

	clearItems()
	{
		this.item_list = [];
		this.forceUpdate();
	}

	renderItem(item, url)
	{
		this.item_list.push(
			<div
				tabindex
				className="searchItem"
				onClick={() => {window.location.href = url}}
			>
				{item}
			</div>
		);
		this.forceUpdate();
	}

	render()
	{
		return this.item_list.length > 0 ?
			(
				<div className="searchItems">
					{this.item_list}
				</div>
			) : null;
	}
};

class SearchList extends React.Component {

	constructor(props)
	{
		super(props);
		this.search_list = React.createRef();
	}

	handleChange()
	{
		var input = event.target.value;
		var that = this;

		fetch("/search", {
			method: "POST",
			headers: {
				Accept: 'application/json',
				'Authorization': 'Basic',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({type: "search", text: input}),
		}).then(function(response) { return response.json();}
		).then(function (data) {
			var search_results = SortSearch(data.users, data.artists, data.songs, data.albums);
			that.search_list.current.clearItems();
			for (var key in search_results)
			{
				that.search_list.current.renderItem(search_results[key][0], search_results[key][1]);
			}
	 	})
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
				<input style = {{height:'100%'}}
					className={search_class}
					onChange={this.handleChange.bind(this)}
					placeholder='Search'
					type='text'
					/>
				<SearchItem ref={this.search_list} />
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
		//var that = this;
	 //   fetch('/notifications', {
	 //       method: "POST",
	 //       headers: {
	 //       	Accept: 'application/json',
	 //       	'Authorization': 'Basic',
	 //       	'Content-Type': 'application/json',
	 //       },
	 //   })
	 //   .then(function(response) { return response.json();})
	 //   .then(function (data) {

	 //   	var notifications_size = '24px'
	 //   	var notifications_font_size = '12pt'
	 //   	if (isMobile)
	 //   	{
	 //   		notifications_size = '60px'
	 //   		notifications_font_size = '2.8em'
	 //   	}

	 //   	that.props.notifications = data.notifications
		//  	if (that.props.notifications != undefined && that.props.notifications.length > 0)
		//  	{
		//	  	for (var i = 0; i < that.props.notifications.length; ++i)
		//	  	{
		//	  		var comment_text = that.props.notifications[i].num_comments + ", comments"
		//	  		var likes_text = that.props.notifications[i].num_likes + " likes"

		//	  		if (that.props.notifications[i].num_comments == 0)
		//	  		{
		//	  			comment_text = ""
		//	  		}
		//	  		if (that.props.notifications[i].num_likes == 0)
		//	  		{
		//	  			likes_text = ""
		//	  			if (comment_text.length != 0)
		//	  			{
		//	  				comment_text = comment_text.substring(0, comment_text.indexOf(",")) + comment_text.substring(comment_text.indexOf(",") + 1, comment_text.length)
		//	  			}
		//	  		}
		//	  		var notification_text = "Your post " + that.props.notifications[i].name + " got " + likes_text + comment_text
		//	  		var notification_url = "/user/" + that.props.notifications[i].username + "/" + that.props.notifications[i].post_id
		//	  		if (that.props.notifications[i].tag > 0)
		//	  		{
		//	  			notification_text = that.props.notifications[i].tagger + " tagged you in a post"
		//	  			if (that.props.notifications[i].tag == 1)
		//	  			{
		//	  				notification_url = "/user/" + that.props.notifications[i].tagger + "/" + that.props.notifications[i].post_id
		//	  			}
		//	  			else
		//	  			{
		//	  				notification_url = "/user/" + that.props.notifications[i].name + "/" + that.props.notifications[i].post_id
		//	  			}

		//	  		}
		//	  		that.dropdown_content.push(<div key = {that.props.notifications[i].post_id} id = {that.props.notifications[i].post_id} className = "dropdownelement" style = {{background:'white', border: '1px solid #F8F8F8', backgroundColor:'#F8F8F8'}}>
		//	  			<a className = "dropdownelement" href = {notification_url} style = {{textDecoration:'none', fontFamily:'Roboto'}}>{notification_text} </a>
		//	  			 <button key = {that.props.notifications[i].post_id} style = {{right:'0px', position:'absolute', borderRadius:'0px', height:'20px'}} className = "dropdownelement grayButton" onClick = {that.removeNotification.bind(that, that.props.notifications[i].post_id)}> X </button>
		//	  			</div>)
		//	  	}
		//	  	that.notification_div = <div className = "notifications" ref = {that.notificationsRef} onClick = {that.toggleNotifications.bind(that)} style = {{marginRight: '10px', fontWeight:'bold', fontSize:notifications_font_size, color: "#178275", width:notifications_size, height:notifications_size, textAlign:'center', backgroundColor:'white', borderRadius:'50%', position:'relative',display:'flex', justifyContent:'center', alignItems:'center'}}> {that.props.notifications.length}</div>
		//  	}
		//  	that.forceUpdate()
	 //	})
		//window.addEventListener('mousedown', this.handleClickOutside.bind(this));
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
