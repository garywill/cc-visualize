var fs = require('fs');



// 编译之后再运行这个文件
const vccrlib = require('./dist-vccrlib/vccrlib.js');

function start() 
{
    
    vccrlib.startNewEssayCheck("这是一段测试文本。這是一段測試，就幾句話怎樣？\n简体与繁体都打几个字上来");
    vccrlib.print_stati();
    
//     checkTextFile("TextFileName.txt");
    
//     eval(fs.readFileSync("test/test.js").toString());
    
}
start();

function checkTextFile(fileName)
{
    vccrlib.startNewEssayCheck ( fs.readFileSync(fileName).toString() );
    console.log("```");
    console.log(`=== ${filename} =============`);
    vccrlib.print_stati();
    console.log("================================");
    console.log("```");
}
