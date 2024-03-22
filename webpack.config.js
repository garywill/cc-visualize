"use strict";
const _ = require('lodash');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

// const CopyPlugin = require("copy-webpack-plugin");



let config = { };
let config_common = {
    // stats: 'verbose', 
    mode: 'development', 
    devtool: "source-map", 
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
        ],
    } 
};


let config_webtool = {
    target: 'web', 
    output: { path: path.resolve(__dirname, 'dist-webtool'), filename: '[name].bundle.js' },
    entry: {
        'index' : [ './js_web/welcome.js'], 
    },
};
let config_vccrlib = {
    target: 'node', 
    output: { path: path.resolve(__dirname, 'dist-vccrlib'), filename: '[name].bundle.js' },
    entry: {
        'vccrlib' :[ './vccrlib/vccrlib.js'], 
    },
};


config_webtool = _.cloneDeep({...config_common, ...config_webtool } ) ;
config_vccrlib =  _.cloneDeep({...config_common, ...config_vccrlib });

let plugin_gui_html =  new HtmlWebpackPlugin({
    template: 'index.html',
    filename: 'index.html',
    chunks: ['index'],
    // minify: { collapseWhitespace: true },
    // meta: { viewport: 'width=device-width, initial-scale=1.0' },
    // attributes: { 'meta': 'viewport' },
    inject: 'head',
    chunksSortMode: 'auto',
    files: {
        // css: ['src/style1.css', 'src/style2.css']
    },
});


    // new CopyPlugin({
    //     patterns: [
    //         {
    //             context: 'src/examples/', 
    //             from: '**/*', 
    //             to: 'examples/[path][name][ext]', 
    //         }
    //     ], 
    // }), 


config_webtool.plugins.push(_.cloneDeep(plugin_gui_html));


config_webtool.plugins.push(new webpack.DefinePlugin({ buildtarget: JSON.stringify('webtool') }));
config_vccrlib.plugins.push(new webpack.DefinePlugin({ buildtarget: JSON.stringify('vccrlib') }));


let externals_vccrlib = {
    fs: 'require("fs")',
    // path: 'require("path")',
    // 你可以根据你的需求添加更多的内置模块
};
config_vccrlib.externals = _.cloneDeep(externals_vccrlib);

// config = {
//     // module: {
//     //     rules: [
//     //         { test: /\.scss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] }, 
//     //         { test: /\.css$/i, use: ['style-loader', 'css-loader'] }, 
//     //     ]
//     // },
// };



console.log(config_vccrlib);
console.log(config_webtool);

module.exports = [
    config_vccrlib,
    config_webtool, 
];;


