# drone-dashboard
A ReatJs dashboard to view real time drone's location and activity.
***********************************************************************************************************************

!!!Important note!!!: all the drones or servers from "drone-api" and the central server from "central-server" app should be running in order to execute this application correctly.

Assumptions on how dashboard gets real time drone information:

As described in "drone-api" and "central-server" apps that the structure of entire project is - 

Dashborad >> Central Server >> Drones

Dashboard contacts central server, server gets list of drones and their location by contacting to drones.

Dasboard shows follwing details:
Device Type - type of device in picture
Device UID - UID of drone/device
Oneline status - whether the device is reachable
Current coordinates - the drone's location coordinates that just received
Previous coordinates - the drone's location coordinates that last received
Moved After Last contact (kms) - Since last contact, how much distance drone has covered
Current Speed (kms/hr) - the speed at which drone is flying by looking into how much it has moved in last 11 secods or so (set in config)

One can set from config the refresh time of device which is currently set at 11 seconds.

If a device is not reachable, it will have a line through and red font.
If device is not moving since last recoding, it will have red background.

Implementation:
This application creates a server to simulate a central server.

1) config.js is an important file that provides predefined information like 
a- auth Key and endpoint of the central server's api.
b- clients' Project default projectID.
c- device refresh time.

2) inde.js build the components and attach to page.

To run:

1) cd into the project
2) npm install
3) npm start
5) server can be tested as localhost:2999

To build Docker image:
1) cd into project
2) docker build -t <project>
3) docker images to see all images
4) docker run -p to run image