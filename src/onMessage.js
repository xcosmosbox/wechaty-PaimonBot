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
var request = require("request");
// ??????????????????
var urlencode = require("urlencode");
// ????????????
function onMessage(message) {
    return __awaiter(this, void 0, void 0, function () {
        var contact, text, room, infoFile, friendAndRoomJson, myName, strStart, start_length, strEnd, room_name, city_name, urlfile, city_name_list_File, city_name_list_Json, i, flag, userJson, data, dataStr, image_path_in_dir, fileBox, QAFile, QAJson, randomNum, api_str, execSync, output, api_res, contact_name, city_name, urlfile, city_name_list_File, city_name_list_Json, i, flag, userJson, data, dataStr, image_path_in_dir, fileBox, QAFile, QAJson, randomNum, api_str, execSync, output, api_res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contact = message.talker();
                    text = message.text();
                    room = message.room();
                    infoFile = "../json/friendAndRoomInfo.json";
                    friendAndRoomJson = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));
                    myName = friendAndRoomJson["myName"];
                    strStart = text.substring(0, (myName.length + 1));
                    //????????????????????????????????????return?????????????????????
                    if (message.self()) {
                        console.log("?????????????????????????????????");
                        return [2 /*return*/, 0];
                    }
                    // print message
                    console.log('on message: ' + message.toString()); //??????????????????
                    if (!room) return [3 /*break*/, 5];
                    start_length = 2 + myName.length;
                    strEnd = text.substring(start_length, text.length);
                    return [4 /*yield*/, room.topic()];
                case 1:
                    room_name = _a.sent();
                    // console.log(room_name)
                    // console.log("???????????????????????????"+contact.name())
                    if ((friendAndRoomJson["room_Keys"])[room_name] == undefined) {
                        console.log("???????????????????????????");
                        return [2 /*return*/, 0]; //???????????????????????????????????????????????????
                    }
                    //???????????????at???????????????????????????????????????????????????return
                    // console.log(strStart == ("@"+myName))
                    if (strStart != ("@" + myName)) {
                        // console.log("??????at???");
                        return [2 /*return*/, 0];
                    }
                    if (!isWeatherMsg(strEnd)) return [3 /*break*/, 4];
                    city_name = strEnd.substring(0, strEnd.length - 2);
                    urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json";
                    city_name_list_File = "../PyMode/WeatherCrawlMode/out/cityNumber.json" //json?????????????????????
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
                        room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + city_name + "??????????????? \n" + dataStr); // ????????????
                        image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //???????????????????????????
                        ;
                        fileBox = wechaty_1.FileBox.fromFile(image_path_in_dir);
                        room.say(fileBox); //????????????
                        return [2 /*return*/, 0];
                    }
                    return [3 /*break*/, 4];
                case 2:
                    room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + "??????????????????");
                    return [4 /*yield*/, Sleep(1000)];
                case 3:
                    _a.sent();
                    room.say("??????????????????????????????");
                    return [2 /*return*/, 0];
                case 4:
                    QAFile = "../json/QA.json" //json?????????????????????
                    ;
                    QAJson = JSON.parse(fs.readFileSync(QAFile, 'utf-8'));
                    if (QAJson[strEnd] != undefined) //??????undefined????????????????????????
                     {
                        room.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + QAJson[strEnd]); //??????????????????????????????
                    }
                    randomNum = Math.round(Math.random() * 8) + 1;
                    if (randomNum == 1) {
                        // ?????????????????????????????????????????????????????????????????????
                        contact === null || contact === void 0 ? void 0 : contact.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + "???????????????????????????????????????");
                        return [2 /*return*/, 0];
                    }
                    else {
                        api_str = "python3 web.py " + strEnd;
                        execSync = require('child_process').execSync;
                        output = execSync(api_str);
                        api_res = output.toString();
                        console.log('sync: ' + api_res);
                        // ??????????????????????????????
                        contact.say("@" + (contact === null || contact === void 0 ? void 0 : contact.name()) + " " + api_res);
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/, 0];
                case 5:
                    contact_name = contact === null || contact === void 0 ? void 0 : contact.name();
                    if ((friendAndRoomJson["friend_Keys"])[contact_name] == undefined)
                        return [2 /*return*/, 0]; //???????????????????????????????????????????????????
                    console.log(contact_name);
                    if (!isWeatherMsg(text)) return [3 /*break*/, 8];
                    city_name = text.substring(0, text.length - 2);
                    urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json";
                    city_name_list_File = "../PyMode/WeatherCrawlMode/out/cityNumber.json" //json?????????????????????
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
                    //?????????????????????????????????
                    if (fs.existsSync(urlfile) && contact != null) {
                        userJson = JSON.parse(fs.readFileSync(urlfile, 'utf-8'));
                        data = userJson[city_name];
                        dataStr = JSON.stringify(data);
                        contact.say(city_name + "??????????????? \n" + dataStr); // ????????????
                        image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //???????????????????????????
                        ;
                        fileBox = wechaty_1.FileBox.fromFile(image_path_in_dir);
                        contact.say(fileBox); //????????????
                        return [2 /*return*/, 0];
                    }
                    return [3 /*break*/, 8];
                case 6:
                    contact.say("??????????????????");
                    return [4 /*yield*/, Sleep(1000)];
                case 7:
                    _a.sent();
                    contact.say("??????????????????????????????");
                    return [2 /*return*/, 0];
                case 8:
                    QAFile = "../json/QA.json" //json?????????????????????
                    ;
                    QAJson = JSON.parse(fs.readFileSync(QAFile, 'utf-8'));
                    if (QAJson[text] != undefined && contact != null) //??????undefined????????????????????????
                     {
                        contact.say(QAJson[text]); //??????????????????????????????
                    }
                    randomNum = Math.round(Math.random() * 8) + 1;
                    if (randomNum == 1) {
                        // ?????????????????????????????????????????????????????????????????????
                        contact === null || contact === void 0 ? void 0 : contact.say("???????????????????????????????????????");
                        return [2 /*return*/, 0];
                    }
                    else {
                        api_str = "python3 web.py " + text;
                        execSync = require('child_process').execSync;
                        output = execSync(api_str);
                        api_res = output.toString();
                        console.log('sync: ' + api_res);
                        // ??????????????????????????????
                        contact.say(api_res);
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/, 0];
            }
        });
    });
}
exports.onMessage = onMessage;
//????????????????????????????????????????????????????????????
function isWeatherMsg(strEnd) {
    //?????????????????????'??????'
    if (strEnd.charAt(strEnd.length - 2) == '???' && strEnd.charAt(strEnd.length - 1) == '???') {
        console.log("isWeatherMsg: true");
        return true;
    }
    else {
        console.log("isWeatherMsg: false");
        return false;
    }
}
//????????????
var Sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
// module.exports = (bot: Wechaty) => {}
