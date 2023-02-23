export const loadTemp = () => {

    const template = document.createElement('template')

    template.innerHTML = `
    <style>
    .text-container {
    width: 100%;
    height: 100%;
    }
    .text-container .tip {
    display: flex;
    align-items: center;
    height: 50px;
    background-color: #fff;
    padding: 0 16px;
    }
    .text-container .tip .desc span {
    color: blue;
    }
    .text-container .tip .desc-img {
    height: 100%;
    width: 150px;
    margin-left: 10px;
    }
    .text-container #textSelCanvas{
    width: 100%;
    height: calc(100% - 50px);
    background-color: #eeebd3;
    }
  </style>

  <div class="text-container">
      <div class="tip">
          <div class="desc">
            请在下图 <span>依次</span> 点击
          </div>
          <div class="desc-img"></div>
      </div>
      <canvas id="textSelCanvas"></canvas>
  </div>
    `

    return template
}