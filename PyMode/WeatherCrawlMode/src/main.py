#爬取所有省份所有城市的最低气温，并进行排名，将排名制作成图表并输出到html中，以供可视化打开。

#导包
from codecs import encode
from concurrent.futures import thread
import datetime
import os
from sys import flags, path
from types import resolve_bases
from typing import Pattern
import requests
import re
from bs4 import BeautifulSoup
from pyecharts.charts import Bar

from pyecharts import options as opts


from pyecharts.render import make_snapshot
from snapshot_selenium import snapshot
import time

from weather_crawler import weather
import json
import json
import os
import pyecharts.options as opts
from pyecharts.charts import Line
from pyecharts.globals import ThemeType
import _thread
import threading

ALL_DATA = []
DICT_CITY_NAME = []
I_CITY_NAME = []

#解析页面的方法
def parse_page(url):

    #抓取网页链接的正则表达式
    pattern = re.compile(r'(?<=href=\").*?(?=\")')  

    #注入头部，伪装为正常访问
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
    }
    #使用requests.get去拉去指定url下的页面，并使用上述的头部去伪装为正常的访问
    response = requests.get(url,headers=headers)
    #将拉取到的网页信息以指定的解码形式（避免乱码），存储到text中
    text = response.content.decode('utf-8')
    #以下使用BS4库中的方法，构建lxml框架下的html解析器，解析刚刚拉去到的信息
    #之所以使用html5lib而不是常见的xml，是因为网页中的源代码，由于目的网址程序员的失误，在关于港澳台那一页的天气信息中，<table>标签最后缺少</table>，如果使用xml来提取则会出现许多不需要的错误信息。而html5lib是接近于浏览器的框架，容错率极高，会自动补全那个缺少的</table>以完成程序(但改用此框架后，程序的运行效率会不可避免的下降)。成功后的图片见pic2.png
    soup = BeautifulSoup(text,'html5lib')
    #使用解析器中的find方法，筛选出存储了天气信息z中‘class’等于conMidtab的表，并将表中标签为table的信息存储在tables表中(网页信息中的table表头是以省份为表头)。由于使用了BeautifulSoup库，所以整个网页已经被处理为了 树 的形式，并且被提取出来的信息此时不再是 string 类型，而是 Tag 类型
    conMidtab = soup.find('div',class_ = 'conMidtab')
    tables = conMidtab.find_all('table') #获取table属性的内容
    for table in tables:
        trs = table.find_all('tr')[2:] #抓取 'tr' 属性的内容，之所以从 第三个 开始，是因为前两个仅仅是页面标题和省份
        # for tr in enumerate(trs): 
        for tr in trs:
            tds = tr.find_all('a') #抓取 'a' 属性的内容
            if len(tds) == 3 :  #省会城市有三个 `a` 标签，使用需要提取第二个
                city_url_tag = tds[1]
            else :  #非省会只有两个 'a' 标签，所以只需要提取第一个
                city_url_tag = tds[0]
            # city_url = tds[0]
            # if index>>0<<1 == index :
            #     city_url = tds[1] #之所以从第1个开始取，而不是第0个标签开始取，是因为网页中第0个标签是省份，而我们只取所有的城市
                # pageTxt = city_url.txt
                # city_hrefUrl = re.findall(/?<=<a href=\").*?(?=\"/)
            # print(city_url)
            # print(isinstance(city_url,str))
            strUrl = str(city_url_tag) #bs4抓取出来的内容，数据类型都是 tags，因此需要对数据类型进行转换
            # print(strUrl)
            # city_hrefUrl = pattern.search(strUrl)
            city_url = pattern.findall(strUrl) #使用以及写好的正则表达式规则对抓取出来的内容进行正则提取
            # print(city_url)
            #获取城市名字列表
            city = list(city_url_tag.stripped_strings)[0] #此句子将会通过迭代器遍历指定节点下所有的节点，并过滤掉空白的部分，且返回一个生成器,最后转换为一个列表
            # print(type(city_url[0]))
            # print(city) # 此句可以打印出上述列表中的城市列表，其中包含了华北地区城市的名字，效果见 pic1.png
            #接下来几句的作用是获得城市温度,之所以知道倒数第二个 ‘td’ 标签是温度，是根据我们手动从网页源代码中观察得到的
            # temp_td = tds[-2]
            # min_temp = list(temp_td.stripped_strings)[0]
            # print({'city':city,'city_url':city_url[0]}) #以列表的形式输出城市和对应城市的温度
            ALL_DATA.append({'city':city,'city_url':city_url[0]}) #最后的min_temp处自所以需要用int强制转换，是因为后面在排序的过程中，默认输出char类型的数据，所以需要强制转换以输出整数数据


############################### draw ###############################
def draw(num,dict_week):
    print("开始绘制图片")
    # jsonStr = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/city_json/'+ city_name +'.json'
    # with open(jsonStr,encoding="utf-8") as readFile:
    #     print(type(readFile.read()))
    #     t_str = '\''+readFile.read()+'\''
    #     dict_json = json.loads(t_str)
    # f = open(jsonStr,"r",encoding="utf-8")
    # print(f)
    # f_str = f.read()
    # print(f_str)
    # print(type(f_str))
    # dict_json = json.load(f_str)
    # dict_json = json.loads(jsonStr)
    num = num + 1
    dict_json = dict_week
    for key in dict_json:
        # print(key) # 获得第一个key：'上海'
        # print(dict_json[key]) # 获得key'上海'所对应的value
        w_key = key 
        city_name = key
    day_dict_json = dict_json[w_key] # 此处将 获得key'上海'所对应的value 作为新的json赋值了对象
   
    d_key = [] #存放日期对应的数据集，对应图片的纵坐标
    week_name_list = [] # 此处是打印图片，横坐标的数据集 ⭐️
    for key in day_dict_json:
        # print(key) # 此处获得了日期
        week_name_list.append(key) # 存放日期
        
        # print(day_dict_json[key])
        d_key.append(day_dict_json[key]) # 将7个日期所对应的数据集加载到数组中
    
    low_temperature = [] # 存放最高温度的数组 ⭐️
    high_temperature = [] # 存放最低温度的数组 ⭐️
    sort_low_low_temperature = [] #一个临时的数组，用来对绘图时，纵坐标最低点的起始参数
    for key in d_key:
        all_str = key['温度'] # 以温度为key获取value
        strList = all_str.split('/') # 分割字符串以获得最低温度和最高温度
        high_temperature.append(float(strList[0])) #此处存放最高温度
        low_temperature.append(float((strList[1].split('℃'))[0])) #此处存放最低温度
        sort_low_low_temperature.append(float((strList[1].split('℃'))[0]))
    
    # print(high_temperature)
    # print(low_temperature)
    sort_low_low_temperature.sort() #因为是升序，所以最低点是这个数组第一个数字减去三，使得图片更加美观
    titleName = city_name + "未来一周天气变化"
    line = (
        Line(init_opts=opts.InitOpts(theme=ThemeType.VINTAGE))
        .add_xaxis(xaxis_data=week_name_list)
        .add_yaxis(
            series_name="最高气温",
            y_axis=high_temperature,
            markpoint_opts=opts.MarkPointOpts(
                data=[
                    opts.MarkPointItem(type_="max",name="最大值"),
                    opts.MarkPointItem(type_="min",name="最小值"),
                ]
            ),
            markline_opts=opts.MarkLineOpts(
                data=[opts.MarkLineItem(type_="average",name="平均值")]
            ),
            
        )
        .add_yaxis(
            series_name="最低气温",
            y_axis=low_temperature,
            markpoint_opts=opts.MarkPointOpts(
                data=[opts.MarkPointItem(value=-2,name="周最低",x=1,y=-1.5)]
            ),
            markline_opts=opts.MarkLineOpts(
                data=[
                    opts.MarkLineItem(type_="average",name="平均值"),
                    opts.MarkLineItem(symbol="none",x="90%",y="max"),
                    # opts.MarkLineItem(symbol="circle",type_="max",name="最高点"),
                ]
            ),
        )
        .set_global_opts(
            title_opts=opts.TitleOpts(title=titleName,subtitle="仅供参考"),
            tooltip_opts=opts.TooltipOpts(trigger="axis"),
            toolbox_opts=opts.ToolboxOpts(is_show=True),
            xaxis_opts=opts.AxisOpts(type_="category",boundary_gap=False,name="日期",name_location='middle',name_gap=30),
            yaxis_opts=opts.AxisOpts(min_=(sort_low_low_temperature[0]-3),name="温度",name_location='middle',name_gap=30)
        )
        # .render(os.path.dirname(os.path.abspath(__file__))+"/temperature_change_line_chart.html")
    )
    make_snapshot(snapshot, line.render(), os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/city_pic/'+ city_name +".png")
    print("图片【"+city_name +".png"+"】绘制完成")
    print("#############")
    # f.close()

# # Make a picture
# def line_chart(cities,temps) -> Bar:
#     c = (
#         Bar()
#         .add_xaxis(cities)
#         .add_yaxis("今日中国最低气温",temps)
#         # .set_global_opts(title_opts=opts.TitleOpts("Theme-LIGHT"))
#         .set_global_opts(opts.InitOpts(_ThemeType.LIGHT))
#     )
#     return c

# def crawl(i):
    
#     # print(type(i['city_url']))
#     # 传回 res 字典，字典内包含了一个地区 七天内 的天气
#     print("1")
#     res = weather(url = i['city_url'])
#     # print(i['city'])
#     # print("*****") //flag
#     # 将传回的 res字典 整体作为新的 value ，以当地地区的名字作为 key，生成新的字典
    
#     dict_week = {i['city'] : res}

#     #构造仅仅包含了城市名，且value都为true都json文件
#     dict_city_name_origin = {i['city'] : True}
#     DICT_CITY_NAME.append(dict_city_name_origin)

#     #设置输出路径 
#     path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/city_json/'+ i['city'] +'.json'
#     city_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/cityNumber.json'
    
#     #开始输出json文件
#     if not os.path.exists(path):
#         print("create " + str(path)) # 提示新建了json文件
#         with open(path, "w",encoding='utf-8') as new_file:
#             #使用 json.dump生成json文件
#             json.dump(dict_week, new_file, indent=4, ensure_ascii=False)
#                 # time.sleep(2)
#             print(i['city']+".json"+"写入完成")

#             draw(dict_week)
#                 # time.sleep(0.5) #减缓多线程的速度，避免出现异常
#                 # # 多线程绘图模块
#                 # try:
#                 #     _thread.start_new_thread( draw,(dict_week,) )
#                 # except:
#                 #     print ("Error: 无法启动线程")
#                 # time.sleep(0.5) #减缓多线程的速度，避免出现异常

#                 # time.sleep(1)
#                 # try:
#                 #     draw(i['city'],dict_week)
#                 # except:
#                 #     print("Error: unable to start thread")
#     else:
#         print("cover "+str(path)) # 覆盖旧文件
#         with open(path, "w",encoding='utf-8') as file_write:
#                 #使用 json.dump生成json文件
#             json.dump(dict_week, file_write, indent=4, ensure_ascii=False)
#             print(i['city']+".json"+"写入完成")
#                 # time.sleep(0.5) #减缓多线程的速度，避免出现异常
#                 # # 多线程绘图模块
#                 # try:
#                 #     _thread.start_new_thread( draw,(dict_week,) )
#                 # except:
#                 #     print ("Error: 无法启动线程")
#                 # time.sleep(0.5) #减缓多线程的速度，避免出现异常

#             draw(dict_week)
#                 # try:
#                 #     draw(dict_week)
#                 #     # t = threading.Thread(target = draw,kwargs = {city_name:res})
#                 #     # t.start()
#                 # except:
#                 #     print("Error: unable to start thread")
#     #将城市名目录的json文件写入指定位置


############################### main ###############################
#执行方法
def main():
    #将所有连接制成一个列表
    urls = {
        "http://www.weather.com.cn/textFC/hb.shtml",
        "http://www.weather.com.cn/textFC/db.shtml",
        "http://www.weather.com.cn/textFC/hd.shtml",
        "http://www.weather.com.cn/textFC/hz.shtml",
        "http://www.weather.com.cn/textFC/hn.shtml",
        "http://www.weather.com.cn/textFC/xb.shtml",
        "http://www.weather.com.cn/textFC/xn.shtml",
        "http://www.weather.com.cn/textFC/gat.shtml"
    }
    #遍历所有的列表爬取城市和温度
    for url in urls:
        parse_page(url)

    # ALL_DATA 是 list 属性，但是ALL_DATA[0]等等都是 dict 属性
    # print((ALL_DATA[0])['city_url']) #取url

    # 一共有462个
    # m = 0
    # dict_Weather = []
    dict_city_name = []
    # num = 1
    for i in ALL_DATA:
        # _thread.start_new_thread( crawl,(i,) )
        I_CITY_NAME.append(i['city']) #将城市名单独形成一个列表
        print(type(i['city_url']))
        # 传回 res 字典，字典内包含了一个地区 七天内 的天气
        res = weather(url = i['city_url'])
        # print(i['city'])
        # print("*****") //flag
        # 将传回的 res字典 整体作为新的 value ，以当地地区的名字作为 key，生成新的字典
        dict_week = {i['city'] : res}

        #构造仅仅包含了城市名，且value都为true都json文件
        dict_city_name_origin = {i['city'] : True}
        dict_city_name.append(dict_city_name_origin)

        #设置输出路径 
        path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/city_json/'+ i['city'] +'.json'
        city_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/cityNumber.json'
        #开始输出json文件
        if not os.path.exists(path):
            print("create " + str(path)) # 提示新建了json文件
            with open(path, "w",encoding='utf-8') as new_file:
                #使用 json.dump生成json文件
                json.dump(dict_week, new_file, indent=4, ensure_ascii=False)
                # time.sleep(2)
                print(i['city']+".json"+"写入完成")

                # draw(dict_week)
                # time.sleep(0.5) #减缓多线程的速度，避免出现异常
                # # 多线程绘图模块
                # try:
                #     _thread.start_new_thread( draw,(dict_week,) )
                # except:
                #     print ("Error: 无法启动线程")
                # time.sleep(0.5) #减缓多线程的速度，避免出现异常

                # time.sleep(1)
                # try:
                #     draw(i['city'],dict_week)
                # except:
                #     print("Error: unable to start thread")
        else:
            print("cover "+str(path)) # 覆盖旧文件
            with open(path, "w",encoding='utf-8') as file_write:
                #使用 json.dump生成json文件
                json.dump(dict_week, file_write, indent=4, ensure_ascii=False)
                print(i['city']+".json"+"写入完成")
                # time.sleep(0.5) #减缓多线程的速度，避免出现异常
                # # 多线程绘图模块
                # try:
                #     _thread.start_new_thread( draw,(dict_week,) )
                # except:
                #     print ("Error: 无法启动线程")
                # time.sleep(0.5) #减缓多线程的速度，避免出现异常

                # draw(dict_week)
                # try:
                #     draw(dict_week)
                #     # t = threading.Thread(target = draw,kwargs = {city_name:res})
                #     # t.start()
                # except:
                #     print("Error: unable to start thread")
  
    # 将城市名目录的json文件写入指定位置
    with open(city_path, "w",encoding='utf-8') as num_file:
        json.dump(dict_city_name,num_file,indent=4, ensure_ascii=False)

    print(len(dict_city_name))

    for num in range(462):
        url_json_file = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/city_json/'+I_CITY_NAME[num]+'.json'
        with open(url_json_file,"r") as fr:
            end_json = json.loads(fr.read())
            try:
                _thread.start_new_thread( draw,(1,end_json))
                time.sleep(2)
            except:
                print("error")
    time.sleep(30)
        # temp = ""
        # print(i['city'])
        # for k in res:
        #     # print(type(k))
        #     # print("-------")
        # #     temp = temp + str(k)
        # ALL_WEEK.update({i['city'] : temp})
    # print(ALL_WEEK)

        # if m==0:
        #         print(res)
        #         m = m+1
        # key = res[0].keys()
        # print((res[0])[str((list(res[0].keys()))[0])])
        # dict_Weather.clear  
        # for k in res:
        #     # print((k)[str((list(k.keys()))[0])])
        #     # if m==0:
        #     #     print(k)
        #     #     m = m+1

        #     key = str((list(k.keys()))[0])
        #     # print(key)
        #     val = (k)[key]
        #     # print(val)
        #     dict_Weather.append({key:val})
        # ALL_WEEK.update({i['city'] : dict_Weather})
        # m = m + 1
        # if m == 3 :
        #     print(ALL_WEEK)
               

        # ALL_WEATHER.append({'city':i['city'], 'mow_weather':str(res)})
        # str_city = i['city']
        # ALL_WEEK.append( {str_city : str(res) } )
        # week = {
        #     'city' : {
        #         'day' : 'weather'
        #     }
        # }
    

############################### init ###############################
#程序入口
if __name__ == '__main__':
    main()
    # print(((ALL_WEATHER[0])['now_weather']))
    # print(ALL_WEEK)
    # with open('json_file_test.json', "w") as file_write:
    #     json.dump(ALL_WEEK, file_write, indent=1, separators=(',', ': '))


