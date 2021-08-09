let text = "青史留名"
let api_str = "python3 ../PyMode/SolitaireMode/main.py "+text
// 临时构建阻塞式的子线程，且是同步的
const execSync = require('child_process').execSync
// 子线程会构建一个shell，因此我们在shell输入python命令
const output = execSync(api_str)
// python脚本打印的东西会被子线程捕捉到，我们需要tostring出来
const api_res = output.toString()
console.log('sync: ' + api_res)
// 将智能对话的结果输出
// contact.say(api_res)