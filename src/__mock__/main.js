"use strict";

let data = {
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
			coordinates: "3,3"
			error: null
		}
	],
	json: () => Promise.resolve(this)
}

export default const fetch = jest.fn().mockImplementation((url, options) => Promise.resolve(data));