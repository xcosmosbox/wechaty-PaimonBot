"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRawPayloadParser = void 0;
const is_type_1 = require("./is-type");
const message_filename_1 = require("./message-filename");
const web_message_type_1 = require("./web-message-type");
function messageRawPayloadParser(rawPayload) {
    const id = rawPayload.MsgId;
    const fromId = rawPayload.MMActualSender; // MMPeerUserName
    const text = rawPayload.MMActualContent; // Content has @id prefix added by wx
    const timestamp = rawPayload.MMDisplayTime; // Javascript timestamp of milliseconds
    const msgFileName = message_filename_1.messageFilename(rawPayload) || undefined;
    let roomId;
    let toId;
    // FIXME: has there any better method to know the room ID?
    if (rawPayload.MMIsChatRoom) {
        if (is_type_1.isRoomId(rawPayload.FromUserName)) {
            roomId = rawPayload.FromUserName; // MMPeerUserName always eq FromUserName ?
        }
        else if (is_type_1.isRoomId(rawPayload.ToUserName)) {
            roomId = rawPayload.ToUserName;
        }
        else {
            throw new Error('parse found a room message, but neither FromUserName nor ToUserName is a room(/^@@/)');
        }
        // console.log('rawPayload.FromUserName: ', rawPayload.FromUserName)
        // console.log('rawPayload.ToUserName: ', rawPayload.ToUserName)
        // console.log('rawPayload.MMPeerUserName: ', rawPayload.MMPeerUserName)
    }
    if (rawPayload.ToUserName) {
        if (!is_type_1.isRoomId(rawPayload.ToUserName)) {
            // if a message in room without any specific receiver, then it will set to be `undefined`
            toId = rawPayload.ToUserName;
        }
    }
    const type = web_message_type_1.webMessageType(rawPayload);
    const payloadBase = {
        filename: msgFileName,
        fromId,
        id,
        mentionIdList: [],
        text,
        timestamp,
        type,
    };
    let payload;
    if (toId) {
        payload = {
            ...payloadBase,
            roomId,
            toId,
        };
    }
    else if (roomId) {
        payload = {
            ...payloadBase,
            roomId,
            toId,
        };
    }
    else {
        throw new Error('neither roomId nor toId');
    }
    return payload;
}
exports.messageRawPayloadParser = messageRawPayloadParser;
//# sourceMappingURL=message-raw-payload-parser.js.map