import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import drone from './drone.jpg';
import config from './config.js';

function Footer(props) {
	return (
		<div className="footer">
			<span>Devices will be contated automatically after {props.refreshTime} seconds and updated.</span>
			<a onClick={props.onClick}>Can't wait? Contact now</a>
		</div>
	);
}

function ProgressMessage(props) {
	return (
		<div className="progress" style={props.style}>
			<span>Contacting Servers to fetch devices and their status....</span>
		</div>
	);
}

function DevicesDetail(props) {

	const getDevices = props.devices.map((_value, _index) => {
		return (
			<tr key={_index}>
				<td>
					<img src={drone} alt="drone" width="16px" height="16px" />
				</td>
				<td>
					{_value.deviceUID}
				</td>
				<td>
					{_value.found ? "Online" : "Offline"}
				</td>
				<td>
					{_value.currentCoordinates}
				</td>
				<td>
					{_value.previousCoordinates}
				</td>
				<td>
					{_value.moved}
				</td>
				<td>
					{_value.speed}
				</td>
			</tr>
		);
	});

	return (
		<table style={props.style}>
			<tr>
				<td>
					Device Type
				</td>
				<td>
					Device UID
				</td>
				<td>
					Online Status
				</td>
				<td>
					Current Latitude,Longitude
				</td>
				<td>
					Previous Latitude,Longitude
				</td>
				<td>
					Moved After Last contact(kms)
				</td>
				<td>
					Current Speed
				</td>
			</tr>
			{getDevices}
		</table>
	)
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.addPrototypes();
		this.state = {
			devices: [],
			customDevicesDetail: [],
			error: null,
			refreshInterval: null
		};
	}

	addPrototypes() {
		if(Number.prototype.toRadian === undefined) {
			Number.prototype.toRadian = function() {
				return this * Math.PI / 180;
			}
		}
	}

	//formula source - https://en.wikipedia.org/wiki/Great-circle_distance to measure distance between 2 coordinates on circle
	distanceBetweenCordinatesInKms(cord1, cord2) {
		let latitude1, longitude1, latitude2, longitude2, res = null;
		try {
			[latitude1, longitude1] = cord1.split(",").map(_n => Number(_n));//explicit type conversion omnce to save multiple auto boxing later.
			[latitude2, longitude2] = cord2.split(",").map(_n => Number(_n));

			//TODO: check latitude1, longitude1... are non null and are valid numbers and non zero (Number('') === 0). currently skipping the check.

			const diffLatInRadian = (latitude2 - latitude1).toRadian(), diffLongInRadian = (longitude2 - longitude1).toRadian();	

			const chrodLength = 
				Math.sin(diffLatInRadian/2) * Math.sin(diffLatInRadian/2) + 
				Math.cos(latitude1.toRadian()) * Math.cos(latitude2.toRadian()) *
				Math.sin(diffLongInRadian/2) * Math.sin(diffLongInRadian/2);

			const angularDistanceInRadian = 2 * Math.asin(Math.sqrt(chrodLength));

			res = 6371 * angularDistanceInRadian;//multiply with earth's radius to get kms
		} catch(ex) {
			//TODO: log error with stack trace.
		}
		return res;
	}

	componentDidMount() {
		if(!this.state.customDevicesDetail.length) {
			buildDevices();
		}
	}

	setCustomDevicesDetail() {
		
	}

	buildDevices() {
		//contact server to get devices detail
		fetch(`${config.centralServerEndpoint}/${config.defaultProjectID}`, {
			method: "GET",
			headers: new Headers({
				"authorization": config.centralServerApiKey,
				"content-type": "application/json"
			})
		})
		.then(res => res.json())
		.then(_res => {
			if(_res.error) {
				this.setState({
					error: _res.error;
				});
			} else {
				this.setState({
					error: null,
					devices: _res.devices
				});
				setCustomDevicesDetail();
			}
		})
		.catch(_err) {
			this.setState({
				error: "A network error occurred, could be wrong URL.";
			});
		}
		if(!this.state.refreshInterval) {
			const interval = setInterval(this.buildDevices(), config.deviceRefreshTime);//save to state
			this.setState({
				refreshInterval: interval
			});
		}
	}

	handleRefreshClick() {
		if(this.state.refreshInterval) {
			clearInterval(this.state.refreshInterval);
			this.setState({
				refreshInterval: null
			});
		}
		buildDevices();
	}

	render() {
		return (
			<div>
				<span><h1>Device Dashboard</h1></span>	
			</div>
			<div className="error">
				<span className="errormessage">
					{this.state.error}
				</span>
			</div>
			<div>
				<span>Displaying all available devices for ProjectID = {config.defaultProjectID}</span>
			</div>
			<div class="main">
				<ProgressMessage style={this.state.deviceLoaded ? "display:none" : "display:block"} />
				<DevicesDetail devices={this.getDevicesDetail()} />
			</div>
			<Footer onClick={this.handleRefreshClick} refreshTime={config.deviceRefreshTime} />
		);
	}
}

ReactDOM.render(
	<Dashboard />,
	document.getElementById("main")
)