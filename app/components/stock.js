import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.selected = 0;
        this.selectTime = this.selectTime.bind(this)
        this.confirmBuyClicked = this.confirmBuyClicked.bind(this)
        this.cancelBuyClicked = this.cancelBuyClicked.bind(this)
        this.openBuyMenu = this.openBuyMenu.bind(this)
        this.getRemainingFunds = this.getRemainingFunds.bind(this)
        this.changeShares = this.changeShares.bind(this)
        this.timeRef = React.createRef();
        this.lineChartRef = React.createRef();
        this.numberSharesRef = React.createRef();
        this.state = {
            graph_data: this.props.data.graph_data,
            openBuy: false,
            openSell: false,
            current_price: this.props.data.current_price,
            funds_remaining: this.props.data.funds,
            user_stocks: this.props.data.user_stocks,
            funds: this.props.data.funds
        }
        console.log(this.state)
        this.openBuyModal = this.openBuyModal.bind(this);
        this.closeBuyModal = this.closeBuyModal.bind(this);
        this.openSellModal = this.openSellModal.bind(this);
        this.closeSellModal = this.closeSellModal.bind(this);
        console.log(this.state.current_price)
        console.log(this.props.data.graph_data)
    }

    openBuyModal() {
        this.setState({ openBuy: true });
    }

    closeBuyModal() {
        this.setState({ openBuy: false });
    }

    openSellModal() {
        this.setState({ openSell: true});
    }

    closeSellModal() {
        this.setState({ openSell: false });
    }

    changeShares() {
        var funds = this.getRemainingFunds()
        console.log("SAHHH")
        console.log(funds)
        this.setState({ funds_remaining: funds })
    }

    getRemainingFunds() {
        var funds = this.state.funds - this.numberSharesRef.current.valueAsNumber * this.state.current_price.value
        console.log(funds)
        return funds
    }

    selectTime(event, time_name) {
        var that = this;
        for (var i = 0; i < this.timeRef.current.childNodes.length; i++) {
            var child = this.timeRef.current.childNodes[i]
            if (child.id == time_name) {
                child.style.backgroundColor = "#178275"
            }
            else {
                child.style.backgroundColor = "#DADADA"
            }

        }
        var time = 2.628e+9
        if (time_name == "twelveMonthButton") {
            time = 2.628e+9 * 12
        } else if (time_name == "sixMonthButton") {
            time = 2.628e+9 * 6
        } else if (time_name == "oneWeekButton") {
            time = 8.64e+7 * 7
        } else if (time_name == "oneDayButton") {
            time = 8.64e+7
        }
        fetch("/get_data", {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Authorization': 'Basic',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: time,
                stocks: [that.props.data.stock_name]
            })
        }).then(function (response) { return response.json(); })
        .then(function (data) {
            console.log(data)
            that.setState({
                graph_data: data.data.graph_data[that.props.data.stock_name]
            });// response.graph_data });

        });
    }

    confirmBuyClicked() {
        var that = this
        fetch("/buy", {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Authorization': 'Basic',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: 10090,
                funds: this.props.data.funds,
                stock: this.props.data.stock_name,
                amount: this.numberSharesRef.current.value,
                operation: "BUY",
                price: this.state.current_price.value
            })
        }).then(function (response) { return response.json(); })
            .then(function (data) {
                
                if (data.message == "FAILURE") {
                    alert("not enough funds")
                } else {
                    console.log(data.funds)
                    that.setState({funds: data.funds, funds_remaining:data.funds})
                }
                console.log(that.state)
            });
        this.closeBuyModal()
    }

    cancelBuyClicked() {
        this.closeBuyModal()
    }
        
    componentDidMount() {
        for (var i = 0; i < this.timeRef.current.childNodes.length; i++) {
            var child = this.timeRef.current.childNodes[i]
            if (child.id == "sixMonthButton") {
                child.style.backgroundColor = "#178275"
            }
            else {
                child.style.backgroundColor = "#DADADA"
            }
        }
        console.log(this.state.current_price)
        console.log(this.state.funds_remaining)
        console.log(this.numberSharesRef)
    }

    openBuyMenu() {
        fetch("/current_price", {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Authorization': 'Basic',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            })
        }).then(function (response) { return response.json(); })
            .then(function (data) {
                console.log(data)
                this.setState({ current_price: data.current_price })
            });
        this.openBuyModal()
    }

    submitBuy() {
        console.log("BUY")
    }

    render() {
        return (
            <div style={{ paddingTop: 0 }} className = "main">
                <div style={{fontSize:48, paddingLeft: 80}} >
                    {this.props.data.stock_name }
                </div>
                <div style={{ fontSize: 24, paddingLeft: 80 }} ref={this.timeRef}>
                    <button onClick={(e) => { this.selectTime(e, "oneDayButton"); }} tag="time_button" id="oneDayButton" className="btn btn-lg btn-primary" >1 Day</button>
                    <button onClick={(e) => { this.selectTime(e, "oneWeekButton"); }} tag="time_button" id="oneWeekButton" className="btn btn-lg btn-primary" >1 Week</button>
                    <button onClick={(e) => { this.selectTime(e, "oneMonthButton"); }} tag="time_button" id="oneMonthButton" className="btn btn-lg btn-primary" >1 Month</button>
                    <button onClick={(e) => { this.selectTime(e, "sixMonthButton"); }} tag="time_button" id="sixMonthButton" className="btn btn-lg btn-primary" >6 Months</button>
                    <button onClick={(e) => { this.selectTime(e, "twelveMonthButton"); }} tag="time_button" id="twelveMonthButton" className="btn btn-lg btn-primary" >12 Months</button>
                    <div style={{ fontSize: 24, paddingLeft: 80 }}> {"Price: " + this.state.current_price.value} </div>
                </div>
                <ResponsiveContainer style={{ display: 'flex', paddingTop: 100 }} width="90%" height="80%">
                    <AreaChart ref={this.lineChartRef}
                        width={500}
                        height={300}
                        data={this.state.graph_data}
                        margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorUserStock" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                        <Area type="monotone" dataKey="user_value" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUserStock)" />
                    </AreaChart>
                </ResponsiveContainer>
                <div style={{ paddingLeft: 80 }}>
                    <button onClick={this.openBuyModal} type="buy" id="buyButton" className="btn btn-lg btn-primary" >Buy</button>
                    <button onClick={this.openSellModal} type="buy" id="sellButton" className="btn btn-lg btn-primary" >Sell</button>
                </div>
                <Popup
                    open={this.state.openBuy}
                    onClose={this.closeBuyModal}
                    modal
                    closeOnDocumentClick>
                    <div style={{ backgroundColor: "#DADADA", borderStyle: "solid", width: "600px", height: "80%" }}>
                        <div style = {{fontSize:48}}> Buy {this.props.data.stock_name} Stock </div>
                        <div>Available Funds: {this.state.funds}</div>
                        <div>Stock Price: {this.state.current_price.value}</div>
                        <div>Number of Shares: </div>
                        <input ref={this.numberSharesRef} onChange={this.changeShares} placeholder="0" type="number" id="number_of_shares" name="fname" />
                        <div>Funds Remaining: {this.state.funds_remaining}</div>
                            <button onClick={this.confirmBuyClicked} type="buy" id="confirmBuyButton" className="btn btn-lg btn-primary" >Confirm</button>
                        <button onClick={this.cancelBuyClicked} type="cancel" id="cancelBuyButton" className="btn btn-lg btn-primary" >Cancel</button>
                    </div>
                </Popup>
                <Popup
                    open={this.state.openSell}
                    onClose={this.closeSellModal}
                    modal
                    closeOnDocumentClick>
                    <div style={{ backgroundColor: "#DADADA", borderStyle: "solid", width: "600px", height: "80%" }}>
                        <div style = {{fontSize:48}}> Sell {this.props.data.stock_name} Stock </div>
                        <div>Available Funds: {this.state.funds}</div>
                        <div>Stock Price: {this.state.current_price.value}</div>
                        <div>Number of Shares: </div>
                        <input ref={this.numberSharesRef} onChange={this.changeShares} placeholder="0" type="number" id="number_of_shares" name="fname" />
                        <div>Funds Remaining: {this.state.funds_remaining}</div>
                            <button onClick={this.confirmBuyClicked} type="buy" id="confirmBuyButton" className="btn btn-lg btn-primary" >Confirm</button>
                        <button onClick={this.cancelBuyClicked} type="cancel" id="cancelBuyButton" className="btn btn-lg btn-primary" >Cancel</button>
                    </div>
                </Popup>
            </div>
        );
  }
}