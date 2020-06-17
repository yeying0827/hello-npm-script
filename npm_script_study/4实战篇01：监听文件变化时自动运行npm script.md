#### 4.1文件变化自动运行npm script

目的：提升开发效率

场景：在代码变更后立即得到反馈，如代码风格检查、单元测试等。



##### ~单元测试自动化

mocha本身支持`--watch`参数，即，在代码变化时自动重跑所有的测试。

```json
{
  "scripts": {
    "watch:test": "npm t -- --watch"
  }
}
```



##### ~代码检查自动化

[stylelint](https://stylelint.io/)、[eslint](https://eslint.org/)、[jsonlint](https://github.com/zaach/jsonlint)不全支持watch模式，需要借助[onchange](https://github.com/Qard/onchange)工具包来实现。

1. 安装项目依赖

   ```shell
   npm i onchange -D
   # npm install onchange --save-dev
   # yarn add onchange -D
   ```

2. 添加npm script

   ```json
   {
     "scripts": {
       "watch": "npm-run-all -parallel watch:*",
       "watch:lint": "onchange -i \"**/*.js\" \"**/*.less\" -v -- npm run lint"
     }
   }
   ```

   说明：

   * `watch:lint`里面的文件匹配模式可以使用通配符，但是模式两边使用了转义的双引号，这样是跨平台兼容的；
   * `watch:lint`里面的`-i`参数是让onchange在启动时就运行一次`--`之后的命令，`-v`参数是在运行指定命令之前输出哪个文件发生了哪些变化

   扩展：

   onchange怎么实现文件系统监听？使用了跨平台的文件系统监听包[chokidar](https://github.com/paulmillr/chokidar)。

   