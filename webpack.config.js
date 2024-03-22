"use strict";
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

const CopyPlugin = require("copy-webpack-plugin");



let config = { };
let config_common = {
    // stats: 'verbose', 
    mode: 'development', 
    // devtool: "source-map", 
    // devServer: { static: './dist-httpsc', hot: true, },    
    plugins: [
        // new webpack.DefinePlugin({ }), 
    ], 
    module: {
        rules: [
            {
                test: /\.js$/,  exclude: /node_modules/,
                use: {
                    loader: path.resolve(__dirname, 'preprocess-loader.js'), 
                    options: { type: "js", }
                },
            },
            {
                test: /\bdata\/.*\.json$/, 
                use: {
                    loader: path.resolve(__dirname, 'data-json-replace.js'), 
                },
            },
            {
                test: /\.scss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader']
            }, 
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }, 
        ]
    },  
};


let config_webtool = {
    target: 'web', 
    output: { path: path.resolve(__dirname, 'dist-webtool'), filename: '[name].bundle.js' },
    entry: {
        'vccrlib_web' :[ './vccrlib.js'], 
    },
};
let config_vccrlib = {
    target: 'node', 
    output: { 
        path: path.resolve(__dirname, 'dist-vccrlib'), filename: 'vccrlib.js' , 
        library: 'vccrlib', libraryTarget: 'umd', 
    },
    entry:'./vccrlib.js',
};





config_webtool = _.cloneDeep({...config_common, ...config_webtool } ) ;
config_vccrlib =  _.cloneDeep({...config_common, ...config_vccrlib });




let plugin_gui_html =  new HtmlWebpackPlugin({
    template: 'index.html',
    filename: 'index.html',
    chunks: ['vccrlib_web'],
    // minify: { collapseWhitespace: true },
    // meta: { viewport: 'width=device-width, initial-scale=1.0' },
    // attributes: { 'meta': 'viewport' },
    inject: 'head',
    chunksSortMode: 'auto',
    files: {
        // css: ['./style.css']
    },
});
config_webtool.plugins.push(_.cloneDeep(plugin_gui_html));

// let webtool_copy_plugin = new CopyPlugin({
//     patterns: [
//         {
//             context: '.', 
//             from: './js_web/**', 
//             to: '[path][name][ext]', 
//         }, 
//         {
//             context: '.', 
//             from: './style.css', 
//             to: '[path][name][ext]', 
//         }, 
//         
//     ], 
// }); 
// config_webtool.plugins.push(webtool_copy_plugin);

const json_copy_replacer = function (content, path) {
    let replacer = require('./data-json-replace.js');
    let newContent = replacer(content.toString());
    return Buffer.from(newContent);
};
let vccrlib_copy_plugin = new CopyPlugin({
    patterns: [
        {
            context: './data/unicode-data', 
            from : 'unicode-data-blocks.json', 
            to: '[path][name][ext]', 
            transform: json_copy_replacer, 
        }, 
        {
            context: './data/unicode-data', 
            from : 'unicode-data-ages.json', 
            to: '[path][name][ext]', 
            transform: json_copy_replacer, 
        }, 
        {
            context: './data/unicode-data', 
            from : 'unicode-data-Cc.json', 
            to: '[path][name][ext]', 
            transform: json_copy_replacer, 
        }, 
        {
            context: './data/unicode-data', 
            from : 'unicode-data-Mn.json', 
            to: '[path][name][ext]', 
            transform: json_copy_replacer, 
        }, 
        {
            context: './data/summary-data', 
            from : 'summary-data-map2.json', 
            to: '[path][name][ext]', 
            transform: json_copy_replacer, 
        }, 
    ], 
}); 
config_vccrlib.plugins.push(vccrlib_copy_plugin);



config_webtool.plugins.push(new webpack.DefinePlugin({ buildtarget: JSON.stringify('webtool') }));
config_vccrlib.plugins.push(new webpack.DefinePlugin({ buildtarget: JSON.stringify('vccrlib') }));



let externals_vccrlib = {
    './data/unicode-data/unicode-data-blocks.json': "./unicode-data-blocks.json", 
    './data/unicode-data/unicode-data-ages.json': "./unicode-data-ages.json", 
    './data/unicode-data/unicode-data-Cc.json': "./unicode-data-Cc.json", 
    './data/unicode-data/unicode-data-Mn.json': "./unicode-data-Mn.json", 
    './data/summary-data/summary-data-map2.json': "./summary-data-map2.json", 
};
config_vccrlib.externals = _.cloneDeep(externals_vccrlib);


switch (process.env.buildtarget) {
    case "vccrlib":
        copy_package_json_to_vccrlib();
        config = config_vccrlib; 
        break;
    case "webtool":
        config = config_webtool;
        break;
}

console.log(config);

module.exports = config;



function copy_package_json_to_vccrlib() {
    var read_str = fs.readFileSync(path.resolve(__dirname, 'package.json').toString() );
    var read_obj = JSON.parse(read_str)
    delete read_obj.devDependencies;
    fs.writeFileSync(path.resolve(__dirname, 'dist-vccrlib/package.json'), 
                     JSON.stringify(read_obj, null, 2)
    );
    
}

