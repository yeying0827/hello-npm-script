####3.2把庞大的npm script拆到单独文件中

场景：npm script不断累积、膨胀，导致package.json糟乱，可读性降低。

借助[scripty](https://github.com/testdouble/scripty)可以将npm script剥离到单独的文件中，从而把复杂性隔到单独的模块里，让代码看起来更加清晰。

例子使用：从cover相关的script入手。

1. 安装依赖

   ```shell
   npm i scripty -D
   # npm install scripty --save-dev
   # yarn add scripty -D
   ```

2. 准备目录和文件

   ```shell
   mkdir -p scripts/cover
   ```

   先创建两层的目录，这里计划把cover脚本写成多个，方便单独去执行。命名为scripts是scripty默认的，可自定义。

   ```shell
   touch scripts/cover.sh
   touch scripts/cover/serve.sh
   touch scripts/cover/open.sh
   ```

   创建空白的脚本文件。按照scripty的默认约定，npm script命令和上面各文件的对应关系如下：

   | 命令        | 文件                   | 备注     |
   | ----------- | ---------------------- | -------- |
   | cover       | scripts/cover.sh       |          |
   | cover:serve | scripts/cover/serve.sh | 启动服务 |
   | cover:open  | scripts/cover/open.sh  | 打开预览 |

   注：给所有脚本增加可执行权限是必须的，否则scripty执行时会报错。给所有脚本增加可执行权限：

   ```shell
   chmod -R a+x scripts/**/*.sh
   ```

3. 修改scripty脚本

   因为脚本使用的是bash，所以直接忽略跨平台兼容的处理，跨平台兼容脚本最好使用nodejs编写。

   `scripts/cover.sh` (cleanup --> cover --> archive --> preview)

   ```shell
   #!/usr/bin/env bash
   
   # remove old coverage reports   ==  precover == cover:cleanup
   rimraf coverage && rimraf .nyc_output
   
   # run test and collect new coverage
   nyc -- reporter=html npm test
   
   # archive coverage report by version   == postcover == cover:archive
   mkdir -p coverage_archive/$npm_package_version 
   cp -r coverage/* coverage_archive/$npm_package_version
   
   # open coverage report for preview
   npm-run-all --parallel cover:serve cover:open
   ```

   `scripts/cover/serve.sh`

   ```shell
   #!/usr/bin/env bash
   
   http-server coverage_archive/$npm_package_version -p $npm_package_config_port
   ```

   `scripts/cover/open.sh` (这里的sleep是为了确保文件系统写入完成)

   ```shell
   #!/usr/bin/env bash
   
   sleep 1
   open-cli http://locahost:$npm_package_config_port
   ```

   **在shell脚本里面可以随意使用npm的内置变量和自定义变量。**

4. 修改package.json

   主要是清理cover:*命令，接入scripty。

   ```json
   {
     "scripts": {
       "cover": "scripty",
       "cover:serve": "scripty",
       "cover:open": "scripty"
     }
   }
   ```

   保留3个命令，都指向scripty，调用哪个脚本都由scripty来处理。

5. 测试

   运行`npm run cover`。

   在代码执行前会把scripty实际执行的文件路径打印出来。

**其他高级技巧：**

scripty也支持通配符运行、脚本并行等特性，静默模式，可查看[README.md](https://github.com/testdouble/scripty#advanced-usage)

​    