var fs = require('fs');

const cns2uni_files = [
// "MapingTables/Unicode/CNS2UNICODE_Unicode 15.txt", 
"MapingTables/Unicode/CNS2UNICODE_Unicode 2.txt", 
"MapingTables/Unicode/CNS2UNICODE_Unicode BMP.txt", 
];

var cns2uni_map = {};

var edu_tw = {
    edu_tw_A_cns: [],  // 常用
    edu_tw_A: [], 
    edu_tw_B_cns: [],  //次常用
    edu_tw_B: [], 
    edu_tw_500_cns: [],   //國中小 500
    edu_tw_500: [], 
};

for ( filepath of cns2uni_files )
{
    const full_filepath = "cns11643/" + filepath;
    const cns2uni_file_content = fs.readFileSync(full_filepath, 'utf8' );
    
    const cns2uni_lineS = cns2uni_file_content.split('\n');
    for ( cns2uni_line of cns2uni_lineS )
    {
        if ( !cns2uni_line )
            continue;
        
        const cns = cns2uni_line.split('\t') [0];
        const uni = cns2uni_line.split('\t') [1];
        
        cns2uni_map [cns] = uni;
    }
}

cnsTxtFile2vars("常用國字標準字體表.cns.txt", 'edu_tw_A_cns', 'edu_tw_A' );
cnsTxtFile2vars("次常用字國字標準字體表.cns.txt", 'edu_tw_B_cns', 'edu_tw_B' );
cnsTxtFile2vars("國中小教科書常用字.cns.txt", 'edu_tw_500_cns', 'edu_tw_500' );
edu_tw.edu_tw_B = edu_tw.edu_tw_B .concat (edu_tw.edu_tw_500);

fs.writeFileSync("cns-data-as-edu-data-TW-A.js",( "edu_data.TW_A =\n" + JSON.stringify( edu_tw.edu_tw_A) + "\n;")
    .replaceAll(",", ",\n")
);   
fs.writeFileSync("cns-data-as-edu-data-TW-B.js",( "edu_data.TW_B =\n" + JSON.stringify( edu_tw.edu_tw_B) + "\n;")
    .replaceAll(",", ",\n")
);   
// fs.writeFileSync("cns-data-as-edu-data-TW-500.js",( "edu_data.TW_500 =\n" + JSON.stringify( edu_tw.edu_tw_500) + "\n;")
//     .replaceAll(",", ",\n")
// );   



function cnsTxtFile2vars(cnsTxtFileName, cnsVar, charsVar)
{
    edu_tw [cnsVar] = fs.readFileSync(cnsTxtFileName, 'utf8').split("\n");
    for ( c_cns of edu_tw [cnsVar] )
    {
        var c_uni = cns2uni_map [ c_cns ];
        if ( ! c_uni )
            continue;
        
        var c = utf16hex2char(c_uni);
        edu_tw [charsVar] .push (c);
    }
}



function utf16hex2char(hexStr) // 输入可以是 3F2F U+3AB2 
{
    hexStr = hexStr.replaceAll("U+", "");
//     console.log(hexStr);
    return String.fromCodePoint( parseInt(hexStr, 16) );
}

