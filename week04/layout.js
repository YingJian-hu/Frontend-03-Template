function getStyle(element) {
    //  这里用style是因为方便，正常情况下style属性有行内属性“style”，不能重名
    if(!element.style) {
        element.style = {}
    }

    //  将属性进行预处理成 健 => 值 的格式，带px的全都转为number
    for (const prop in element.computedStyle) {
        element.style[prop] = element.computedStyle[prop].value;

        if(element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
        if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }

    return element.style;
}

function layout(element) {
    if(!element.computedStyle || Object.getOwnPropertyNames(element.computedStyle).length === 0)
        return;


    //  对style做预处理
    let elementStyle = getStyle(element);

    //  toy-browser只实现flex布局
    if(elementStyle.display != 'flex') 
        return;

    //  取出所有非文本元素
    let items = element.children.filter(item => item.type === 'element');

    //  支持order属性
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    let style = elementStyle;

    //  处理width,height的默认值
    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })

    //  处理flex布局属性默认值
    //  主轴方向
    if(!style.flexDirection || style.flexDirection === 'auto') 
        style.flexDirection = 'row';

    //  flex子项在flex容器的当前行的侧轴上的对齐方式
    if(!style.alignItems || style.alignItems === 'auto') 
        style.alignItems = 'stretch';

    //  弹性盒子元素在当前主轴方向上的对齐方式
    if(!style.justifyContent || style.justifyContent === 'auto')
        style.justifyContent = 'flex-start';
    
    //  flex容器可否换行
    if(!style.flexWrap || style.flexWrap === 'auto')
        style.flexWrap = 'nowrap';

    //  弹性盒子元素在当前交叉轴方向上的对齐方式
    if(!style.alignContent || style.alignContent === 'auto')
        style.alignContent = 'stretch';

    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;
    if(style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right'
    }
    if(style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right'
    }
    //  反向换行
    if(style.flexWrap === 'wrap-reverse') {
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else {
        crossBase = 0;
        crossSign = 1;
    }

    let isAutoMainSize = false;
    //  若主轴没有设置尺寸，则由子元素撑开空间
    if(!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemStyle = getStyle(item);
            if(itemStyle[mainSize] !== null && itemStyle[mainSize] !== (void 0)) 
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
        }
        isAutoMainSize = true;
    }

    //  将元素收进行
    let flexLine = [];
    let flexLines = [flexLine];
    
    //  声明剩余空间
    let mainSpace = elementStyle[mainSize];
    let crossSpace = 0;

    //  分行算法
    for(let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }

        //  若元素可收缩则直接入行
        if(itemStyle.flex) {
            flexLine.push(item);
        } 
        else if(itemStyle.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
        } 
        //  换行情况
        else {
            //  若子元素主轴尺寸大于父元素，则与父元素持平
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }

            //  若剩余空间不足够放当前元素
            if(mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }

            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            mainSpace -= itemStyle[mainSize];
        }
    }
    
    flexLine.mainSpace = mainSpace;
    flexLine.crossSpace = crossSpace;

    //  计算主轴
    //  单行情况，即flexWrap: nowrap，mainSpace < itemStyle[mainSize]，这里父元素装不下子元素，需要子元素作等比压缩
    if(mainSpace < 0) {
        let scale = style[mainSize] / (style[mainSize - mainSpace]);
        let currentMain = mainBase;
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemStyle = getStyle(item);

            //  带flex属性的元素尺寸为0
            if(itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    } else {
        flexLines.forEach((items) => {
            let flexTotal = 0;
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemStyle = getStyle(item);
                if(itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += 1;
                    continue;
                }
            }
            
            //  有flex元素时永远会沾满整个行
            if(flexTotal > 0) {
                let currentMain = mainBase;
                for(let i = 0; i < items.length; i++) {
                    let item = items[i];
                    let itemStyle = getStyle(item);

                    //  flex元素大小，根据剩余空间，按flex比例平分
                    if(itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }

                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            } else {
                //  没有flex属性元素的剩余空间，需要根据justify-content的规则去分配
                let currentMain;
                let step;
                if(style.justifyContent === 'flex-start') {
                    currentMain = mainBase;
                    step = 0;
                }
                if(style.justifyContent === 'flex-end') {
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                }
                if(style.justifyContent === 'center') {
                    currentMain = mainSpace / 2 * mainSign + mainBase;
                    step = 0
                }
                if(style.justifyContent === 'space-bettween') {
                    //  所有元素的间隔
                    step = mainSpace / (item.length - 1) * mainSign;
                    currentMain = mainBase
                }
                if(style.justifyContent === 'space-around') {
                    //  前后也有间隔
                    step = mainSpace / item.length * mainSign;
                    currentMain = step / 2 + mainBase;
                }
                for(let i = 0; i < items.length; i++) {
                    let item = items[i];
                    let itemStyle = getStyle(item);
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }

    //  计算交叉轴
    //  剩余行高
    if(!style[crossSize]) {
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for(let i = 0; i < flexLines.length; i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
        }
    } else {
        crossSpace = style[crossSize];
        for(let i = 0; i < flexLines.length; i++) {
            crossSpace -= flexLines[i].crossSpace;
        }
    }

    if(style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    }else {
        crossBase = 0;
    }

    // let lineSize = crossSpace / flexLines.length;

    let step;
    if(style.alignContent === 'flex-start') {
        crossBase += 0;
        step = 0;
    }
    if(style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if(style.alignContent === 'center') {
        crossBase += crossSign * (crossSpace / 2);
        step = 0;
    }
    if(style.alignContent === 'space-bettween') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if(style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length);
        crossBase += crossSign * (step / 2);
    }
    if(style.alignContent === 'stretch') {
        crossBase += 0;
        step = 0;
    }
    flexLines.forEach((items) => {
        //  计算当前行真实的交叉轴尺寸
        let lineCrossSize = style.alignContent === 'stretch' ?
            items.crossSpace + crossSpace / flexLines.length :
            items.crossSpace;
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemStyle = getStyle(item);
            let align = itemStyle.alignSelf || style.alignItems;

            if(itemStyle[crossSize] === null || itemStyle[crossSize] === (void 0)) {
                itemStyle[crossSize] = (align === 'stretch') ?
                    lineCrossSize : 0;
            }

            if(align === 'flex-start') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + itemStyle[crossSize];
            }
            if(align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            }
            if(align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? lineCrossSize : 0)
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
            }
        }
        crossBase += crossSign * (lineCrossSize + step);
    })
}

module.exports = layout;