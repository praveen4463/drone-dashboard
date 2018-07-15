import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import drone from "./drone.jpg";
import {config} from './config.js';

function Footer(props) {
	return (
		<div className="footer">
			<span>Devices will be contated  and updated automatically after {props.refreshTime} seconds.</span><br/>
			<span>Offline Devices will have a line through on their row and in red.</span><br/>
			<span>Devices not moving for more than 10 secs will be highlighted in red background.</span><br/>
		</div>
	);
}

function DevicesDetail(props) {
	const getDeviceRowFormatting = (customDeviceParam) => {
		let css = "";
		if(customDeviceParam.moved === 0 && customDeviceParam.speed === 0 && customDeviceParam.previousCoordinates) {
			css = "highlight";
		} else if(!customDeviceParam.found) {
			css = "offline";
		}
		return css;
	};

	const getDevices = props.devices.map((_value, _index) => {
		return (
			<tr key={_index} className={getDeviceRowFormatting(_value)}>
				<td>
					<img src={drone} alt="drone" width="36px" height="36px" />
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

	//*********************************************************************************************************

	return (
		<table>
			<tbody>
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
						Current coordinates
					</td>
					<td>
						Previous coordinates
					</td>
					<td>
						Moved After Last contact (kms)
					</td>
					<td>
						Current Speed (kms/hr)
					</td>
				</tr>
				{getDevices}
			</tbody>
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
			error: null
		};
	}

	addPrototypes() {
		if(Number.prototype.toRadian === undefined) {
			// eslint-disable-next-line
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

	//speed calculatation assumptions:
	//If device is moved by .01 kms in 11 seconds, (since last recorded time which is config.deviceRefreshTime),
	//get the move for 1 second and multiply by 60*60 to get speed.
	calculateHourlySpeed(lastMove) {
	 	return Math.round((lastMove / config.deviceRefreshTime) * 60 * 60, 2);
	}

	componentDidMount() {
		if(!this.firstAPICallDone) {
			this.firstAPICallDone = true;
			this.buildDevices();
		}
	}

	componentWillUnmount() {
    	clearInterval(this.refreshInterval);
  	}

	//whenever new device information is loaded, compare it with the ones saved in state and build the new information.
	setCustomDevicesDetail(currentDevicesDetails) {
		let customDevicesDetail;
		if(this.state.devices.length) {
			let stateDevices = this.state.devices;
			customDevicesDetail = currentDevicesDetails.map(device => {
				let previousCoordinates = null, moved = 0, speed = 0, obj = {};

				obj.deviceUID = device.deviceUID;
				obj.found = device.found;
				obj.currentCoordinates = device.coordinates;

				const match = stateDevices.filter(sd => sd.deviceUID === device.deviceUID);
				if(match.length === 1) {
					previousCoordinates = match[0].coordinates;
					moved = this.distanceBetweenCordinatesInKms(previousCoordinates, device.coordinates);
					speed = this.calculateHourlySpeed(moved);
				}

				obj.previousCoordinates = previousCoordinates;
				obj.moved = moved;
				obj.speed = speed;
				return obj;
			});
		} else {
			customDevicesDetail = currentDevicesDetails.map(device => {
				return {
					deviceUID: device.deviceUID,
					found: device.found,
					currentCoordinates: device.coordinates,
					previousCoordinates: null,
					moved: 0,
					speed: 0
				};
			});
		}
		this.setState({
			customDevicesDetail: customDevicesDetail
		});
	}

	buildDevices() {
		//contact server to get devices detail
		const headers = new Headers();
		headers.append("authorization", config.centralServerApiKey);
		headers.append("content-type", "application/json");

		fetch(`${config.centralServerEndpoint}/${config.defaultProjectID}`, {
			method: "GET",
			headers: headers,
			mode: "cors"
		})
		.then(res => res.json())
		.then(_res => {
			if(_res.error) {
				this.setState({
					error: _res.error
				});
			} else {				
				//start interval just once.
				if(!this.refreshInterval) {
					this.refreshInterval = setInterval(() => this.buildDevices(), config.deviceRefreshTime * 1000);
				}

				//setup device details as compared to last details and then update the state.
				this.setCustomDevicesDetail(_res.devices);
				this.setState({
					error: null,
					devices: _res.devices
				});
			}
		})
		.catch(_err => {
			this.setState({
				error: "A network error occurred."
			});
		})
	}

	render() {
		return (
			<div>
				<div>
					<span><h1>Device Dashboard</h1></span>	
				</div>
				<div className="error">
					<span>
						{this.state.error}
					</span>
				</div>
				<div className="project">
					<span>Displaying all available devices for ProjectID = {config.defaultProjectID}</span>
				</div>
				<div className="main">
					<DevicesDetail devices={this.state.customDevicesDetail} />
				</div>
				<Footer refreshTime={config.deviceRefreshTime} />
			</div>
		);
	}
}

ReactDOM.render(
	<Dashboard />,
	document.getElementById("main")
)