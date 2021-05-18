'use strict';

const NukiHomeyDriver = require('../../lib/NukiHomeyDriver');

module.exports = class NukiOpenerDriver extends NukiHomeyDriver {

  onFilterDevice(device) {
    return device.type === 2;
  }

};
