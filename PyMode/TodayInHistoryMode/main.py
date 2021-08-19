import urllib
import requests
import random

# print(sys.argv[0])
# msg = sys.argv[1]
# msg = "Start"
# url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
start_head = "https://api.muxiaoguo.cn/api/lishijr"
# full_head = start_head+msg
# print(full_head)
url = start_head
html = requests.get(url)
data = html.json()["data"]
data_len = len(data)
num = random.randint(0,data_len)
year = ((html.json()["data"])[num])["year"]
month = ((html.json()["data"])[num])["month"]
day = ((html.json()["data"])[num])["day"]
title = ((html.json()["data"])[num])["title"]
if(int(year) < 0):
    num = abs(int(year))
    str_Year = "公元前"+str(num)+"年"
else:
    str_Year = "公元"+year+"年"

content = "历史上的今天：\n"+str_Year+", "+month+"月"+day+"日\n"+title

print(content)

# print(sys.argv[0])