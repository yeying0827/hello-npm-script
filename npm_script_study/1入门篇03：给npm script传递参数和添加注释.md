#### 1.3 给npm script传递参数和添加注释

* 给npm script传递参数以减少重复的npm script；
* 增加注释提高npm script 脚本的可读性；
* 控制运行时日志输出，专注于重要信息

#####~给npm script传递参数：

场景：eslint内置了代码风格自动修复模式，传入`--fix`参数即可，在scripts中声明检查代码命令的同时可能也需要声明修复代码的命令。

* 简单粗暴：复制粘贴

  ```json
  {
    "scripts": {
      "lint:js": "eslint *.js",
      "lint:js:fix": "eslint *.js --fix"
    }
  }
  ```

  **缺点：**不好维护。假设原命令很长，后期修改原命令可能忘记修改`lint:js:fix`。更健壮的做法：在运行npm script时给定额外的参数。

* 使用参数

  ```json
  {
    "scripts": {
      "lint:js": "eslint *.js",
      "lint:js:fix": "npm run lint:js -- --fix"
    }
  }
  ```

  **注意：**`--fix`参数前面的`--`分隔符，意指要给`npm run lint:js`实际指向的命令传递额外的参数

  直接运行`npm run lint:js -- --fix`效果一致。



##### ~给npm script添加注释：

2种trick方式：

* 在package.json中增加`//`为键的值，注释可以写在对应的值里面，npm会忽略这种键

  ```json
  {
    "scripts": {
      "//": "运行所有代码检查和单元测试",
      "test": "npm-run-all --parallel lint:* mocha"
    }
  }
  ```

  **缺点：**运行`npm run`列出来的命令列表不能把注释和实际命令对应上

* 直接在script声明中做手脚：命令的本质是shell命令，可以在命令前加上注释

  ```json
  {
    "scripts": {
      "test": "# 运行所有代码检查和单元测试 \n    npm-run-all --parallel lint:* mocha"
    }
  }
  ```

  **注意：**换行符`\n`，用于将注释和命令分隔开，这样命令相当于微型的shell脚本，多余的空格时为了控制缩进。这些能让npm run列出来的命令更美观，但scripts声明阅读起来不那么整齐美观

  **`>>更优方案`**：把复杂的命令剥离到单独的文件中管理，在单独的文件中可以自由添加注释，见后续



##### ~调整npm script运行时日志输出：

场景：调试问题

* 默认日志输出级别

  不加任何参数，能看到执行的命令、命令执行的结果。

* 显示尽可能少的有用信息

  结合其他工具调动npm script的时候比较有用，需要使用`--loglevel silent`，或者`--silent`，或者更简单的`-s`

  （只有命令本身的输出）

  如果执行各种lint script的时候启用了`-s`配置，代码都符合规范，就不会看到任何输出

* 显示尽可能多的运行时状态

  场景：排查脚本问题。需要使用`--loglevel verbose`，或者`--verbose`，或者更简单的`-d`

  （详细打印出每个步骤的参数、返回值）`--verbose`比`-d`输出更详细

