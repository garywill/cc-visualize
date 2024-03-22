/* vccrlib v0.3.0 (Visualize Chinese Charactors and Their Relations Library) is a JavaScript library for nodejs and web. */ 


// @include js/common.js 
// @include js/init.js 
// @include js/ucd.js 
// @include js/unusual_conditions.js 
// @include js/print_check.js 
// @include js/checkessay.js 

// @if buildtarget = 'webtool'
// @include js_web/common.js 
// @include js_web/webessay.js 
// @include js_web/welcome.js 
// @include js_web/checkbox.js 
// @endif

// @if buildtarget = 'vccrlib'
module.exports = {
    reset, 
    startNewCheck, 
    getCInfo, 
    print_stati, 
};
// @endif
