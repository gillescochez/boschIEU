const { BusUtil } = require('@johntalton/and-other-delights');

const { Chip } = require('./chip/chip.js');
const { Converter } = require('./converter.js');


/**
 * Fifo abstraction class.
 * wrapps calls into the chips static fifo methods and is accessable
 *   via the sensors fifo getter (creating a namespace for higher level
 *   api interations
 **/
class BoschFifo {
  constructor(sensor) {
    this.sensor = sensor;
  }

  flush() { return this.sensor.chip.fifo.flush(sensor._bus); }

  read() { return this.sensor.chip.fifo.read(this.sensor._bus, this.sensor._calibration); }
}

/**
 * Acts as a cache around the Chip implmentation
 */
class BoschSensor {
  constructor(bus) {
    this._bus = bus;
    this._chip = Chip.generic();
    this._calibration = undefined;

    this._fifo = new BoschFifo(this);
  }

  get chip(){ return this._chip; }

  get fifo() { return this._fifo; }

  // select chip is exposed over a setter here to explicity
  //   relate it to the `detectChip` methed
  // todo both select / detect chip should return a BoschSensorChip
  //   wrapper class to create a namespace for the curried `Chip`
  // todo selectChip(chip) { this._chip = chip; }

  // cached promise version of the `_detectChip` call
  // forcing the detect will bypass the cached (valid check) and
  // re-detect and cache the chip (but it still assignes the result
  // to the cache, so this is different from using`_detectChip`)
  detectChip(force) {
    const f = force === true;
    if(!f && this.valid()) { return Promise.resolve(this.chip); }
    return this._detectChip().then(chip => this._chip = chip);
  }

  // detects the chip id using single byte reads. the generic chip nolonger
  //   supports a wider version of chip detection and thus appropriate location
  //   for generic chip detection has been abstrated here
  // @return promise that resolves to chip implementation class selected by id
  _detectChip() {
    function readid(bus, reg) { return BusUtil.readblock(bus, [reg]).then(buffer => buffer.readInt8(0)); }

    return readid(this._bus, 0xD0) // standard `generic` register id
      .then(result => {
        if(result === 0) {
          console.log('inital buffer Zero, read alt register');
          return readid(this._bus, 0x00); // bmp388 register
        }
        return result;
      })
      .then(result => {
        const c = Chip.fromId(result);
        return c;
      });
  }

  valid() { return this._chip.chip_id !== Chip.generic().chip_id; }

  calibrated() { return this.valid() && (this._calibration !== undefined); }


  // old code used call to `id` in order to force a chip identification
  //   and update the cached chip reference.
  // this assumed that the id register was stable accross sensors, and thus
  //   the `generic` chips version of `id` worked.  this assumption is nolonger
  //   valid when the `id` function is not stable. Thus, elevating the "detection"
  //    functionality into the higher level Sensor code
  id() {
    // call cached detect
    // then call the chip id (redundent but provides consistent return)
    return this.detectChip()
      .then(() => this._id());
  }

  // directly calls the bus read id and returns hex value directly
  _id() {
    return this._chip.id(this._bus);
   }

  reset() { return this._chip.reset(this._bus); }

  calibration() {
    return this._chip.calibration(this._bus).then(cali => {
      this._calibration = cali;
      return cali;
    });
  }

  profile() { return this._chip.profile(this._bus); }
  setProfile(profile) { return this._chip.setProfile(this._bus, profile, this._calibration); }
  patchProfile(patch) { return this._chip.patchProfile(this._bus, patch)}

  ready() { return this._chip.ready(this._bus); }

  measurement() { return this._chip.measurement(this._bus, this._calibration); }

  estimateMeasurementWait(profile) { return this._chip.estimateMeasurementWait(profile); }
}

/**
 * Bosch Integrated Environmental Unit
 * bmp280 / bme280 / bme680 / bpm388
 */
class BoschIEU {
  static sensor(bus) {
    return Promise.resolve(new BoschSensor(bus));
  }
}

module.exports = { BoschIEU, BoschSensor, Converter };
