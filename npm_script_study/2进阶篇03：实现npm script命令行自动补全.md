####2.3实现npm script命令行自动补全

场景：npm script里面积累的命令越来越多。



##### ~使用npm run直接列出：

不带任何参数运行npm run能列出scripts对象中定义的所有命令。结合管道操作如、less命令，即使scripts子命令很多也能移动自如。

执行`npm run | less`，按空格能翻页，`/`进入搜索模式，然后输入搜索关键词。`:q`退出



##### ~把npm completion集成到shell中：

npm 自身提供了自动完成工具[completion](https://docs.npmjs.com/cli/completion)。集成到[bash](https://www.gnu.org/software/bash)或者[zsh](https://github.com/robbyrussell/oh-my-zsh)：

```shell
npm completion >> ~/.bashrc
npm completion >> ~/.zshrc
```

注：`>>`意思是把前面命令的输出追加到后面的文件中。

**整洁做法**：

1. 把npm completion产生的那坨命令放在单独的文件中：

   ```shell
   npm completion >> ~/.npm-completion.bash
   ```

2. 在.bashrc或者.zshrc中引入这个文件

   ```shell
   echo "[ -f ~/.npm-completion.bash ] && source ~/.npm-completion.bash;" >> ~/.bashrc
   echo "[ -f ~/.npm-completion.bash ] && source ~/.npm-completion.bash;" >> ~/.zshrc
   ```

   **如果没有生效**，执行`source ~/.zshrc` 或者`source ~/.bashrc`

3. 使用

   在命令行中输入`npm run`，然后键入空格，然后键入`tab`键。继续按tab，就能在不同的选项之间切换，找到想要的直接回车就能完成命令补全。

   npm completion能实现自动完成的不仅仅是scripts里面的子命令，npm的子命令也可以。



##### ~更高级的自动完成

npm命令补全还不够，补全package.json里面的依赖名称？在补全npm script的时候能不能列出命令是干啥的？

zsh插件：[zsh-better-npm-completion](https://github.com/lukechilds/zsh-better-npm-completion)

* 下载安装：

  ```bash
  git clone https://github.com/lukechilds/zsh-better-npm-completion ~/.oh-my-zsh/custom/plugins/zsh-better-npm-completion
  ```

* 添加插件：

  ```shell
  ## 修改~/.zshrc文件
  ## plugins=(
  ##   git
  ## )
  plugins=(
    git zsh-better-npm-completion
  )
  ```

* 使用：

  1. 在npm install时自动根据历史安装过的包给出补全建议（全局？）： `> npm install node`键入tab
  2. 在npm uninstall时根据package.json里面的声明给出补全建议：`> npm uninstall   `键入tab
  3. 在npm run时补全建议中列出命令细节：`> npm run `键入tab



##### >> 扩展：

实现yarn的命令自动补全：

[yarn-completions](https://github.com/mklabs/yarn-completions)

[yarn-completion](https://github.com/dsifford/yarn-completion)

其他zsh插件

[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)

其他

[fish-shell](https://github.com/fish-shell/fish-shell)

[oh-my-fish](https://github.com/oh-my-fish/oh-my-fish)

