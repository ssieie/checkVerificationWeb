export const loadTemp = () => {

    const template = document.createElement('template')

    template.innerHTML = `
    <style>
    .container {
    }
  </style>

  <div class="container">
  rotateMode
  </div>
    `

    return template
}