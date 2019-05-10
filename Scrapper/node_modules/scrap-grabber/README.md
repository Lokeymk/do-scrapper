# Scrap-Grabber

### Instructions:

* Grab the grabber from npm.
* Enter your most favorite site and desired word to catch.
* Watch the your pc as it pukes out the html you wanted...

```javascript

var scrap_grabber = require('scrap-grabber');

scrap_grabber.textgrab('package', 'https://www.npmjs.com');

scrap_grabber.imggrab('https://www.npmjs.com', 
        downloadImg=false, 
        writeHTML=true
        );

```