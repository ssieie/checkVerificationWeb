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
        this.lastPointRender = true
        this.$canvas.addEventListener('click', (event) => {
            // 获取事件目标的实际DOM节点
            const target = event.composedPath()[0];
            // 获取鼠标点击事件在元素内的x和y坐标
            const rect = target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const len = this.pointArrs.value.length

            if (len > 98) this.pointArrs.value = [];

            // 判断点是否重合
            const isCoincide = this.checkPointIsCoincide(this.pointArrs.value, x, y)
            if (isCoincide) {
                this.lastPointRender = false
                this.pointArrs.value = this.pointArrs.value.filter(v => v.index < isCoincide.index)
            } else {
                this.lastPointRender = true
                this.pointArrs.value = [...this.pointArrs.value, {
                    x, y,
                    index: this.pointArrs.value.length + 1
                }]
            }
        }, false)
    }

    drawPointToCanvas(pointArr) {
        this.canvasContext.clearRect(0, 0, this.$canvas.width, this.$canvas.height)
        const len = pointArr.length
        if (len) {
            for (let i = 0; i < len; i++) {
                const lastRender = i === len - 1 && this.lastPointRender
                this.drawPoint({x: pointArr[i].x, y: pointArr[i].y}, lastRender)

                this.drawText({x: pointArr[i].x, y: pointArr[i].y, index: pointArr[i].index}, lastRender)

            }
        }
    }

    checkPointIsCoincide(pointArr, x, y) {
        const len = pointArr.length
        if ([0].includes(len)) return false
        for (let i = 0; i < len; i++) {
            if (this.isPointInsideCircle(pointArr[i].x, pointArr[i].y, 18, x, y)) {
                return pointArr[i]
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

    drawPoint({x, y}, lastRender) {
        this.canvasContext.beginPath();

        if (lastRender) {
            let transparent = 0
            let renderPointTimer = setInterval(() => {
                // this.canvasContext.shadowBlur = transparent;
                // this.canvasContext.shadowColor = `rgba(0,0,0,${transparent / 10})`;
                this.canvasContext.arc(x, y, 18, 0, 2 * Math.PI);
                this.canvasContext.fillStyle = `rgba(255,255,255,${transparent / 10})`;
                this.canvasContext.fill();
                this.canvasContext.beginPath();
                this.canvasContext.shadowBlur = 0;
                this.canvasContext.shadowColor = "rgba(0,0,0,0)";
                this.canvasContext.arc(x, y, 15, 0, 2 * Math.PI);
                this.canvasContext.fillStyle = `rgba(83,159,254,${transparent / 10})`;
                this.canvasContext.fill();
                transparent++
                if (transparent === 11) {
                    clearInterval(renderPointTimer)
                    renderPointTimer = null
                }
            }, 30)
        } else {
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
    }

    drawText({x, y, index}, lastRender) {
        this.canvasContext.fillStyle = "#FFFFFF";
        this.canvasContext.font = "16px sans-serif"
        if (index > 9) {
            this.canvasContext.fillText(index, x - 10, y + 6)
        } else {
            this.canvasContext.fillText(index, x - 4, y + 6)
        }
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.propertyChangeMonitor(name, oldVal, newVal)
        this.render()
    }

    propertyChangeMonitor(name, oldVal, newVal) {
        switch (name) {
            case 'data':
                console.log(JSON.parse(newVal))
                this.pointArrs.value = [];
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
        this.pointArrs = new Proxy({
            value: []
        }, {
            set(target, p, newValue, receiver) {
                Reflect.set(...arguments);
                if (['value'].includes(p)) {
                    _this.drawPointToCanvas(newValue)
                    _this.points = newValue
                }
                return true
            }
        })
    }

}

export default zTextClickMode