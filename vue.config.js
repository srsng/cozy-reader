const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: ['node_modules/(?!es5-ext)'],
    outputDir: 'dist',
    publicPath: './',
})
