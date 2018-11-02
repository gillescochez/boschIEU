# Bosch Integrated Environmental Unit
Sensor level API for Bosch IEU (bmp280 bme280 bme680 bmp388).

Simplified interface for common interaction, but includes full support for some overlooked features (bme680 multi heater profiles).

This also wraps all three modules, allowing for better reuse and api encapsulation.

Tested with these products:

[Adafruit BMP280](https://www.adafruit.com/product/2651)

[Adafruit BME280](https://www.adafruit.com/product/2652)

[Adafruit BME680](https://www.adafruit.com/product/3660)

[Adafruit BMP388](https://www.adafruit.com/product/3966)

# :wrench: API

Simple init case:
```
const busImpl = require('rasbus').byname('i2c-bus'); // use fivdi i2c impl
busImpl.init(1, 0x77).then(bus => {
  return BoschIEU.sensor(name, bus).then(sensor => {
     // ...
  })
});
```



## :blue_book: BoschIEU
### :page_facing_up: sensor

Static factory class for returning a new sensor then ... (thats up to you)

```
const { BoeschIEU } = requre('./boschIEU.js');
BoscIEU.sensor(name, bus).then( ... )
``` 





## :blue_book: BoschIEU Sensor

### :page_facing_up: id()

```
sensor.id()
   .then(id => console.log(sensor.chip.name));
```

---

### :page_facing_up: calibration()

```
sensor.calibration().then(calibration_data => {
  // ...
  // and then, later on at the bat cave ...
  sensor.measurement().then(() => {}); // not passing calibration data 
});
```

---
### :page_facing_up: fifo()

```
sensor.fifo.flush( ... ).then(...)
```
The `fifo` getter method returns a static `Fifo` class implementation. This provides a namesapce for fifo functionality.

---



### :page_facing_up: profile()

Returns current chip profile from the device.

---

### :page_facing_up: setProfile()

Sets the profile for the chip.

### :page_facing_up: reset()

```
sensor.reset().then( ... )
```

Write a soft-reset to the chip.  Returning it to power-on state.

---

### :page_facing_up: measurement(...)

```
sensor.measurement().then(results => {
  // process results
});
```

Read pressure, tempature and hunidity register in a single pass.


## :blue_book: Fifo

### :page_facing_up: flush(...)
Flushes the fifo buffer using command register.

---

### :page_facing_up: read(...)
Read byte count and read bytes parsing into frames.

---


## :blue_book: Converter

Converter class of common helps are included (ft to meters, alttitude from Pa, etc)
