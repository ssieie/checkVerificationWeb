const path = require('path');

module.exports = {
    entry: './src/components/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
}