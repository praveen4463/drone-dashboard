# drone-dashboard
A Node.js Restful api for central server that communicates to drones.
***********************************************************************************************************************

To run:

1) cd into the project
2) npm install
3) npm start
4) npm test (to build but make sure to test after starting central server and drone servers because test is dependent on 'live' api and not using a "mock" api.)
5) server can be tested as localhost:2999

To build Docker image:
1) cd into project
2) docker build -t <project>
3) docker images to see all images
4) docker run -p to run image