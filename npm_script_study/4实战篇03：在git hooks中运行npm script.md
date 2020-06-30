#### 4.3在Git Hooks中执行npm script

Git在代码版本管理之外，也提供了类似npm script里`pre`、`post`的钩子机制，叫做[Git Hooks](https://git-scm.com/book/gr/v2/Customizing-Git-Git-Hooks)，钩子机制能让我们在代码commit、push之前（后）做自己想做的事情。

本地仓库pre-commit、pre-push，远程仓库（[Remotes](https://git-scm.com/book/en/v1/Git-Basics-Working-with-Remotes)）pre-receive。本地检查是为了尽早给提交代码的同学反馈；而远程检查是为了确保远程仓库收到的代码是符合团队约定的规范的，如果没有远程检查环节，熟悉Git的同学使用`--no-verify`或`-n`参数跳过本地检查时，本地检查就形同虚设。

场景：团队开发。破窗理论。

检查编码规范，把低级错误趁早挖出来修好；运行测试，用自动化的方法做功能回归。

方案：[pre-commit](https://github.com/observing/pre-commit)、[husky](https://github.com/typicode/husky)，相比较husky更好用，支持更多的Git Hooks种类，结合[lint-staged](https://github.com/okonet/lint-staged)食用更佳。

1. 安装项目依赖

   ```shell
   npm i husky lint-staged -D
   # npm install husky lint-staged --save-dev
   # yarn add husky lint-staged -D
   ```

   关于husky的基本原理，可以先翻看husky的package.json，注意scripts的声明，里面的install就是在项目安装husky时执行的脚本。

   再检查本仓库的`.git/hooks`目录，可以看到里面的钩子被husky替换，新增了一些husky相关文件。

2. 修改npm script

   ```json
   {
     "husky": {
       "hooks": {
         "pre-commit": "npm run lint",
         "pre-push": "npm test"
       }
     }
   }
   ```

   尝试提交代码`git commit -am 'add husky hooks'`，能看到pre-commit钩子已生效（有打印出来的文字）

3. 用lint-staged改进pre-commit

   场景：在大型项目、遗留项目中接入lint工作流，每次提交代码会检查所有的代码，可能比较慢，还可能会报告成百上千的错误。无法做一些渐进式的技术改进。

   lint-staged在提交时，只检查当次改动的文件。

   修改package.json：

   ```json
   {
     "husky": {
       "hooks": {
         "pre-commit": "lint-staged"
       }
     },
     "lint-staged": {
       "*.js": "eslint",
       "*.less": "stylelint",
       "*.css": "stylelint",
       "*.json": "jsonlint --quiet",
       "*.md": "markdownlint --config .markdownlint.json"
     }
   }
   ```

   故意在index.js中引入错误，尝试提交这个文件：

   `git commit -m 'try to add eslint error' index.js`。

   打印出的带有`Running taks`字样的列表就是lint-staged根据当前要提交的文件和package.json中配置的检查命令去执行的动态输出。钩子执行失败，提交也就没有成功。

4. 继续运行push

   `git push origin master`

   测试通过，push成功。

