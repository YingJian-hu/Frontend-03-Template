class MapUi {
    constructor(selector = '#constructor') {
        this.map = localStorage['map'] ? JSON.parse(localStorage['map']) : Array(10000).fill(0);
        this.box = document.querySelector(selector);
        this.isMouseDown = false;
        this._initEvent();
        this._initDOM();
    }

    _initDOM() {
        const fragment = document.createDocumentFragment();
        for(let y = 0; y < 100; y++) {
            for(let x = 0; x < 100; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.backgroundColor = this.map[100 * y + x] === 1 ? 'black' : 'gray';
                cell.addEventListener('mousemove', () => {
                    this._drawCell(cell, x, y);
                })
                fragment.appendChild(cell);
            }
        }
        this.box.appendChild(fragment);
    }

    _initEvent() {
        document.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.isClear = (e.which === 3);
        })
        document.addEventListener('mouseup', () => this.isMouseDown = false);
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    _drawCell(cell, x, y) {
        if(this.isMouseDown) {
            if(this.isClear) {
                cell.style.backgroundColor = '';
                this.map[100 * y + x] = 0;
            }else {
                cell.style.backgroundColor = 'black';
                this.map[100 * y + x] = 1;
            }
        }
    }

    async findPath(start, end) {
        //  改为用栈存储则为深度优先搜索，广度优先搜索更适合于寻路算法
        //  启发式搜索更优于广度优先搜索，需要用一个可排序的数据结构来存储，每次弹出最小的距离的那个点，建议数据结构二叉堆
        const table = Object.create(this.map);
        const queue = new BinaryHeap([start], (a, b) => distance(a) - distance(b));

        const distance = (point) => {
            return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2;
        }

        const insert = async (x, y, pre) => {
            if(x < 0 || x >= 100 || y < 0 || y >= 100) {
                return;
            }
            if(table[y * 100 + x]) {
                return;
            }

            //  异步编程模拟广度优先算法的执行过程
            await this.sleep(5)
            this.box.children[y * 100 + x].style.backgroundColor = 'lightgreen';
            
            //  将向外搜索的点的前驱节点保存下来，最后画出所有的前驱节点即可得到路径
            table[y * 100 + x] = pre;
            queue.insert([x, y]);
        }

        while(queue.length) {
            let [x, y] = queue.take();

            //  寻路走完后，已最终节点为起点，根据前驱节点存储的map反查路径
            if(x === end[0] && y === end[1]) {
                //  存储返回的最终路径
                let path = [];

                while(x !== start[0] || y !== start[1]) {
                    path.push(this.map[y * 100 + x]);
                    [x, y] = table[y * 100 + x];
                    this.box.children[y * 100 + x].style.backgroundColor = 'purple';
                }

                return path;
            }
            
            //  寻找相邻节点
            await insert(x - 1, y, [x, y]);
            await insert(x, y - 1, [x, y]);
            await insert(x + 1, y, [x, y]);
            await insert(x, y + 1, [x, y]);

            await insert(x - 1, y - 1, [x, y]); 
            await insert(x - 1, y + 1, [x, y]); 
            await insert(x + 1, y - 1, [x, y]); 
            await insert(x + 1, y + 1, [x, y]); 
        }
    }

    async sleep(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        })
    }

    save() {
        localStorage['map'] = JSON.stringify(this.map);
    }
}