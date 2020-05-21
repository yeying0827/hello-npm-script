#### 1.2 运行多个npm script的各种姿势

串行，遵循严格的执行顺序，并行，来提高速度。比npm内置的多命令运行机制更好的解决方案：npm-run-all。

##### ~那么多命令？

通常为保障代码质量，给不同的代码添加检查很有必要。

4种通常代码检查：

* [eslint](https://eslint.org/)
* [stylelint](https://stylelint.io/)
* [jsonlint](https://github.com/zaach/jsonlint)
* [markdown-cli](https://github.com/igorshubovych/markdownlint-cli)

html也应该检查，但工具支持薄弱？

为代码添加必要的单元测试也是质量保障的重要手段，常用的单测技术栈：

* [mocha](https://mochajs.org/)，测试用例组织、测试用例运行和结果收集的框架；
* [chai](http://chaijs.com/)，测试断言库，必要的时候可以结合[sinon](http://sinonjs.org/)使用；
* ... [tap](http://www.node-tap.org/)、[ava](https://github.com/avajs/ava)

```shel
npm i stylelint stylelint-config-standard jsonlint markdown-cli mocha chai -D
```

修改package.json

```json
{
  "scripts": {
    "lint:js": "eslint *.js",
    "lint:css": "stylelint *.less",
    "lint:json": "jsonlint --quiet *.json",
    "lint:markdown": "markdownlint --config .markdownlint.json *.md",
    "test": "mocha tests/"
  }
}
```

新建index.less  .stylelintrc.json tests/test.js

修改index.js



##### ~多个npm script串行：

场景：运行测试之前确保代码都通过代码检查

只需要用**&&**符号把多条npm script按先后顺序串起来即可

```json
{
  "scripts": {
    "test": "npm run lint:js && npm run lint:css && npm run lint:json && npm run lint:markdown && mocha tests/"
  }
}
```

执行**npm t**，从输出可看到子命令的执行顺序是严格按照在scripts中声明的先后顺序来的

**eslint ==> stylelint ==> jsonlint ==> markdownlint ==> mocha**

**>>>注意：**

串行执行的时候如果前序命令失败（通常进程退出码非0），后续全部命令都会终止



##### ~让多个npm script并行：

场景：代码变更时同时给出代码检查结果和测试运行结果

把连接多条命令的**&&**符号替换成**&**即可

```json
{
  "scripts": {
    "test": "npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/"
  }
}
```

**>>>注意：**

报错结果可能在进程退出之后才输出。 npm 内置支持的多命令并行跟 js 里面同时发起多个异步请求非常类似，它只负责触发多条命令，而不管结果的收集；如果并行的命令执行时间差异非常大，就会稳定复现 > 报错结果在进程退出之后才输出。

**>>>改进：**

增加**& wait**

```json
{
  "scripts": {
    "lint:js": "eslint *.js",
    "lint:css": "stylelint *.less",
    "lint:json": "jsonlint --quiet *.json",
    "lint:markdown": "markdownlint --config .markdownlint.json *.md",
    "test": "npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/ & wait"
  }
}
```

如果在任何子命令中启动了长时间运行的进程，比如启用了mocha的**--watch**配置，可以使用**ctrl + c**来结束进程，如果没加的话，就没办法直接结束启动到后台的进程。