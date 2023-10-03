import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default class Stock extends React.Component {
    constructor(props) {
        super(props);
        this.selected = 0;
        this.selectTime = this.selectTime.bind(this)
        this.confirmBuyClicked = this.confirmBuyClicked.bind(this)
        this.cancelBuyClicked = this.cancelBuyClicked.bind(this)
        this.timeRef = React.createRef();
        this.lineChartRef = React.createRef();
        this.numberSharesRef = React.createRef();
        this.state = {
            graph_data: this.props.data.graph_data,
            open: false
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    selectTime(event, time) {
        var that = this;
        for (var i = 0; i < this.timeRef.current.childNodes.length; i++) {
            var child = this.timeRef.current.childNodes[i]
            if (child.id == time) {
                child.style.backgroundColor = "#178275"
            }
            else {
                child.style.backgroundColor = "#DADADA"
            }

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
                stock: this.props.data.stock_name
            })
        }).then(function (response) { return response.json(); })
        .then(function (data) {
            console.log(data)
            that.setState({
                graph_data: data.graph_data,
            });// response.graph_data });

        });
    }

    confirmBuyClicked() {
        fetch("/buy", {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Authorization': 'Basic',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: 10090,
                stock: this.props.data.stock_name,
                amount: this.numberSharesRef.current.value,

            })
        }).then(function (response) { return response.json(); })
            .then(function (data) {
                console.log(data)
            });
        this.closeModal()
    }

    cancelBuyClicked() {
        this.closeModel()
    }
        
    componentDidMount() {
        for (var i = 0; i < this.timeRef.current.childNodes.length; i++) {
            var child = this.timeRef.current.childNodes[i]
            if (child.id == "oneMonthButton") {
                child.style.backgroundColor = "#178275"
            }
            else {
                child.style.backgroundColor = "#DADADA"
            }
        }
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
                    <button onClick={(e) => { this.selectTime(e, "oneMonthButton"); }} tag="time_button" id="oneMonthButton" className="btn btn-lg btn-primary" >1 Month</button>
                    <button onClick={(e) => { this.selectTime(e, "sixMonthButton"); }} tag="time_button" id="sixMonthButton" className="btn btn-lg btn-primary" >6 Months</button>
                    <button onClick={(e) => { this.selectTime(e, "twelveMonthButton"); }} tag="time_button" id="twelveMonthButton" className="btn btn-lg btn-primary" >12 Months</button>
                </div>
                <ResponsiveContainer style={{ display: 'flex', paddingTop: 100 }} width="90%" height="80%">
                    <LineChart ref={this.lineChartRef}
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
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
                <div style={{ paddingLeft: 80 }}>
                    <button onClick={this.openModal} type="buy" id="buyButton" className="btn btn-lg btn-primary" >Buy</button>
                </div>
                <Popup
                    open={this.state.open}
                    onClose={this.closeModal}
                    modal
                    closeOnDocumentClick>
                    <div style={{ backgroundColor: "#DADADA", borderStyle: "solid", width: "600px", height: "80%" }}>Buy {this.props.data.stock_name} Stock
                        <div>Available Funds: {this.props.data.funds}</div>
                        <div>Number of Shares: </div>
                        <input ref={this.numberSharesRef }type="number" id="number_of_shares" name="fname"/>
                            <div>Funds Remaining: </div>
                            <button onClick={this.confirmBuyClicked} type="buy" id="confirmBuyButton" className="btn btn-lg btn-primary" >Confirm</button>
                        <button onClick={this.cancelBuyClicked} type="cancel" id="cancelBuyButton" className="btn btn-lg btn-primary" >Cancel</button>
                    </div>
                </Popup>
            </div>
        );
  }
}