var fs = require('fs');
var opencc = {
    map: {},
    map2: {},
    map3: {},
};

// document.addEventListener('DOMContentLoaded', async (event) => {
    init_opencc();
// });
    
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
//         console.log(JPV);
        
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
        fs.writeFileSync( "opencc-data-ST.js", "opencc.ST = \n" + JSON.stringify(STj, null, 2) + "\n;" );
        
        TSj = txt2json(TS);
        fs.writeFileSync( "opencc-data-TS.js", "opencc.TS = \n" + JSON.stringify(TSj, null, 2) + "\n;" );
        
        HKVj = txt2json(HKV);
        fs.writeFileSync( "opencc-data-HKV.js", "opencc.HKV = \n" + JSON.stringify(HKVj, null, 2) + "\n;" );
        
        TWVj = txt2json(TWV);
        fs.writeFileSync( "opencc-data-TWV.js", "opencc.TWV = \n" + JSON.stringify(TWVj, null, 2) + "\n;" );
        
        JPVj = txt2json(JPV);
        fs.writeFileSync( "opencc-data-JPV.js", "opencc.JPV = \n" + JSON.stringify(JPVj, null, 2) + "\n;" );
        
        mapTnS(STj, "ST");
        mapTnS(TSj, "TS");
        opencc.map = map;
        fs.writeFileSync( "opencc-data-map.js", "opencc.map = \n" + JSON.stringify(map, null, 2) + "\n;" );
        console.log("完成map");
        
        //     map2 = Object.assign({}, map);
        map2 = JSON.parse(JSON.stringify(map));
        
        checkVariants(HKVj, "HK");
        checkVariants(TWVj, "TW");
        checkVariants(JPVj, "JP");
        opencc.map2 = map2;
        fs.writeFileSync( "opencc-data-map2.js", "opencc.map2 = \n" + JSON.stringify(map2, null, 2) + "\n;" );
        console.log("完成map2");
        
        //     map3 = Object.assign({}, map2);
        map3 = JSON.parse(JSON.stringify(map2));
        
        finishMap3();
        opencc.map3 = map3;
        fs.writeFileSync( "opencc-data-map3.js", "opencc.map3 = \n" + JSON.stringify(map3, null, 2) + "\n;" );
        console.log("完成map3");
    }
    
    //============ map3 所需函数 ==============================
    function finishMap3() {
        var all_chars = Object.keys(map2);
        
        for (char of all_chars)
        {
            var newSet = new Set(map2[char].rel);
            newSet.add(char);
            newSet = new Set(getAllRel(map2, newSet));
            for (write_char of newSet) 
            {
                createKey(write_char, map3);
                map3[write_char]['rel'] = [...newSet];
            }
            //         if (newSet.has("发"))
            //             console.log(newSet);
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
            var right_arr = obj[left];
        
            var candi = [];
            candi = right_arr;
            //candi.unshift(left);
            candi = new Set(candi) ;
            candi.delete(left);
            
            
            var candi_filtered = new Set(candi);
            
            //for (i=candi.length-1; i>=0; i--)
            for (char of candi)
            {
                if ( haveTSRelation(char, left) )
                {
                    //                 console.log(`正在处理${zone}变体关系，${char} 与 ${left} 已有繁简关系，故不判断为变体`);
                    candi_filtered.delete( char );
                }
            }
            
            for( char of candi_filtered )
            {
                //console.log(char,  left,  zone);
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
            map2[char]['rel'] = [..._updatedRelSet];
        });
    }
    //=================================
    //============= map 所需函数 及 通用函数 ====================
    
    //参数：
    //     ToS:         是[繁-简]还是[简-繁]
    //仅作用于map表
    function mapTnS(rawrelObj , ToS)
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
                createKey(simpChar);
                mapObj[simpChar]['isSimp'] = true;
                //set.add(simpChar);
                //mapObj[simpChar]['rel'].forEach( function(char) {
                //    set.add(char);
                //});
            });
            
            tradChars.forEach( function(tradChar) {
                createKey(tradChar);
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
                updateCharRel(char, set)
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
    
    function updateCharRel(char, updatedRelSet)
    {
        var newSet = new Set(updatedRelSet);
        newSet.delete(char);
        
        //     if ( map[char]['rel'].length)
        //     {
        //         var oldr = map[char]['rel'].sort().toString();
        //         var newr = [...newSet].sort().toString();
        //         if (oldr != newr)
        //             console.log(`${char} 字已设置过关联关系{${oldr}}，现又更新关联成为{${newr}}`);
        //     }
        
        map[char]['rel'] = [...newSet];
    }
    
    //如果某表中还没有这个字的索引，为它创建一个新的（空内容但有基本结构的）
    function createKey( key , mapObj=map)
    {
        if ( mapObj[key] === undefined)
        {
            mapObj[key] = { 
                "rel" : []
            };
            
        }
    }
    
    //检查两个字有无繁简关系。仅读map表
    function haveTSRelation(char1, char2) //前提是建立繁简map rel关系时每两两都关系了
    {
        if ( map[char1] === undefined || map[char2] === undefined)
            return false;
        
        if ( map[char1]['rel'].includes(char2) )
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
            
            json[left] = right_arr;
        })
        
        return json;
    }
}
