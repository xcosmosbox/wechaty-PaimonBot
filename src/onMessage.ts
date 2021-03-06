import { Message} from "wechaty";
import { FileBox }  from 'wechaty'
import * as fs from 'fs';
const request = require("request")
// 请求参数解码
const urlencode = require("urlencode")
// 配置文件


export async function onMessage(message:Message) {
    //初始化数据，获取信息的聊天人、文本信息、房间信息等信息
    const contact = message.talker(); //非名字，而是一个Contact对象
    const text = message.text();  
    const room = message.room(); //一个Room对象
    const infoFile = "../json/friendAndRoomInfo.json"; //json文件的存储地址
    const friendAndRoomJson = JSON.parse(fs.readFileSync(infoFile,'utf-8')); //json文件的读取
    const myName = friendAndRoomJson["myName"]; //获得使用者登录的微信号的用户名
    const strStart = text.substring(0,(myName.length+1))
    
    
    //消息如果是自己发的，直接return，别浪费内存了
    if(message.self())
    {
        console.log("消息是我自己发的不用管");
        return 0;
    }
    
    // print message
    console.log('on message: ' + message.toString()); //打印信息内容

    //判断是群聊还是私聊
    if(room)
    {
        //说明是群聊
        //返回undefined说明不在关注列表，直接返回return
        const start_length = 2 + myName.length; //在信息中，”@“+”myName“+”【一个空格】“，因此长度是 （2+myName.length）
        const strEnd = text.substring(start_length,text.length); //截取剩余的信息
        const room_name = await room.topic();  //之所以要加双引号双因为，topic返回的是一个非引用类型，需要加双引号变为string，string是一个引用类型
        // console.log(room_name)
        // console.log("群聊时是谁在说话："+contact.name())
        
        if((friendAndRoomJson["room_Keys"])[room_name] == undefined)
        {
            console.log("这不是我关注的群聊");
            return 0;//找不到说明不是关注的群聊，直接返回
        } 

        //判断是否为at我，不是也不需要管这个信息了，直接return
        // console.log(strStart == ("@"+myName))
        if(strStart != ("@"+myName))
        {
            // console.log("没有at我");
            return 0
        } 

        //对于天气爬虫的使用
        if(isWeatherMsg(strEnd))
        {
            //取第一个和第二个字符组成为城市名
            const city_name = strEnd.substring(0,strEnd.length-2)
            //取得json文件
            const urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json" 
            const city_name_list_File = "../PyMode/WeatherCrawlMode/out/cityNumber.json" //json文件的存储地址
            const city_name_list_Json = JSON.parse(fs.readFileSync(city_name_list_File,'utf-8')); //json文件的读取
            //开始对天气信息进行输出
            let i;
            var flag = false;
            for( i=0;i<462;i++)
            {
                if((city_name_list_Json[i])[city_name])
                {
                    flag = true
                }
            }
            if(flag) //即使拥有前面对判断，但是城市名本身可能是个不存在对城市
            {
                if(fs.existsSync(urlfile))
                {
                    let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
                    const data = userJson[city_name];
                    const dataStr = JSON.stringify(data)
                    room.say(`@${contact?.name()} `+city_name+"今日天气： \n"+dataStr) // 输出数据
                    const image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //获取天气图片的地址
                    const fileBox = FileBox.fromFile(image_path_in_dir)
                    room.say(fileBox) //发送图片
                    return 0
                }
            }
            else
            {
                room.say(`@${contact?.name()} `+"你在赣神魔？")
                await Sleep(1000)
                room.say("这个城市压根不存在！")
                return 0
            }
            
        }

        //表情包搜索模块
        if(isEmojiSearch(strEnd))
        {
            let index = strEnd.indexOf("：")
            let emoji_Str = strEnd.substring(index+1,strEnd.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/EmojiSearchMode/main.py "+emoji_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            const emoji_image_path_in_net = api_res //获取表情包图片的地址
            const emojiFileBox = FileBox.fromUrl(emoji_image_path_in_net)
            room.say(emojiFileBox) //发送图片

            return 0
        }

        // 历史上的今天模块
        if(strEnd == "历史上的今天")
        {
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/TodayInHistoryMode/main.py "
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            room.say(api_res)

            return 0
        }

        // 垃圾分类模块
        if(isRubbish(strEnd))
        {
            let index = strEnd.indexOf("：")
            let rubbish_Str = strEnd.substring(index+1,strEnd.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/RubbishClassMode/main.py "+rubbish_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            room.say(`@${contact?.name()} `+api_res)

            return 0
        }

        // 百度百科模块
        if(isWiki(strEnd))
        {
            let index = strEnd.indexOf("：")
            let wiki_Str = strEnd.substring(index+1,strEnd.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/WikiMode/main.py "+wiki_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            room.say(`@${contact?.name()} `+`${wiki_Str}：`+api_res)

            return 0
        }

        // 成语接龙模块
        if(isSolitaire(strEnd))
        {
            let index = strEnd.indexOf("：")
            let soli_Str = strEnd.substring(index+1,strEnd.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/SolitaireMode/main.py "+soli_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            room.say("我的答案是："+api_res)
            await Sleep(1000)
            room.say(`@${contact?.name()} `+"轮到你了")

            return 0
        }


        //到了此处却没有被return，说明进入了固定问答模块
        const QAFile = "../json/QA.json" //json文件的存储地址
        const QAJson = JSON.parse(fs.readFileSync(QAFile,'utf-8')); //json文件的读取
        if(QAJson[strEnd] != undefined) //不是undefined说明有对应的问答
        {
            room.say(`@${contact?.name()} `+QAJson[strEnd]) //将对应的问答回复他人
        }

        //如果固定对话中没有想要的答案，那么就需要使用智能对话了
        const randomNum = Math.round(Math.random()*8)+1;
        if(randomNum == 1)
        {
            // 并不需要时时刻刻都智能对话，偶尔来次疑惑的话语
            contact?.say(`@${contact?.name()} `+"我不是很懂你在说什么。。。")
            return 0
        }
        else
        {
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 web.py "+strEnd
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            room.say(`@${contact?.name()} `+api_res)
            return 0
        }
        return 0
        


    }   ///////////////////////////////////////群聊和私聊分界线///////////////////////////////////////
    else///////////////////////////////////////群聊和私聊分界线///////////////////////////////////////
    {
        //说明是私聊
        //返回undefined说明不在关注列表，直接返回return
        const contact_name = contact?.name(); //之所以要加双引号双因为，name返回的是一个非引用类型，需要加双引号变为string，string是一个引用类型
        if((friendAndRoomJson["friend_Keys"])[contact_name] == undefined) return 0//找不到说明不是关注的私聊，直接返回
        console.log(contact_name)

        //对于天气爬虫的使用
        if(isWeatherMsg(text))
        {
            //取第一个和第二个字符组成为城市名
            const city_name = text.substring(0,text.length-2)
            //取得json文件
            const urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json" 
            const city_name_list_File = "../PyMode/WeatherCrawlMode/out/cityNumber.json" //json文件的存储地址
            const city_name_list_Json = JSON.parse(fs.readFileSync(city_name_list_File,'utf-8')); //json文件的读取
            let i;
            var flag = false;
            for( i=0;i<462;i++)
            {
                if((city_name_list_Json[i])[city_name])
                {
                    flag = true
                }
            }
            if(flag)
            {
                //开始对天气信息进行输出
                if(fs.existsSync(urlfile) && contact!=null)
                {   
                    let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
                    const data = userJson[city_name];
                    const dataStr = JSON.stringify(data)
                    contact.say(city_name+"今日天气： \n"+dataStr) // 输出数据
                    const image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //获取天气图片的地址
                    const fileBox = FileBox.fromFile(image_path_in_dir)
                    contact.say(fileBox) //发送图片
                    return 0
                }
            }
            else
            {
                contact.say("你在赣神谟？")
                await Sleep(1000)
                contact.say("这个城市压根不存在！")
                return 0
            }   
        }

        //表情包搜索模块
        if(isEmojiSearch(text))
        {
            let index = text.indexOf("：")
            let emoji_Str = text.substring(index+1,text.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/EmojiSearchMode/main.py "+emoji_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            const emoji_image_path_in_net = api_res //获取表情包图片的地址
            const emojiFileBox = FileBox.fromUrl(emoji_image_path_in_net)
            contact.say(emojiFileBox) //发送图片

            return 0
        }

        // 历史上的今天模块
        if(text == "历史上的今天")
        {
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/TodayInHistoryMode/main.py "
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            contact.say(api_res)

            return 0
        }

        // 垃圾分类模块
        if(isRubbish(text))
        {
            let index = text.indexOf("：")
            let rubbish_Str = text.substring(index+1,text.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/RubbishClassMode/main.py "+rubbish_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            contact.say(api_res)

            return 0
        }

        // 百度百科模块
        if(isWiki(text))
        {
            let index = text.indexOf("：")
            let wiki_Str = text.substring(index+1,text.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/WikiMode/main.py "+wiki_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            contact.say(`${wiki_Str}：`+api_res)

            return 0
        }

        // 成语接龙模块
        if(isSolitaire(text))
        {
            let index = text.indexOf("：")
            let soli_Str = text.substring(index+1,text.length)
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 ../PyMode/SolitaireMode/main.py "+soli_Str
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            contact.say("我的答案是："+api_res)
            await Sleep(1000)
            contact.say("轮到你了")

            return 0
        }

        //到了此处却没有被return，说明进入了固定问答模块
        const QAFile = "../json/QA.json" //json文件的存储地址
        const QAJson = JSON.parse(fs.readFileSync(QAFile,'utf-8')); //json文件的读取
        if(QAJson[text]!=undefined && contact!=null) //不是undefined说明有对应的问答
        {
            contact.say(QAJson[text]) //将对应的问答回复他人
        }

        //如果固定对话中没有想要的答案，那么就需要使用智能对话了
        const randomNum = Math.round(Math.random()*8)+1;
        if(randomNum == 1)
        {
            // 并不需要时时刻刻都智能对话，偶尔来次疑惑的话语
            contact?.say("我不是很懂你在说什么。。。")
            return 0
        }
        else
        {
            // 通过ts调用python，并将参数传递过去
            let api_str = "python3 web.py "+text
            // 临时构建阻塞式的子线程，且是同步的
            const execSync = require('child_process').execSync
            // 子线程会构建一个shell，因此我们在shell输入python命令
            const output = execSync(api_str)
            // python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
            const api_res = output.toString()
            console.log('sync: ' + api_res)
            // 将智能对话的结果输出
            contact.say(api_res)
            return 0
        }
        
        
        



        return 0

    }


}


//使用这个函数判断用户是否想要得到天气数据
function isWeatherMsg(strEnd:string){
    
    //如果末尾字符是'天气'
    if(strEnd.charAt(strEnd.length-2) == '天' && strEnd.charAt(strEnd.length-1) == '气')
    { 
        console.log("isWeatherMsg: true")
        return true
    }
    else 
    {
        console.log("isWeatherMsg: false")
        return false
    }
    
}

//对成语接龙的判断
function isSolitaire(text:string)
{   let keywords = text.substring(0,4)
    if(keywords == "成语接龙")
    {
        return true
    }
    else
    {
        return false
    }
}

//对WIKI的判断
function isWiki(text:string)
{   let keywords = text.substring(0,4)
    if(keywords == "百科全书" || keywords == "百科查询")
    {
        return true
    }
    else
    {
        return false
    }
}

//垃圾分类
function isRubbish(text:string)
{   let keywords = text.substring(0,4)
    if(keywords == "垃圾分类")
    {
        return true
    }
    else
    {
        return false
    }
}

//表情包查询
function isEmojiSearch(text:string)
{   let keywords = text.substring(0,4)
    if(keywords == "查表情包")
    {
        return true
    }
    else
    {
        return false
    }
}


//休眠程序
const Sleep = (ms:number)=> {
    return new Promise(resolve=>setTimeout(resolve, ms))
}


// module.exports = (bot: Wechaty) => {}

