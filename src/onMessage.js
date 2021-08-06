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
exports.onMessage = void 0;
var wechaty_1 = require("wechaty");
var fs = require("fs");
function onMessage(message) {
    return __awaiter(this, void 0, void 0, function () {
        var contact, text, room, infoFile, friendAndRoomJson, myName, strStart, start_length, strEnd, room_name, city_name, urlfile, city_name_list_File, city_name_list_Json, i, flag, userJson, data, dataStr, image_path_in_dir, fileBox, QAFile, QAJson, contact_name, city_name, urlfile, city_name_list_File, city_name_list_Json, i, flag, userJson, data, dataStr, image_path_in_dir, fileBox, QAFile, QAJson;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contact = message.talker();
                    text = message.text();
                    room = message.room();
                    infoFile = "../json/friendAndRoomInfo.json";
                    friendAndRoomJson = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));
                    myName = friendAndRoomJson["myName"];
                    strStart = text.charAt(0) + text.charAt(1) + text.charAt(2) + text.charAt(3) + text.charAt(4);
                    //消息如果是自己发的，直接return，别浪费内存了
                    if (message.self()) {
                        console.log("消息是我自己发的不用管");
                        return [2 /*return*/, 0];
                    }
                    // print message
                    console.log('on message: ' + message.toString()); //打印信息内容
                    if (!room) return [3 /*break*/, 5];
                    start_length = 2 + myName.length;
                    strEnd = text.substring(start_length, text.length);
                    return [4 /*yield*/, room.topic()];
                case 1:
                    room_name = _a.sent();
                    // console.log(room_name)
                    // console.log("群聊时是谁在说话："+contact.name())
                    if ((friendAndRoomJson["room_Keys"])[room_name] == undefined) {
                        console.log("这不是我关注的群聊");
                        return [2 /*return*/, 0]; //找不到说明不是关注的群聊，直接返回
                    }
                    //判断是否为at我，不是也不需要管这个信息了，直接return
                    // console.log(strStart == ("@"+myName))
                    if (strStart != ("@" + myName)) {
                        // console.log("没有at我");
                        return [2 /*return*/, 0];
                    }
                    if (!isWeatherMsg(strEnd)) return [3 /*break*/, 4];
                    city_name = strEnd.substring(0, strEnd.length - 2);
                    urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json";
                    city_name_list_File = "../PyMode/WeatherCrawlMode/out/cityNumber.json" //json文件的存储地址
                    ;
                    city_name_list_Json = JSON.parse(fs.readFileSync(city_name_list_File, 'utf-8'));
                    i = void 0;
                    flag = false;
                    for (i = 0; i < 462; i++) {
                        if ((city_name_list_Json[i])[city_name]) {
                            flag = true;
                        }
                    }
                    if (!flag) return [3 /*break*/, 2];
                    if (fs.existsSync(urlfile)) {
                        userJson = JSON.parse(fs.readFileSync(urlfile, 'utf-8'));
                        data = userJson[city_name];
                        dataStr = JSON.stringify(data);
                        room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + city_name + "今日天气： \n" + dataStr); // 输出数据
                        image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //获取天气图片的地址
                        ;
                        fileBox = wechaty_1.FileBox.fromFile(image_path_in_dir);
                        room.say(fileBox); //发送图片
                        return [2 /*return*/, 0];
                    }
                    return [3 /*break*/, 4];
                case 2:
                    room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + "你在赣神魔？");
                    return [4 /*yield*/, Sleep(1000)];
                case 3:
                    _a.sent();
                    room.say("这个城市压根不存在！");
                    return [2 /*return*/, 0];
                case 4:
                    QAFile = "../json/QA.json" //json文件的存储地址
                    ;
                    QAJson = JSON.parse(fs.readFileSync(QAFile, 'utf-8'));
                    if (QAJson[strEnd] != undefined) //不是undefined说明有对应的问答
                     {
                        room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + QAJson[strEnd]); //将对应的问答回复他人
                    }
                    else {
                        room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + "我不是很懂你在说什么。。。");
                    }
                    return [3 /*break*/, 9];
                case 5:
                    contact_name = contact === null || contact === void 0 ? void 0 : contact.name();
                    if ((friendAndRoomJson["friend_Keys"])[contact_name] == undefined)
                        return [2 /*return*/, 0]; //找不到说明不是关注的私聊，直接返回
                    console.log(contact_name);
                    if (!isWeatherMsg(text)) return [3 /*break*/, 8];
                    city_name = text.substring(0, text.length - 2);
                    urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json";
                    city_name_list_File = "../PyMode/WeatherCrawlMode/out/cityNumber.json" //json文件的存储地址
                    ;
                    city_name_list_Json = JSON.parse(fs.readFileSync(city_name_list_File, 'utf-8'));
                    i = void 0;
                    flag = false;
                    for (i = 0; i < 462; i++) {
                        if ((city_name_list_Json[i])[city_name]) {
                            flag = true;
                        }
                    }
                    if (!flag) return [3 /*break*/, 6];
                    //开始对天气信息进行输出
                    if (fs.existsSync(urlfile) && contact != null) {
                        userJson = JSON.parse(fs.readFileSync(urlfile, 'utf-8'));
                        data = userJson[city_name];
                        dataStr = JSON.stringify(data);
                        contact.say(city_name + "今日天气： \n" + dataStr); // 输出数据
                        image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //获取天气图片的地址
                        ;
                        fileBox = wechaty_1.FileBox.fromFile(image_path_in_dir);
                        contact.say(fileBox); //发送图片
                        return [2 /*return*/, 0];
                    }
                    return [3 /*break*/, 8];
                case 6:
                    contact.say("你在赣神谟？");
                    return [4 /*yield*/, Sleep(1000)];
                case 7:
                    _a.sent();
                    contact.say("这个城市压根不存在！");
                    return [2 /*return*/, 0];
                case 8:
                    QAFile = "../json/QA.json" //json文件的存储地址
                    ;
                    QAJson = JSON.parse(fs.readFileSync(QAFile, 'utf-8'));
                    if (QAJson[text] != undefined && contact != null) //不是undefined说明有对应的问答
                     {
                        contact.say(QAJson[text]); //将对应的问答回复他人
                    }
                    else {
                        contact === null || contact === void 0 ? void 0 : contact.say("我不是很懂你在说什么。。。");
                    }
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.onMessage = onMessage;
//使用这个函数判断用户是否想要得到天气数据
function isWeatherMsg(strEnd) {
    //如果末尾字符是'天气'
    if (strEnd.charAt(strEnd.length - 2) == '天' && strEnd.charAt(strEnd.length - 1) == '气') {
        console.log("isWeatherMsg: true");
        return true;
    }
    else {
        console.log("isWeatherMsg: false");
        return false;
    }
}
//休眠程序
var Sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
// module.exports = (bot: Wechaty) => {}
