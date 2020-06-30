#### 2.1使用npm script的钩子

npm script的设计者为命令的执行增加了类似生命周期的机制，具体来说就是`pre`和`post`钩子脚本。

场景：在某些操作前需要做检查、某些操作后需要做清理。

例子：运行npm test的3个阶段：

1. 检查scripts对象中是否存在pretest命令，若有，先执行该命令；
2. 检查是否有test命令，有的话运行test命令，没有的话报错；
3. 检查是否存在posttest命令，若有，执行posttest命令。

衡量测试效果的重要指标是**`测试覆盖率`**。



##### ~改造test命令：

基于钩子机制对现有的scripts做以下3点重构，把代码检查和测试运行串起来：

* 增加简单的lint命令，并行运行所有的lint子命令；
* 增加pretest钩子，在其中运行lint命令；
* 把test替换为更简单的`mocha tests/`；

```json
{
  "scripts": {
    "lint": "npm-run-all --parallel lint:*",
    "pretest": "npm run lint",
    "test": "mocha tests/",
  }
}
```

当运行npm test的时候，会先自动执行pretest里面的lint。



##### ~增加覆盖率收集：

覆盖率：单元测试对代码的覆盖程度（就是所有逻辑有没有覆盖）

增加覆盖率收集的命令，并且覆盖率收集完毕之后自动打开html版本的覆盖率报告。引入2个新工具：

1. 覆盖率收集工具[nyc](https://github.com/istanbuljs/nyc)，是覆盖率收集工具[istanbul](https://istanbul.js.org/)的命令行版本。支持生成各种格式的覆盖率报告
2. 打开html文件的工具[opn-cli](https://github.com/sindresorhus/opn-cli)，是能够打开任意程序的工具[opn](https://github.com/sindresorhus/opn)的命令行版本。作者是前端社区非常高产的[Sindre Sorhus](https://github.com/sindresorhus)。

* 安装：

```shell
npm i nyc opn-cli -D
```

* 在package.json增加nyc的配置，告诉nyc该忽略哪些文件

```json
{
  "nyc": {
    "exclude": [
      "**/*.spec.js",
      ".*.js"
    ]
  }
}
```

* 在scripts中新增3条命令：
  * precover 收集覆盖率之前把之前的覆盖率报告目录清理掉；
  * cover 直接调用nyc， 收集npm test命令的覆盖率，让其生成html格式的覆盖率报告；
  * postcover 清理掉临时文件，并在浏览器中预览覆盖率报告。

```json
"scripts": {
    "precover": "rm -rf coverage",
    "cover": "nyc --reporter=html npm test",
    "postcover": "rm -rf .nyc_output && open-cli coverage/index.html"
  },
```

* 直接运行npm run cover



到目前为止，demo的工作流中已经包含代码检查、测试运行、覆盖率收集、覆盖率查看等功能。