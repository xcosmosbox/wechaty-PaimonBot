import sys
import urllib
import requests

# print(sys.argv[0])
msg = sys.argv[1]
# url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
start_head = "http://api.qingyunke.com/api.php?key=free&appid=0&msg="
full_head = start_head+msg
# print(full_head)
url = full_head
html = requests.get(url)
print(html.json()["content"])

# print(sys.argv[0])
# print()
