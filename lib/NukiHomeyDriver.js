'use strict';

const { OAuth2Driver } = require('homey-oauth2app');

module.exports = class SmartLockDriver extends OAuth2Driver {

  async onPairListDevices({ oAuth2Client }) {
    const devices = await oAuth2Client.getSmartlocks();
    return devices.filter(this.onFilterDevice).map(device => {
      const {
        name,
        smartlockId,
        accountId,
      } = device;

      return {
        name,
        data: {
          smartlockId,
          accountId,
        },
      };
    });
  }

};
