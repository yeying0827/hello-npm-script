#### 4.4使用npm script实现构建流水线

部署前最关键的环节就是构建，构建环节要完成的事情通常包括：

* 源代码预编译，如less、sass、typescript；
* 图片优化、雪碧图生成；
* js、css合并、压缩；
* 静态资源加版本号和引用替换；
* 静态资源传CDN等。

组合npm script和简单的命令行工具为实际项目添加构建过程



##### ~项目目录结构

```
client
├── images
│   └── schedule.png
├── index.html
├── scripts
│   └── main.js
└── styles
    └── main.css
```

可能的资源依赖关系：

* css、html文件中引用了图片；
* html文件中引用了css、js；

构建过程须遵循以下步骤：

1. 压缩图片；
2. 编译less、压缩css；
3. 编译、压缩js；
4. 给图片加版本号并替换js、css中的引用；
5. 给js、css加版本号并替换html中的引用；



##### ~添加构建过程

1. 准备构建目录

   约定构建产生的结果代码，放在dist目录下，与client的结构完全相同，每次构建前，清空之前的构建目录，利用npm的钩子机制添加prebuild命令：

   ```json
   {
     "scripts": {
       "prebuild": "rm -rf dist && mkdir -p dist/{images,styles,scripts}"
     }
   }
   ```

2. 准备脚本目录

   使用scripty把脚本剥离到单独的文件中，构建过程为：images、styles、scripts、hash四个步骤，为每个步骤准备单独的文件

   ```shell
   mkdir scripts/build
   touch scripts/build.sh
   touch scripts/build/{images,styles,scripts,hash}.sh
   chmod -R a+x scripts
   ```

   **可执行权限必须添加正确，否则会报错**

3. 图片构建过程

   图片构建的经典工具是[imagemin](https://github.com/imagemin/imagemin)，使用它的命令行版本[imagemin-cli](https://github.com/imagemin/imagemin-cli)，安装依赖：

   ```shell
   npm i imagemin-cli -D
   # npm install imagemin-cli --save-dev
   # yarn add imagemin-cli -D
   ```

   在scripts/build/images.sh中添加内容：

   ```shell
   imagemin client/images/* --out-dir=dist/images
   ```

   在package.json中添加命令：

   ```json
   {
     "scripts": {
       "build:images": "scripty"
     }
   }
   ```

   尝试运行`npm run prebuild && npm run build:images`，失败，需要安装automake。

   1. 下载[automake](http://www.gnu.org/software/automake/#downloading)
   2. 解压 `sudo tar -zxvf automake-1.16.2.tar.gz -C /opt/`
   3. 进入目录 `cd /opt/automake-1.16.2/`
   4. 执行文件 `sudo ./bootstrap`
   5. 配置编译环境 `sudo ./configure`
   6. 编译并安装automake ` sudo make`  `sudo make install`
   7. 检查是否安装成功 `automake --version`

   重新运行`npm run prebuild && npm run build:images`，成功创建目录并压缩图片

4. 样式构建过程

   [less](http://lesscss.org/usage/)需要预编译样式代码，可使用less官方库自带的命令行工具lessc。（sass可使用[node-sass](https://github.com/sass/node-sass)）。样式预编译完成之后，使用[cssmin](https://www.npmjs.com/package/cssmin)来完成代码预压缩。安装依赖：

   ```shell
   npm i cssmin -D
   # npm install cssmin --save-dev
   # yarn add cssmin -D
   ```

   在scripts/build/styles.sh中添加内容：

   ```shell
   # .css ???
   # for file in client/styles/*.css
   # do
   #   lessc $file | cssmin > dist/styles/$(basename $file)
   # done
   for file in client/styles/*.less
   do
     lessc $file > client/styles/$(basename $file .less).css
     lessc $file | cssmin > dist/styles/$(basename $file .less).css
   done
   ```

   [Linux shell遍历文件夹 | 提取文件名和目录名](https://blog.csdn.net/sinat_28442665/article/details/84796054)

   在package.json中添加命令：

   ```json
   {
     "scripts": {
       "build:styles": "scripty"
     }
   }
   ```

   运行`npm run prebuild && npm run build:styles`，成功看到less编译之后再被压缩的css代码

5. JS构建过程

   ES6需要[uglify-es](https://github.com/mishoo/UglifyJS2/tree/harmony)来进行代码压缩，不使用ES6可以直接使用[uglify-js](https://github.com/mishoo/UglifyJS2)来压缩代码。安装依赖：

   ```shell
   npm i uglify-es -D
   # npm install uglify-es --save-dev
   # yarn add uglify-es -D
   ```

   在scripts/build/scripts.sh中添加内容：

   ```shell
   for file in client/scripts/*.js
   do
     uglifyjs $file --mangle > dist/scripts/$(basename $file)
   done
   ```

   在package.json添加命令：

   ```json
   {
     "scripts": {
       "build:scripts": "scripty"
     }
   }
   ```

   运行`npm run prebuild && npm run build:scripts`，可以看到被uglify-es压缩后的代码

   注：uglify-es支持很多选项，以及sourcemap，对js代码做极致的优化，详细[参考](https://github.com/mishoo/UglifyJS2/tree/harmony#command-line-options)

6. 资源版本号和引用替换

   线上环境的静态资源通常都放在CDN上，或者设置后很长时间的缓存，或者两者兼有，如果资源更新了但没有更新版本号，浏览器端是拿不到最新内容的。

   手动添加过程繁琐且容易出错，自动化这个过程通常的做法是利用文件内容做哈希，如md5，然后以此哈希值为版本号。

   两个小工具：

   * [hashmark](https://github.com/keithamus/hashmark): 自动添加版本号
   * [replaceinfiles](https://github.com/songkick/replaceinfiles): 自动完成引用替换，它需要将版本号过程的输出作为输入

   安装依赖：

   ```shell
   npm i hashmark replaceinfiles -D
   # npm install hashmark replaceinfiles --save-dev
   # yarn add hashmark replaceinfiles -D
   ```

   在scripts/build/hash.sh中添加内容：

   ```shell
   # 给图片资源添加版本号，并且替换引用
   hashmark -c dist -r -l 8 '**/*.{png,jpg}' '{dir}/{name}.{hash}{ext}' | replaceinfiles -S -s 'dist/**/*.css' -d '{dir}/{base}'
   
   # 给css、js添加版本号，并且替换引用
   hashmark -c dist -r -l 8 '**/*.{css,js}' '{dir}/{name}.{hash}{ext}' | replaceinfiles -S -s 'client/index.html' -d 'dist/index.html'
   ```

   在package.json中添加命令：

   ```json
   {
     "scripts": {
       "build:hash": "scripty"
     }
   }
   ```

   该命令不能单独执行，需要完整的build步骤

7. 完整的构建步骤

   在scripts/build.sh中添加内容：

   ```shell
   for step in 'images' 'scripts' 'styles' 'hash'
   do
     npm run build:$step
   done
   ```

   运行`npm run build`，可以看到所有的静态资源都加上了版本号。

   验证运行：

   `./node_modules/.bin/http-server dist`

