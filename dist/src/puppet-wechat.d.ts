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
import { Watchdog } from 'watchdog';
import { ContactPayload, FriendshipPayload, FileBox, MessagePayload, MiniProgramPayload, Puppet, PuppetOptions, RoomInvitationPayload, RoomMemberPayload, RoomPayload, UrlLinkPayload, ImageType, EventScanPayload } from 'wechaty-puppet';
import { Bridge } from './bridge';
import { WebContactRawPayload, WebMessageRawPayload, WebRoomRawMember, WebRoomRawPayload } from './web-schemas';
export declare type ScanFoodType = 'scan' | 'login' | 'logout';
export declare class PuppetWeChat extends Puppet {
    options: PuppetOptions;
    static readonly VERSION: string;
    bridge: Bridge;
    scanPayload?: EventScanPayload;
    scanWatchdog: Watchdog<ScanFoodType>;
    private fileId;
    constructor(options?: PuppetOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    /**
     * Deal with SCAN events
     *
     * if web browser stay at login qrcode page long time,
     * sometimes the qrcode will not refresh, leave there expired.
     * so we need to refresh the page after a while
     */
    private initWatchdogForScan;
    private initBridge;
    private getBaseRequest;
    unref(): void;
    /**
     *
     * Message
     *
     */
    messageRawPayload(id: string): Promise<WebMessageRawPayload>;
    messageRawPayloadParser(rawPayload: WebMessageRawPayload): Promise<MessagePayload>;
    messageRecall(messageId: string): Promise<boolean>;
    messageFile(messageId: string): Promise<FileBox>;
    messageUrl(messageId: string): Promise<UrlLinkPayload>;
    messageMiniProgram(messageId: string): Promise<MiniProgramPayload>;
    private messageRawPayloadToFile;
    messageSendUrl(conversationId: string, urlLinkPayload: UrlLinkPayload): Promise<void>;
    messageSendMiniProgram(conversationId: string, miniProgramPayload: MiniProgramPayload): Promise<void>;
    /**
     * TODO: Test this function if it could work...
     */
    messageForward(conversationId: string, messageId: string): Promise<void>;
    messageSendText(conversationId: string, text: string): Promise<void>;
    login(userId: string): Promise<void>;
    /**
     * logout from browser, then server will emit `logout` event
     */
    logout(): Promise<void>;
    /**
     *
     * ContactSelf
     *
     *
     */
    contactSelfQRCode(): Promise<string>;
    contactSelfName(name: string): Promise<void>;
    contactSelfSignature(signature: string): Promise<void>;
    /**
     *
     * Contact
     *
     */
    contactRawPayload(id: string): Promise<WebContactRawPayload>;
    contactRawPayloadParser(rawPayload: WebContactRawPayload): Promise<ContactPayload>;
    ding(data?: string): void;
    contactAvatar(contactId: string): Promise<FileBox>;
    contactAvatar(contactId: string, file: FileBox): Promise<void>;
    contactQrcode(contactId: string): Promise<string>;
    contactAlias(contactId: string): Promise<string>;
    contactAlias(contactId: string, alias: string | null): Promise<void>;
    contactList(): Promise<string[]>;
    /**
     *
     * Room
     *
     */
    roomRawPayload(id: string): Promise<WebRoomRawPayload>;
    roomRawPayloadParser(rawPayload: WebRoomRawPayload): Promise<RoomPayload>;
    roomList(): Promise<string[]>;
    roomDel(roomId: string, contactId: string): Promise<void>;
    roomAvatar(roomId: string): Promise<FileBox>;
    roomAdd(roomId: string, contactId: string): Promise<void>;
    roomTopic(roomId: string): Promise<string>;
    roomTopic(roomId: string, topic: string): Promise<void>;
    roomCreate(contactIdList: string[], topic: string): Promise<string>;
    roomAnnounce(roomId: string): Promise<string>;
    roomAnnounce(roomId: string, text: string): Promise<void>;
    roomQuit(roomId: string): Promise<void>;
    roomQRCode(roomId: string): Promise<string>;
    roomMemberList(roomId: string): Promise<string[]>;
    roomMemberRawPayload(roomId: string, contactId: string): Promise<WebRoomRawMember>;
    roomMemberRawPayloadParser(rawPayload: WebRoomRawMember): Promise<RoomMemberPayload>;
    /**
     *
     * Room Invitation
     *
     */
    roomInvitationAccept(roomInvitationId: string): Promise<void>;
    roomInvitationRawPayload(roomInvitationId: string): Promise<any>;
    roomInvitationRawPayloadParser(rawPayload: any): Promise<RoomInvitationPayload>;
    /**
     *
     * Friendship
     *
     */
    friendshipRawPayload(id: string): Promise<WebMessageRawPayload>;
    friendshipRawPayloadParser(rawPayload: WebMessageRawPayload): Promise<FriendshipPayload>;
    friendshipSearchPhone(phone: string): Promise<null | string>;
    friendshipSearchWeixin(weixin: string): Promise<null | string>;
    friendshipAdd(contactId: string, hello: string): Promise<void>;
    friendshipAccept(friendshipId: string): Promise<void>;
    /**
     * @private
     * For issue #668
     */
    waitStable(): Promise<void>;
    /**
     * https://www.chatie.io:8080/api
     * location.hostname = www.chatie.io
     * location.host = www.chatie.io:8080
     * See: https://stackoverflow.com/a/11379802/1123955
     */
    private hostname;
    private cookies;
    saveCookie(): Promise<void>;
    private extToType;
    private messageRawPayloadToUrl;
    private uploadMedia;
    messageSendFile(conversationId: string, file: FileBox): Promise<void>;
    messageSendContact(conversationId: string, contactId: string): Promise<void>;
    messageImage(messageId: string, imageType: ImageType): Promise<FileBox>;
    messageContact(messageId: string): Promise<string>;
    /**
     *
     * Tag
     *
     */
    tagContactAdd(tagId: string, contactId: string): Promise<void>;
    tagContactRemove(tagId: string, contactId: string): Promise<void>;
    tagContactDelete(tagId: string): Promise<void>;
    tagContactList(contactId?: string): Promise<string[]>;
}
export default PuppetWeChat;
//# sourceMappingURL=puppet-wechat.d.ts.map