#### 4.5使用npm script进行服务运维

本节涉及服务的部署、日志，但会从前端项目管理开始，比如依赖管理、版本管理等。

了解整个前端项目交付流程中需要考量的点能让我们更有大局观。

通常来说，项目构建完成后，就成为待发布的版本，因此版本管理需要考虑，甚至做成自动化的，然后最新的代码需要部署到线上机器才能让所有用户访问到，部署环节涉及到服务的启动、重启、日志管理等需要考虑。

npm script在服务运维时的几个用途：



##### ~使用npm script进行版本管理

每次构建完的代码都应该有新的版本号，修改版本号直接使用npm内置的version命令即可，如果是简单粗暴的版本管理，可以在package.json中添加如下scripts：

```json
{
  "scripts": {
    "release:patch": "npm version patch && git push && git push --tags",
    "release:minor": "npm version minor && git push && git push --tags",
    "release:major": "npm version major && git push && git push --tags",
  }
}
```

这3条命令遵循[semver](https://semver.org/)的版本号规范（语义化）来方便你管理版本，patch是更新补丁版本，minor是更新小版本，major是更新大版本。

在必要的时候，可以通过运行`npm run version:patch`来升补丁版本

如果要求所有的版本号不超过10，即0.0.9的下个版本是0.1.0而不是0.0.10，可以编写简单的shell脚本来实现（**注：这样会破坏semver的约定**），具体步骤：

1. 在scripts目录下新增bump.sh（设置文件的可执行权限：`chmod -R a+x scripts/bump.sh`）

   ```shell
   #!/usr/bin env bash
   
   # get major/minor/patch versio to change
   version=`cat package.json | grep version | grep -v release | awk -F\" '{print $4}'`
   components=($(echo $version | tr '.' '\n'))
   major=${components[0]}
   minor=${components[1]}
   patch=${components[2]}
   
   release='patch';
   
   # decide which version to increment
   if [ $patch -ge 9 ]; then
       if [ $minor -ge 9 ]; then
           release='major';
       else
           release='minor';
       fi
   else
       release='patch';
   fi
   
   echo "major=$major, minor=$minor, patch=$patch, release=$release"
   
   # upgrade version
   npm run relese:$release
   ```

2. 在package.json中新增bump子命令：

   ```json
   {
     "scripts": {
       "bump": "scripty"
     }
   }
   ```

3. 在必要的时候执行`npm run bump`



#####~使用npm script进行服务进程和日志管理

在生产环境的服务进程和日志管理领域，[pm2](http://pm2.keymetrics.io/)是当之无愧的首选，功能很强大，使用简单，开发环境常用的是[nodemon](https://www.npmjs.com/package/nodemon)。

使用npm script进行服务进程和日志管理的基本步骤：

1. 准备http服务

   在使用npm script作为构建流水线的基础上，在项目中引入[express](https://www.npmjs.com/package/express)和[morgan](https://www.npmjs.com/package/morgan)，并使用如下脚本启动http服务器方便用户访问我们的网页（morgan用来记录用户的访问日志）:

   * 安装依赖：

     ```shell
     npm i express morgan -D
     # npm install express morgan --save-dev
     # yarn add express morgan -D
     ```

   * 在根目录下创建文件server.js

     ```javascript
     const express = require('express');
     const morgan = require('morgan');
     
     const app = express();
     const port = process.env.PORT || 8080;
     
     app.use(express.static('./dist'));
     app.use(morgan('combined'));
     
     app.listen(port, err => {
       if(err) {
         console.error('server start error', err); // eslint-disable-line
         process.exit(1);
       }
       
       console.log(`server startedat port ${port}`); // eslint-disable-line
     });
     ```

2. 准备日志目录

   简单起见，在项目中创建日志存储目录logs，通常不会把日志存在项目部署目录下。

   ```shell
   mkdir logs
   touch logs/.gitkeep
   git add logs/.gitkeep
   git commit -m 'add logs folder'
   ```

   并且设置该目录为git忽略的，改动.gitignore

   ```
   logs
   ```

   **注：这里加`logs/.gitkeep`空文件的目的是为了能把logs目录提交到git里面，但是我们故意忽略logs目录里面的内容，这是在git中提交目录结构而忽略其中内容的常见做法。**

3. 安装和配置pm2

   * 安装依赖：

   ```shell
   npm i pm2 -D
   # npm install pm2 --save-dev
   # yarn add pm2 -D
   ```

   * 添加服务启动配置到项目根目录下pm2.json，更多配置项可以参考[文档](http://pm2.keymetrics.io/docs/usage/application-declaration)

   ```json
   {
     "apps": [
       {
         "name": "npm-script-workflow",
         "script": "./server.js",
         "out_file": "./logs/stdout.log",
         "error_file": "./logs/stderr.log",
         "log_date_format": "YYYY-MM-DD HH:mm:ss",
         "instances": 0,
         "exec_mode": "cluster",
         "max_memory_restart": "800M",
         "merge_logs": true,
         "env": {
           "NODE_ENV": "production",
           "PORT": 8080
         }
       }
     ]
   }
   ```

   上面的配置指定了服务脚本为server.js，日志输出文件路径，日志时间格式，进程数量 = CPU核数，启动方式为cluster，以及两个环境变量

4. 配置服务部署命令

   ```json
   {
     "scripts": {
       "predeploy": "yarn && npm run build",
       "deploy": "pm2 restart pm2.json"
     }
   }
   ```

   即，在部署前需要安装最新的依赖，重新构建，然后使用pm2重新启动服务即可。如果有多台机器跑通1个服务，建议有个集中的CI服务器专门负责构建，而部署时就不需要运行build了。

5. 配置日志查看命令

   虽然pm2提供了内置的logs管理命令，如果某台服务器上启动了多个不同的服务进程，那么pm2 logs会展示所有服务的日志，个人建议使用如下命令查看当前服务的日志：

   ```json
   {
     "scripts": {
       "logs": "tail -f logs/*"
     }
   }
   ```

   需要查看日志时，直接运行`npm run logs`。

   如果有更复杂的日志查看需求，直接用cat、grep之类的命令就可以。

