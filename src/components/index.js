import {loadTemp} from "./temp/temp.js";
import zTextClickMode from "./textClick.js";
import zSlideMode from "./slide.js";
import zRotateMode from "./rotate.js";

class zRobotCalibration extends HTMLElement {

    constructor() {
        super();

        this.modeIsOpen = false

        this.modeValidData = {
            text: [],
            rotate: null,
            slide: null
        }

        this.validDataMap = {
            'text': 'points',
            'slide': 'xxx',
            'rotate': 'xxx'
        }

        this.proxyModeData()

        this._shadowRoot = this.attachShadow({mode: 'closed'});
        this._shadowRoot.appendChild(loadTemp().content.cloneNode(true))

        this.$container = this._shadowRoot.querySelector('.container')

        this.$containerChild = {
            icon: this._shadowRoot.querySelector('.container>.shield-icon'),
            desc: this._shadowRoot.querySelector('.container>.valid-desc'),
            verifyingIcon: this._shadowRoot.querySelector('.container>.verifying-icon'),
            verifying: this._shadowRoot.querySelector('.container>.verifying')
        }

        this.$passiveMode = this._shadowRoot.querySelector('.mode-wrapper-append-to-body')
        this.$passiveModeSlot = this._shadowRoot.querySelector('.mode-wrapper-append-to-body>.mode-slot')
        this.$passiveModePanel = {
            close: this._shadowRoot.querySelector('.mode-wrapper-append-to-body>.mode-panel>.btns>.close'),
            refresh: this._shadowRoot.querySelector('.mode-wrapper-append-to-body>.mode-panel>.btns>.refresh'),
            confirm: this._shadowRoot.querySelector('.mode-wrapper-append-to-body>.mode-panel>.confirm-btn')
        }

        this.$blockMode = this._shadowRoot.querySelector('.mode-wrapper-append-to-container')
        this.$blockModeChild = {
            loadingMask: this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.loading-mask'),
            arrowT: this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.pos-arrow-t'),
            arrowB: this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.pos-arrow-b')
        }
        this.$blockModePanel = {
            close: this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.mode-panel>.btns>.close'),
            refresh: this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.mode-panel>.btns>.refresh'),
            confirm: this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.mode-panel>.confirm-btn')
        }
        this.$blockModeSlot = this._shadowRoot.querySelector('.mode-wrapper-append-to-container>.mode-slot')

        this.$container.addEventListener('click', () => {
            if (!this.modeIsOpen) {
                this.blockModeController().computedPos()
                this.blockModeController().show()
                this.createMode()

                if (this.modeData[this.mode]) {
                    this.modeData[this.mode] = this.modeData[this.mode]
                } else {
                    this.networkFunc().getData().then(({type, data}) => {
                        this.modeData[type] = data
                    })
                }

            } else {
                this.blockModeController().hide()
            }
            this.modeIsOpen = !this.modeIsOpen
        }, false);

        this.blockModePanelEvent()
        this.passiveModePanelEvent()
    }

    // 验证模式
    get mode() {
        return this.getAttribute('mode')
    }

    set mode(val) {
        const validMode = (val) => {
            let isLegal = ['slide', 'text', 'rotate'].includes(val)
            val = isLegal ? val : 'text'
            if (!isLegal) console.warn('property mode can only be "slide" | "text" | "rotate"')
            return val
        }

        this.setAttribute('mode', validMode(val))
    }

    // 触发模式
    get trigger() {
        return this.validTrigger(this.getAttribute('trigger'))
    }

    set trigger(val) {
        this.setAttribute('trigger', this.validTrigger(val))
    }

    validTrigger(val) {
        let isLegal = ['block', 'passive'].includes(val)
        val = isLegal ? val : 'block'
        if (!isLegal) console.warn('property trigger can only be "block" or "passive"')
        return val
    }

    // 自定义样式
    get customStyle() {
        return JSON.parse(this.getAttribute('custom-style'))
    }

    set customStyle(val) {
        this.setAttribute('custom-style', JSON.stringify(val))
    }

    // 是否打开
    get open() {
        return this.getAttribute('open')
    }

    set open(val) {
        if (![false, true].includes(val)) {
            console.warn('property open type can only be boolean')
            val = false
        }
        this.setAttribute('open', val)
    }

    static get observedAttributes() {
        return ['mode', 'trigger', 'custom-style', 'open']
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.propertyChangeMonitor(name, oldVal, newVal)
        this.render()
    }

    render() {
        this.customStyleRender()
    }

    customStyleRender() {
        if (this.customStyle) {
            for (const key in this.customStyle) {
                this.$container.style[key] = this.customStyle[key]
            }
        }
    }

    // 属性改变的自定义分发监听
    propertyChangeMonitor(name, oldVal, newVal) {
        switch (name) {
            case 'open':
                if (['true'].includes(newVal) && ['passive'].includes(this.trigger)) {

                    this.modeIsOpen = true
                    this.passiveModeController().show()
                    this.createMode()
                }
                break
            case 'test':

                break
        }
    }

    // 创建插入body的验证组件
    createMode() {
        switch (this.trigger) {
            case 'block':
                this.createAppointMode(this.$blockModeSlot)
                break
            case 'passive':
                this.createAppointMode(this.$passiveModeSlot)
                break
        }
    }

    // 创建插入body指定类型的验证组件
    createAppointMode(pDom) {
        switch (this.mode) {
            case 'slide':
                break
            case 'text':
                const textDom = document.createElement('z-text-click-mode')
                textDom.setAttribute('trigger', this.trigger)
                textDom.setAttribute('points', JSON.stringify(this.modeValidData.text))
                pDom.appendChild(textDom)
                break
            case 'rotate':
                break
        }
    }


    passiveModeController() {
        return {
            hide: () => {
                this.$passiveMode.style.zIndex = '-99999';
                this.$passiveMode.style.opacity = '0';

                this.$passiveModeSlot.innerHTML = ''
            },
            show: () => {
                this.$passiveMode.style.zIndex = '99999';
                this.$passiveMode.style.opacity = '1';
            },
        }
    }

    blockModeController() {
        return {
            hide: () => {
                this.$blockMode.style.zIndex = '-99999';
                this.$blockMode.style.opacity = '0';
                this.$blockMode.style.transform = 'scale(0)';

                this.$containerChild.icon.style.opacity = '1'
                this.$containerChild.desc.style.opacity = '1'
                this.$containerChild.verifying.style.opacity = '0'
                this.$containerChild.verifyingIcon.style.opacity = '0'

                this.$blockModeSlot.innerHTML = ''
            },
            show: () => {
                this.$blockMode.style.zIndex = '99999';
                this.$blockMode.style.opacity = '1';
                this.$blockMode.style.transform = 'scale(1)';

                this.$containerChild.icon.style.opacity = '0'
                this.$containerChild.desc.style.opacity = '0'
                this.$containerChild.verifyingIcon.style.opacity = '1'
                this.$containerChild.verifying.style.opacity = '1'
            },
            computedPos: () => {
                if (this.$container.offsetTop > (this.$blockMode.offsetHeight + 20)) {
                    this.$blockMode.style.top = this.$container.offsetTop - this.$blockMode.offsetHeight - 10 + 'px'
                    this.$blockModeChild.arrowT.style.opacity = '0'
                    this.$blockModeChild.arrowB.style.opacity = '1'
                } else {
                    this.$blockModeChild.arrowT.style.opacity = '1'
                    this.$blockModeChild.arrowB.style.opacity = '0'
                    this.$blockMode.style.top = this.$container.offsetTop + this.$container.offsetHeight + 10 + 'px'
                }
                this.$blockMode.style.left = this.$container.offsetWidth / 2 + this.$container.offsetLeft - this.$blockMode.offsetWidth / 2 + 'px'
            },
        }
    }

    blockModePanelEvent() {
        this.$blockModePanel.close.addEventListener('click', () => {
            this.blockModeController().hide()
            this.modeIsOpen = false
        }, false)
        this.$blockModePanel.refresh.addEventListener('click', () => {
            if (this.loadingFlag.refresh) return
            this.networkFunc().getData(true).then(({type, data}) => {
                this.modeData[type] = data
            })
        }, false)
        this.$blockModePanel.confirm.addEventListener('click', () => {
            if (this.loadingFlag.confirm) return

            const validData = JSON.parse(this.$blockModeSlot.lastChild.getAttribute(this.validDataMap[this.mode]))
            console.log(validData)
            this.networkFunc().valid().then((res) => {
                console.log(res)
                // this.blockModeController().hide()
                // this.modeIsOpen = false

                this.dispatchEvent(
                    new CustomEvent('success', {
                        detail: {
                            success: true
                        },
                    })
                )
            })
        }, false)
    }

    passiveModePanelEvent() {
        this.$passiveModePanel.close.addEventListener('click', () => {
            this.passiveModeController().hide()
            this.modeIsOpen = false
        }, false)
    }

    connectedCallback() {
        let uuid = window.localStorage.getItem('Z_UUID')
        if (uuid) {
            this.Z_UUID = uuid
        } else {
            this.Z_UUID = this.toolFunc().uniqueKey()
            window.localStorage.setItem('Z_UUID', this.Z_UUID)
        }

        if (['passive'].includes(this.trigger)) {
            this.$container.style.display = 'none';
        } else {
            this.blockModeController().computedPos()

            // test
            this.blockModeController().computedPos()
            this.blockModeController().show()
            this.createMode()
            this.networkFunc().getData().then(({type, data}) => {
                this.modeData[type] = data
            })
            this.modeIsOpen = true
        }
    }

    networkFunc() {
        return {
            getData: (refresh = false) => {
                this.loadingFlag.mask = true
                if (refresh) this.loadingFlag.refresh = true
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({
                            type: 'text',
                            data: {
                                descImage: Math.floor(Math.random() * 100),
                                image: '3'
                            }
                        })
                        this.loadingFlag.mask = false
                        if (refresh) this.loadingFlag.refresh = false
                    }, 1000)
                })
            },
            valid: () => {
                this.loadingFlag.confirm = true
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.loadingFlag.confirm = false
                        resolve({success: false})
                    }, 2000)
                })
            }
        }
    }

    proxyModeData() {
        const _this = this
        // 给子组件的基本数据
        this.modeData = new Proxy({
            text: null,
            rotate: null,
            slide: null,
        }, {
            get(target, p, receiver) {
                return target[p]
            },
            set(target, p, newValue, receiver) {
                switch (_this.trigger) {
                    case 'block':
                        _this.$blockModeSlot.lastChild?.setAttribute('data', JSON.stringify(newValue))
                        break
                    case 'passive':
                        break
                }
                return Reflect.set(...arguments);
            }
        })

        this.loadingFlag = new Proxy({
            mask: false,
            refresh: false,
            confirm: false,
        }, {
            set(target, p, newValue, receiver) {
                switch (_this.trigger) {
                    case 'block':
                        switch (p) {
                            case 'mask':
                                _this.$blockModeChild.loadingMask.style.opacity = newValue ? '1' : '0'
                                _this.$blockModeChild.loadingMask.style.zIndex = newValue ? '1' : '-1'
                                break
                            case 'refresh':
                                newValue ? _this.$blockModePanel.refresh.classList.add('loading') : _this.$blockModePanel.refresh.classList.remove('loading')
                                break
                            case 'confirm':
                                newValue ? _this.$blockModePanel.confirm.classList.add('confirm-loading') : _this.$blockModePanel.confirm.classList.remove('confirm-loading')
                                break
                        }
                        break
                    case 'passive':
                        switch (p) {
                            case 'mask':
                                newValue ? _this.$passiveModeSlot.classList.add('loading') : _this.$passiveModeSlot.classList.remove('loading')
                                break
                            case 'refresh':
                                newValue ? _this.$passiveModePanel.refresh.classList.add('loading') : _this.$passiveModePanel.refresh.classList.remove('loading')
                                break
                            case 'confirm':
                                newValue ? _this.$passiveModePanel.confirm.classList.add('loading') : _this.$passiveModePanel.confirm.classList.remove('loading')
                                break
                        }
                        break
                }
                return Reflect.set(...arguments)
            }
        })
    }

    toolFunc() {
        return {
            uniqueKey: () => {
                let uuid = '', i, random
                for (i = 0; i < 32; i++) {
                    random = Math.random() * 16 | 0
                    if (i === 8 || i === 12 || i === 16 || i === 20) {
                        uuid += '-'
                    }
                    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
                        .toString(16)
                }
                return uuid
            }
        }
    }
}

window.customElements.define('z-text-click-mode', zTextClickMode)
window.customElements.define('z-slide-mode', zSlideMode)
window.customElements.define('z-rotate-mode', zRotateMode)
window.customElements.define('z-robot-calibration', zRobotCalibration)
