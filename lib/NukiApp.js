'use strict';

const Homey = require('homey');
const { OAuth2App } = require('homey-oauth2app');

const NukiOAuth2Client = require('./NukiOAuth2Client');

module.exports = class NukiApp extends OAuth2App {

  static OAUTH2_CLIENT = NukiOAuth2Client;
  static OAUTH2_DEBUG = true;

  registerWebhook() {
    if (this.webhookRegistered) return;
    if (this.webhookRegistering) return;
    this.webhookRegistering = true;

    // Register Webhooks
    Promise.resolve().then(async () => {
      const oAuth2Client = await this.getFirstSavedOAuth2Client();
      const webhooks = await oAuth2Client.getDecentralWebhooks();
      const homeyId = await this.homey.cloud.getHomeyId();
      const webhookUrl = `https://webhooks.athom.com/webhook/${Homey.env.WEBHOOK_ID}?homey=${homeyId}`;

      const hasWebhook = !!webhooks.find(webhook => {
        return webhook.webhookUrl === webhookUrl;
      });

      if (hasWebhook) {
        this.log('Webhook already registered');
      } else {
        this.log('Registering webhook...');
        await oAuth2Client.createDecentralWebhook({ webhookUrl });
        this.log('Webhook registered');
      }

      const webhook = await this.homey.cloud.createWebhook(Homey.env.WEBHOOK_ID, Homey.env.WEBHOOK_SECRET, { homeyId });
      webhook.on('message', ({ body }) => {
        const { smartlockLog } = body;
        if (!smartlockLog) return;

        const driver = this.homey.drivers.getDriver('smart-lock');
        const devices = driver.getDevices();
        const device = devices.find(device => String(device.getData().smartlockId) === String(smartlockLog.smartlockId));
        if (!device) return;

        device.onWebhook(smartlockLog).catch(this.error);
      });

      this.webhookRegistered = true;
    })
      .catch(this.error)
      .finally(() => {
        this.webhookRegistering = false;
      });
  }

};
