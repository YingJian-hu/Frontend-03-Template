学习笔记

这周主要学习了CSS里面的盒，正常流与flex的排版，CSS的颜色、绘制原理，CSS动画，BFC合并等内容，以下是我对这周学习内容的总结

#### 盒
是排版和渲染的基本单位，CSS选中的元素在排版时可能产生多个盒，CSS选中的元素不一定跟盒是一一对应的关系，也有可能是一对多的关系

+ 盒模型（box-sizing）
    + 标准盒模型（content-box）
    + 怪异合模型（content-weidth + padding + border）

#### 正常流
+ 正常流排版
    + 收集盒进行
    + 计算盒在行中的排布
    + 计算行的排布

放入图标，图表，文字等行内的盒称之为“行内级别盒（inline-level-box）”，如一些数据较多，高度叫大的元素需要插入，便单独让其占一行，，这类盒称为“块级盒（block-level-box）”，排行级的排布方式成为IFC（inline-level-formatting-ontext），排块级的排布方式成为BFC（block-level-formatting-ontext）

+ 行级排布
    + baseline：基线，行级排本会有一条基线，英文会以这条线来对齐，中文实际上也会以这条线来对齐，只是因为特殊的结构而发生一些偏移
    + text-top: 文字的顶部（根据字体大小来变的，以最大尺寸的字符为主）
    + text-bottom: 文字的底部（根据字体大小来变的，以最大尺寸的字符为主）
    + line-top：文字跟盒混排的时候会根据盒的基线排列所撑开
    + line-bottom：文字跟盒混排的时候会根据盒的基线排列所撑开

inline-block行内盒它的基线是根据里面文字来变化的，一般用vertical-align来对齐

+ 块级排布
    + float：
    + clear：启一块干净的区域进行浮动

在BFC中，如果出现都有margin的盒，会发生margin重叠，margin值会以最大的那个margin为主，margin重叠不会发生在IFC中。

+ Block
    + Block-Container: 里面有BFC的（能容纳正常流的盒：如block，inline-block，table-cell，flex item，grid cell，table-caption）
    + Block-level Box: 外面有BFC的（display: block, display: flex, display: table, display: grid, ）
    + Block-Box：Block-Container + Block-level Box，里外都有BFC

+ 创建BFC
    + floats（浮动元素）
    + 绝对定位的元素
    + block-cantainer
    + 属于Block-level Box，但是overflow属于不为visible

#### 动画

+ animation
    + animation-name: 动画的名称，这是一个 keyframes 类型的值
    + animation-duration: 动画的时长
    + animation-timing-function: 动画的时间曲线，（cubic-bezier接收一个回调函数来自定义曲线）
    + animation-delay: 动画开始前的延迟
    + animation-iteration-count: 动画的播放次数
    + animation-direction: 动画的方向

+ transition
    + transition-property: 要变换的属性
    + transition-duration: 变换的时长
    + transition-timing-function: 时间曲线，（cubic-bezier接收一个回调函数来自定义曲线）
    + transition-delay: 延迟

##### 贝塞尔曲线
它是一种插值曲线，它描述了两个点之间差值来形成连续的曲线形状的规则，最基本的情况，我们认为这个变化是按照时间均匀进行的，这个时候，我们称其为线性插值。而实际上，线性插值不大能满足我们的需要，因此数学上出现了很多其它的插值算法，其中贝塞尔插值法是非常典型的一种。它根据一些变换中的控制点来决定值与时间的关系。“三次贝塞尔插值”则是“两次‘二次贝塞尔插值’的结果，再做一次贝塞尔插值”

#### 颜色
+ RGB颜色：它符合光谱三原色理论：红、绿、蓝三种颜色的光可以构成所有的颜色，这跟人类的视神经系统相关，人类的视觉神经分别有对红、绿、蓝三种颜色敏感的类型
+ CMYK颜色：在印刷行业，使用的就是这样的三原色（品红、黄、青）来调配油墨，这种颜色的表示法叫做 CMYK，它用一个四元组来表示颜色。因为在印刷中，用红黄青来调配黑色成本过高，因此黑色单独指定
+ HSL颜色：由色相（H）。加上颜色的纯度（S）和明度（L）构成
+ RGBA颜色：Alpha 通道类似一种颜色值的保留字。在 CSS 中，Alpha 通道被用于透明度，所以我们的颜色表示被称作 RGBA，而不是 RGBO（Opacity）

#### 绘制
+ 几何图形
    + border
    + box-shadow
    + border-radius
+ 文字
    + font
    + text-decoration
+ 位图
    + background-image

底层是shader绘制

这些产生形状的属性非常有趣，我们也能看到很多利用它们来产生的 CSS 黑魔法。然而，这里我有一个相反的建议，我们仅仅把它们用于基本的用途，把 border 用于边框、把阴影用于阴影，把圆角用于圆角，所有其它的场景，都有一个更好的替代品：datauri+svg。
