import json
import os
from typing import TYPE_CHECKING
from pyecharts.globals import ThemeType, _ThemeType
import pyecharts.options as opts
from pyecharts.charts import Line
from pyecharts.render import make_snapshot
from snapshot_selenium import snapshot

def main():
    f = open(os.path.dirname(os.path.abspath(__file__))+"/out/city_json/上海.json")
    dict_json = json.load(f)

    for key in dict_json:
        # print(key) # 获得第一个key：'上海'
        # print(dict_json[key]) # 获得key'上海'所对应的value
        w_key = key 
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
            title_opts=opts.TitleOpts(title="未来一周天气变化",subtitle="仅供参考"),
            tooltip_opts=opts.TooltipOpts(trigger="axis"),
            toolbox_opts=opts.ToolboxOpts(is_show=True),
            xaxis_opts=opts.AxisOpts(type_="category",boundary_gap=False,name="日期",name_location='middle',name_gap=30),
            yaxis_opts=opts.AxisOpts(min_=(sort_low_low_temperature[0]-3),name="温度",name_location='middle',name_gap=30),
           
        )
        # .render(os.path.dirname(os.path.abspath(__file__))+"/temperature_change_line_chart.html")
    )
    
    

    make_snapshot(snapshot, line.render(), os.path.dirname(os.path.abspath(__file__))+"/tem.png")
    
    f.close()

if __name__ == '__main__':
    main()