import React, { Component } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default class Graph extends React.Component {
	constructor(props) {
		super(props);
        this.drawAreas = this.drawAreas.bind(this)
        this.drawLinearGradients = this.drawLinearGradients.bind(this)
        this.colors = ["#fc1c03", "#fcf403", "#03fc4e", "#0324fc", "#fc03fc"]
	}

    drawLinearGradients(names){
        var gradients = []
        for (var i = 0; i < names.length; i++){
            gradients.push(
            <linearGradient id={"color_" + names[i]} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={this.colors[i%this.colors.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            )
        }
        return gradients
    }

    drawAreas(names){
        var areas = []
        
        for (var i = 0; i < names.length; i++){
            console.log(i%this.colors.length)
            areas.push((<Area type="monotone" dataKey={names[i]} stroke={this.colors[i%this.colors.length]} fillOpacity={1} fill={"url(#color_" + names[i] + ")"} />))
        }
        return areas
    }

    drawChart() {
	}
    componentDidMount() {
		this.drawChart();
	}



	render() {
		return (
				<ResponsiveContainer style={{ display: 'flex', paddingTop: 100 }} width="90%" height="80%">
                    <AreaChart
                        width={500}
                        height={300}
                        data={this.props.data.graph_data}
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
                        {this.drawLinearGradients(this.props.data.stocks)}
                        </defs>
                        {this.drawAreas(this.props.data.stocks)}
                    </AreaChart>
                </ResponsiveContainer>
		)
	}
}