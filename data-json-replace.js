"use strict";

module.exports = function(source) {
    // const buildtarget = options.buildtarget;
    const buildtarget = process.env.buildtarget;

    
    // console.log(process.env); 
    
    let processedSource = replaceThem(source);
    // console.log(processedSource); 
    
    return processedSource;
};

function replaceThem(str) 
{
    str = str.replace(/\bisEdu_CN_1c\b/g, 'EC1');
    str = str.replace(/\bisEdu_CN_2c\b/g, 'EC2');
    str = str.replace(/\bisEdu_CN_3c\b/g, 'EC3');
    
    str = str.replace(/\bisEdu_TW_A\b/g, 'ETA');
    str = str.replace(/\bisEdu_TW_B\b/g, 'ETB');
    
    str = str.replace(/\bisEdu_HK\b/g, 'EH');
    
    str = str.replace(/\bisEdu\b/g, 'E');
    
    str = str.replace(/\bisSimp\b/g, 'S');
    
    str = str.replace(/\bisTrad\b/g, 'T');
    str = str.replace(/\bisComp\b/g, 'Cp');
    
    str = str.replace(/true/g, '1');
    
    str = str.replace(/rel/g, 'r');
    str = str.replace(/"r":\[\]\,/g, '');
    
    return str;
}