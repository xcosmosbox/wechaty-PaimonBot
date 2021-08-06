import * as fs from 'fs';
const city_name_list_File = "./cityNumber.json" //json文件的存储地址
const city_name_list_Json = JSON.parse(fs.readFileSync(city_name_list_File,'utf-8')); //json文件的读取
const city_name = "成都"
// const num = 0
let i;
for( i=0;i<462;i++)
{
    if((city_name_list_Json[i])[city_name])
    {
        console.log(city_name)
    }
}