
function utf16hex2char(hexStr) // 输入可以是 3F2F U+3AB2 1A7323<xxxx
{
    hexStr = hexStr.replaceAll("U+", "");
    hexStr = hexStr.split("<")[0];
//     console.log(hexStr);
    return String.fromCodePoint( parseInt(hexStr, 16) );
}


//参数：
//     ToS:         是[繁-简]还是[简-繁]
function mapTnS(mapObj, rawrelObj , ToS)
{
    
    for ( var  left in rawrelObj ) {
        var right_arr = rawrelObj[left];
        
        
        
        if (ToS == "TS")
            addTSRelation(mapObj, right_arr, left );
        else if (ToS == "ST")
            addTSRelation(mapObj, left, right_arr );
                
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

//检查两个字有无繁简关系。仅读map表
function haveTSRelation(mapObj, char1, char2) //前提是建立繁简map rel关系时每两两都关系了
{
    if ( mapObj[char1] === undefined || mapObj[char2] === undefined)
        return false;
    
    if ( mapObj[char1]['rel'].includes(char2) )
        return true;
    
    return false;
}

//参数可以是字符串（单个字），也可以是数组（一个元素是一个字）
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
        for ( var char of set) 
        {
            updateCharRel(mapObj, char, set)
        }
        
}



// 在某个mapObj中，给数组中的字互相关联起来，不加任何标记
function relTheseChars(mapObj, charsArr)
{
    for ( var  c of charsArr )
    {
        createKey( c,  mapObj);
        updateCharRel(mapObj, c , charsArr);
    }
}

function updateCharRel(mapObj, char, updatedRelSet)
{
    var newSet = new Set(updatedRelSet);
    newSet.delete(char);            //从数组中去掉这个当索引的字本身
    
    //     if ( mapObj[char]['rel'].length)
    //     {
    //         var oldr = mapObj[char]['rel'].sort().toString();
    //         var newr = [...newSet].sort().toString();
    //         if (oldr != newr)
    //             console.log(`${char} 字已设置过关联关系{${oldr}}，现又更新关联成为{${newr}}`);
    //     }
    
    mapObj[char]['rel'] = [...newSet].sort();
}

function sortMapObj(mapObj) {
    
    var newMapObj = {};
    const origI = Object.keys(mapObj).sort();
    for ( var  c of origI )
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
            for ( var attr of otherIsAttrs)
            {
                newMapObj [c] [attr] = JSON.parse( JSON.stringify( mapObj [c] [attr] ) );
            }
        }
    }
    return newMapObj;
}



function combineMap(map_1, map_2)
{
    var rmap = {};
    
    for ( var c in map_1 )
    {
        rmap [c] = combineCharObj(c, map_1, map_2);
    }    
    for ( var c in map_2 )
    {
        rmap [c] = combineCharObj(c, map_1, map_2);
    }    
    return rmap;
}

function combineCharObj(c , fromMap1, fromMap2) 
{
    var map1obj = fromMap1[c] ? JSON.parse(JSON.stringify( fromMap1 [c] )) : { rel: [] };
    var map2obj = fromMap2[c] ? JSON.parse(JSON.stringify( fromMap2 [c] )) : { rel: [] } ;
    
    var coRel = [ ... unionSet( (new Set(map1obj['rel'])) , (new Set(map2obj['rel'])) ) ] ;
    
    var newCObj = {
        rel : coRel,
    };
    
    delete map1obj['rel'];
    delete map2obj['rel'];
    
    for ( var kn in map1obj) 
    {
        newCObj[kn] = map1obj[kn];
    }
    for ( var kn in map2obj) 
    {
        newCObj[kn] = map2obj[kn];
    }
    
    return newCObj;
}

function unionSet(setA, setB) {
    let _union = new Set(setA);
    for ( var  elem of setB) {
        _union.add(elem);
    }
    return _union;
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
 
module.exports = {
    utf16hex2char,
    mapTnS,
    getAllRel,
    haveTSRelation,
    addTSRelation,
    relTheseChars,
    updateCharRel,
    sortMapObj,
    combineMap,
    combineCharObj,
    unionSet,
    createKey,
    
};
