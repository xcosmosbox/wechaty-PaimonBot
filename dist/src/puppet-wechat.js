"use strict";
/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppetWeChat = void 0;
// tslint:disable:member-ordering
// tslint:disable:arrow-parens
// tslint:disable:object-literal-key-quotes
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
const bl_1 = __importDefault(require("bl"));
const md5_1 = __importDefault(require("md5"));
const mime_1 = __importDefault(require("mime"));
const request_1 = __importDefault(require("request"));
const rx_queue_1 = require("rx-queue");
const watchdog_1 = require("watchdog");
const wechaty_puppet_1 = require("wechaty-puppet");
const config_1 = require("./config");
const mod_1 = require("./pure-function-helpers/mod");
const bridge_1 = require("./bridge");
const event_1 = require("./event");
const web_schemas_1 = require("./web-schemas");
class PuppetWeChat extends wechaty_puppet_1.Puppet {
    constructor(options = {}) {
        super(options);
        this.options = options;
        this.fileId = 0;
        this.bridge = new bridge_1.Bridge({
            endpoint: options.endpoint || process.env.WECHATY_PUPPET_PUPPETEER_ENDPOINT,
            extspam: options.token || process.env.WECHATY_PUPPET_WECHAT_TOKEN,
            head: typeof options.head === 'boolean' ? options.head : config_1.envHead(),
            launchOptions: options.launchOptions,
            memory: this.memory,
            stealthless: typeof options.stealthless === 'boolean' ? options.stealthless : config_1.envStealthless(),
        });
        const SCAN_TIMEOUT = 2 * 60 * 1000; // 2 minutes
        this.scanWatchdog = new watchdog_1.Watchdog(SCAN_TIMEOUT, 'Scan');
        this.initWatchdogForScan();
    }
    async start() {
        config_1.log.verbose('PuppetWeChat', `start() with ${this.memory.name}`);
        if (this.state.on()) {
            config_1.log.warn('PuppetWeChat', 'start() is called on a ON puppet. await ready(on) and return.');
            await this.state.ready('on');
            return;
        }
        this.state.on('pending');
        try {
            /**
             * Overwrite the memory in bridge
             * because it could be changed between constructor() and start()
             */
            this.bridge.options.memory = this.memory;
            // this.initWatchdog()
            // this.initWatchdogForScan()
            this.bridge = await this.initBridge();
            config_1.log.verbose('PuppetWeChat', 'initBridge() done');
            /**
             *  state must set to `live`
             *  before feed Watchdog
             */
            this.state.on(true);
            /**
             * Feed the dog and start watch
             */
            const food = {
                data: 'inited',
                timeout: 2 * 60 * 1000, // 2 mins for first login
            };
            this.emit('heartbeat', food);
            /**
             * Save cookie for every 5 minutes
             */
            const throttleQueue = new rx_queue_1.ThrottleQueue(5 * 60 * 1000);
            this.on('heartbeat', data => throttleQueue.next(data));
            throttleQueue.subscribe(async (data) => {
                config_1.log.verbose('PuppetWeChat', 'start() throttleQueue.subscribe() new item: %s', data);
                await this.saveCookie();
            });
            config_1.log.verbose('PuppetWeChat', 'start() done');
            // this.emit('start')
            return;
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'start() exception: %s', e);
            // this.state.off(true)
            this.emit('error', e);
            await this.stop();
            throw e;
        }
    }
    async stop() {
        config_1.log.verbose('PuppetWeChat', 'stop()');
        if (this.state.off()) {
            config_1.log.warn('PuppetWeChat', 'stop() is called on a OFF puppet. await ready(off) and return.');
            await this.state.ready('off');
            return;
        }
        this.state.off('pending');
        config_1.log.verbose('PuppetWeChat', 'stop() make watchdog sleep before do stop');
        /**
         * Clean listeners for `watchdog`
         */
        // this.watchdog.sleep()
        this.scanWatchdog.sleep();
        // this.watchdog.removeAllListeners()
        this.scanWatchdog.removeAllListeners();
        this.removeAllListeners('watchdog');
        try {
            await this.bridge.stop();
            // register the removeListeners micro task at then end of the task queue
            setImmediate(() => this.bridge.removeAllListeners());
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'this.bridge.quit() exception: %s', e.message);
            throw e;
        }
        finally {
            this.state.off(true);
            // this.emit('stop')
        }
    }
    /**
     * Deal with SCAN events
     *
     * if web browser stay at login qrcode page long time,
     * sometimes the qrcode will not refresh, leave there expired.
     * so we need to refresh the page after a while
     */
    initWatchdogForScan() {
        config_1.log.verbose('PuppetWeChat', 'initWatchdogForScan()');
        const puppet = this;
        const dog = this.scanWatchdog;
        // clean the dog because this could be re-inited
        // dog.removeAllListeners()
        puppet.on('scan', info => dog.feed({
            data: info,
            type: 'scan',
        }));
        puppet.on('login', ( /* user */) => {
            // dog.feed({
            //   data: user,
            //   type: 'login',
            // })
            // do not monitor `scan` event anymore
            // after user login
            dog.sleep();
        });
        // active monitor again for `scan` event
        puppet.on('logout', user => dog.feed({
            data: user,
            type: 'logout',
        }));
        dog.on('reset', async (food, timePast) => {
            config_1.log.warn('PuppetWeChat', 'initScanWatchdog() on(reset) lastFood: %s, timePast: %s', food.data, timePast);
            try {
                await this.bridge.reload();
            }
            catch (e) {
                config_1.log.error('PuppetWeChat', 'initScanWatchdog() on(reset) exception: %s', e);
                try {
                    config_1.log.error('PuppetWeChat', 'initScanWatchdog() on(reset) try to recover by bridge.{quit,init}()', e);
                    await this.bridge.stop();
                    await this.bridge.start();
                    config_1.log.error('PuppetWeChat', 'initScanWatchdog() on(reset) recover successful');
                }
                catch (e) {
                    config_1.log.error('PuppetWeChat', 'initScanWatchdog() on(reset) recover FAIL: %s', e);
                    this.emit('error', e);
                }
            }
        });
    }
    async initBridge() {
        config_1.log.verbose('PuppetWeChat', 'initBridge()');
        if (this.state.off()) {
            const e = new Error('initBridge() found targetState != live, no init anymore');
            config_1.log.warn('PuppetWeChat', e.message);
            throw e;
        }
        this.bridge.on('dong', (data) => this.emit('dong', { data }));
        // this.bridge.on('ding'     , Event.onDing.bind(this))
        this.bridge.on('heartbeat', (data) => this.emit('heartbeat', { data: data + 'bridge ding' }));
        this.bridge.on('error', (e) => this.emit('error', { data: (e && e.message) || String(e) }));
        this.bridge.on('log', event_1.Event.onLog.bind(this));
        this.bridge.on('login', event_1.Event.onLogin.bind(this));
        this.bridge.on('logout', event_1.Event.onLogout.bind(this));
        this.bridge.on('message', event_1.Event.onMessage.bind(this));
        this.bridge.on('scan', event_1.Event.onScan.bind(this));
        this.bridge.on('unload', event_1.Event.onUnload.bind(this));
        try {
            await this.bridge.start();
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'initBridge() exception: %s', e.message);
            await this.bridge.stop().catch(e => {
                config_1.log.error('PuppetWeChat', 'initBridge() this.bridge.stop() rejection: %s', e);
            });
            this.emit('error', e);
            throw e;
        }
        return this.bridge;
    }
    async getBaseRequest() {
        try {
            const json = await this.bridge.getBaseRequest();
            const obj = JSON.parse(json);
            return obj.BaseRequest;
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'send() exception: %s', e.message);
            throw e;
        }
    }
    unref() {
        config_1.log.verbose('PuppetWeChat', 'unref ()');
        super.unref();
        if (this.scanWatchdog) {
            this.scanWatchdog.unref();
        }
        // TODO: unref() the puppeteer
    }
    /**
     *
     * Message
     *
     */
    async messageRawPayload(id) {
        const rawPayload = await this.bridge.getMessage(id);
        return rawPayload;
    }
    async messageRawPayloadParser(rawPayload) {
        config_1.log.verbose('PuppetWeChat', 'messageRawPayloadParser(%s) @ %s', rawPayload, this);
        const payload = mod_1.messageRawPayloadParser(rawPayload);
        return payload;
    }
    async messageRecall(messageId) {
        return wechaty_puppet_1.throwUnsupportedError(messageId);
    }
    async messageFile(messageId) {
        const rawPayload = await this.messageRawPayload(messageId);
        const fileBox = await this.messageRawPayloadToFile(rawPayload);
        return fileBox;
    }
    async messageUrl(messageId) {
        return wechaty_puppet_1.throwUnsupportedError(messageId);
    }
    async messageMiniProgram(messageId) {
        config_1.log.verbose('PuppetWeChat', 'messageMiniProgram(%s)', messageId);
        return wechaty_puppet_1.throwUnsupportedError(messageId);
    }
    async messageRawPayloadToFile(rawPayload) {
        let url = await this.messageRawPayloadToUrl(rawPayload);
        if (!url) {
            throw new Error('no url for type ' + wechaty_puppet_1.MessageType[rawPayload.MsgType]);
        }
        // use http instead of https, because https will only success on the very first request!
        url = url.replace(/^https/i, 'http');
        const parsedUrl = new url_1.default.URL(url);
        const msgFileName = mod_1.messageFilename(rawPayload);
        if (!msgFileName) {
            throw new Error('no filename');
        }
        const cookies = await this.cookies();
        const headers = {
            Accept: '*/*',
            // 'Accept-Encoding': 'gzip, deflate, sdch',
            // 'Accept-Encoding': 'gzip, deflate, sdch, br', // MsgType.IMAGE | VIDEO
            'Accept-Encoding': 'identity;q=1, *;q=0',
            'Accept-Language': 'zh-CN,zh;q=0.8',
            // 'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6,en-US;q=0.4,en;q=0.2',
            Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '),
            // Accept: 'image/webp,image/*,*/*;q=0.8',
            // Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', //  MsgType.IMAGE | VIDEO
            Host: parsedUrl.hostname,
            Range: 'bytes=0-',
            // Referer: protocol + '//wx.qq.com/',
            Referer: url,
            // 'Upgrade-Insecure-Requests': 1, // MsgType.VIDEO | IMAGE
            /**
             * pgv_pvi=6639183872; pgv_si=s8359147520; webwx_data_ticket=gSeBbuhX+0kFdkXbgeQwr6Ck
             */
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) '
                + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
        };
        const fileBox = wechaty_puppet_1.FileBox.fromUrl(url, msgFileName, headers);
        return fileBox;
    }
    async messageSendUrl(conversationId, urlLinkPayload) {
        wechaty_puppet_1.throwUnsupportedError(conversationId, urlLinkPayload);
    }
    async messageSendMiniProgram(conversationId, miniProgramPayload) {
        config_1.log.verbose('PuppetWeChat', 'messageSendMiniProgram("%s", %s)', conversationId, JSON.stringify(miniProgramPayload));
        wechaty_puppet_1.throwUnsupportedError(conversationId, miniProgramPayload);
    }
    /**
     * TODO: Test this function if it could work...
     */
    // public async forward(baseData: MsgRawObj, patchData: MsgRawObj): Promise<boolean> {
    async messageForward(conversationId, messageId) {
        config_1.log.silly('PuppetWeChat', 'forward(receiver=%s, messageId=%s)', conversationId, messageId);
        let rawPayload = await this.messageRawPayload(messageId);
        // rawPayload = Object.assign({}, rawPayload)
        const newMsg = {};
        const largeFileSize = 25 * 1024 * 1024;
        // let ret = false
        // if you know roomId or userId, you can use `Room.load(roomId)` or `Contact.load(userId)`
        // let sendToList: Contact[] = [].concat(sendTo as any || [])
        // sendToList = sendToList.filter(s => {
        //   if ((s instanceof Room || s instanceof Contact) && s.id) {
        //     return true
        //   }
        //   return false
        // }) as Contact[]
        // if (sendToList.length < 1) {
        //   throw new Error('param must be Room or Contact and array')
        // }
        if (rawPayload.FileSize >= largeFileSize && !rawPayload.Signature) {
            // if has RawObj.Signature, can forward the 25Mb+ file
            config_1.log.warn('MediaMessage', 'forward() Due to webWx restrictions, '
                + 'more than 25MB of files can not be downloaded and can not be forwarded.');
            throw new Error('forward() Due to webWx restrictions, '
                + 'more than 25MB of files can not be downloaded and can not be forwarded.');
        }
        newMsg.FromUserName = this.id || '';
        newMsg.isTranspond = true;
        newMsg.MsgIdBeforeTranspond = rawPayload.MsgIdBeforeTranspond || rawPayload.MsgId;
        newMsg.MMSourceMsgId = rawPayload.MsgId;
        // In room msg, the content prefix sender:, need to be removed,
        // otherwise the forwarded sender will display the source message sender,
        // causing self () to determine the error
        newMsg.Content = mod_1.unescapeHtml(rawPayload.Content.replace(/^@\w+:<br\/>/, '')).replace(/^[\w-]+:<br\/>/, '');
        newMsg.MMIsChatRoom = mod_1.isRoomId(conversationId);
        // The following parameters need to be overridden after calling createMessage()
        rawPayload = Object.assign(rawPayload, newMsg);
        // for (let i = 0; i < sendToList.length; i++) {
        // newMsg.ToUserName = sendToList[i].id
        // // all call success return true
        // ret = (i === 0 ? true : ret) && await config.puppetInstance().forward(m, newMsg)
        // }
        newMsg.ToUserName = conversationId;
        // ret = await config.puppetInstance().forward(m, newMsg)
        // return ret
        const baseData = rawPayload;
        const patchData = newMsg;
        try {
            const ret = await this.bridge.forward(baseData, patchData);
            if (!ret) {
                throw new Error('forward failed');
            }
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'forward() exception: %s', e.message);
            throw e;
        }
    }
    async messageSendText(conversationId, text) {
        config_1.log.verbose('PuppetWeChat', 'messageSendText(%s, %s)', conversationId, text);
        try {
            await this.bridge.send(conversationId, text);
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'messageSendText() exception: %s', e.message);
            throw e;
        }
    }
    async login(userId) {
        return super.login(userId);
    }
    /**
     * logout from browser, then server will emit `logout` event
     */
    async logout() {
        config_1.log.verbose('PuppetWeChat', 'logout()');
        const user = this.selfId();
        if (!user) {
            config_1.log.warn('PuppetWeChat', 'logout() without self()');
            return;
        }
        try {
            await this.bridge.logout();
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'logout() exception: %s', e.message);
            throw e;
        }
        finally {
            this.id = undefined;
            this.emit('logout', { contactId: user, data: 'logout()' });
        }
    }
    /**
     *
     * ContactSelf
     *
     *
     */
    async contactSelfQRCode() {
        return wechaty_puppet_1.throwUnsupportedError();
    }
    async contactSelfName(name) {
        return wechaty_puppet_1.throwUnsupportedError(name);
    }
    async contactSelfSignature(signature) {
        return wechaty_puppet_1.throwUnsupportedError(signature);
    }
    /**
     *
     * Contact
     *
     */
    async contactRawPayload(id) {
        config_1.log.silly('PuppetWeChat', 'contactRawPayload(%s) @ %s', id, this);
        try {
            const rawPayload = await this.bridge.getContact(id);
            return rawPayload;
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'contactRawPayload(%s) exception: %s', id, e.message);
            throw e;
        }
    }
    async contactRawPayloadParser(rawPayload) {
        config_1.log.silly('PuppetWeChat', 'contactParseRawPayload(Object.keys(payload).length=%d)', Object.keys(rawPayload).length);
        if (!Object.keys(rawPayload).length) {
            config_1.log.error('PuppetWeChat', 'contactParseRawPayload(Object.keys(payload).length=%d)', Object.keys(rawPayload).length);
            config_1.log.error('PuppetWeChat', 'contactParseRawPayload() got empty rawPayload!');
            throw new Error('empty raw payload');
            // return {
            //   gender: Gender.Unknown,
            //   type:   Contact.Type.Unknown,
            // }
        }
        // this.id = rawPayload.UserName
        // MMActualSender??? MMPeerUserName??? `getUserContact(message.MMActualSender,message.MMPeerUserName).HeadImgUrl`
        // uin:        rawPayload.Uin,    // stable id: 4763975 || getCookie("wxuin")
        return {
            address: rawPayload.Alias,
            alias: rawPayload.RemarkName,
            avatar: rawPayload.HeadImgUrl,
            city: rawPayload.City,
            friend: rawPayload.stranger === undefined
                ? undefined
                : !rawPayload.stranger,
            gender: rawPayload.Sex,
            id: rawPayload.UserName,
            name: mod_1.plainText(rawPayload.NickName || ''),
            province: rawPayload.Province,
            signature: rawPayload.Signature,
            star: !!rawPayload.StarFriend,
            /**
              * @see 1. https://github.com/Chatie/webwx-app-tracker/blob/
              *  7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L3243
              * @see 2. https://github.com/Urinx/WeixinBot/blob/master/README.md
              * @ignore
              */
            type: (!!rawPayload.UserName && !rawPayload.UserName.startsWith('@@') && !!(rawPayload.VerifyFlag & 8))
                ? wechaty_puppet_1.ContactType.Official
                : wechaty_puppet_1.ContactType.Personal,
            weixin: rawPayload.Alias, // Wechat ID
        };
    }
    ding(data) {
        config_1.log.verbose('PuppetWeChat', 'ding(%s)', data || '');
        this.bridge.ding(data);
    }
    async contactAvatar(contactId, file) {
        config_1.log.verbose('PuppetWeChat', 'contactAvatar(%s)', contactId);
        if (file) {
            throw new Error('not support');
        }
        const payload = await this.contactPayload(contactId);
        if (!payload.avatar) {
            throw new Error('Can not get avatar: no payload.avatar!');
        }
        try {
            const hostname = await this.hostname();
            const avatarUrl = `http://${hostname}${payload.avatar}&type=big`; // add '&type=big' to get big image
            const cookieList = await this.cookies();
            config_1.log.silly('PuppeteerContact', 'avatar() url: %s', avatarUrl);
            /**
             * FileBox headers (will be used in NodeJS.http.get param options)
             */
            const headers = {
                cookie: cookieList.map(c => `${c.name}=${c.value}`).join('; '),
            };
            const fileName = (payload.name || 'unknown') + '-avatar.jpg';
            return wechaty_puppet_1.FileBox.fromUrl(avatarUrl, fileName, headers);
        }
        catch (err) {
            config_1.log.warn('PuppeteerContact', 'avatar() exception: %s', err.stack);
            throw err;
        }
    }
    async contactQrcode(contactId) {
        if (contactId !== this.selfId()) {
            throw new Error('can not set avatar for others');
        }
        throw new Error('not supported');
        // return await this.bridge.WXqr
    }
    async contactAlias(contactId, alias) {
        if (typeof alias === 'undefined') {
            throw new Error('to be implement');
        }
        try {
            const ret = await this.bridge.contactAlias(contactId, alias);
            if (!ret) {
                config_1.log.warn('PuppetWeChat', 'contactRemark(%s, %s) bridge.contactAlias() return false', contactId, alias);
                throw new Error('bridge.contactAlias fail');
            }
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'contactRemark(%s, %s) rejected: %s', contactId, alias, e.message);
            throw e;
        }
    }
    async contactList() {
        const idList = await this.bridge.contactList();
        return idList;
    }
    /**
     *
     * Room
     *
     */
    async roomRawPayload(id) {
        config_1.log.verbose('PuppetWeChat', 'roomRawPayload(%s)', id);
        try {
            let rawPayload;
            // = await this.bridge.getContact(room.id) as PuppeteerRoomRawPayload
            // let currNum = rawPayload.MemberList && rawPayload.MemberList.length || 0
            // let prevNum = room.memberList().length
            // rawPayload && rawPayload.MemberList && this.rawObj.MemberList.length || 0
            let prevLength = 0;
            /**
             * @todo use Misc.retry() to replace the following loop
             */
            let ttl = 7;
            while (ttl-- /* && currNum !== prevNum */) {
                rawPayload = await this.bridge.getContact(id);
                if (rawPayload) {
                    const currLength = (rawPayload.MemberList && rawPayload.MemberList.length) || 0;
                    config_1.log.silly('PuppetWeChat', 'roomPayload() this.bridge.getContact(%s) '
                        + 'MemberList.length:(prev:%d, curr:%d) at ttl:%d', id, prevLength, currLength, ttl);
                    if (prevLength === currLength) {
                        config_1.log.silly('PuppetWeChat', 'roomPayload() puppet.getContact(%s) done at ttl:%d with length:%d', this.id, ttl, currLength);
                        return rawPayload;
                    }
                    if (currLength >= prevLength) {
                        prevLength = currLength;
                    }
                    else {
                        config_1.log.warn('PuppetWeChat', 'roomRawPayload() currLength(%d) <= prevLength(%d) ???', currLength, prevLength);
                    }
                }
                config_1.log.silly('PuppetWeChat', `roomPayload() puppet.getContact(${id}) retry at ttl:%d`, ttl);
                await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
            }
            throw new Error('no payload');
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'roomRawPayload(%s) exception: %s', id, e.message);
            throw e;
        }
    }
    async roomRawPayloadParser(rawPayload) {
        config_1.log.verbose('PuppetWeChat', 'roomRawPayloadParser(%s)', rawPayload);
        // const payload = await this.roomPayload(rawPayload.UserName)
        // console.log(rawPayload)
        // const memberList = (rawPayload.MemberList || [])
        //                     .map(m => this.Contact.load(m.UserName))
        // await Promise.all(memberList.map(c => c.ready()))
        const id = rawPayload.UserName;
        // const rawMemberList = rawPayload.MemberList || []
        // const memberIdList  = rawMemberList.map(rawMember => rawMember.UserName)
        // const nameMap         = await this.roomParseMap('name'        , rawPayload.MemberList)
        // const roomAliasMap    = await this.roomParseMap('roomAlias'   , rawPayload.MemberList)
        // const contactAliasMap = await this.roomParseMap('contactAlias', rawPayload.MemberList)
        // const aliasDict = {} as { [id: string]: string | undefined }
        // if (Array.isArray(rawPayload.MemberList)) {
        //   rawPayload.MemberList.forEach(rawMember => {
        //     aliasDict[rawMember.UserName] = rawMember.DisplayName
        //   })
        //   // const memberListPayload = await Promise.all(
        //   //   rawPayload.MemberList
        //   //     .map(rawMember => rawMember.UserName)
        //   //     .map(contactId => this.contactPayload(contactId)),
        //   // )
        //   // console.log(memberListPayload)
        //   // memberListPayload.forEach(payload => aliasDict[payload.id] = payload.alias)
        //   // console.log(aliasDict)
        // }
        const memberIdList = rawPayload.MemberList
            ? rawPayload.MemberList.map(m => m.UserName)
            : [];
        const roomPayload = {
            adminIdList: [],
            id,
            memberIdList,
            topic: mod_1.plainText(rawPayload.NickName || ''),
            // aliasDict,
            // nameMap,
            // roomAliasMap,
            // contactAliasMap,
        };
        // console.log(roomPayload)
        return roomPayload;
    }
    async roomList() {
        config_1.log.verbose('PuppetPupppeteer', 'roomList()');
        const idList = await this.bridge.roomList();
        return idList;
    }
    async roomDel(roomId, contactId) {
        try {
            await this.bridge.roomDelMember(roomId, contactId);
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'roomDelMember(%s, %d) rejected: %s', roomId, contactId, e.message);
            throw e;
        }
    }
    async roomAvatar(roomId) {
        config_1.log.verbose('PuppetWeChat', 'roomAvatar(%s)', roomId);
        const payload = await this.roomPayload(roomId);
        if (payload.avatar) {
            return wechaty_puppet_1.FileBox.fromUrl(payload.avatar);
        }
        config_1.log.warn('PuppetWeChat', 'roomAvatar() avatar not found, use the chatie default.');
        return config_1.qrCodeForChatie();
    }
    async roomAdd(roomId, contactId) {
        try {
            await this.bridge.roomAddMember(roomId, contactId);
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'roomAddMember(%s) rejected: %s', contactId, e.message);
            throw e;
        }
    }
    async roomTopic(roomId, topic) {
        if (!topic) {
            const payload = await this.roomPayload(roomId);
            return payload.topic;
        }
        try {
            await this.bridge.roomModTopic(roomId, topic);
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'roomTopic(%s) rejected: %s', topic, e.message);
            throw e;
        }
    }
    async roomCreate(contactIdList, topic) {
        try {
            const roomId = await this.bridge.roomCreate(contactIdList, topic);
            if (!roomId) {
                throw new Error('PuppetWeChat.roomCreate() roomId "' + roomId + '" not found');
            }
            return roomId;
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'roomCreate(%s, %s) rejected: %s', contactIdList.join(','), topic, e.message);
            throw e;
        }
    }
    async roomAnnounce(roomId, text) {
        config_1.log.warn('PuppetWeChat', 'roomAnnounce(%s, %s) not supported', roomId, text || '');
        if (text) {
            return;
        }
        return '';
    }
    async roomQuit(roomId) {
        config_1.log.warn('PuppetWeChat', 'roomQuit(%s) not supported by Web API', roomId);
    }
    async roomQRCode(roomId) {
        return wechaty_puppet_1.throwUnsupportedError(roomId);
    }
    async roomMemberList(roomId) {
        config_1.log.verbose('PuppetWeChat', 'roommemberList(%s)', roomId);
        const rawPayload = await this.roomRawPayload(roomId);
        const memberIdList = (rawPayload.MemberList || [])
            .map(member => member.UserName);
        return memberIdList;
    }
    async roomMemberRawPayload(roomId, contactId) {
        config_1.log.verbose('PuppetWeChat', 'roomMemberRawPayload(%s, %s)', roomId, contactId);
        const rawPayload = await this.roomRawPayload(roomId);
        const memberPayloadList = rawPayload.MemberList || [];
        const memberPayloadResult = memberPayloadList.filter(payload => payload.UserName === contactId);
        if (memberPayloadResult.length > 0) {
            return memberPayloadResult[0];
        }
        else {
            throw new Error('not found');
        }
    }
    async roomMemberRawPayloadParser(rawPayload) {
        config_1.log.verbose('PuppetWeChat', 'roomMemberRawPayloadParser(%s)', rawPayload);
        const payload = {
            avatar: rawPayload.HeadImgUrl,
            id: rawPayload.UserName,
            name: rawPayload.NickName,
            roomAlias: rawPayload.DisplayName,
        };
        return payload;
    }
    /**
     *
     * Room Invitation
     *
     */
    async roomInvitationAccept(roomInvitationId) {
        return wechaty_puppet_1.throwUnsupportedError(roomInvitationId);
    }
    async roomInvitationRawPayload(roomInvitationId) {
        return wechaty_puppet_1.throwUnsupportedError(roomInvitationId);
    }
    async roomInvitationRawPayloadParser(rawPayload) {
        return wechaty_puppet_1.throwUnsupportedError(rawPayload);
    }
    /**
     *
     * Friendship
     *
     */
    async friendshipRawPayload(id) {
        config_1.log.warn('PuppetWeChat', 'friendshipRawPayload(%s)', id);
        const rawPayload = await this.bridge.getMessage(id);
        if (!rawPayload) {
            throw new Error('no rawPayload');
        }
        return rawPayload;
    }
    async friendshipRawPayloadParser(rawPayload) {
        config_1.log.warn('PuppetWeChat', 'friendshipRawPayloadParser(%s)', rawPayload);
        const timestamp = Math.floor(Date.now() / 1000); // in seconds
        switch (rawPayload.MsgType) {
            case web_schemas_1.WebMessageType.VERIFYMSG: {
                if (!rawPayload.RecommendInfo) {
                    throw new Error('no RecommendInfo');
                }
                const recommendInfo = rawPayload.RecommendInfo;
                if (!recommendInfo) {
                    throw new Error('no recommendInfo');
                }
                const payloadReceive = {
                    contactId: recommendInfo.UserName,
                    hello: recommendInfo.Content,
                    id: rawPayload.MsgId,
                    ticket: recommendInfo.Ticket,
                    timestamp,
                    type: wechaty_puppet_1.FriendshipType.Receive,
                };
                return payloadReceive;
            }
            case web_schemas_1.WebMessageType.SYS: {
                const payloadConfirm = {
                    contactId: rawPayload.FromUserName,
                    id: rawPayload.MsgId,
                    timestamp,
                    type: wechaty_puppet_1.FriendshipType.Confirm,
                };
                return payloadConfirm;
            }
            default:
                throw new Error('not supported friend request message raw payload');
        }
    }
    async friendshipSearchPhone(phone) {
        throw wechaty_puppet_1.throwUnsupportedError(phone);
    }
    async friendshipSearchWeixin(weixin) {
        throw wechaty_puppet_1.throwUnsupportedError(weixin);
    }
    async friendshipAdd(contactId, hello) {
        try {
            await this.bridge.verifyUserRequest(contactId, hello);
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'friendshipAdd() bridge.verifyUserRequest(%s, %s) rejected: %s', contactId, hello, e.message);
            throw e;
        }
    }
    async friendshipAccept(friendshipId) {
        const payload = await this.friendshipPayload(friendshipId);
        try {
            await this.bridge.verifyUserOk(payload.contactId, payload.ticket);
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'bridge.verifyUserOk(%s, %s) rejected: %s', payload.contactId, payload.ticket, e.message);
            throw e;
        }
    }
    /**
     * @private
     * For issue #668
     */
    async waitStable() {
        config_1.log.verbose('PuppetWeChat', 'waitStable()');
        let maxNum = 0;
        let curNum = 0;
        let unchangedNum = 0;
        const SLEEP_SECOND = 1;
        const STABLE_CHECK_NUM = 3;
        while (unchangedNum < STABLE_CHECK_NUM) {
            // wait 1 second
            await new Promise(resolve => setTimeout(resolve, SLEEP_SECOND * 1000));
            const contactList = await this.contactList();
            curNum = contactList.length;
            if (curNum > 0 && curNum === maxNum) {
                unchangedNum++;
            }
            else /* curNum < maxNum */ {
                unchangedNum = 0;
            }
            if (curNum > maxNum) {
                maxNum = curNum;
            }
            config_1.log.silly('PuppetWeChat', 'readyStable() while() curNum=%s, maxNum=%s, unchangedNum=%s', curNum, maxNum, unchangedNum);
        }
        config_1.log.verbose('PuppetWeChat', 'readyStable() emit(ready)');
        this.emit('ready', { data: 'stable' });
    }
    /**
     * https://www.chatie.io:8080/api
     * location.hostname = www.chatie.io
     * location.host = www.chatie.io:8080
     * See: https://stackoverflow.com/a/11379802/1123955
     */
    async hostname() {
        try {
            const name = await this.bridge.hostname();
            if (!name) {
                throw new Error('no hostname found');
            }
            return name;
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'hostname() exception:%s', e);
            this.emit('error', e);
            throw e;
        }
    }
    async cookies() {
        return this.bridge.cookies();
    }
    async saveCookie() {
        const cookieList = await this.bridge.cookies();
        await this.memory.set(config_1.MEMORY_SLOT, cookieList);
        await this.memory.save();
    }
    extToType(ext) {
        switch (ext) {
            case '.bmp':
            case '.jpeg':
            case '.jpg':
            case '.png':
                return web_schemas_1.WebMessageType.IMAGE;
            case '.gif':
                return web_schemas_1.WebMessageType.EMOTICON;
            case '.mp4':
                return web_schemas_1.WebMessageType.VIDEO;
            default:
                return web_schemas_1.WebMessageType.APP;
        }
    }
    // public async readyMedia(): Promise<this> {
    async messageRawPayloadToUrl(rawPayload) {
        config_1.log.silly('PuppetWeChat', 'readyMedia()');
        // let type = MessageType.Unknown
        let url;
        try {
            switch (rawPayload.MsgType) {
                case web_schemas_1.WebMessageType.EMOTICON:
                    // type = MessageType.Emoticon
                    url = await this.bridge.getMsgEmoticon(rawPayload.MsgId);
                    break;
                case web_schemas_1.WebMessageType.IMAGE:
                    // type = MessageType.Image
                    url = await this.bridge.getMsgImg(rawPayload.MsgId);
                    break;
                case web_schemas_1.WebMessageType.VIDEO:
                case web_schemas_1.WebMessageType.MICROVIDEO:
                    // type = MessageType.Video
                    url = await this.bridge.getMsgVideo(rawPayload.MsgId);
                    break;
                case web_schemas_1.WebMessageType.VOICE:
                    // type = MessageType.Audio
                    url = await this.bridge.getMsgVoice(rawPayload.MsgId);
                    break;
                case web_schemas_1.WebMessageType.APP:
                    switch (rawPayload.AppMsgType) {
                        case web_schemas_1.WebAppMsgType.ATTACH:
                            if (!rawPayload.MMAppMsgDownloadUrl) {
                                throw new Error('no MMAppMsgDownloadUrl');
                            }
                            // had set in Message
                            // type = MessageType.Attachment
                            url = rawPayload.MMAppMsgDownloadUrl;
                            break;
                        case web_schemas_1.WebAppMsgType.URL:
                        case web_schemas_1.WebAppMsgType.READER_TYPE:
                            if (!rawPayload.Url) {
                                throw new Error('no Url');
                            }
                            // had set in Message
                            // type = MessageType.Attachment
                            url = rawPayload.Url;
                            break;
                        default: {
                            const e = new Error('ready() unsupported typeApp(): ' + rawPayload.AppMsgType);
                            config_1.log.warn('PuppeteerMessage', e.message);
                            throw e;
                        }
                    }
                    break;
                case web_schemas_1.WebMessageType.TEXT:
                    if (rawPayload.SubMsgType === web_schemas_1.WebMessageType.LOCATION) {
                        // type = MessageType.Image
                        url = await this.bridge.getMsgPublicLinkImg(rawPayload.MsgId);
                    }
                    break;
                default:
                    /**
                     * not a support media message, do nothing.
                     */
                    return null;
                // return this
            }
            if (!url) {
                // if (!this.payload.url) {
                //   /**
                //    * not a support media message, do nothing.
                //    */
                //   return this
                // }
                // url = this.payload.url
                // return {
                //   type: MessageType.Unknown,
                // }
                return null;
            }
        }
        catch (e) {
            config_1.log.warn('PuppetWeChat', 'ready() exception: %s', e.message);
            throw e;
        }
        return url;
    }
    async uploadMedia(file, toUserName) {
        const filename = file.name;
        const ext = path_1.default.extname(filename); //  message.ext()
        // const contentType = Misc.mime(ext)
        const contentType = mime_1.default.getType(ext);
        // const contentType = message.mimeType()
        if (!contentType) {
            throw new Error('no MIME Type found on mediaMessage: ' + file.name);
        }
        let mediatype;
        switch (ext) {
            case '.bmp':
            case '.jpeg':
            case '.jpg':
            case '.png':
            case '.gif':
                mediatype = "pic" /* Image */;
                break;
            case '.mp4':
                mediatype = "video" /* Video */;
                break;
            default:
                mediatype = "doc" /* Attachment */;
        }
        const buffer = await new Promise((resolve, reject) => {
            file.pipe(new bl_1.default((err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            }));
        });
        // Sending video files is not allowed to exceed 20MB
        // https://github.com/Chatie/webwx-app-tracker/blob/
        //  7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L1115
        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        const LARGE_FILE_SIZE = 25 * 1024 * 1024;
        const MAX_VIDEO_SIZE = 20 * 1024 * 1024;
        if (mediatype === "video" /* Video */ && buffer.length > MAX_VIDEO_SIZE) {
            throw new Error(`Sending video files is not allowed to exceed ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
        }
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error(`Sending files is not allowed to exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        const fileMd5 = md5_1.default(buffer);
        const baseRequest = await this.getBaseRequest();
        const passTicket = await this.bridge.getPassticket();
        const uploadMediaUrl = await this.bridge.getUploadMediaUrl();
        const checkUploadUrl = await this.bridge.getCheckUploadUrl();
        const cookie = await this.bridge.cookies();
        const first = cookie.find(c => c.name === 'webwx_data_ticket');
        const webwxDataTicket = first && first.value;
        const size = buffer.length;
        const fromUserName = this.selfId();
        const id = 'WU_FILE_' + this.fileId;
        this.fileId++;
        const hostname = await this.bridge.hostname();
        const headers = {
            Cookie: cookie.map(c => c.name + '=' + c.value).join('; '),
            Referer: `https://${hostname}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 '
                + '(KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
        };
        config_1.log.silly('PuppetWeChat', 'uploadMedia() headers:%s', JSON.stringify(headers));
        const uploadMediaRequest = {
            AESKey: '',
            BaseRequest: baseRequest,
            ClientMediaId: +new Date(),
            DataLen: size,
            FileMd5: fileMd5,
            FromUserName: fromUserName,
            MediaType: "doc" /* Attachment */,
            Signature: '',
            StartPos: 0,
            ToUserName: toUserName,
            TotalLen: size,
            UploadType: 2,
        };
        const checkData = {
            BaseRequest: baseRequest,
            FileMd5: fileMd5,
            FileName: filename,
            FileSize: size,
            FileType: 7,
            FromUserName: fromUserName,
            ToUserName: toUserName,
        };
        const mediaData = {
            FileMd5: fileMd5,
            FileName: filename,
            FileSize: size,
            MMFileExt: ext,
            MediaId: '',
            ToUserName: toUserName,
        };
        // If file size > 25M, must first call checkUpload to get Signature and AESKey, otherwise it will fail to upload
        // https://github.com/Chatie/webwx-app-tracker/blob/
        //  7c59d35c6ea0cff38426a4c5c912a086c4c512b2/formatted/webwxApp.js#L1132 #1182
        if (size > LARGE_FILE_SIZE) {
            let ret;
            try {
                ret = await new Promise((resolve, reject) => {
                    const r = {
                        headers,
                        json: checkData,
                        url: `https://${hostname}${checkUploadUrl}`,
                    };
                    request_1.default.post(r, (err, _ /* res */, body) => {
                        try {
                            if (err) {
                                reject(err);
                            }
                            else {
                                let obj = body;
                                if (typeof body !== 'object') {
                                    config_1.log.silly('PuppetWeChat', 'updateMedia() typeof body = %s', typeof body);
                                    try {
                                        obj = JSON.parse(body);
                                    }
                                    catch (e) {
                                        config_1.log.error('PuppetWeChat', 'updateMedia() body = %s', body);
                                        config_1.log.error('PuppetWeChat', 'updateMedia() exception: %s', e);
                                        this.emit('error', e);
                                    }
                                }
                                if (typeof obj !== 'object' || obj.BaseResponse.Ret !== 0) {
                                    const errMsg = obj.BaseResponse || 'api return err';
                                    config_1.log.silly('PuppetWeChat', 'uploadMedia() checkUpload err:%s \nreq:%s\nret:%s', JSON.stringify(errMsg), JSON.stringify(r), body);
                                    reject(new Error('chackUpload err:' + JSON.stringify(errMsg)));
                                }
                                resolve({
                                    AESKey: obj.AESKey,
                                    Signature: obj.Signature,
                                });
                            }
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
            }
            catch (e) {
                config_1.log.error('PuppetWeChat', 'uploadMedia() checkUpload exception: %s', e.message);
                throw e;
            }
            if (!ret.Signature) {
                config_1.log.error('PuppetWeChat', 'uploadMedia(): chackUpload failed to get Signature');
                throw new Error('chackUpload failed to get Signature');
            }
            uploadMediaRequest.Signature = ret.Signature;
            uploadMediaRequest.AESKey = ret.AESKey;
            mediaData.Signature = ret.Signature;
        }
        else {
            delete uploadMediaRequest.Signature;
            delete uploadMediaRequest.AESKey;
        }
        config_1.log.verbose('PuppetWeChat', 'uploadMedia() webwx_data_ticket: %s', webwxDataTicket);
        config_1.log.verbose('PuppetWeChat', 'uploadMedia() pass_ticket: %s', passTicket);
        /**
         * If FILE.SIZE > 1M, file buffer need to split for upload.
         * Split strategy：
         *  BASE_LENGTH: 512 * 1024
         *  chunks: split number
         *  chunk: the index of chunks
         */
        const BASE_LENGTH = 512 * 1024;
        const chunks = Math.ceil(buffer.length / BASE_LENGTH);
        const bufferData = [];
        for (let i = 0; i < chunks; i++) {
            const tempBuffer = buffer.slice(i * BASE_LENGTH, (i + 1) * BASE_LENGTH);
            bufferData.push(tempBuffer);
        }
        async function getMediaId(buffer, index) {
            const formData = {
                chunk: index,
                chunks,
                filename: {
                    options: {
                        contentType,
                        filename,
                        size,
                    },
                    value: buffer,
                },
                id,
                lastModifiedDate: Date().toString(),
                mediatype,
                name: filename,
                pass_ticket: passTicket || '',
                size,
                type: contentType,
                uploadmediarequest: JSON.stringify(uploadMediaRequest),
                webwx_data_ticket: webwxDataTicket,
            };
            try {
                return await new Promise((resolve, reject) => {
                    try {
                        request_1.default.post({
                            formData,
                            headers,
                            url: uploadMediaUrl + '?f=json',
                        }, (err, _, body) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                let obj = body;
                                if (typeof body !== 'object') {
                                    obj = JSON.parse(body);
                                }
                                resolve(obj.MediaId || '');
                            }
                        });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            catch (e) {
                config_1.log.error('PuppetWeChat', 'uploadMedia() uploadMedia exception: %s', e.message);
                throw new Error('uploadMedia err: ' + e.message);
            }
        }
        let mediaId = '';
        for (let i = 0; i < bufferData.length; i++) {
            mediaId = await getMediaId(bufferData[i], i);
        }
        if (!mediaId) {
            config_1.log.error('PuppetWeChat', 'uploadMedia(): upload fail');
            throw new Error('PuppetWeChat.uploadMedia(): upload fail');
        }
        return Object.assign(mediaData, { MediaId: mediaId });
    }
    async messageSendFile(conversationId, file) {
        config_1.log.verbose('PuppetWeChat', 'messageSendFile(%s, file=%s)', conversationId, file.toString());
        let mediaData;
        let rawPayload = {};
        if (!rawPayload || !rawPayload.MediaId) {
            try {
                mediaData = await this.uploadMedia(file, conversationId);
                rawPayload = Object.assign(rawPayload, mediaData);
                config_1.log.silly('PuppetWeChat', 'Upload completed, new rawObj:%s', JSON.stringify(rawPayload));
            }
            catch (e) {
                config_1.log.error('PuppetWeChat', 'sendMedia() exception: %s', e.message);
                throw e;
            }
        }
        else {
            // To support forward file
            config_1.log.silly('PuppetWeChat', 'skip upload file, rawObj:%s', JSON.stringify(rawPayload));
            mediaData = {
                FileName: rawPayload.FileName,
                FileSize: rawPayload.FileSize,
                MMFileExt: rawPayload.MMFileExt,
                MediaId: rawPayload.MediaId,
                MsgType: rawPayload.MsgType,
                ToUserName: conversationId,
            };
            if (rawPayload.Signature) {
                mediaData.Signature = rawPayload.Signature;
            }
        }
        // console.log('mediaData.MsgType', mediaData.MsgType)
        // console.log('rawObj.MsgType', message.rawObj && message.rawObj.MsgType)
        mediaData.MsgType = this.extToType(path_1.default.extname(file.name));
        config_1.log.silly('PuppetWeChat', 'sendMedia() destination: %s, mediaId: %s, MsgType; %s)', conversationId, mediaData.MediaId, mediaData.MsgType);
        let ret = false;
        try {
            ret = await this.bridge.sendMedia(mediaData);
        }
        catch (e) {
            config_1.log.error('PuppetWeChat', 'sendMedia() exception: %s', e.message);
            throw e;
        }
        if (!ret) {
            throw new Error('sendMedia fail');
        }
    }
    async messageSendContact(conversationId, contactId) {
        config_1.log.verbose('PuppetWeChat', 'messageSend("%s", %s)', conversationId, contactId);
        return wechaty_puppet_1.throwUnsupportedError();
    }
    async messageImage(messageId, imageType) {
        config_1.log.verbose('PuppetWeChat', 'messageImage(%s, %s)', messageId, imageType);
        return this.messageFile(messageId);
    }
    async messageContact(messageId) {
        config_1.log.verbose('PuppetWeChat', 'messageContact(%s)', messageId);
        return wechaty_puppet_1.throwUnsupportedError(messageId);
    }
    /**
     *
     * Tag
     *
     */
    async tagContactAdd(tagId, contactId) {
        return wechaty_puppet_1.throwUnsupportedError(tagId, contactId);
    }
    async tagContactRemove(tagId, contactId) {
        return wechaty_puppet_1.throwUnsupportedError(tagId, contactId);
    }
    async tagContactDelete(tagId) {
        return wechaty_puppet_1.throwUnsupportedError(tagId);
    }
    async tagContactList(contactId) {
        return wechaty_puppet_1.throwUnsupportedError(contactId);
    }
}
exports.PuppetWeChat = PuppetWeChat;
PuppetWeChat.VERSION = config_1.VERSION;
exports.default = PuppetWeChat;
//# sourceMappingURL=puppet-wechat.js.map