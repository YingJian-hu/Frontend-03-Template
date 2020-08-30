学习笔记
### 思考题：为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？（提交至 GitHub）
first-letter和first-line都只能与块级元素关联，但first-letter可以设置起float属性，但是first-line却不能，我认为是first-letter虽然只能与块级元素关联，但它关联的实际上是块级元素内第一个元素相对于在块级元素内的一个样式，因此第一个元素在它的父元素内可以设置浮动属性，但是first-line的作用是用于设置元素中的第一行文本的样式，而不论该行出现多少单词，也就是说，无论如何设置怎杨的样式，它都会作用于第一行，因此，它一直作用于第一行，无论是否有浮动属性，它只会作用于第一行内的样式。

这周主要学习了CSS总论，CSS规则与选择器的知识，一下是我对这周学习的总结：

CSS
+ at-rules
    + @charset（声明CSS的字符集）
    + @import（告诉CSS引擎包含外部CSS样式表）
    + @namespace（告诉CSS引擎所有的内容都必须考虑使用XML命名空间前缀）
    + @media（它能够对设备的类型进行一些判断）
    + @font-face（用于定义一种字体）
    + @page（用于分页媒体访问网页时的表现设置，一般用于打印）
    + @supports（检查环节的特性，由于本身的兼容性不是很好，不建议使用）
    + @keyframes（产生一种数据，用于定义动画关键帧）
    + @counter-style（产生一种数据，用于定义列表项的表现）
+ rules
    + Selector
        + selector_group
        + selector
            + “>” 选择器（第一层父子关系）
            + 空格选择器（父子关系）
            + “+” 选择器（紧跟在后面的相邻选择器）
            + “~” 选择器（当两个兄弟元素相同时，会一次循环查找）
        + simple_selector
            + 标签选择器
            + “*” 通用选择器
            + “#” ID选择器
            + “.” 类选择器
            + “[]” 属性选择器
            + “:” 伪类选择器
                + :any-link（匹配所有的超链接）
                + :link:visited（一旦匹配了link或visited就无法更改元素里文字颜色之外的属性了，会有安全性问题）
                + :hover
                + :active
                + :focus
                + :target
                + :empty（是否有子元素，不推荐使用，破坏了CSS元素计算时的元素收集的时机，在startTag收集时是还不知道自己子元素的）
                + :nth-child（里面支持一些简单的语法，匹配第几个子元素）
                + :nth-last-child（不推荐使用，同上）
                + :first-child :last-child :only-child（不推荐使用，同上）
                + :not
                + :where :has
                + “::” 伪元素选择器
                + “:not”：选择器
    + Declaration
        + Key
            + properties
            + variables 
                + --（一个声明，可用于属性，也可用于值）
        + Value
            + calc
            + number
            + length