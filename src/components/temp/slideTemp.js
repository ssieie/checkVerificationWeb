export const loadTemp = () => {

    const template = document.createElement('template')

    template.innerHTML = `
    <style>
    .container {
    }
  </style>

  <div class="container">
  slideMode
  </div>
    `

    return template
}