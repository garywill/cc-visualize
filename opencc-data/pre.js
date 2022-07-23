var fs = require('fs');

var edu_data = {};
eval(fs.readFileSync('../edu-data/edu-data-CN-1c.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-CN-2c.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-CN-3c.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-HK.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-TW-A.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-TW-B.js').toString());

edu_data.allCharsSet = new Set(
    edu_data.CN_1c 
    . concat (edu_data.CN_2c) 
    . concat (edu_data.CN_3c) 
    . concat (edu_data.HK) 
    . concat (edu_data.TW_A) 
    . concat (edu_data.TW_B) 
)

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
        fs.writeFileSync( "opencc-data-ST.js", ( "opencc.ST = \n" + JSON.stringify(STj) + "\n;" )
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        TSj = txt2json(TS);
        fs.writeFileSync( "opencc-data-TS.js", ( "opencc.TS = \n" + JSON.stringify(TSj) + "\n;" )
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        HKVj = txt2json(HKV);
        fs.writeFileSync( "opencc-data-HKV.js", ( "opencc.HKV = \n" + JSON.stringify(HKVj) + "\n;" )
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        TWVj = txt2json(TWV);
        fs.writeFileSync( "opencc-data-TWV.js", ( "opencc.TWV = \n" + JSON.stringify(TWVj) + "\n;" )
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        JPVj = txt2json(JPV);
        fs.writeFileSync( "opencc-data-JPV.js", ( "opencc.JPV = \n" + JSON.stringify(JPVj) + "\n;" )
            .replaceAll("{", "{\n") 
            .replaceAll("}", "\n}")
            .replaceAll("],", "],\n")
        );
        
        mapTnS(STj, "ST");
        mapTnS(TSj, "TS");
        map = sortMapObj(map);
        opencc.map = map;
//         fs.writeFileSync( "opencc-data-map.js", ( "opencc.map = \n" + JSON.stringify(map) + "\n;" )
//             .replaceAll("},", "},\n")
//         );
        console.log("完成map");
        
        map2 = JSON.parse(JSON.stringify(map));
        
        checkVariants(HKVj, "HK");
        checkVariants(TWVj, "TW");
        checkVariants(JPVj, "JP");
        map2 = sortMapObj(map2);
        opencc.map2 = map2;
        fs.writeFileSync( "opencc-data-map2.js", ( "opencc.map2 = \n" + JSON.stringify(map2) + "\n;" )
            .replaceAll("},", "},\n")
        );
        console.log("完成map2");
        
        map3 = JSON.parse(JSON.stringify(map2));
        
        finishMap3();
        map3 = sortMapObj(map3);
        opencc.map3 = map3;
        fs.writeFileSync( "opencc-data-map3.js", ( "opencc.map3 = \n" + JSON.stringify(map3) + "\n;" )
            .replaceAll("},", "},\n")
        );
        console.log("完成map3");
    }
    
    //============ map3 所需函数 ==============================
    function finishMap3() {
        var all_chars = Object.keys(map3);
        
        for (char of all_chars)
        {
            var newSet = new Set(map3[char].rel);
            newSet.add(char);
            newSet = new Set(getAllRel(map3, newSet));
            
            for (write_char of newSet) 
            {
                createKey(write_char, map3);
                
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
        
        for ( left in obj )
        {
            createKey( left, map2);
            
            if ( ! map2 [left] ['isSimp'] && ! map2 [left] ['isTrad'] )
                map2[left]['isChi'] = true;
            else if ( map2 [left] ['isSimp'] && ! map2 [left] ['isTrad'] ) 
                map2[left]['isTrad'] = true;
            
            var right_arr = obj[left];
            
            if (zone == "HK" || zone == "TW")
            {
                for (c of right_arr)
                {
                    if ( map2[c] && map2 [c]['isSimp'] && ! map2 [c]['isTrad'] )
                        map2 [c] ['isTrad'] = true;
                }
            }
            
            var filter_right_arr = new Set(right_arr) ;
            if (zone == "JP" && edu_data.allCharsSet.has(left) )
            {
                for (c of right_arr)
                {
                    if ( edu_data.allCharsSet.has(c) )
                        filter_right_arr.delete(c);
                }
            }
            right_arr = [ ... filter_right_arr];
        
            var candi = [];
            candi = right_arr;
            candi = new Set(candi) ;
            candi.delete(left);
            
            
            var candi_filtered = new Set(candi);
            
            for (char of candi)
            {
                if ( haveTSRelation(map, char, left) )
                {
                    //                 console.log(`正在处理${zone}变体关系，${char} 与 ${left} 已有繁简关系，故不判断为变体`);
                    candi_filtered.delete( char );
                }
            }
            
            for( char of candi_filtered )
            {
                createKey(char, map2);
                map2[char]['isVari_'+zone] = true;
            }
            
            var all_chars = [...candi_filtered];
            all_chars.push(left);
            var allRel = getAllRel(map, all_chars);
            
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
            createKey(char, map2);
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
    //=================================
    //============= map 所需函数 及 通用函数 ====================
    
    //参数：
    //     ToS:         是[繁-简]还是[简-繁]
    //仅作用于map表
    function mapTnS(rawrelObj , ToS) //TODO mapobj
    {
        
        for ( left in rawrelObj ) {
            var right_arr = rawrelObj[left];
            
            
            
            if (ToS == "TS")
                addTSRelation(map, right_arr, left )
            else if (ToS == "ST")
                addTSRelation(map, left, right_arr )
                    
        };   
    }
    
    //参数char可以是字符串（单个字），也可以是数组（一个元素是一个字）
    //参数mapObj指定要从哪一个表中读取
    //把输入的一个或多个字的目前表中已知的关联字都找出来
    function getAllRel( mapObj, chars)
    {
        if ( typeof(chars) === "string" )
            chars = [chars];
        
        var set = new Set();
        
        chars.forEach( function(char) {
            set.add(char);
            
            if (mapObj[char] !== undefined)
            {
                mapObj[char]['rel'].forEach( function(relChar) {
                    set.add(relChar);
                });
            }
        });
        
        return [...set];
    }
    
    //参数可以是字符串（单个字），也可以是数组（一个元素是一个字）
    //仅作用于map表
    function addTSRelation(mapObj, simpChars, tradChars)
    {
        // 单个字的输入转为数组
        if ( typeof(simpChars) === "string")
            simpChars=[simpChars]
            
            if ( typeof(tradChars) === "string")
                tradChars=[tradChars]
                
                var set = new Set();
            
            // 分别设置繁、简标志
            simpChars.forEach( function(simpChar) {
                createKey(simpChar, mapObj);
                mapObj[simpChar]['isSimp'] = true;
                //set.add(simpChar);
                //mapObj[simpChar]['rel'].forEach( function(char) {
                //    set.add(char);
                //});
            });
            
            tradChars.forEach( function(tradChar) {
                createKey(tradChar, mapObj);
                mapObj[tradChar]['isTrad'] = true;
                //set.add(tradChar);
                //mapObj[tradChar]['rel'].forEach( function(char) {
                //    set.add(char);
                //});
            });
            
            var set1 = getAllRel(mapObj, simpChars);
            var set2 = getAllRel(mapObj, tradChars);
            set = unionSet(set1, set2);
            
            // 写入（更新）rel
            for (char of set) 
            {
                updateCharRel(mapObj, char, set)
            }
            
    }
    
    //并集
    function unionSet(setA, setB) {
        let _union = new Set(setA);
        for (let elem of setB) {
            _union.add(elem);
        }
        return _union;
    }
    
    function updateCharRel(mapObj, char, updatedRelSet)
    {
        var newSet = new Set(updatedRelSet);
        newSet.delete(char);
        
        //     if ( mapObj[char]['rel'].length)
        //     {
        //         var oldr = mapObj[char]['rel'].sort().toString();
        //         var newr = [...newSet].sort().toString();
        //         if (oldr != newr)
        //             console.log(`${char} 字已设置过关联关系{${oldr}}，现又更新关联成为{${newr}}`);
        //     }
        
        mapObj[char]['rel'] = [...newSet].sort();
    }
    
    //如果某表中还没有这个字的索引，为它创建一个新的（空内容但有基本结构的）
    function createKey( key , mapObj)
    {
        if ( mapObj[key] === undefined)
        {
            mapObj[key] = { 
                "rel" : []
            };
            
        }
    }
    
    //检查两个字有无繁简关系。仅读map表
    function haveTSRelation(mapObj, char1, char2) //前提是建立繁简map rel关系时每两两都关系了
    {
        if ( mapObj[char1] === undefined || mapObj[char2] === undefined)
            return false;
        
        if ( mapObj[char1]['rel'].includes(char2) )
            return true;
        
        return false;
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
        
        json = sortMapObj(json);
        
        return json;
    }
}
// ====================

function sortMapObj(mapObj) {
    
    var newMapObj = {};
    const origI = Object.keys(mapObj).sort();
    for ( c of origI )
    {
        if ( Array.isArray(mapObj[c]) )
            newMapObj[c] = JSON.parse( JSON.stringify( mapObj[c] ) );
        else
        {
            newMapObj [c] = {};
            
            if ( Array.isArray(mapObj [c] ['rel'] ) )
            {
                newMapObj [c] ['rel']  = JSON.parse( JSON.stringify( mapObj [c] ['rel'] .sort() ) );
            }
            
            var otherIsAttrs = new Set ( Object.keys(mapObj [c]) ) ;
            otherIsAttrs.delete ('rel');
            otherIsAttrs = [...otherIsAttrs].sort();
            for (attr of otherIsAttrs)
            {
                newMapObj [c] [attr] = JSON.parse( JSON.stringify( mapObj [c] [attr] ) );
            }
        }
    }
    return newMapObj;
}
