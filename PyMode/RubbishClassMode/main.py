import sys
import urllib
import requests

# print(sys.argv[0])
msg = sys.argv[1]
# msg = "Start"
# url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
start_head = "https://api.muxiaoguo.cn/api/lajifl?m="
full_head = start_head+msg
# print(full_head)
url = full_head
html = requests.get(url)
# classify
rubbish_name = msg
rubbish_type = (html.json()["data"])["type"]
rubbish_content = ((html.json()["data"])["description"])["Concept"] +"\n"+"一般包含在："+((html.json()["data"])["description"])["Including"]+"\n"+"推荐的处理方法："+((html.json()["data"])["description"])["Release_requirement"]
res = rubbish_name+": \n"+"垃圾种类："+rubbish_type+"\n"+rubbish_content
print(res)

# print(sys.argv[0])  test
