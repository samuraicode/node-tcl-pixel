node-tcl-pixel
==============

NodeJS interface for controlling the Total Control Lighting pixel led strings

Based off work done by Christopher De Vries https://github.com/CoolNeon/elinux-tcl and Russell Hay https://github.com/RussTheAerialist/node-adafruit-pixel

Basic usage
```javascript

var Pixel = require('tcl_pixel').Pixel;
var pixels = new Pixel('/dev/spidev1.1', 25);

pixels.all(255, 0, 0); // Set entire buffer to red
pixels.sync(); // Updates strand with current buffer
pixels.set(1, 0, 255, 0); // Set second (zero indexed) pixel in buffer to green
pixels.set(2, 0, 0, 255); // Set third pixel in buffer to blue
pixels.sync();
pixels.off(); // All off immediately (saves previous state)
pixels.sync(); // Restores previous state
pixels.clear(); // Sets every pixel in the pixel buffer to zero (hard off)
pixels.sync();
```