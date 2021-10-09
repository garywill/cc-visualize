# 汉字所有关联字可视化

也可以称为：

#### 全文汉字关联字关系可视化 / 全文繁简对应可视化工具 / 一简多繁检查器 / 汉字变体关系查看工具 /  汉文全文错字异体字人工检查器 / 汉字所有关联字检索表

首先，基于[OpenCC](https://github.com/BYVoid/OpenCC)的数据，创建了一个JSON格式的“汉字所有关联字检索表”。

例如`干幹乾榦`：`干`和`乾`既是简体也是繁体，`幹`和`榦`仅是繁体。（这里相当于把openCC的`STCharacters.txt`和`TSCharacters.txt`合并了）

```
"干": { "rel": [ "幹", "乾", "榦" ], "isSimp": true, "isTrad": true },
"幹": { "rel": [ "干", "乾", "榦" ], "isTrad": true },
"乾": { "rel": [ "干", "幹", "榦" ], "isTrad": true, "isSimp": true },
"榦": { "rel": [ "干", "幹", "乾" ], "isTrad": true },
```

又例如`发發髮発髪`中：中文繁简字皆互相关联，日本变体可关联到中文繁简字，但从中文字不需要关联到日本字。（这里又相当于把openCC的`HKVariants.txt`、`TWVariants.txt`、`JPVariants.txt`也合并了进来，期间排除了不必要的变体关联）

```
"发": { "rel": [ "發", "髮" ], "isSimp": true },
"發": { "rel": [ "发", "髮" ], "isTrad": true },
"髮": { "rel": [ "发", "發" ], "isTrad": true },
"発": { "rel": [ "發", "发", "髮" ], "isVari_JP": true },
"髪": { "rel": [ "髮", "发", "發" ], "isVari_JP": true },
```

## 全文每个汉字关联字可视化

颜色含意：

- 绿色：既是繁体也是简体

- 蓝色：繁体

- 黄色：简体
  
  > 受openCC有时某一边数据遗漏影响，被认作简体的字，不一定仅是简体字。（按理说，繁体亦然）

- 红色：非中华变体（日本）

![Screenshot](Screenshot.png)

目前只做了单字，没有做地区词语

## 其他相关

1. 其他工具推荐：可以快速在不同的词典中查字的工具：[大术专搜](https://acsearch.ga)（[主站](https://acsearch.ga) [备用站](http://acsearch.tk)）（[源代码](https://github.com/garywill/bigSearch)）
2. 收集的汉字资源、字体、阅读器 等：见[`resource`分支](https://github.com/garywill/cc-visualize/tree/resource)
