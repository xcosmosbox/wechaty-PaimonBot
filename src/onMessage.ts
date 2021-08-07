import { Message} from "wechaty";
import { FileBox }  from 'wechaty'
import * as fs from 'fs';


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

        //到了此处却没有被return，说明进入了固定问答模块
        const QAFile = "../json/QA.json" //json文件的存储地址
        const QAJson = JSON.parse(fs.readFileSync(QAFile,'utf-8')); //json文件的读取
        if(QAJson[strEnd] != undefined) //不是undefined说明有对应的问答
        {
            room.say(`@${contact?.name()} `+QAJson[strEnd]) //将对应的问答回复他人
        }
        else
        {
            room.say(`@${contact?.name()} `+"我不是很懂你在说什么。。。")
        }
        


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

        //到了此处却没有被return，说明进入了固定问答模块
        const QAFile = "../json/QA.json" //json文件的存储地址
        const QAJson = JSON.parse(fs.readFileSync(QAFile,'utf-8')); //json文件的读取
        if(QAJson[text]!=undefined && contact!=null) //不是undefined说明有对应的问答
        {
            contact.say(QAJson[text]) //将对应的问答回复他人
        }
        else
        {
            contact?.say("我不是很懂你在说什么。。。")
        }
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

//休眠程序
const Sleep = (ms:number)=> {
    return new Promise(resolve=>setTimeout(resolve, ms))
}


// module.exports = (bot: Wechaty) => {}