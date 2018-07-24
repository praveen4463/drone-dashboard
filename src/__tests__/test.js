'use strict';

import React from "react";
import {Footer, DevicesDetail, Dashboard} from "../main";
import renderer from "react-test-renderer";


describe("Dashboard tests", () => {
	it("Footer renders correctly", () => {
		const tree = renderer.create(<Footer refreshTime="11"></Footer>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("DevicesDetail renders correctly with row formatting", () => {
		let dummyDevicesDetail = [], obj = {};

		obj.deviceUID = "device1";
		obj.found = true;
		obj.currentCoordinates = "1,1";
		obj.previousCoordinates = ".1,.1";
		obj.moved = 0;
		obj.speed = 0;
		dummyDevicesDetail.push(obj);

		obj = {};
		obj.deviceUID = "device2";
		obj.found = true;
		obj.currentCoordinates = "2,2";
		obj.previousCoordinates = ".2,.2";
		obj.moved = 4;
		obj.speed = 40;
		dummyDevicesDetail.push(obj);

		obj = {};
		obj.deviceUID = "device3";
		obj.found = false;
		obj.currentCoordinates = null;
		obj.previousCoordinates = null;
		obj.moved = 0;
		obj.speed = 0;
		dummyDevicesDetail.push(obj);

		const tree = renderer.create(<DevicesDetail devices={dummyDevicesDetail}></DevicesDetail>).toJSON();
		expect(tree).toMatchSnapshot();
	});

	test("Dashboard renders correctly", done => {
		const data = {
			devices: [
				{
					deviceUID: "drone1",
					found: true,
					coordinates: "1,1",
					error: null
				},
				{
					deviceUID: "drone2",
					found: true,
					coordinates: "2,2",
					error: null
				},
				{
					deviceUID: "drone1",
					found: false,
					coordinates: null,
					error: null
				},
				{
					deviceUID: "drone3",
					found: true,
					coordinates: "3,3",
					error: null
				}
			],
			json: () => Promise.resolve(data)
		};
		window.fetch = jest.fn().mockImplementation((url, options) => Promise.resolve(data));
		const tree = renderer.create(<Dashboard></Dashboard>);
		setTimeout(() => { 
			tree.update(<Dashboard></Dashboard>);
			expect(tree.toJSON()).toMatchSnapshot();
			done();
	 	}, 1000);
	});
});