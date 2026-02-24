const path = require('path')
const {initWebpackConfig} = require('@stellar-expert/webpack-template')
const pkgInfo = require('./package.json')

module.exports = initWebpackConfig({
    entries: {
        'app': {
            import: './views/app.js',
            htmlTemplate: './template/index.html'
        }
    },
    outputPath: path.join(__dirname, './public/'),
    staticFilesPath:'./static/',
    scss: {
        additionalData: '@import "~@stellar-expert/ui-framework/basic-styles/variables.scss";',
        sassOptions: {
            quietDeps: true,
            silenceDeprecations: ['import']
        }
    },
    define: {
        appVersion: pkgInfo.version,
        orchestratorApiOrigin: process.env.ORCHESTRATOR_ORIGIN || process.env.apiOrigin || 'https://orchestrator.reflector.network/',
        daoContractId: process.env.DAO_CONTRACTID || 'CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE',
        daoAdmin: process.env.DAO_ADMIN || 'GDSRHC7U5XWNGHDML6SBU7HXLH67ILO7PCCCFMN55PPBYYCZEAU4FXRF'
    },
    devServer: {
        host: '0.0.0.0',
        server: 'http',
        port: 9003
    }
})