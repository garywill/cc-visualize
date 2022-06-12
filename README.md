# 全文每个汉字关联字可视化

使用：Web tool。直接打开 https://garywill.github.io/cc-visualize/

![Screenshot](Screenshot.png)

颜色含意：

- 绿色：既是繁体也是简体

- 蓝色：繁体

- 黄色：简体
  
  > 受某一边数据遗漏影响，被认作简体的字，不一定仅是简体字。（按理说，繁体亦然）

- 红色：非中华变体（日本），或其他不寻常字符

> 这个东西也可以称为：
> 全文汉字关联字关系可视化 / 全文繁简对应可视化工具 / 一简多繁检查器 / 汉字变体关系查看工具 /  汉文全文错字异体字人工检查器 / 汉字所有关联字检索表 / 全文非中华汉字误用检查器

## 背景

1. 学习汉字繁简关系、异体字和俗体字的辨与用，并想要一眼能够明白地看清一简多繁组合
2. 繁体字的文章转换成简体后有信息损失。然而，又有许多人用机器把简体转换成繁体，因原信息无法直接恢复，故内含错字。需要一个工具分辨错字，判断文章来源可靠程度
3. Unicode的坑，汉字也有类似punycode attack问题（施工中）

## 原理

汉字、字符关系数据来源：

- [OpenCC](https://github.com/BYVoid/OpenCC)（Open Chinese Convert）

- [Unicode Character Database (UCD)](https://www.unicode.org/ucd/) （施工中）

- 可以再加....

### openCC

含有中文繁简关系、日本用字与中文汉字关系

本工具创建了一个JSON格式的“汉字所有关联字检索表”。

这里相当于把openCC的`STCharacters.txt`和`TSCharacters.txt`合并了。例如

```
"干": { "rel": [ "幹", "乾", "榦" ], "isSimp": true, "isTrad": true },
"幹": { "rel": [ "干", "乾", "榦" ], "isTrad": true },
"乾": { "rel": [ "干", "幹", "榦" ], "isTrad": true, "isSimp": true },
"榦": { "rel": [ "干", "幹", "乾" ], "isTrad": true },
```

`干幹乾榦`：`干`和`乾`既是简体也是繁体，`幹`和`榦`仅是繁体。

以上储存在`opencc.map`

又例如`发發髮発髪`：中文繁简字皆互相关联，日本变体可关联到中文繁简字，但从中文字不需要关联到日本字。（这里又相当于把openCC的`HKVariants.txt`、`TWVariants.txt`、`JPVariants.txt`也合并了进来，期间排除了不必要的变体关联）

```
"发": { "rel": [ "發", "髮" ], "isSimp": true },
"發": { "rel": [ "发", "髮" ], "isTrad": true },
"髮": { "rel": [ "发", "發" ], "isTrad": true },
"発": { "rel": [ "發", "发", "髮" ], "isVari_JP": true },
"髪": { "rel": [ "髮", "发", "發" ], "isVari_JP": true },
```

<u>以上储存在`opencc.map2`，为目前GUI使用的表</u>。

另外有`opencc.map3`，从中华字能够找到日本字。

### Unicode Character Database (UCD)

施工中。

UCD提供txt（文件数量多）和[xml](https://www.unicode.org/Public/15.0.0/ucdxml/)（单个大文件）两种数据格式。


含有正常汉字字符（CJK统一表意字符区）与康熙部首区、兼容表意字符区、繁简、Z变体、语义变体、特殊主义变体之间的关系。还有每个字的提交者是来自哪个国家的研究组

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
