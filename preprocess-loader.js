"use strict";
const pp = require('preprocess');

module.exports = function(source) {
    const options = this.getOptions();
    
    // console.log("options: ", options);
    const type = options.type;
    
    // const buildtarget = options.buildtarget;
    const buildtarget = process.env.buildtarget;
    // console.log(buildtarget);

    
    // console.log(process.env); 
    let processedSource = pp.preprocess(source, {buildtarget:buildtarget} , {type:type} );
    
    // console.log(processedSource); 
    return processedSource;
};
