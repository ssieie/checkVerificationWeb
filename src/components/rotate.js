import {loadTemp} from "./temp/rotateTemp.js";

class zRotateMode extends HTMLElement {
    constructor() {
        super();

        this._shadowRoot = this.attachShadow({mode: 'closed'});
        this._shadowRoot.appendChild(loadTemp().content.cloneNode(true))

        this.$container = this._shadowRoot.querySelector('.container')

    }

    // 验证模式
    get mode() {
        return this.getAttribute('mode')
    }

    set mode(val) {
        this.setAttribute('mode', val)
    }
    static get observedAttributes() {
        return ['mode']
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this.render()
    }

    render() {
    }



    connectedCallback() {
    }
}

export default zRotateMode