'use strict';

const { OAuth2Device } = require('homey-oauth2app');

module.exports = class SmartLockDevice extends OAuth2Device {

  async onOAuth2Init() {
    const {
      smartlockId,
      accountId,
    } = this.getData();

    this.smartlockId = smartlockId;
    this.accountId = accountId;

    this.onCapabilityLocked = this.onCapabilityLocked.bind(this);
    this.registerCapabilityListener('locked', this.onCapabilityLocked);
  }

};
