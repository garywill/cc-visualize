var fs = require('fs');

const cm = require('../pre_common/functions.js');

var edu_data = {};
edu_data.map2 = require('../edu-data/edu-data-map2.json');



var opencc = {
    map: {},
    map2: {},
    map3: {},
};

init_opencc();
    
async function init_opencc() 
{
    var ST="";
    var TS="";
    var HKV=""
    var TWV="";
    var JPV="";
    
    var STj = {};
    var TSj = {};
    var HKVj = {}
    var TWVj = {};
    var JPVj = {};
    
    
    var map = {}; // 主 繁与简对应表
    var map2 = {}; // 加上变体之后的map(中华字不与外国变体字主动关联)
    var map3 = {}; // 所有关联,包括自身
    
    
    
    
    async function onLoad()
    {


        ST = fs.readFileSync('STCharacters.txt', 'utf8' )
        TS = fs.readFileSync('TSCharacters.txt', 'utf8' )
        HKV = fs.readFileSync('HKVariants.txt', 'utf8' )
        TWV = fs.readFileSync('TWVariants.txt', 'utf8' )
        JPV = fs.readFileSync('JPVariants.txt', 'utf8' )
        
        await afterLoadText();
        
        
        delete ST;
        delete TS;
        delete HKV;
        delete TWV;
        delete JPV;
        
    }
    
    onLoad();
    
    async function afterLoadText() 
    {
        STj = txt2json(ST);
        fs.writeFileSync( "opencc-data-ST.json",  JSON.stringify(STj)
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        TSj = txt2json(TS);
        fs.writeFileSync( "opencc-data-TS.json",  JSON.stringify(TSj)
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        HKVj = txt2json(HKV);
        fs.writeFileSync( "opencc-data-HKV.json",  JSON.stringify(HKVj)
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        TWVj = txt2json(TWV);
        fs.writeFileSync( "opencc-data-TWV.json",  JSON.stringify(TWVj)
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        JPVj = txt2json(JPV);
        fs.writeFileSync( "opencc-data-JPV.json",  JSON.stringify(JPVj)
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        cm.mapTnS(map, STj, "ST");
        cm.mapTnS(map, TSj, "TS");
        map = cm.sortMapObj(map);
        opencc.map = map;
//         fs.writeFileSync( "opencc-data-map.js", ( "opencc.map = \n" + JSON.stringify(map) + "\n;" )
//             .replaceAll("},", "},\n")
//         );
        console.log("完成map");
        
        map2 = JSON.parse(JSON.stringify(map));
        
        checkVariants(HKVj, "HK");
        checkVariants(TWVj, "TW");
        checkVariants(JPVj, "JP");
        map2 = cm.sortMapObj(map2);
        opencc.map2 = map2;
        fs.writeFileSync( "opencc-data-map2.json",  JSON.stringify(map2) .replaceAll("},", "},\n") );
        console.log("完成map2");
        
        map3 = JSON.parse(JSON.stringify(map2));
        
        finishMap3();
        map3 = cm.sortMapObj(map3);
        opencc.map3 = map3;
        fs.writeFileSync( "opencc-data-map3.json",  JSON.stringify(map3) .replaceAll("},", "},\n") );
        console.log("完成map3");
    }
    
    //============ map3 所需函数 ==============================
    function finishMap3() {
        var all_chars = Object.keys(map3);
        
        for ( var char of all_chars)
        {
            var newSet = new Set(map3[char].rel);
            newSet.add(char);
            newSet = new Set(cm.getAllRel(map3, newSet));
            
            for ( var write_char of newSet) 
            {
                cm.createKey(write_char, map3);
                
                var write_newSet = new Set(newSet);
                write_newSet.delete(write_char);
                map3[write_char]['rel'] = [...write_newSet].sort();
            }
        }
        
    }
    //==========================================
    //============ map2 所需函数 ==============================
    
    //参数：
    //参数zone: HK/TW/JP
    function checkVariants(obj , zone)
    {
        
        for ( var  left in obj )
        {
            cm.createKey( left, map2);
            
            if ( ! map2 [left] ['isSimp'] && ! map2 [left] ['isTrad'] )
                map2[left]['isChi'] = true;
            else if ( map2 [left] ['isSimp'] && ! map2 [left] ['isTrad'] ) 
                map2[left]['isTrad'] = true;
            
            var right_arr = obj[left];
            
            if (zone == "HK" || zone == "TW")
            {
                for ( var c of right_arr)
                {
                    if ( map2[c] && map2 [c]['isSimp'] && ! map2 [c]['isTrad'] )
                        map2 [c] ['isTrad'] = true;
                }
            }
            
            var filter_right_arr = new Set(right_arr) ;
            if (zone == "JP" && Object.keys(edu_data.map2).includes(left)  )
            {
                for ( var c of right_arr)
                {
                    if (Object.keys(edu_data.map2).includes(c))
                        filter_right_arr.delete(c);
                }
            }
            right_arr = [ ... filter_right_arr];
        
            var candi = [];
            candi = right_arr;
            candi = new Set(candi) ;
            candi.delete(left);
            
            
            var candi_filtered = new Set(candi);
            
            for ( var char of candi)
            {
                if ( cm.haveTSRelation(map, char, left) )
                {
                    //                 console.log(`正在处理${zone}变体关系，${char} 与 ${left} 已有繁简关系，故不判断为变体`);
                    candi_filtered.delete( char );
                }
            }
            
            for( char of candi_filtered )
            {
                cm.createKey(char, map2);
                map2[char]['isVari_'+zone] = true;
            }
            
            var all_chars = [...candi_filtered];
            all_chars.push(left);
            var allRel = cm.getAllRel(map, all_chars);
            
            addVariantRel( [...candi_filtered], allRel );
        };  
    }
    
    //把一个或多个字设置为表中的变体字
    //参数可以是字符串（单个字），也可以是数组（一个元素是一个字）
    function addVariantRel(variChars, relToAddArr)
    {
        if ( typeof(variChars) == "string" )
            variChars = [variChars];
        
        if ( typeof(relToAddArr) == "string" )
            relToAddArr = [relToAddArr];
        
        var updatedRelSet = new Set(relToAddArr);
        
        variChars.forEach( function(char) {
            cm.createKey(char, map2);
            map2[char]['rel'].forEach( function (relChar) {
                updatedRelSet.add(relChar);
            });
        });
        
        variChars.forEach( function(char) {
            var _updatedRelSet = new Set(updatedRelSet);
            _updatedRelSet.delete(char)
            map2[char]['rel'] = [..._updatedRelSet].sort();
        });
    }


    
    //     txtStream:   openCC数据文本文件的内容
    //                  其中一行为，例如：  A<tab>B<space>C<space>D
    function txt2json(txtStream) 
    {
        var json = {};
        
        var lines = txtStream.split('\n');
        
        lines.forEach( function (line, line_i) {
        
            if (!line)
                return;
            
            var [left, right] = line.split('\t');
            
            var right_arr = right.split(' ');
            
            json[left] = right_arr.sort();
        })
        
        json = cm.sortMapObj(json);
        
        return json;
    }
}
