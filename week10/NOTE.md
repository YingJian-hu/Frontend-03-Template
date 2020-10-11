学习笔记

这周学习了用LL算法构建AST，以下是我对这周学习的总结：

AST：抽象语法树（我们的代码在计算机分析过程中，首先会把编程语言进行分词，将这些词构成层层嵌套的语法树的树形结构，接下来才是对代码的解析）
LL算法：语法分析（构建抽象语法树的过程）的核心算法

四则运算分析
+ TokenNumber：0 1 2 3 4 5 6 7 8 9 的组合
+ Operator：+ - * /
+ Whitespace：<SP>
+ LineTerminator：<LF><CR>

四则运算的词法定义（产生式）
```
<Expression>::=
    <AdditiveExpression><EOF>
```
加法由左右两个乘法组成，并且可以进行连加，是一个重复自身的序列
```
<AdditiveExpression>::=
    <Number>
    |<MultiplicativeExpression><*><Number>
    |<MultiplicativeExpression></><Number>
    |<AdditiveExpression><+><MultiplicativeExpression>
    |<AdditiveExpression><-><MultiplicativeExpression>
```
将单独的数组认定为一种特殊的乘法，把只有一个乘号（* | /）认定为一个特殊的加法
```
<MultiplicativeExpression>::=
    <Number>
    |<MultiplicativeExpression><*><Number>
    |<MultiplicativeExpression><*><Number>
```

正则表达式分析
```
//  圆括号在正则里表示捕获，除了这个正则表达式整体表示的字符串，圆括号里的内容也会直接匹配出来，专为词法分析所准备
const regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
```

词法分析
利用新的javascript特性generator函数来输出一个序列

语法分析
每一个产生式对应我们的一个函数
```
function Expression(source) {
    // ...
}

//  注意在加法产生式中，需要先调用乘法产生式去处理Number
function AdditiveExpression(source) {
    //  ...
}

function MultiplicativeExpression(source) {
    //  ...
}
```

