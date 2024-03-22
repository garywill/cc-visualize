// var win = window;
// var doc = document;
function $$(s) 
{
    return document.querySelector(s);
}

function $$$(s) 
{
    return document.querySelectorAll(s);
}

Object.prototype.q$ = function(selectorStr) {
    function handleNonArrayObject(obj)
    {
        return obj.querySelector(selectorStr);
    }
    
    var obj = this;
    var result = null;
    
    if ( HTMLElement.prototype.isPrototypeOf(obj) ) 
        result = handleNonArrayObject( obj );
    else if ( typeof(obj) != "string" && 
        obj.length !== undefined && obj.length > 0
    )
    {
        for( subObj of obj )
        {
            result = handleNonArrayObject(subObj);
            if (result)
                break;
        }
    }
    
    return result;
}
Object.prototype.q$$ = function(selectorStr) {
    function handleNonArrayObject(obj)
    {
        return obj.querySelectorAll(selectorStr);
    }
    
    var obj = this;
    var result = [];
    
    if ( HTMLElement.prototype.isPrototypeOf(obj) ) 
        result = Array.from( handleNonArrayObject( obj ) );
    else if ( typeof(obj) != "string" && 
        obj.length !== undefined && obj.length > 0
    )
    {
        for( subObj of obj )
        {
            result = result.concat ( Array.from (handleNonArrayObject(subObj) ) );
        }
        result = Array.from ( new Set(result) );
    }
    
    return result;
}

function onDCL(f) 
{
    document.addEventListener('DOMContentLoaded', f);
} 
Object.prototype.addOnClk = function(f) {
    function handleNonArrayObject(obj)
    {
        obj.removeEventListener("click", f);
        obj.addEventListener("click", f);
    }
    
    var obj = this;
    if ( HTMLElement.prototype.isPrototypeOf(obj) ) 
        handleNonArrayObject( obj );
    else if ( typeof(obj) != "string" && 
        obj.length !== undefined && obj.length > 0
    )
    {
        for( subObj of obj )
        {
            handleNonArrayObject(subObj);
        }
    }
}



function htmlStr2dom(htmlStr)
{
    htmlStr = htmlStr.replaceAll("\n", "");
    htmlStr = htmlStr.replaceAll("\r", "");
    htmlStr = htmlStr.replace(/> *</g, "><");
    
    var dp = new DOMParser();
    return dp.parseFromString(htmlStr, "text/html").body.firstChild;

}

function removeNode(node)
{
    node.parentNode.removeChild(node);
}

function escapeHtml(unsafe)
{
    if (typeof(unsafe) !== "string" )
        return escapeHtml( toString(unsafe) );
    
    return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
