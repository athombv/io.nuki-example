'use strict';

const NukiHomeyDevice = require('../../lib/NukiHomeyDevice');
const {
  LOCK_STATE_LOCKED,
  LOCK_STATE_LOCKING,
  DOOR_STATE_OPENED,
  LOCK_ACTION_LOCK,
  LOCK_ACTION_UNLATCH,
  LOCK_ACTION_UNLOCK,
  LOCK_ACTION_LOCK_N_GO_UNLATCH,
} = require('../../lib/NukiOAuth2Client');

const SYNC_INTERVAL = 1000 * 60 * 15; // 15 min

module.exports = class NukiSmartLockDevice extends NukiHomeyDevice {

  async onOAuth2Init() {
    await super.onOAuth2Init();

    this.sync();
    this.syncInterval = setInterval(() => this.sync(), SYNC_INTERVAL);

    this.homey.app.registerWebhook();
  }

  async onOAuth2Deleted() {
    await super.onOAuth2Deleted();

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async onOAuth2Saved() {
    this.sync();
    this.homey.app.registerWebhook();
  }

  sync() {
    Promise.resolve().then(async () => {
      const { smartlockId } = this;

      // get the state
      const { state } = await this.oAuth2Client.getSmartlock({ smartlockId });
      const {
        state: lockState,
        doorState,
        batteryCritical,
      } = state;

      // update the device
      this.setCapabilityValue('alarm_battery', !!batteryCritical).catch(this.error);
      this.setCapabilityValue('alarm_contact', doorState === DOOR_STATE_OPENED).catch(this.error);
      this.setCapabilityValue('locked', lockState === LOCK_STATE_LOCKED || lockState === LOCK_STATE_LOCKING).catch(this.error);

      this.setAvailable();
    }).catch(err => {
      this.error(err);
      this.setUnavailable(err).catch(this.error);
    });
  }

  async onCapabilityLocked(value) {
    const { smartlockId } = this;
    const { open_door: openDoor } = this.getSettings();

    let action;
    if (value) {
      action = LOCK_ACTION_LOCK;
    } else if (openDoor) {
      action = LOCK_ACTION_UNLATCH;
    } else {
      action = LOCK_ACTION_UNLOCK;
    }

    await this.oAuth2Client.setSmartlockLocked({
      smartlockId,
      action,
    });
  }

  async unlockAndPullLatch() {
    const { smartlockId } = this;
    await this.oAuth2Client.setSmartlockLocked({
      smartlockId,
      action: LOCK_ACTION_UNLATCH,
    });
  }

  async onWebhook({
    action,
    trigger,
    state,
    autoUnlock,
  }) {
    this.log('onWebhook', {
      action,
      trigger,
      state,
      autoUnlock,
    });

    switch (action) {
      case LOCK_ACTION_LOCK:
        await this.setCapabilityValue('locked', true);
        break;
      case LOCK_ACTION_UNLOCK:
      case LOCK_ACTION_UNLATCH:
      case LOCK_ACTION_LOCK_N_GO_UNLATCH:
        await this.setCapabilityValue('locked', false);
        break;
      default:
        break;
    }
  }

};
