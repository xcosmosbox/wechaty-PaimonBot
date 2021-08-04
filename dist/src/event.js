"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const config_1 = require("./config");
// import {
//   PuppetScanEvent,
// }                 from 'wechaty-puppet'
const firer_1 = require("./firer");
const web_schemas_1 = require("./web-schemas");
const normalize_scan_status_1 = require("./pure-function-helpers/normalize-scan-status");
/* tslint:disable:variable-name */
exports.Event = {
    onDing,
    onLog,
    onLogin,
    onLogout,
    onMessage,
    onScan,
    onUnload,
};
function onDing(data) {
    config_1.log.silly('PuppetWeChatEvent', 'onDing(%s)', data);
    this.emit('heartbeat', { data });
}
async function onScan(
// Do not use PuppetScanPayload at here, use { code: number, url: string } instead,
//  because this is related with Browser Hook Code:
//    wechaty-bro.js
payloadFromBrowser) {
    config_1.log.verbose('PuppetWeChatEvent', 'onScan({code: %d, url: %s})', payloadFromBrowser.code, payloadFromBrowser.url);
    // if (this.state.off()) {
    //   log.verbose('PuppetWeChatEvent', 'onScan(%s) state.off()=%s, NOOP',
    //                                 payload, this.state.off())
    //   return
    // }
    this.scanPayload = {
        qrcode: payloadFromBrowser.url,
        status: payloadFromBrowser.code,
    };
    /**
     * When wx.qq.com push a new QRCode to Scan, there will be cookie updates(?)
     */
    await this.saveCookie();
    if (this.logonoff()) {
        config_1.log.verbose('PuppetWeChatEvent', 'onScan() there has user when got a scan event. emit logout and set it to null');
        await this.logout();
    }
    // feed watchDog a `scan` type of food
    const food = {
        data: payloadFromBrowser,
        type: 'scan',
    };
    this.emit('heartbeat', food);
    const qrcode = payloadFromBrowser.url.replace(/\/qrcode\//, '/l/');
    const status = normalize_scan_status_1.normalizeScanStatus(payloadFromBrowser.code);
    this.emit('scan', { qrcode, status });
}
function onLog(data) {
    config_1.log.silly('PuppetWeChatEvent', 'onLog(%s)', data);
}
async function onLogin(note, ttl = 30) {
    config_1.log.verbose('PuppetWeChatEvent', 'onLogin(%s, %d)', note, ttl);
    const TTL_WAIT_MILLISECONDS = 1 * 1000;
    if (ttl <= 0) {
        config_1.log.verbose('PuppetWeChatEvent', 'onLogin(%s) TTL expired');
        this.emit('error', { data: 'onLogin() TTL expired.' });
        return;
    }
    // if (this.state.off()) {
    //   log.verbose('PuppetWeChatEvent', 'onLogin(%s, %d) state.off()=%s, NOOP',
    //                                 note, ttl, this.state.off())
    //   return
    // }
    if (this.logonoff()) {
        throw new Error('onLogin() user had already logined: ' + this.selfId());
        // await this.logout()
    }
    this.scanPayload = undefined;
    try {
        /**
         * save login user id to this.userId
         *
         * issue #772: this.bridge might not inited if the 'login' event fired too fast(because of auto login)
         */
        const userId = await this.bridge.getUserName();
        if (!userId) {
            config_1.log.verbose('PuppetWeChatEvent', 'onLogin() browser not fully loaded(ttl=%d), retry later', ttl);
            const html = await this.bridge.innerHTML();
            config_1.log.silly('PuppetWeChatEvent', 'onLogin() innerHTML: %s', html.substr(0, 500));
            setTimeout(onLogin.bind(this, note, ttl - 1), TTL_WAIT_MILLISECONDS);
            return;
        }
        config_1.log.silly('PuppetWeChatEvent', 'bridge.getUserName: %s', userId);
        // const user = this.Contact.load(userId)
        // await user.ready()
        config_1.log.silly('PuppetWeChatEvent', `onLogin() user ${userId} logined`);
        // if (this.state.on() === true) {
        await this.saveCookie();
        // }
        // fix issue https://github.com/Chatie/wechaty-puppet-wechat/issues/107
        // we do not wait `ready` before emit `login`
        this.waitStable().catch(e => {
            config_1.log.error('PuppetWeChatEvent', 'onLogin() this.waitStable() rejection: %s', e && e.message);
        });
        await this.login(userId);
    }
    catch (e) {
        config_1.log.error('PuppetWeChatEvent', 'onLogin() exception: %s', e);
        throw e;
    }
}
async function onLogout(data) {
    config_1.log.verbose('PuppetWeChatEvent', 'onLogout(%s)', data);
    if (this.logonoff()) {
        await this.logout();
    }
    else {
        // not logged-in???
        config_1.log.error('PuppetWeChatEvent', 'onLogout() without self-user');
    }
}
async function onMessage(rawPayload) {
    const firer = new firer_1.Firer(this);
    /**
     * Fire Events if match message type & content
     */
    switch (rawPayload.MsgType) {
        case web_schemas_1.WebMessageType.VERIFYMSG:
            this.emit('friendship', { friendshipId: rawPayload.MsgId });
            // firer.checkFriendRequest(rawPayload)
            break;
        case web_schemas_1.WebMessageType.SYS:
            /**
             * /^@@/.test() return true means it's a room
             */
            if (/^@@/.test(rawPayload.FromUserName)) {
                const joinResult = await firer.checkRoomJoin(rawPayload);
                const leaveResult = await firer.checkRoomLeave(rawPayload);
                const topicRestul = await firer.checkRoomTopic(rawPayload);
                if (!joinResult && !leaveResult && !topicRestul) {
                    config_1.log.silly('PuppetWeChatEvent', `checkRoomSystem message: <${rawPayload.Content}> not found`);
                }
            }
            else {
                await firer.checkFriendConfirm(rawPayload);
            }
            break;
    }
    this.emit('message', { messageId: rawPayload.MsgId });
}
async function onUnload() {
    config_1.log.silly('PuppetWeChatEvent', 'onUnload()');
    /*
    try {
      await this.quit()
      await this.init()
    } catch (e) {
      log.error('PuppetWeChatEvent', 'onUnload() exception: %s', e)
      this.emit('error', e)
      throw e
    }
    */
}
//# sourceMappingURL=event.js.map