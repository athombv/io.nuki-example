'use strict';

const NukiHomeyDevice = require('../../lib/NukiHomeyDevice');

module.exports = class NukiSmartLockDevice extends NukiHomeyDevice {

  async onOAuth2Init() {
    await super.onOAuth2Init();
    await this.setCapabilityValue('locked', true);
  }

  async onCapabilityLocked() {
    const { smartlockId } = this;

    setTimeout(() => {
      this.setCapabilityValue('locked', true).catch(this.error);
    }, 2000);

    return this.oAuth2Client.setSmartlockLocked({
      smartlockId,
      action: 3,
    });
  }

  async onWebhook(data) {
    this.log('onWebhook', data);
  }

};
