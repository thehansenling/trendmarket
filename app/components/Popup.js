import Popup from 'reactjs-popup';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick() {
	}

	render() {
		return (
			<div style={{ display: 'flex', paddingTop: 100 }}>
				<Popup>
				TEST
				</Popup>
			</div>);
	}
}