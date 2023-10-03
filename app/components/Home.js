import React from 'react';

export default class Home extends React.Component {
	constructor(props)
	{
		super(props);
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick()
	{
		alert("SDHSDHSDFG");
		console.log("PLERASER");
	}

	render ()
	{
		return (
			<div style={{ display: 'flex', paddingTop: 100 }}>
				<button type="submit" id="submitButton" className="btn btn-lg btn-primary" onClick={this.handleClick}>Register</button>
			</div>);
	}
}