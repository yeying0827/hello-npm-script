#### 3.1 实现npm script跨平台兼容

不是所有的shell命令都是跨平台兼容的，甚至各种常见的文件系统操作也是不兼容的。

简单粗暴：为两种平台各写一份npm script

```json
{
  "scripts": {
    "bash-script": "echo Hello $npm_package_name",
    "win-script": "echo Hello %npm_package_name%"
  }
}
```

优雅实现：利用社区中的小工具



##### ~文件系统操作的跨平台兼容

涉及的文件系统操作包括文件和目录的创建、移动、删除、复制等。为这些基本操作支持的跨平台兼容包：

* [rimraf](https://github.com/isaacs/rimraf)或[del-cli](https://www.npmjs.com/package/del-cli)，用于删除文件和目录，类似`rm -rf`的功能；
* [cpr](https://www.npmjs.com/package/cpr)，用于拷贝、复制文件和目录，类似`cp -r`的功能；
* [make-dir-cli](https://www.npmjs.com/package/make-dir-cli)，用于创建目录，类似`mkdir -p`的功能

使用步骤：

1. 添加开发依赖

   ```shell
   npm i rimraf cpr make-dir-cli -D
   # npm install rimraf cpr make-dir-cli --save-dev
   # yarn add rimraf cpr make-dir-cli -D
   ```

2. 改造涉及文件系统操作的npm script

   ```json
   {
     "scripts": {
       "cover:cleanup": "rimraf coverage && rimraf .nyc_output",
       "cover:archive": "make-dir coverage_archive/$npm_package_version && cpr coverage/* coverage_archive/$npm_package_version -o",
       "precover": "npm run cover:cleanup",
       "postcover": "npm-run-all cover:archive --parallel cover:serve cover:open"
     }
   }
   ```

   说明：

   * `rm -rf`直接替换为`rimraf`；
   * `mkdir -p`直接替换为`make-dir`；
   * `cpr`：默认不覆盖，需要显式传入`-o`配置项，并且参数必须严格遵从格式 `cpr <source> <destination> [options]`，即配置项放在最后面；
   * `cover:cleanup`从`postcover`挪到`precover`，规避`cpr`没归档完毕覆盖率报告就被清空的问题；



##### ~用cross-var引用变量

[cross-var](https://www.npmjs.com/package/cross-var)使用步骤：

1. 安装开发依赖

   ```shell
   npm i cross-var -D
   # npm install cross-var --save-dev
   # yarn add cross-var -D
   ```

2. 改写引用变量的npm script

   ```json
   {
     "scripts": {
       "cover:archive": "cross-var \"make-dir coverage_archive/$npm_package_version && cpr coverage/* coverage_archive/$npm_package_version -o\"",
       "cover:serve": "cross-var http-server coverage_archive/$npm_package_version -p $npm_package_config_port",
       "cover:open": "cross-var open-cli http://localhost:$npm_package_config_port"
     }
   }
   ```

   说明：

   * `cover:archive`包含了两条子命令，需要用引号把整个命令包起来（必须转义）
   * **cross-var**会安装babel，更轻量级可以使用[cross-var-no-babel](https://www.npmjs.com/package/cross-var-no-babel)



##### ~用cross-env设置环境变量

场景：在运行测试时，需要加上`NODE_ENV=test`，或者在启动静态资源服务器时自定义端口号。

不同平台的环境变量语法不同，可以使用[cross-env](https://www.npmjs.com/package/cross-env)来实现npm script的跨平台兼容。

使用步骤：

1. 添加开发依赖

   ```shell
   npm i cross-env -D
   # npm install cross-env --save-dev
   # yarn add cross-env -D
   ```

2. 改写使用了环境变量的npm script

   ```json
   {
     "scripts": {
       "test": "# 旧 \n    NODE_ENV=test mocha tests/",
       "test": "# 新 \n    cross-env NODE_ENV=test mocha tests/"
     }
   }
   ```

   

##### ~其他：

注意点：

* 所有使用引号的地方，建议使用双引号，并加上转义；
* 没做特殊处理的命令如 eslint、stylelint、mocha、open-cli等，本身就是跨平台兼容的；
* win10引入的[Subsystem](https://msdn.microsoft.com/en-us/commandline/wsl/about)，可以不用虚拟机即可在Windows下使用大多数linux命令。

更多跨平台兼容需求，可去[npmjs.com](https://www.npmjs.com/search?q=cross%20platform)上找对应的包