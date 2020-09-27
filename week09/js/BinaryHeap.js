class BinaryHeap {
    constructor(data, compare) {
        this.data = data.slice();
        this.compare = compare || ((a, b) => a - b);
    }
    take() {
        if(!this.data.length) {
            return;
        }
        let min = this.data[0];
        let i = 0;

        while(i < this.data.length) {
            //  左右子节点的坐标分别为：2k + 1、2k + 2
            if(i * 2 + 1 >= this.data.length) {
                break;
            }
            if(i * 2 + 2 >= this.data.length) {
                this.data[i] = this.data[i * 2 + 1];
                i = i * 2 + 1;
                break;
            }

            //  上浮节点，上浮子节点中最小的一个
            //  这里是通过移除最后一个节点，改变第一个节点索引对应的值的方式来上浮节点
            if(this.compare(this.data[i * 2 + 1], this.data[i * 2 + 2]) < 0) {
                this.data[i] = this.data[i * 2 + 1];
                i = i * 2 + 1
            }else {
                this.data[i] = this.data[i * 2 + 2];
                i = i * 2 + 2;
            }
        }
        
        if(i < this.data.length - 1) {
            this.insertAt(i, this.data.pop())
        }else {
            this.data.pop();
        }

        return min;
    }
    insertAt(i, v) {
        this.data[i] = v;

        //  最小堆，插入后，若当前节点值比父节点值小，则上浮到父节点位置，依次类推直到堆顶
        while(i > 0 && this.compare(v, this.data[Math.floor((i-1) / 2)]) < 0) {
            this.data[i] = this.data[Math.floor((i - 1) / 2)];
            this.data[Math.floor((i - 1) / 2)] = v;

            //  当期节点下标k，其父节点的下标为 (k - 1) / 2
            i = Math.floor((i - 1) / 2);
        }
    }
    insert(v) {
        this.insertAt(this.data.length, v);
    }
    get length() {
        return this.data.length;
    }
}