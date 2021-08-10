import sys
import urllib
import requests

# print(sys.argv[0])
msg = sys.argv[1]
# msg = "谢谢"
# url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
start_head = "https://api.muxiaoguo.cn/api/emoticons?tuname="
full_head = start_head+msg
# print(full_head)
url = full_head
html = requests.get(url)
imagelink = ((html.json()["data"])[0])["imagelink"]
print(imagelink)

# print(sys.argv[0])
# print()