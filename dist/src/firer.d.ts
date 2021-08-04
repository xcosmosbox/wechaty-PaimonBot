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
import { PuppetWeChat } from './puppet-wechat';
import { WebMessageRawPayload } from './web-schemas';
export declare class Firer {
    puppet: PuppetWeChat;
    constructor(puppet: PuppetWeChat);
    checkFriendConfirm(rawPayload: WebMessageRawPayload): Promise<void>;
    checkRoomJoin(rawPayload: WebMessageRawPayload): Promise<boolean>;
    /**
     * You removed "Bruce LEE" from the group chat
     */
    checkRoomLeave(rawPayload: WebMessageRawPayload): Promise<boolean>;
    checkRoomTopic(rawPayload: WebMessageRawPayload): Promise<boolean>;
    /**
     * try to find FriendRequest Confirmation Message
     */
    private parseFriendConfirm;
    /**
     * try to find 'join' event for Room
     *
     * 1.
     *  You invited 管理员 to the group chat.
     *  You invited 李卓桓.PreAngel、Bruce LEE to the group chat.
     * 2.
     *  管理员 invited 小桔建群助手 to the group chat
     *  管理员 invited 庆次、小桔妹 to the group chat
     */
    private parseRoomJoin;
    private parseRoomLeave;
    private parseRoomTopic;
}
export default Firer;
//# sourceMappingURL=firer.d.ts.map