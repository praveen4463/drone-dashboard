import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import config from './config';

function Error(props) {
	return (
		<span className="error">
			{props.error}
		</span>
	);
}

function Projects(props) {
	return (
		<div>
			<span>Choose one of your Projects to see available devices in real time.</span>
			<div>
				<select className="projects" onChange={props.onChange}>
					{props.projects}
				</select>
			</div>
		</div>
	);
}

function footer(props) {
	return (
		<div className="footer">
			<span>Devices will be contated automatically after {props.refreshTime} seconds and updated.</span>
			<a onClick={props.onClick}>Can't wait? Contact now</a>
		</div>
	);
}

function progressMessage() {
	return (
		<div className="progress">
			<span>Contacting devices....</span>
		</div>
	);
}

class Dashboard extends React.Component {
	
}

ReactDOM.render(
	<Dashboard />,
	document.getElementById("main")
)