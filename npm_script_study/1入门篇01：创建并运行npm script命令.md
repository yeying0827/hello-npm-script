#### 1.1 初识

##### ~创建:

**创建**package.json文件的科学方法： npm init              keywords用逗号分隔

**讲解**npm脚本基本执行流程：在终端运行自动生成的test命令

**熟悉**创建自定义命令的基本流程：动手给项目增加eslint命令

修改package.json：

1. 使用npm init    默认不会覆盖修改已存在的信息
2. 用编辑器编辑

npm init -f  直接跳过参数问答环节，快速生成package.json



初始化package.json时的字段默认值是可以自己配置的：

```shell
npm config set init.author.email xx
npm config set init.author.name xx
npm config set init.author.url xx
npm config set init.license "MIT"
npm config set init.version "0.1.0"
```

这些配置被写入.npmrc里面，`cat ~/.npmrc`可以查看



用Git对源代码进行版本管理：git init



##### ~执行命令 npm run:

npm run test = npm test = npm t

npm内置支持的命令：test, start, stop, restart

npm run 实际上是 npm run-script命令的简写

当运行npm run xxx时的基本步骤（简化版）：

* 1.从package.json文件中读取scripts对象里面的全部配置；
* 2.以传给npm run的第一个参数作为键，本例中为xxx，在scripts对象里面获取对应的值作为接下来要执行的命令，如果没有找到直接报错；
* 3.在系统默认的shell中执行上述命令，系统默认shell通常为bash，windows环境下可能略有不同。

不带任何参数执行npm run -> 列出可执行的所有命令

```shell
Lifecycle scripts included in hello-npm-script:
  test
    echo "Error: no test specified" && exit 1
```

假设package.json包含eslint命令

```json
{
  "scripts": {
    "eslint": "eslint **.js"
  }
}
```

运行npm run eslint  => npm会在shell中运行eslint **.js

npm在执行指定script之前，会把node_modules/.bin加到环境变量$PATH的前面，这意味着任何内含可执行文件的npm依赖都可以在npm script中直接调用，即，不需要在npm script中加上可执行文件的完整路径，如**./node_modules/.bin/eslint \**.js**



##### ~创建自定义npm sript：

在项目中添加实用的eslint脚本（代码风格检查工具），步骤：

* 1.准备被检查的代码 `touch index.js`

* 2.添加eslint为devDependencies：

  ```bash
  npm install eslint -D
  ```

* 3.初始化eslint配置

  用eslint做检查需要配置规则集，存放规则集的文件就是配置文件，使用如下文件生成配置文件

  ```shell
  ./node_modules/.bin/eslint --lint
  ```

  生成.eslintrc.js配置文件。

  可直接尝试运行`./node_modules/.bin/eslint index.js `

* 4.添加eslint命令

  ```json
  {
    "scripts": {
      "eslint": "eslint *.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    }
  }
  ```

  注意package.json语法正确

* 5.运行eslint命令

  npm run eslint



##### >>>补充：

结合eslint检查主流前端框架react、vue.js   -> 官方仓库README

* 1.react

  使用[eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react)检查react代码，使用[react-plugin-react-native](https://github.com/Intellicode/eslint-plugin-react-native)检查react-native代码，如果人懒，可直接使用[eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)，里面内置了eslint-plugin-react

* 2.vue.js

  Vue.js官方的eslint插件：[eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)

* 对于使用的规则集，如需要关闭某些规则

  可直接在自己的.eslintrc*里面的rules中配置，如：

  ```javascript
  module.exports = {
    env: {
      es6: true,
      node: true,
    },
    extends: 'eslint:recommended',
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
    },
  };
  ```



peerDependencies----

yarn add <package-name> --peer

IDE自动格式化配置：

https://standardjs.com/readme-zhcn.html

区分devDependencies和dependencies：

> DevDependencies 是我们开发时候需要的东西，例如eslint，webpack等等。 dependencies是我们打包上传到服务器正式环境上需要的依赖，例如 react，react-router等等。





