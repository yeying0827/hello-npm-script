#### 4.2使用livereload实现自动刷新

场景：重复低效的操作--刷新页面。

[LiveReload](https://www.npmjs.com/package/livereload)把这个过程自动化，但是在单页应用中刷新页面意味着客户端状态的全部丢失，社区又捣鼓出了[Hot Module Replacement，简称HMR](https://webpack.js.org/concepts/hot-module-replacement/)。

LiveReload是自动刷新技术的鼻祖，后续的HMR、HR等都是它的改良版。

在前端项目中接入LiveReload的详细步骤：

1. 安装依赖包

   ```shell
   npm i livereload http-server -D
   # npm install livereload http-server --save-dev
   # yarn add livereload http-server -D
   ```

2. 添加npm script

   方便启动LiveReload服务器和通过HTTP方式访问页面。

   ```json
   {
     "scripts": {
       "client": "npm-run-all client:*",
       "client:reload-server": "livereload client/",
       "client:static-server": "http-server client/"
     }
   }
   ```

   client命令同时启动livereload服务、静态文件服务。

   http-server启动的是静态文件服务器，该服务启动后可以通过http的方式访问文件系统上的文件。

   livereload启动了自动刷新服务，该服务负责监听文件系统的变化，并在文件系统变化时通知所有连接的客户端，在`client/index.html`中嵌入的那段js实际上是和livereload-server连接的一个livereload-client。

3. 在页面中嵌入livereload脚本

   ```html
   <body>
     <h2>
       LiveReload Demo
     </h2>
     <script>
       document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>');
     </script>
   </body>
   ```

   livereload支持在启动时自定义端口，如果使用了自定义端口，在页面中嵌入的这段js里面的`35729`也需要替换成对应的端口。

4. 启动服务并测试

   运行`npm run client`

   打开浏览器访问8080，接着修改client/main.css并保存，浏览器自动刷新。



**运行中出现问题：**

修改main.css并保存会刷新页面展示最新样式，如果接着改动html并保存，刷新页面后展示的页面样式是main.css修改之前的样式。



使用browser-sync

安装依赖包：

```shell
npm i browser-sync -D
```

修改npm script

```json
{
  "scripts": {
    "browser:client": "browser-sync start --server client/ --files \"**/*.css, **/*.html, **/*.js\""
  }
}
```

运行`npm run browser:client`

可以自动刷新页面。

