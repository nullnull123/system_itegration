module.exports = {
  publicPath: './',
  assetsDir: 'static',
  productionSourceMap: false,
  /* 本地开发服务器配置 */
  devServer: {
    proxy: {
      /* 静态资源交给 Django 9988 */
      '/static': {
        target: 'http://127.0.0.1:9988',
        changeOrigin: true
      },
      '/api': {
        target: 'http://10.104.73.235:8000',
        // target: 'http://127.0.0.1:8000', 
        // target: 'http://10.102.133.224:8000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        timeout: 600000,
        proxyTimeout: 600000
      }

      /* 你之前若有其它接口需要代理，也可以继续写
      ,'/api': {
        target: 'http://127.0.0.1:9988',
        changeOrigin: true
      }
      */
    },
    disableHostCheck: true
  }
}