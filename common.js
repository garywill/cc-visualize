var isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null;
  
var isWeb = !isNode;

if (isNode)
    console.warn("isNode");
if (isWeb)
    console.log("isWeb");

