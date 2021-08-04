var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Wechaty = require('wechaty').Wechaty;
var _name = 'wechaty-puppet-wechat';
var bot = new Wechaty({
    _name: _name
});
//  二维码生成
function onScan(qrcode, status) {
    require('qrcode-terminal').generate(qrcode); // 在console端显示二维码
    var qrcodeImageUrl = [
        'https://wechaty.js.org/qrcode/',
        encodeURIComponent(qrcode),
    ].join('');
    console.log(qrcodeImageUrl);
}
// 登录
function onLogin(user) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u8D34\u5FC3\u5C0F\u52A9\u7406" + user + "\u767B\u5F55\u4E86");
                    // if (config.AUTOREPLY) {
                    //   console.log(`已开启机器人自动聊天模式`);
                    // }
                    // 登陆后创建定时任务
                    return [4 /*yield*/, initDay()];
                case 1:
                    // if (config.AUTOREPLY) {
                    //   console.log(`已开启机器人自动聊天模式`);
                    // }
                    // 登陆后创建定时任务
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//登出
function onLogout(user) {
    console.log("\u5C0F\u52A9\u624B" + user + " \u5DF2\u7ECF\u767B\u51FA");
}
bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot
    .start()
    .then(function () { return console.log('开始登陆微信'); })["catch"](function (e) { return console.error(e); });
function initDay() {
    throw new Error("Function not implemented.");
}
