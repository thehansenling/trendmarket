import React from 'react';
import StockListElement from './StockListElement.js'
import { createElement } from 'react';
export default class StockList extends React.Component {
	constructor(props) {
		super(props)
		
		this.state = { childStocks: [] }
		this.stockClicked = this.stockClicked.bind(this)
		this.stockRefs = []
	}

	stockClicked(name, value) {
		console.log(name)
		console.log(value)
		if (name == "ALL") {
			for (var i = 0; i < this.stockRefs.length; i++) {
				console.log(this.stockRefs[i])
				this.stockRefs[i].current.setChecked(value)
			}
		}
		var checked = []
		for (var i = 0; i < this.stockRefs.length; i++) {
			console.log(this.stockRefs[i])
			if (this.stockRefs[i].current.getChecked()) {
				checked.push(this.stockRefs[i].current.props.name)
			}
		}
		this.props.data.stockCallback(checked)


	}
	componentDidMount() {
		var childStocks = []
		var that = this
		console.log(this.props.data)
		childStocks.push(createElement(StockListElement, { name: "ALL", clickCallback: that.stockClicked }))
		if (this.props.data.stocks != undefined) {
			for (var i = 0; i < this.props.data.stocks.length; i++) {
				console.log(this.props.data.stocks[i])
				console.log(this.stockClicked)
				var ref = React.createRef()
				this.stockRefs.push(ref)
				var newprops = { name: this.props.data.stocks[i], clickCallback: that.stockClicked }
				childStocks.push(createElement(StockListElement, {...newprops, ref:ref}))
				
			}
		}
		console.log(this.stockRefs)
		this.setState({ childStocks: childStocks })
	}



	render ()
	{
		return (
			<div style={{ display: 'flex', paddingTop: 10, paddingLeft: 80, flexDirection:"column" }} >
				{ this.state.childStocks }
			</div>
		);
	}
}