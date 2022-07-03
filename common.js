var isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null;
  
var isWeb = !isNode;

if (isNode)
    console.warn("isNode");
if (isWeb)
    console.log("isWeb");

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
