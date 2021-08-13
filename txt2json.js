/*
async function getTextFile( file ) {
    r = await fetch(file) ;
    t = await r.text() ;
    return t ;
}
*/
var ST="";
var TS="";
var HKV=""
var TWV="";
var JPV="";

var map = {}; // 主 繁与简对应表
var map2 = {}; // 加上变体之后的map




async function onLoad()
{
    //ST = getTextFile("STCharacters.txt");
    //TS = getTextFile("TSCharacters.txt");
    await fetch('opencc-data/STCharacters.txt').then(response => response.text()).then(textString => {
        ST = textString;
    });
    
    await fetch('opencc-data/TSCharacters.txt').then(response => response.text()).then(textString => {
        TS = textString;
    });   
    
    await fetch('opencc-data/HKVariants.txt').then(response => response.text()).then(textString => {
        HKV = textString;
    });
    
    await fetch('opencc-data/TWVariants.txt').then(response => response.text()).then(textString => {
        TWV = textString;
    });
    
    await fetch('opencc-data/JPVariants.txt').then(response => response.text()).then(textString => {
        JPV = textString;
    });
    
    afterLoadText();
    
    delete ST;
    delete TS;
    delete HKV;
    delete TWV;
    delete JPV;
    
    document.getElementById("gen_json").textContent = JSON.stringify(map2, null, 2);
}

onLoad();

function afterLoadText() 
{
    mapTnS(ST, "ST");
    mapTnS(TS, "TS");
    
    map2 = Object.assign({}, map);
    
    checkVariants(HKV, "HK");
    checkVariants(TWV, "TW");
    checkVariants(JPV, "JP");
}
//==========================================
function checkVariants(txtStream, zone)
{
    var lines = txtStream.split('\n');
    var candi = [];
    
    lines.forEach( function (line, line_i) {
  
        if (!line)
            return;
        
        var [left, right] = line.split('\t');
        
        var right_arr = right.split(' ');
        
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
                console.log(`正在处理${zone}变体关系，${char} 与 ${left} 已有繁简关系，故不判断为变体`);
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
        var allRel = getAllRel(all_chars);
        
        addVariantRel( [...candi_filtered], allRel );
    });  
}
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
function mapTnS(txtStream, ToS)
{
    var lines = txtStream.split('\n');

    lines.forEach( function (line, line_i) {

        if (!line)
            return;
        
        var [left, right] = line.split('\t');
        
        var right_arr = right.split(' ');
        
        if (ToS == "TS")
            addTSRelation( right_arr, left )
        else if (ToS == "ST")
            addTSRelation( left, right_arr )

    });   
}

function getAllRel(chars, mapObj=map)
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

function addTSRelation(simpChars, tradChars)
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
        map[simpChar]['isSimp'] = true;
        //set.add(simpChar);
        //map[simpChar]['rel'].forEach( function(char) {
        //    set.add(char);
        //});
    });
    
    tradChars.forEach( function(tradChar) {
        createKey(tradChar);
        map[tradChar]['isTrad'] = true;
        //set.add(tradChar);
        //map[tradChar]['rel'].forEach( function(char) {
        //    set.add(char);
        //});
    });
    
    var set1 = getAllRel(simpChars);
    var set2 = getAllRel(tradChars);
    set = unionSet(set1, set2);
    
    // 写入（更新）rel
    for (char of set) 
    {
        updateCharRel(char, set)
    }
    
}

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
    
    if ( map[char]['rel'].length)
    {
        var oldr = map[char]['rel'].sort().toString();
        var newr = [...newSet].sort().toString();
        if (oldr != newr)
            console.log(`${char} 字已设置过关联关系{${oldr}}，现又更新关联成为{${newr}}`);
    }
    
    map[char]['rel'] = [...newSet];
}

function createKey( key , mapObj=map)
{
    if ( mapObj[key] === undefined)
    {
        mapObj[key] = { 
            "rel" : []
        };
        
    }
}

function haveTSRelation(char1, char2) //前提是建立繁简map rel关系时每两两都关系了
{
    if ( map[char1] === undefined || map[char2] === undefined)
        return false;
    
    if ( map[char1]['rel'].includes(char2) )
        return true;
    
    return false;
}
