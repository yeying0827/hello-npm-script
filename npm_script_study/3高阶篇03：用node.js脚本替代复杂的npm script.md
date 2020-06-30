#### 3.3用node.js脚本替代复杂的npm script

使用node.js来编写复杂的npm script的2个明显优势：1.编写简单的工具脚本对前端工程师来说额外的学习成本很低；2.node.js本身是跨平台的，编写的脚本出现跨平台兼容问题的概率很小。

使用[shelljs](https://www.npmjs.com/package/shelljs)工具包。

1. 安装依赖

   ```shel
   npm i shelljs chalk -D
   ```

   chalk: 用于给输出加点颜色

   shelljs： 提供了shell下可执行的常见的命令

2. 创建node.js脚本

   ```shell
   touch scripts/cover.js
   ```

3. 用node.js实现和shell脚本同等功能

   shelljs提供了各种常见命令的跨平台支持，如cp、mkdir、rm、cd等命令，理论上可以在node.js脚本中使用任何[npmjs.com](https://www.npmjs.com/)上能找到的包。 

   ```js
   const { rm, cp, mkdir, exec, env } = require('shelljs');
   const chalk = require('chalk');
   const npm_package_version = env['npm_package_version'];
   
   exec(`echo $npm_package_version`);
   console.log(chalk.green('1. remove old coverage report...'));
   rm('-rf', 'coverage');
   rm('-rf', '.nyc_output');
   
   console.log(chalk.green('2. run test and collect new coverage...'));
   exec('nyc --reporter=html npm test');
   
   console.log(chalk.green('3. archive coverage report by version...'));
    // mkdir('-p', `coverage_archive/${npm_package_version}`)
   mkdir('-p', `coverage_archive/$npm_package_version`)
   cp('-r', 'coverafe/*', `coverage_archive/${npm_package_version}`);
   
   console.log(chalk.green('4. open coverage report for preview...'));
   exec('npm-run-all --parallel cover:serve cover:open');
   
   
   ```

   说明：

   * 简单的文件系统操作，建议直接使用shelljs提供的cp、rm等替换；
   * 稍复杂的命令，可以使用exec来执行，也可以使用istanbul包来完成；
   * 在exec中也可以使用npm script运行时的环境变量的方式需要注意；

4. 让package.json指向新脚本

   ```json
   {
     "scripts": {
       "cover": "node scripts/cover.js"
     }
   }
   ```

5. 测试

   运行`npm run cover`。增加了新的绿色输出。

