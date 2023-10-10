import React from 'react';


import StockList from './StockList.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default class User extends React.Component {
	constructor(props)
	{
        super(props);
        this.stockListRef = React.createRef()
        this.stocks = Object.keys(this.props.data.graph_data)
        this.stocksChanged = this.stocksChanged.bind(this)
        this.state = {
            display_graph: this.props.data.total_graph_data,
            graph_data: this.props.data.graph_data
        }
        this.timeRef = React.createRef();
        console.log(this.props.data)
    }

    getStockAmount(time, stock) {
        for (var i = 0; i < this.props.data.transactions_log.length; i++) {
            if (time >= this.props.data.transactions_log[i].timestamp &&
                (i >= this.props.data.transactions_log.length - 1 || time < this.props.data.transactions_log[i + 1].timestamp)) {
                if (this.props.data.transactions_log[i]["stocks"] == undefined || this.props.data.transactions_log[i]["stocks"][stock] == undefined) {
                    return 0
                }
                return this.props.data.transactions_log[i]["stocks"][stock]
            }
        }
        return 0
    }

    stocksChanged(names) {
        var graph_length = this.props.data.total_graph_data.length
        var display_data = [];
        for (var i = 0; i < graph_length; i++) {
            var time_total = 0
            var stock_count = 0
            var time = 0;
            var formattedTime = "";
            for (var name_index in names) {
            
                var name = names[name_index]
                time = this.state.graph_data[name][i].time
                time_total += this.state.graph_data[name][i].value * this.getStockAmount(time * 1000, name)
                stock_count += this.props.data.stock_info[name]
                time = this.state.graph_data[name][i].time
                formattedTime = this.state.graph_data[name][i].formattedTime
            }
            
            display_data.push({time:time, formattedTime:formattedTime, value:time_total})
        }
        console.log(display_data)
        this.setState({display_graph:display_data})
    }

    selectTime(event, time_name) {
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
        var time = 2.628e+9
        if (time_name == "twelveMonthButton") {
            time = 2.628e+9 * 12
        } else if (time_name == "sixMonthButton") {
            time = 2.628e+9 * 6
        }
        var stock_names = []
        for (var key in this.props.data.stock_info) {
            console.log(key)
            stock_names.push(key)
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
                stocks: stock_names
            })
        }).then(function (response) { return response.json(); })
            .then(function (data) {
                console.log(data)
                that.setState({
                    graph_data: data.data.graph_data,
                });// response.graph_data });

            });
    }

    componentDidMount() {
        var names = []
        for (var key in this.props.data.stock_info) {
            console.log(key)
            names.push(key)
        }
        this.stocksChanged(names)
        console.log(this.timeRef)
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



	render ()
	{
        return (
                <div>
                <div style={{ display: 'flex', paddingTop: 100, fontSize:48 }}>
                    {this.props.username}
                </div>
                <div style={{ fontSize: 24, paddingLeft: 80 }} ref={this.timeRef}>
                    <button onClick={(e) => { this.selectTime(e, "oneMonthButton"); }} tag="time_button" id="oneMonthButton" className="btn btn-lg btn-primary" >1 Month</button>
                    <button onClick={(e) => { this.selectTime(e, "sixMonthButton"); }} tag="time_button" id="sixMonthButton" className="btn btn-lg btn-primary" >6 Months</button>
                    <button onClick={(e) => { this.selectTime(e, "twelveMonthButton"); }} tag="time_button" id="twelveMonthButton" className="btn btn-lg btn-primary" >12 Months</button>
                    <div style={{ fontSize: 24, paddingLeft: 80 }}>Price: {this.state.current_price} </div>
                </div>
                <ResponsiveContainer width="90%" height="80%">
                    <AreaChart
                        width={500}
                    height={300}
                    data={this.state.display_graph}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="formattedTime" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
                <StockList data={{ stocks: this.stocks, stockCallback: this.stocksChanged }} />
                </div>
                )
	}
}