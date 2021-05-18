'use strict';

const NukiHomeyDriver = require('../../lib/NukiHomeyDriver');

module.exports = class NukiSmartLockDriver extends NukiHomeyDriver {

  async onOAuth2Init() {
    this.homey.flow.getActionCard('unlock_pull_latch')
      .registerRunListener(async ({ device }) => {
        return device.unlockAndPullLatch();
      });
  }

  onFilterDevice(device) {
    return device.type === 0;
  }

};
