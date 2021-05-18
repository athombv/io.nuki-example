'use strict';

const { OAuth2Client } = require('homey-oauth2app');

module.exports = class NukiOAuth2Client extends OAuth2Client {

  static API_URL = 'https://api.nuki.io';
  static TOKEN_URL = 'https://api.nuki.io/oauth/token';
  static AUTHORIZATION_URL = 'https://api.nuki.io/oauth/authorize';
  static SCOPES = [
    'account',
    'notification',
    'smartlock',
    'smartlock.action',
    'webhook.decentral',
  ];

  // Smart Lock Actions
  static LOCK_ACTION_UNLOCK = 1;
  static LOCK_ACTION_LOCK = 2;
  static LOCK_ACTION_UNLATCH = 3;
  static LOCK_ACTION_LOCK_N_GO = 4;
  static LOCK_ACTION_LOCK_N_GO_UNLATCH = 5;

  // Smart Lock States
  static LOCK_STATE_UNCALIBRATED = 0;
  static LOCK_STATE_LOCKED = 1;
  static LOCK_STATE_UNLOCKING = 2;
  static LOCK_STATE_UNLOCKED = 3;
  static LOCK_STATE_LOCKING = 4;
  static LOCK_STATE_UNLATCHED = 5;
  static LOCK_STATE_UNLOCKED_LOCK_N_GO = 6;
  static LOCK_STATE_UNLATCHING = 7;
  static LOCK_STATE_MOTOR_BLOCKED = 254;

  // Doorsensor States
  static DOOR_STATE_DEACTIVATED = 1;
  static DOOR_STATE_CLOSED = 2;
  static DOOR_STATE_OPENED = 3;
  static DOOR_STATE_UNKNOWN = 4;
  static DOOR_STATE_CALIBRATING = 5;

  // Opener States
  static OPENER_STATE_UNTRAINER = 0;
  static OPENER_STATE_ONLINE = 1;
  static OPENER_STATE_RTO_ACTIVE = 3;
  static OPENER_STATE_OPEN = 5;
  static OPENER_STATE_OPENING = 7;
  static OPENER_STATE_BOOT_RUN = 253;

  async getSmartlocks() {
    return this.get({
      path: '/smartlock',
    });
  }

  async getSmartlock({ smartlockId }) {
    return this.get({
      path: `/smartlock/${smartlockId}`,
    });
  }

  async setSmartlockLocked({ smartlockId, action }) {
    return this.post({
      path: `/smartlock/${smartlockId}/action`,
      json: {
        action,
        config: 0,
      },
    });
  }

  async sync({ smartlockId }) {
    return this.post({
      path: `/smartlock/${smartlockId}/sync`,
    });
  }

  async getDecentralWebhooks() {
    return this.get({
      path: '/api/decentralWebhook',
    });
  }

  async createDecentralWebhook({
    id,
    secret,
    webhookUrl,
    webhookFeatures = [
      'DEVICE_STATUS',
      'DEVICE_LOGS',
    ],
  }) {
    return this.put({
      path: '/api/decentralWebhook',
      json: {
        id,
        secret,
        webhookUrl,
        webhookFeatures,
      },
    });
  }

  async deleteDecentralWebhook({ id }) {
    return this.delete({
      path: `/api/decentralWebhook/${id}`,
    });
  }

};
