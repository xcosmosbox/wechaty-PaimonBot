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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebMessageType = exports.WebAppMsgType = void 0;
// export type MessageTypeName = 'TEXT' | 'IMAGE' | 'VOICE' | 'VERIFYMSG' | 'POSSIBLEFRIEND_MSG'
// | 'SHARECARD' | 'VIDEO' | 'EMOTICON' | 'LOCATION' | 'APP' | 'VOIPMSG' | 'STATUSNOTIFY'
// | 'VOIPNOTIFY' | 'VOIPINVITE' | 'MICROVIDEO' | 'SYSNOTICE' | 'SYS' | 'RECALLED'
// export type MessageTypeValue = 1 | 3 | 34 | 37 | 40 | 42 | 43 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 62 | 9999 | 10000 | 10002
// export interface WebMsgTypeDict {
//   [index: string]: string|number,
//   //   MessageTypeName:  MessageTypeValue
//   // , MessageTypeValue: MessageTypeName
// }
/**
 *
 * Enum for AppMsgType values.
 *
 * @enum {number}
 * @property {number} TEXT                    - AppMsgType.TEXT                     (1)     for TEXT
 * @property {number} IMG                     - AppMsgType.IMG                      (2)      for IMG
 * @property {number} AUDIO                   - AppMsgType.AUDIO                    (3)      for AUDIO
 * @property {number} VIDEO                   - AppMsgType.VIDEO                    (4)      for VIDEO
 * @property {number} URL                     - AppMsgType.URL                      (5)      for URL
 * @property {number} ATTACH                  - AppMsgType.ATTACH                   (6)      for ATTACH
 * @property {number} OPEN                    - AppMsgType.OPEN                     (7)      for OPEN
 * @property {number} EMOJI                   - AppMsgType.EMOJI                    (8)      for EMOJI
 * @property {number} VOICE_REMIND            - AppMsgType.VOICE_REMIND             (9)      for VOICE_REMIND
 * @property {number} SCAN_GOOD               - AppMsgType.SCAN_GOOD                (10)     for SCAN_GOOD
 * @property {number} GOOD                    - AppMsgType.GOOD                     (13)     for GOOD
 * @property {number} EMOTION                 - AppMsgType.EMOTION                  (15)     for EMOTION
 * @property {number} CARD_TICKET             - AppMsgType.CARD_TICKET              (16)     for CARD_TICKET
 * @property {number} REALTIME_SHARE_LOCATION - AppMsgType.REALTIME_SHARE_LOCATION  (17)     for REALTIME_SHARE_LOCATION
 * @property {number} TRANSFERS               - AppMsgType.TRANSFERS                (2e3)    for TRANSFERS
 * @property {number} RED_ENVELOPES           - AppMsgType.RED_ENVELOPES            (2001)   for RED_ENVELOPES
 * @property {number} READER_TYPE             - AppMsgType.READER_TYPE              (100001) for READER_TYPE
 */
var WebAppMsgType;
(function (WebAppMsgType) {
    WebAppMsgType[WebAppMsgType["TEXT"] = 1] = "TEXT";
    WebAppMsgType[WebAppMsgType["IMG"] = 2] = "IMG";
    WebAppMsgType[WebAppMsgType["AUDIO"] = 3] = "AUDIO";
    WebAppMsgType[WebAppMsgType["VIDEO"] = 4] = "VIDEO";
    WebAppMsgType[WebAppMsgType["URL"] = 5] = "URL";
    WebAppMsgType[WebAppMsgType["ATTACH"] = 6] = "ATTACH";
    WebAppMsgType[WebAppMsgType["OPEN"] = 7] = "OPEN";
    WebAppMsgType[WebAppMsgType["EMOJI"] = 8] = "EMOJI";
    WebAppMsgType[WebAppMsgType["VOICE_REMIND"] = 9] = "VOICE_REMIND";
    WebAppMsgType[WebAppMsgType["SCAN_GOOD"] = 10] = "SCAN_GOOD";
    WebAppMsgType[WebAppMsgType["GOOD"] = 13] = "GOOD";
    WebAppMsgType[WebAppMsgType["EMOTION"] = 15] = "EMOTION";
    WebAppMsgType[WebAppMsgType["CARD_TICKET"] = 16] = "CARD_TICKET";
    WebAppMsgType[WebAppMsgType["REALTIME_SHARE_LOCATION"] = 17] = "REALTIME_SHARE_LOCATION";
    WebAppMsgType[WebAppMsgType["TRANSFERS"] = 2000] = "TRANSFERS";
    WebAppMsgType[WebAppMsgType["RED_ENVELOPES"] = 2001] = "RED_ENVELOPES";
    WebAppMsgType[WebAppMsgType["READER_TYPE"] = 100001] = "READER_TYPE";
})(WebAppMsgType = exports.WebAppMsgType || (exports.WebAppMsgType = {}));
/**
 *
 * Enum for MsgType values.
 * @enum {number}
 * @property {number} TEXT                - MsgType.TEXT                (1)     for TEXT
 * @property {number} IMAGE               - MsgType.IMAGE               (3)     for IMAGE
 * @property {number} VOICE               - MsgType.VOICE               (34)    for VOICE
 * @property {number} VERIFYMSG           - MsgType.VERIFYMSG           (37)    for VERIFYMSG
 * @property {number} POSSIBLEFRIEND_MSG  - MsgType.POSSIBLEFRIEND_MSG  (40)    for POSSIBLEFRIEND_MSG
 * @property {number} SHARECARD           - MsgType.SHARECARD           (42)    for SHARECARD
 * @property {number} VIDEO               - MsgType.VIDEO               (43)    for VIDEO
 * @property {number} EMOTICON            - MsgType.EMOTICON            (47)    for EMOTICON
 * @property {number} LOCATION            - MsgType.LOCATION            (48)    for LOCATION
 * @property {number} APP                 - MsgType.APP                 (49)    for APP
 * @property {number} VOIPMSG             - MsgType.VOIPMSG             (50)    for VOIPMSG
 * @property {number} STATUSNOTIFY        - MsgType.STATUSNOTIFY        (51)    for STATUSNOTIFY
 * @property {number} VOIPNOTIFY          - MsgType.VOIPNOTIFY          (52)    for VOIPNOTIFY
 * @property {number} VOIPINVITE          - MsgType.VOIPINVITE          (53)    for VOIPINVITE
 * @property {number} MICROVIDEO          - MsgType.MICROVIDEO          (62)    for MICROVIDEO
 * @property {number} SYSNOTICE           - MsgType.SYSNOTICE           (9999)  for SYSNOTICE
 * @property {number} SYS                 - MsgType.SYS                 (10000) for SYS
 * @property {number} RECALLED            - MsgType.RECALLED            (10002) for RECALLED
 */
var WebMessageType;
(function (WebMessageType) {
    WebMessageType[WebMessageType["TEXT"] = 1] = "TEXT";
    WebMessageType[WebMessageType["IMAGE"] = 3] = "IMAGE";
    WebMessageType[WebMessageType["VOICE"] = 34] = "VOICE";
    WebMessageType[WebMessageType["VERIFYMSG"] = 37] = "VERIFYMSG";
    WebMessageType[WebMessageType["POSSIBLEFRIEND_MSG"] = 40] = "POSSIBLEFRIEND_MSG";
    WebMessageType[WebMessageType["SHARECARD"] = 42] = "SHARECARD";
    WebMessageType[WebMessageType["VIDEO"] = 43] = "VIDEO";
    WebMessageType[WebMessageType["EMOTICON"] = 47] = "EMOTICON";
    WebMessageType[WebMessageType["LOCATION"] = 48] = "LOCATION";
    WebMessageType[WebMessageType["APP"] = 49] = "APP";
    WebMessageType[WebMessageType["VOIPMSG"] = 50] = "VOIPMSG";
    WebMessageType[WebMessageType["STATUSNOTIFY"] = 51] = "STATUSNOTIFY";
    WebMessageType[WebMessageType["VOIPNOTIFY"] = 52] = "VOIPNOTIFY";
    WebMessageType[WebMessageType["VOIPINVITE"] = 53] = "VOIPINVITE";
    WebMessageType[WebMessageType["MICROVIDEO"] = 62] = "MICROVIDEO";
    WebMessageType[WebMessageType["SYSNOTICE"] = 9999] = "SYSNOTICE";
    WebMessageType[WebMessageType["SYS"] = 10000] = "SYS";
    WebMessageType[WebMessageType["RECALLED"] = 10002] = "RECALLED";
})(WebMessageType = exports.WebMessageType || (exports.WebMessageType = {}));
//# sourceMappingURL=web-schemas.js.map