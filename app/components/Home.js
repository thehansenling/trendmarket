import React from 'react';
import Graph from './CreateGraph.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default class Home extends React.Component {
	constructor(props)
	{
		super(props);
	}

	render ()
	{
		return (
			<div>
				<Graph data = {this.props.data}/>
			</div>);
	}
}