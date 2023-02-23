import {loadTemp} from "./temp/textClickTemp.js";

class zTextClickMode extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({mode: 'closed'});
        this._shadowRoot.appendChild(loadTemp().content.cloneNode(true))

        this.$container = this._shadowRoot.querySelector('.text-container')

        this.$canvas = this._shadowRoot.querySelector('.text-container>#textSelCanvas')

        this.proxyModeData()
    }

    // 验证模式
    get trigger() {
        return this.getAttribute('trigger')
    }

    set trigger(val) {
        this.setAttribute('trigger', val)
    }

    get data() {
        return JSON.parse(this.getAttribute('data'))
    }

    set data(val) {
        this.setAttribute('data', JSON.stringify(val))
    }

    get points() {
        return JSON.parse(this.getAttribute('points'))
    }

    set points(val) {
        this.setAttribute('points', JSON.stringify(val))
    }

    static get observedAttributes() {
        return ['trigger', 'data', 'points']
    }

    initCanvas() {
        this.$canvas.width = this.$canvas.offsetWidth
        this.$canvas.height = this.$canvas.offsetHeight
        this.canvasContext = this.$canvas.getContext("2d");
        this.$canvas.addEventListener('click', (event) => {
            // 获取事件目标的实际DOM节点
            const target = event.composedPath()[0];
            // 获取鼠标点击事件在元素内的x和y坐标
            const rect = target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const len = this.pointArrs.length
            console.log(len)
            if (len > 98) this.pointArrs.length = 0;

            this.pointArrs.push({
                x, y,
                index: this.pointArrs.length + 1
            })
        }, false)
    }

    drawPointToCanvas() {
        // 判断点是否重合
        console.log(this.pointArrs)
        const isCoincide = this.checkPointIsCoincide()
        const len = this.pointArrs.length
        console.log('isCoincide', isCoincide)
        // console.log(this.pointArrs)
        if (isCoincide) {
            const saveP = this.pointArrs.filter(v => v.index < isCoincide.index)
            this.pointArrs.length = 0
            this.pointArrs.push(...saveP)

            // this.pointArrs.splice(isCoincide.index - 1, 999)
            return
        }
        if (len) {
            const {x, y, index} = this.pointArrs[len - 1]

            this.drawPoint({x, y})

            this.canvasContext.fillStyle = "#FFFFFF";
            this.canvasContext.font = "16px sans-serif"
            if (index > 9) {
                this.canvasContext.fillText(index, x - 10, y + 6)
            } else {
                this.canvasContext.fillText(index, x - 4, y + 6)
            }
        } else {
            this.canvasContext.clearRect(0, 0, this.$canvas.width, this.$canvas.height)
        }

    }

    checkPointIsCoincide() {
        const len = this.pointArrs.length
        if ([0, 1].includes(len)) return false
        const {x, y} = this.pointArrs[len - 1]
        for (let i = 0; i < len - 1; i++) {
            if (this.isPointInsideCircle(this.pointArrs[i].x, this.pointArrs[i].y, 18, x, y)) {
                return this.pointArrs[i]
            }
        }
        return false
    }

    isPointInsideCircle(xc, yc, r, xp, yp) {
        // 计算点到圆心的距离
        let distance = Math.sqrt(Math.pow(xp - xc, 2) + Math.pow(yp - yc, 2));
        // 判断点是否在圆内
        return distance <= r;
    }

    drawPoint({x, y}) {
        this.canvasContext.beginPath();

        this.canvasContext.shadowBlur = 10;
        this.canvasContext.shadowColor = "rgba(0,0,0)";
        this.canvasContext.arc(x, y, 18, 0, 2 * Math.PI);
        this.canvasContext.fillStyle = "#FFFFFF";
        this.canvasContext.fill();
        this.canvasContext.beginPath();
        this.canvasContext.shadowBlur = 0;
        this.canvasContext.shadowColor = "rgba(0,0,0,0)";
        this.canvasContext.arc(x, y, 15, 0, 2 * Math.PI);
        this.canvasContext.fillStyle = "#539FFE";
        this.canvasContext.fill();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.propertyChangeMonitor(name, oldVal, newVal)
        this.render()
    }

    propertyChangeMonitor(name, oldVal, newVal) {
        switch (name) {
            case 'data':
                console.log(JSON.parse(newVal))
                this.pointArrs.length = 0;
                break
        }
    }

    render() {
    }

    connectedCallback() {
        console.log(this.trigger)
        this.initCanvas()
    }

    disconnectedCallback() {
        console.log('disconnectedCallback')
    }

    proxyModeData() {
        const _this = this
        this.pointArrs = new Proxy([], {
            set(target, p, newValue, receiver) {
                target[p] = newValue;
                if (p === "length" && newValue === 0) {
                    target.splice(0, target.length); // 清空数组
                    _this.drawPointToCanvas()
                }
                _this.points = target
                if (!['length'].includes(p)) {
                    _this.drawPointToCanvas()
                }
                return true;
            }
        })
    }

}

export default zTextClickMode