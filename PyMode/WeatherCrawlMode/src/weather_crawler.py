import re
from time import daylight
from types import resolve_bases
from urllib.request import urlopen
from bs4 import BeautifulSoup
import datetime

from pyecharts.types import SankeyLevel



def weather (url) :
    """
    :param url: 天气预报地址
    :return:
    """
    # if url is None:
    #     url = "http://www.weather.com.cn/weather/101270101.shtml"

    html = urlopen(url).read().decode("utf-8")
    # print(html)
    soup = BeautifulSoup(html, 'lxml')
    all_ul = soup.find_all('ul', attrs={"class": "t clearfix"})
    #print(all_ul, len(all_ul))
    all_li = all_ul[0].find_all("li")

    temp = {}
    res = {}
    num = 0
    now = datetime.datetime.now().hour
    for i in all_li:

        if now <= 15:
            h1 = i.find("h1").get_text()  # 日期
            p1 = i.find('p', attrs={"class": "wea"}).get_text()  # 天气
            p2 = i.find('p', attrs={"class": "tem"})
            tem = p2.find("span").get_text() + "/" + p2.find("i").get_text()  # 温度
            win = i.find("p", attrs={"class": "win"}).find("i").get_text()  # 风力
        else:
            if num == 0:
                num = num + 1
                h1 = i.find("h1").get_text()  # 日期
                p1 = i.find('p', attrs={"class": "wea"}).get_text()  # 天气
                p2 = i.find('p', attrs={"class": "tem"})
                tem = p2.find("i").get_text()  # 温度
                win = i.find("p", attrs={"class": "win"}).find("i").get_text()  # 风力
            else:
                #print(i)
                h1 = i.find("h1").get_text()  # 日期
                p1 = i.find('p', attrs={"class": "wea"}).get_text()  # 天气
                p2 = i.find('p', attrs={"class": "tem"})
                tem = p2.find("span").get_text() + "/" + p2.find("i").get_text()  # 温度
                win = i.find("p", attrs={"class": "win"}).find("i").get_text()  # 风力    
        
        
        
             

        # print(h1)
        # print(p1)
        #print(tem)
        # print(win)
        # print('=' * 60)

        # print(type(h1))
        # print(type(p1))
        # print(type(tem))
        # print(type(win))
        # day = []
        # day.append(h1)
        # day.append(p1)
        # day.append(tem)
        # day.append(win)
        # day = h1 + ',' + p1 + ','+ tem + ','+ win
        # temp = {
        #         '日期' : h1,
        #         '天气' : p1,
        #         '温度' : tem,
        #         '风象' : win
        #     }
        # res.append(temp)
        temp = {
            h1 : {
                '天气' : p1,
                '温度' : tem,
                '风象' : win
            }
        }

        res.update(temp)
    # print(res)
    
    # print(len(res)) 永远只取一周，所以数组长度一直为7，可通过下标进行操作
    return res
