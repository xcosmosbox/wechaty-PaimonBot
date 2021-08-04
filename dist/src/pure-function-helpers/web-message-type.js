"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webMessageType = void 0;
const web_schemas_1 = require("../web-schemas");
const wechaty_puppet_1 = require("wechaty-puppet");
function webMessageType(rawPayload) {
    switch (rawPayload.MsgType) {
        case web_schemas_1.WebMessageType.TEXT:
            switch (rawPayload.SubMsgType) {
                case web_schemas_1.WebMessageType.LOCATION:
                    return wechaty_puppet_1.MessageType.Attachment;
                default:
                    return wechaty_puppet_1.MessageType.Text;
            }
        case web_schemas_1.WebMessageType.EMOTICON:
        case web_schemas_1.WebMessageType.IMAGE:
            return wechaty_puppet_1.MessageType.Image;
        case web_schemas_1.WebMessageType.VOICE:
            return wechaty_puppet_1.MessageType.Audio;
        case web_schemas_1.WebMessageType.MICROVIDEO:
        case web_schemas_1.WebMessageType.VIDEO:
            return wechaty_puppet_1.MessageType.Video;
        case web_schemas_1.WebMessageType.APP:
            switch (rawPayload.AppMsgType) {
                case web_schemas_1.WebAppMsgType.ATTACH:
                case web_schemas_1.WebAppMsgType.URL:
                case web_schemas_1.WebAppMsgType.READER_TYPE:
                    return wechaty_puppet_1.MessageType.Attachment;
                default:
                    return wechaty_puppet_1.MessageType.Text;
            }
        /**
         * Treat those Types as TEXT
         *
         * Friendship is a SYS message
         * FIXME: should we use better message type at here???
         */
        case web_schemas_1.WebMessageType.SYS:
            return wechaty_puppet_1.MessageType.Text;
        // add recall type
        case web_schemas_1.WebMessageType.RECALLED:
            return wechaty_puppet_1.MessageType.Recalled;
        // VERIFYMSG           = 37,
        // POSSIBLEFRIEND_MSG  = 40,
        // SHARECARD           = 42,
        // LOCATION            = 48,
        // VOIPMSG             = 50,
        // STATUSNOTIFY        = 51,
        // VOIPNOTIFY          = 52,
        // VOIPINVITE          = 53,
        // SYSNOTICE           = 9999,
        // RECALLED            = 10002,
        default:
            return wechaty_puppet_1.MessageType.Text;
    }
}
exports.webMessageType = webMessageType;
//# sourceMappingURL=web-message-type.js.map