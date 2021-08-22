import sys
import urllib
import requests

# print(sys.argv[0])
msg = sys.argv[1]
# msg = "Start"
# url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
start_head = "https://api.muxiaoguo.cn/api/chengyujielong?word="
full_head = start_head+msg
# print(full_head)
url = full_head
html = requests.get(url)
print((html.json()["data"])["name"])

# print(sys.argv[0])  test
