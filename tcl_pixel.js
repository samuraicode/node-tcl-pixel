var spi = require('spi');

function Pixel(deviceName, num_pixels) {
    this.num_pixels = num_pixels;
    this.pixel_buffer = new Buffer((this.num_pixels + 3) * 4);
    this.clear_buffer = new Buffer((this.num_pixels + 3) * 4);
    this.device = new spi.Spi(deviceName);
    this.device.open(deviceName, {
        "mode": spi.MODE[0],
        "bitsPerWord": 8,
        "chipSelect": spi.CS.none,
        "maxSpeed": 1500000,
        "bitOrder": spi.ORDER.msb
    });
    // Storage for a stream of colors to cycle through
    this.color_stream = [];
    // Gamma correction, off by default (Try setting it to (2.2,2.2,2.2))
    this.useGamma = false;
    this.hasGamma = false;
    this.gamma_table_red = [];
    this.gamma_table_green = [];
    this.gamma_table_blue = [];
    // Initialize the buffers
    this.pixel_buffer.fill(0);
    this.clear_buffer.fill(0);
    for(var i = 0; i < this.clear_buffer.length; i++) {
        this.clear_buffer[(i+1)*4] = this.makeFlag(0,0,0);
    }
}

Pixel.prototype.makeFlag = function(red, green, blue) {
    var flag;

    flag =  (red&0xc0)>>6;
    flag |= (green&0xc0)>>4;
    flag |= (blue&0xc0)>>2;
    
    return ~flag;
};

Pixel.prototype.off = function() {
    this.device.write(this.clear_buffer);
};

Pixel.prototype.sync = function() {
    this.device.write(this.pixel_buffer);
};

Pixel.prototype.all = function(r, g, b) {
    for(var i = 0; i < this.num_pixels; i++) {
        this.set(i, r, g, b);
    }
};

Pixel.prototype.clear = function() {
    this.all(0,0,0);
};

Pixel.prototype.set = function(pixelnum, r, g, b) {
    if (pixelnum < 0 || pixelnum >= this.num_pixels) return;
    var pixel = pixelnum + 1;
    
    if (this.useGamma && this.hasGamma) {
        r = this.gamma_table_red[r];
        g = this.gamma_table_green[g];
        b = this.gamma_table_blue[b];
    }
    
    this.pixel_buffer[pixel*4] = this.makeFlag(r,g,b);
    this.pixel_buffer[pixel*4+1] = b;
    this.pixel_buffer[pixel*4+2] = g;
    this.pixel_buffer[pixel*4+3] = r;
};

Pixel.prototype.setGammaCorrection = function(redGamma, greenGamma, blueGamma) {
    this.hasGamma = true;
    for (var i=0; i<256; i++) {
        this.gamma_table_red[i] = Math.pow(i/255.0,redGamma)*255.0+0.5;
        this.gamma_table_green[i] = Math.pow(i/255.0,greenGamma)*255.0+0.5;
        this.gamma_table_blue[i] = Math.pow(i/255.0,blueGamma)*255.0+0.5;
    }
};

Pixel.prototype.nextInStream = function() {
    if (this.color_stream.length === 0) return;
    var nextColor = this.color_stream.shift();
    this.color_stream.push(nextColor);
    return nextColor;
};

Pixel.prototype.shiftStream = function() {
    if (this.color_stream.length < this.num_pixels) return;
    for(var i = 0; i < this.num_pixels; i++) {
        var nextColor = this.color_stream[i];
        this.set(i, nextColor.r, nextColor.g, nextColor.b);
    }
    this.sync();
    this.nextInStream();
};

Pixel.prototype.syncStream = function() {
    if (this.color_stream.length === 0) return;
    for(var i = 0; i < this.num_pixels; i++) {
        var nextColor = this.nextInStream();
        this.set(i, nextColor.r, nextColor.g, nextColor.b);
    }
    this.sync();
};

module.exports.Pixel = Pixel;
