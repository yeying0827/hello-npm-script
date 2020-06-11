#### 2.2 在npm script中使用变量

DRY（Don't Repeat Yourself）是基本的编程原则，在npm script中使用预定义变量和自定义变量让我们更容易遵从DRY原则。



##### ~使用预定义变量：

查看预定义变量：`npm run env`

获取部分排序后的预定义环境变量：`npm run env | grep npm_package | sort`

变量的使用方法遵循**shell**的语法，直接在npm script给想要引用的变量前面加上`$`符号即可。如：

```json
{
  "scripts": {
    "dummy": "echo $npm_package_name"
  }
}
```

**场景**：测试覆盖率归档。方便追踪覆盖率的变化趋势，最彻底的做法是归档到CI系统里面，简单项目可直接归档到文件系统中，即把收集到的覆盖率报告按版本号去存放。

在根目录下新建coverage_archive目录存储覆盖率归档，并利用变量机制把归档和版本号关联起来。

```json
{
  "scripts": {
    "cover": "nyc --reporter=html npm test",
    "cover:cleanup": "rm -rf coverage && rm -rf .nyc_output",
    "cover:archive": "mkdir -p coverage_archive/$npm_package_version && cp -r coverage/* coverage_archive/$npm_package_version",
    "postcover": "npm run cover:archive && npm run cover:cleanup && open-cli coverage_archive/$npm_package_version/index.html"
  }
}
```

* 直接运行`npm run cover`



##### ~使用自定义变量：

可以在package.json中添加自定义变量，并且在npm script中使用这些变量。

场景：分享测试覆盖率报告给其他人浏览，不能使用opn-cli打开文件了，需要启动简单的http服务。

使用[http-server](https://www.npmjs.com/package/http-server)（非常轻量的http服务），安装：

```shell
npm i http-server -D
```

* 在package.json增加自定义端口配置和相应的npm script命令

```json
{
  "config": {
    "port": 3000
  },
  "scripts": {
    "cover": "nyc --reporter=html npm test",
    "cover:serve": "http-server coverage_archive/$npm_package_version -p $npm_package_config_port",
    "cover:open": "open-cli http://localhost:$npm_package_config_port",
    "postcover": "npm-run-all cover:archive cover:cleanup --parallel cover:serve cover:open"
  }
}
```

* 运行`npm run cover`

  终端在`cover:serve`之后进入等待状态，同时浏览器会打开覆盖率报告