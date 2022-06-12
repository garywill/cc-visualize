document.addEventListener('DOMContentLoaded', async (event) => {
    /*
    await fetch('example.txt').then(response => response.text()).then(textString => {
        document.getElementById("essay").value = textString;
    });
    */
    
    document.getElementById("btn_checkessay").onclick = function() {
        
        const container = document.getElementById("div_result")
        container.innerHTML = "";
        
        const essay = Array.from(document.getElementById("essay").value);
        
        for ( var pos = 0; pos < essay.length; pos++) // 原文一字一循环
        {
            const essayChar = essay[pos];
            if (essayChar == "\n" )
            {
                container.appendChild( document.createElement("br") );
            }else{    
                    
                var div_essayChar = document.createElement("div");
                div_essayChar.className = "div_essay_char";
                
                var div_origChar = document.createElement("ruby");
                div_origChar.className = "div_orig_char";
                div_origChar.textContent = essayChar;
                
                if (opencc.map2[essayChar] && opencc.map2[essayChar]['isSimp'] && opencc.map2[essayChar]['isTrad'])
                    div_origChar.className += " simp-n-trad";
                else if (opencc.map2[essayChar] && opencc.map2[essayChar]['isSimp'])
                    div_origChar.className += " simp";
                else if (opencc.map2[essayChar] && opencc.map2[essayChar]['isTrad'])
                    div_origChar.className += " trad";
                else if (opencc.map2[essayChar] && opencc.map2[essayChar]['isVari_JP'])
                    div_origChar.className += " jp";
                
                div_essayChar.appendChild(div_origChar);
                
                var ruby_rt = document.createElement("rt");
                if (opencc.map2[essayChar] && opencc.map2[essayChar]['rel']) //有关联字
                {
                    div_essayChar.className += " div_essay_char_haverel";
                    
                    opencc.map2[essayChar]['rel'].forEach( function(relChar) {
                        
                        var div_oneRelChar = document.createElement("div");
                        div_oneRelChar.className = "div_one_rel_char";
                        div_oneRelChar.textContent = relChar;
                        
                        if (opencc.map2[relChar] && opencc.map2[relChar]['isSimp'] && opencc.map2[relChar]['isTrad'])
                            div_oneRelChar.className += " simp-n-trad";
                        else if (opencc.map2[relChar] && opencc.map2[relChar]['isSimp'])
                            div_oneRelChar.className += " simp";
                        else if (opencc.map2[relChar] && opencc.map2[relChar]['isTrad'])
                            div_oneRelChar.className += " trad";
                        else if (opencc.map2[relChar] && opencc.map2[relChar]['isVari_JP'])
                            div_oneRelChar.className += " jp";
                        
                        ruby_rt.appendChild(div_oneRelChar);
                    });
                    div_origChar.appendChild(ruby_rt);
                }
                
                var tip = "";
                tip += essayChar + "（" + getCharPropStr(essayChar) + "）";
                
                if (opencc.map2[essayChar] && opencc.map2[essayChar]['rel']) //有关联字
                {
                    tip += "\n\n关联字\n";
                    opencc.map2[essayChar]['rel'].forEach( function(relChar) {
                        tip += relChar + "（" + getCharPropStr(relChar) + "）\n";
                    });
                }
                
                div_essayChar.title = tip;
                
                container.appendChild(div_essayChar);
            }
        }
    }

});

function getCharPropStr(char) {
    var prop = "";
    if (opencc.map2[char])
    {
        
        if (opencc.map2[char]['isSimp'])
            prop += "简";
        if (opencc.map2[char]['isTrad'])
            prop += "繁";
        if (opencc.map2[char]['isVari_HK'])
            prop += "港";
        if (opencc.map2[char]['isVari_TW'])
            prop += "台";
        if (opencc.map2[char]['isVari_JP'])
            prop += "日";
    }
    return prop;
}
