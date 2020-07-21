# wwc-wechaty

Demo code for WWC Wechaty talk

## 如何运行

如果你是第一次接触到`Wechaty`，请移步到[`wechaty-getting-started`](https://github.com/wechaty/wechaty-getting-started)了解下如何运行`Wechaty`，然后再来运行本项目的`index.ts`。

### 在运行代码之前

1. 准备好可运行`Wechaty`的微信号（如果你用的是`wechaty-puppet-puppeteer`）或者一个`token`（如果你用的是非web的puppet）
1. 注册`微信对话开放平台`，并且创建好自己的机器人
1. 开启机器人的开放API的功能，并且拿到对应的`token`和`encodingAESKey`

### 动手运行代码

找到一个你想存放这个项目的文件夹，通过终端 cd 到那个文件夹
然后运行下面的指令
```shell
git clone https://github.com/windmemory/wwc-wechaty.git
cd wwc-wechaty
npm install
ts-node index.ts
```
