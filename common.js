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

function escapeHtml(unsafe)
{
    return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

