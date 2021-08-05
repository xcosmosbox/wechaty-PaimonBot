
import { config } from "wechaty-puppet-wechat/node_modules/rxjs/internal/config";
//import { Message } from "wechaty";
import { Wechaty, Message, Room, Contact } from 'wechaty';
import { MessageType } from "wechaty-puppet";
import { wechatifyMessage } from "wechaty/dist/src/user/message";
import * as fs from 'fs'
import { FileBox }  from 'wechaty'



const name = 'wechat-puppet-wechat';
//let bot = ;
const bot = new Wechaty({
    name, // generate xxxx.memory-card.json and save login data for the next login
});

//  二维码生成
function onScan(qrcode: string | number | boolean, status: any) {
  require('qrcode-terminal').generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    'https://wechaty.js.org/qrcode/',
    encodeURIComponent(qrcode),
  ].join('');
  console.log(qrcodeImageUrl);

  
//    if (status === ScanStatus.Waiting && qrcode) {
//         require('qrcode-terminal').generate(qrcode); // 在console端显示二维码
//         const qrcodeImageUrl = [
//             'https://wechaty.js.org/qrcode/',
//             encodeURIComponent(qrcode),
//           ].join('');
//         console.log(`onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);
//    } else {
//         console.log(`onScan: ${ScanStatus[status]}(${status})`);
//    }
}

// 登录
async function onLogin(user: any) {
  console.log(`你的小助手Paimon登录了，龙哥你醒醒啊！`);
  // if (config.AUTOREPLY) {
  //   console.log(`${user}已开启机器人自动聊天模式`);
  // }
  // 登陆后创建定时任务
  //await initDay();
}

async function onMessage(message: Message){
    // get message
    console.log('on message: ' + message.toString()); //打印信息内容
    // console.log(message.talker().id); //获得用户的唯一id
    console.log(message.talker().name().toString()); //获得用户的姓名 //这个感觉靠谱点
    console.log(message.talker().alias().toString()); //获得给用户备注的名字
    console.log(message.conversation())

    // Monitoring area
    const follows_talker = await bot.Contact.find({name: '理智丧失'})
    const room = await bot.Room.find({topic: '《英语课同学》'});

    // type tag = ReturnType<typeof message.conversation>
    // Post message
    if(message.room() != null)
    {
      // get text in message
      let text = message.text();
      const strStart = text.charAt(0)+text.charAt(1)+text.charAt(2)+text.charAt(3)+text.charAt(4)
      const strEnd = text.substring(6,text.length)
      if(strStart == '@理智丧失')
      {
        //如果长度为4
        if(strEnd.length == 4)
        { //如果第三个和第四个字符是'天气'
          if(strEnd.charAt(2) == '天' && strEnd.charAt(3) == '气')
          { //取第一个和第二个字符组成为城市名
            const city_name = strEnd.charAt(0) + strEnd.charAt(1)
            //取得json文件
            const urlfile = "../PyMode/WeatherCrawlMode/out/city_json/" + city_name + ".json" 
            if(fs.existsSync(urlfile))
            {
              let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
              const data = userJson[city_name];
              const dataStr = JSON.stringify(data)
              room?.say(city_name+"今日天气： \n"+dataStr) // 输出数据
              const image_path_in_dir = '../PyMode/WeatherCrawlMode/out/city_pic/' + city_name + '.png' //获取天气图片的地址
              const fileBox = FileBox.fromFile(image_path_in_dir)
              room?.say(fileBox) //发送图片
            }
          }
        }

      }
    }
    else
    {
      //  如果是理智丧失在说话
      if(message.talker().name() == '理智丧失')
      {
        // get text in message
        let text = message.text();
        //如果长度为4
        if(text.length == 4)
        { //如果第三个和第四个字符是'天气'
          if(text.charAt(2) == '天' && text.charAt(3) == '气')
          { //取第一个和第二个字符组成为城市名
            const city_name = text.charAt(0) + text.charAt(1)
            //取得json文件
            const urlfile = "../PyMode/WeatherCrawlMode/out/" + city_name + ".json" 
            if(fs.existsSync(urlfile))
            {
              let userJson = JSON.parse(fs.readFileSync(urlfile,'utf-8'));
              const data = userJson[city_name];
              const dataStr = JSON.stringify(data)
              follows_talker?.say(city_name+"今日天气： \n"+dataStr) // 输出数据
            }
          }
        }
      }

      //另外的人
    }
    
}



//登出
function onLogout(user: any) {
  console.log(`小助手${user} 已经登出`);
}

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('message',onMessage);
bot.on('logout', onLogout);
bot
  .start()
  .then(() => console.log('开始登陆微信'))
  .catch((e: any) => console.error(e));

bot.ready();

