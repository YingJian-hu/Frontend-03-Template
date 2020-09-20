学习笔记
这周主要学习的是tictactoe游戏实现以及async异步编程，以下是我这周的总结

### tictactoe要点

#### 用一个可交替的变量来实现下棋双方
用可交替的变量来实现下棋双方，如“白棋”为1，“黑棋”为2，就可以通过3 - X，来相互置换下棋方
```
partten[x * 3 + y] = flag;
flag = 3 - flag;
```

#### 胜负判断
胜负判断有4种情况，哪种棋子率先完成下面四种情况判胜，否则平
+ 横3颗
+ 竖3颗
+ 左上到右下3颗
+ 右上到左下3颗

#### AI设计
用递归回溯的算法来实现AI操作，自己每走一步棋后，AI判断对手棋的下一步的最优解，从而得到自己的最优解，递归调用，算出每一步的最优解，然后返回。这里因为是3 X 3的棋盘，可以进行全数据遍历，如果棋盘是围棋，五子棋则不可，需要有一个预估值，在递归计算到一定深度之后，去预估最有利的下一步，没法精确到最好的下一部，不过在tictactoe中可以实现到保持和棋。
```
function bestChoice(partten, flag) {
    let point = willWin(partten, flag);
    if(point) {
        return {
            point: point,
            result: 1
        }
    }

    let result = -1;
    outer:for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            if(partten[i * 3 + j] !== 0)
                continue;
            let tmp = clone(partten);
            tmp[i * 3 + j] = flag;
            let opp = bestChoice(tmp, 3 - flag);

            //  若我方最好情况好于现在情况，则进行覆盖
            if(-opp.result >= result) {
                point = [j, i];
                result = -opp.result;
            }
            //  剪枝
            if(result == 1) {
                break outer;
            }
        }
    }

    return {
        point: point,
        result: point ? result : 0
    }
}
```

### 异步编程要点

编程方式：
+ callback 编程简单，会有回调地狱
+ Promise
+ async 对promise进行包装
+ generator 一种async未成形式的一种形式