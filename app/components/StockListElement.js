import React from 'react';

export default class StockListElement extends React.Component {
	constructor(props)
	{
		super(props);
		this.inputRef = React.createRef()
		this.handleClick = this.handleClick.bind(this)
		this.setChecked = this.setChecked.bind(this)
		this.getChecked = this.getChecked.bind(this)
	}

	componentDidMount() {

	}

	handleClick(event, name) {
		if (this.props.clickCallback != undefined) {
			this.props.clickCallback(name, this.inputRef.current.checked)
		}
		
	}

	setChecked(value) {
		console.log("CHEKCED")
		this.inputRef.current.checked = value
	}

	getChecked() {
		return this.inputRef.current.checked
	}

	render ()
	{
		return (
			<div style={{ display: 'flex', paddingTop: 10, flexDirection: "row" }} key={this.props.name} >
				<input ref={ this.inputRef } onClick={(e) => { this.handleClick(e, this.props.name); }} type="checkbox" id={this.props.name} name={this.props.name}  />
				<div> { this.props.name} </div>
			</div>
		);
	}
}