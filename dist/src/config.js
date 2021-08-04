"use strict";
/// <reference path="./typings.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.VERSION = exports.MEMORY_SLOT = exports.qrCodeForChatie = exports.envStealthless = exports.envHead = exports.retry = void 0;
const wechaty_puppet_1 = require("wechaty-puppet");
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return wechaty_puppet_1.log; } });
const qr_image_1 = __importDefault(require("qr-image"));
const version_1 = require("./version");
Object.defineProperty(exports, "VERSION", { enumerable: true, get: function () { return version_1.VERSION; } });
const promiseRetry = require("promise-retry");
async function retry(retryableFn) {
    /**
     * 60 seconds: (to be confirmed)
     *  factor: 3
     *  minTimeout: 10
     *  maxTimeout: 20 * 1000
     *  retries: 9
     */
    const factor = 3;
    const minTimeout = 10;
    const maxTimeout = 20 * 1000;
    const retries = 9;
    // const unref      = true
    const retryOptions = {
        factor,
        maxTimeout,
        minTimeout,
        retries,
    };
    return promiseRetry(retryOptions, retryableFn);
}
exports.retry = retry;
function envHead() {
    const KEY = 'WECHATY_PUPPET_WECHAT_PUPPETEER_HEAD';
    return KEY in process.env
        ? !!process.env[KEY]
        : false;
}
exports.envHead = envHead;
function envStealthless() {
    const KEY = 'WECHATY_PUPPET_WECHAT_PUPPETEER_STEALTHLESS';
    return !!process.env[KEY];
}
exports.envStealthless = envStealthless;
function qrCodeForChatie() {
    const CHATIE_OFFICIAL_ACCOUNT_QRCODE = 'http://weixin.qq.com/r/qymXj7DEO_1ErfTs93y5';
    const name = 'qrcode-for-chatie.png';
    const type = 'png';
    const qrStream = qr_image_1.default.image(CHATIE_OFFICIAL_ACCOUNT_QRCODE, { type });
    return wechaty_puppet_1.FileBox.fromStream(qrStream, name);
}
exports.qrCodeForChatie = qrCodeForChatie;
exports.MEMORY_SLOT = 'PUPPET_WECHAT';
//# sourceMappingURL=config.js.map