# WECHATY-PAIMONBOT

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-blue.svg)](https://github.com/wechaty/wechaty) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/) [![node](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)]() 

For the function implementation of [wechaty-puppet-wechat](https://github.com/wechaty/wechaty-puppet-wechat), use the [UOS request header](https://wechaty.js.org/2021/04/13/wechaty-uos-web/) of WeChat web protocol, adding additional Python function modules.

The bot's functional logic code is written in Typescript, and the Python functional module code is written in Python.


- [ ] PaimonBot
   - [x] Introduce external API to realize intelligent dialogue
   - [x] Implement dynamic calling between Bot and Python
   - [x] Monitor individual and group chats simultaneously
   - [x] Multithreading
   - [x] Reply function for specific statements
     - [x] pictures
     - [x] text
     - [x] URL
   - [x] Convert the Q&A template of the conversation from pure code to easy-to-use `JSON`
     - [x] User edits key-value pairs of `JSON` files to create Q&A in batches
   - [x] Send and receive personal business cards
   - [x] Send and receive applet
   - [x] Send and receive videos
   - [ ] Send group chat invitation
   - [x] @group member
   - [x] Change group name
   - [ ] Automatically apply through friends
   - [ ] Add emoticons and fighting pictures
   - [x] Add chat function
- [ ] PythonCode
   - [x] Weather crawler
     - [x] Crawl the weather for a week
     - [x] Answer the weather in the area specified by the questioner in text form
     - [x] Answer the weather in the area specified by the questioner in the form of pictures
       - [x] Multi-threaded image crawling
     - [x] Multi-threaded weather crawler
     - [ ] Send the weather in their location to designated friends regularly every day
   - [x] Idiom Solitaire `keywor: Idiom Solitaire`
   - [x] Historical moment `keywor: Today in history`
   - [x] Baidu Encyclopedia `keywor: encyclopedia or encyclopedia query`
   - [x] Emoji search `keywor: check emoticons`
   - [x] Garbage classification `keywor: Garbage classification`
   - [ ] Other crawlers


## FEATURES

1. The threshold for use is low, even people with no programming experience can use it
2. Does not affect the use of mobile phones
3. Runs on all platforms (MacOS, Windows, Linux)
4. Python function modularization facilitates secondary development
5. Out of the box, users do not need to write code, they only need to edit the desired question and answer format.


## LICENSE & DISCLAIMERS

-  Apache-2.0 License
- This software uses the open source project [WECHATY-PUPPET-WECHAT](https://github.com/wechaty/wechaty-puppet-wechat) on GitHub 
- Please use it reasonably. Users should abide by corresponding laws and regulations. All legal issues and consequences have nothing to do with the author. ***Don't be evil***


