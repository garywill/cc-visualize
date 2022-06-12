# 全文每个汉字关联字可视化

使用：Web tool。直接打开 https://garywill.github.io/cc-visualize/

本工具施工中，在alpha试用阶段

## 作用

1. 学习汉字繁简关系、异体字。一眼看清一对多或多对多组合

2. 分辨网上泛滥的，机器简转繁造成的，大量“文献”所含有的大量错字

3. 找出大段文本中的不寻常字符：仅日本用的简化版汉字、兼容区汉字符、非中非英的其他语言符号等、扩展区的汉字（少用字）
  > Unicode的坑，汉字也有类似punycode attack的问题

## 截图预览

![Screenshot](https://repository-images.githubusercontent.com/395479775/5b0eff04-c615-4b80-bc87-091443360351)

![Screenshot](Screenshot.png)

颜色含意：

- 绿色：既是繁体也是简体
- 蓝色：繁体
- 黄色：简体
  > 受某一边数据可能遗漏的影响，被标作简体的字，不一定仅是简体字。（按理说，繁体亦然）
- 红色：不寻常字符


## 原理

汉字、字符关系数据来源：

- [OpenCC](https://github.com/BYVoid/OpenCC)（Open Chinese Convert）

- [Unicode Character Database (UCD)](https://www.unicode.org/ucd/) （及其子集Unihan）

- 可以再加....

### OpenCC

OpenCC含有中文繁简关系、日本用字与中文汉字关系

下例相当于把openCC的`STCharacters.txt`和`TSCharacters.txt`合并了

```json
"干": { "rel": [ "幹", "乾", "榦" ], "isSimp": true, "isTrad": true },
"幹": { "rel": [ "干", "乾", "榦" ], "isTrad": true },
"乾": { "rel": [ "干", "幹", "榦" ], "isTrad": true, "isSimp": true },
"榦": { "rel": [ "干", "幹", "乾" ], "isTrad": true },
```

`干幹乾榦`：`干`和`乾`既是简体也是繁体，`幹`和`榦`仅是繁体。以上储存在`opencc.map`

又，例如，`发發髮発髪`：中文繁简字皆互相关联，日本变体可关联到中文繁简字，但从中文字不需要关联到日本字。（这里又相当于把openCC的`HKVariants.txt`、`TWVariants.txt`、`JPVariants.txt`也合并了进来，期间排除了不必要的变体关联）

```json
"发": { "rel": [ "發", "髮" ], "isSimp": true },
"發": { "rel": [ "发", "髮" ], "isTrad": true },
"髮": { "rel": [ "发", "發" ], "isTrad": true },
"発": { "rel": [ "發", "发", "髮" ], "isVari_JP": true },
"髪": { "rel": [ "髮", "发", "發" ], "isVari_JP": true },
```

以上储存在`opencc.map2`

另外又有`opencc.map3`，关联更多，从中华字也能够找到日本字。

### Unicode Character Database (UCD)

UCD提供txt（文件数量多）和[xml](https://www.unicode.org/Public/15.0.0/ucdxml/)（单个大文件）两种数据格式。

含有任意字符所属语言区块、每个区块的码的范围。含有正常汉字字符（CJK统一表意字符区）与康熙部首区、兼容表意字符区。还有繁简、Z变体、语义变体、特殊主义变体之间的关系。还有每个字的提交者是来自哪个国家的研究组

下载了xml并进行缩小，删除不需要的信息。然后生成JSON格式的汉字关联表

采用的UCD参数
- kSimplifiedVariant 这个字对应的简体字
- kTraditionalVariant 这个字对应的繁体字
- kCompatibilityVariant 这个兼容区字对应的统一区字
- kZVariant 相同字被多次编码（因为错误，或来源不同）

然后生成`unicode_data.map`（仅繁简关系）和`unicode_data.map2`。例如
```json
"壮":{"rel":["壯","𡉟"],"isSimp":true,"isTrad":true},
"壯":{"rel":["壮","𡉟"],"isTrad":true},
"壮":{"rel":["壮","壯","𡉟"],"isComp":true},
"𡉟":{"rel":["壮","壯"]},

"並":{"rel":["併","倂","并"],"isTrad":true},
"併":{"rel":["並","倂","并"],"isTrad":true},
"倂":{"rel":["並","併","并"]},
"并":{"rel":["並","併","倂"],"isSimp":true,"isTrad":true},
"倂":{"rel":["並","併","倂","并"],"isComp":true},
"並":{"rel":["並","併","倂","并"],"isComp":true},
```

其他未采用的UCD参数
- kSemanticVariant
- kSpecializedSemanticVariant
- kSpoofingVariant


### 总数据

结合`opencc.map2`及`uncode_data.map2`生成总数据表使用

## 同类其他工具和数据资料

其他的能够查到汉字变体和关联关系的工具

- [Unicode Utilities: Character Properties](https://util.unicode.org/UnicodeJsps/character.jsp)
- [Unicode Utilities: Confusables](https://util.unicode.org/UnicodeJsps/confusables.jsp)
- [Unihan Data](http://www.unicode.org/cgi-bin/GetUnihanData.pl)
- [Unicopedia Plus](https://github.com/tonton-pixel/unicopedia-plus)
- [Unicopedia Sinca](https://github.com/tonton-pixel/unicopedia-sinica)
- [字嗨](https://zi-hi.com/sp/uni/)

## 其他

1. [**大术专搜**](https://github.com/garywill/BigSearch/blob/master/src/README_zh.md)（一个搜索、查询工具）中收集的汉语工具部分
2. [收集的汉字资源、字体、阅读器 等](https://gitlab.com/garywill/cc-resources/-/releases)
