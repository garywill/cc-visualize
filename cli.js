var fs = require('fs');

eval(fs.readFileSync('common.js').toString());
eval(fs.readFileSync('init.js').toString());

eval(fs.readFileSync("unicode-data/unicode-data-blocks.js").toString());
eval(fs.readFileSync("unicode-data/unicode-data-ages.js").toString());
eval(fs.readFileSync("ucd.js").toString());

eval(fs.readFileSync("summary-data/summary-data-map2.js").toString());

eval(fs.readFileSync("unusual_conditions.js").toString());
eval(fs.readFileSync("checkessay.js").toString());
