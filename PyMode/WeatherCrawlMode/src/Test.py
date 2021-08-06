import json
import os

url_json_file = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/out/cityNumber.json'
with open(url_json_file,"r") as fr:
    end_json = json.loads(fr.read())
