"use strict";
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
exports.__esModule = true;
// import { config } from "wechaty-puppet-wechat/node_modules/rxjs/internal/config";
//import { Message } from "wechaty";
var wechaty_1 = require("wechaty");
var onMessage_1 = require("./onMessage");
var name = 'wechat-puppet-wechat';
//let bot = ;
var bot = new wechaty_1.Wechaty({
    name: name
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
            console.log("\u4F60\u7684\u5C0F\u52A9\u624BPaimon\u767B\u5F55\u4E86\uFF0C\u9F99\u54E5\u4F60\u9192\u9192\u554A\uFF01");
            return [2 /*return*/];
        });
    });
}
// async function onMessage(message: Message){
//     // get message
//     console.log('on message: ' + message.toString()); //打印信息内容
//     // console.log(message.talker().id); //获得用户的唯一id
//     console.log(message.talker().name().toString()); //获得用户的姓名 //这个感觉靠谱点
//     console.log(message.talker().alias().toString()); //获得给用户备注的名字
//     console.log(message.conversation())
//     // Monitoring area
//     const follows_talker = await bot.Contact.find({name: '理智丧失'})
//     const room = await bot.Room.find({topic: '《英语课同学》'});
//     // type tag = ReturnType<typeof message.conversation>
//     // Post message
//     if(message.room() != null)
//     {
//       // get text in message
//       let text = message.text();
//       const strStart = text.charAt(0)+text.charAt(1)+text.charAt(2)+text.charAt(3)+text.charAt(4)
//       const strEnd = text.substring(6,text.length)
//       if(strStart == '@理智丧失')
//       {
//         //如果长度为4
//         if(strEnd.length == 4)
//         { //如果第三个和第四个字符是'天气'
//           if(strEnd.charAt(2) == '天' && strEnd.charAt(3) == '气')
//           { //取第一个和第二个字符组成为城市名
//             const city_name = strEnd.charAt(0) + strEnd.charAt(1)
//             //取得json文件
//             const urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json" 
//             if(fs.existsSync(urlfile))
//             {
//               let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
//               const data = userJson[city_name];
//               const dataStr = JSON.stringify(data)
//               room?.say(city_name+"今日天气： \n"+dataStr) // 输出数据
//               const image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //获取天气图片的地址
//               const fileBox = FileBox.fromFile(image_path_in_dir)
//               room?.say(fileBox) //发送图片
//             }
//           }
//         }
//       }
//     }
//     else
//     {
//       //  如果是理智丧失在说话
//       if(message.talker().name() == '理智丧失')
//       {
//         // get text in message
//         let text = message.text();
//         //如果长度为4
//         if(text.length == 4)
//         { //如果第三个和第四个字符是'天气'
//           if(text.charAt(2) == '天' && text.charAt(3) == '气')
//           { //取第一个和第二个字符组成为城市名
//             const city_name = text.charAt(0) + text.charAt(1)
//             //取得json文件
//             const urlfile = "../PyMode/WeatherCrawlMode/out/" + city_name + ".json" 
//             if(fs.existsSync(urlfile))
//             {
//               let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
//               const data = userJson[city_name];
//               const dataStr = JSON.stringify(data)
//               follows_talker?.say(city_name+"今日天气： \n"+dataStr) // 输出数据
//             }
//           }
//         }
//       }
//       //另外的人
//     }
// }
//登出
function onLogout(user) {
    console.log("\u5C0F\u52A9\u624B" + user + " \u5DF2\u7ECF\u767B\u51FA");
}
bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('message', onMessage_1.onMessage);
bot.on('logout', onLogout);
bot
    .start()
    .then(function () { return console.log('开始登陆微信'); })["catch"](function (e) { return console.error(e); });
bot.ready();
