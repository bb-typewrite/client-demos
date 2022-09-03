## Node 管理

1. 使用 `nvm` 工具对 `node` 版本进行管理

   [仓库地址](https://github.com/coreybutler/nvm-windows)

2. 使用 `nvm` 下载项目中需要的 `node版本`

   `.nvmrc` 文件中列有具体的版本要求（`v17` 则为 `node-17` 的版本）

   在命令行通过 `nvm install 17` 来进行 `node-17` 版本的安装

3. 安装完后，可在项目根目录中输入 `nvm use` 命令来切换到 `.nvmrc` 文件中指定的 `node 版本`

## 包管理

1. 使用 `yarn`

   通过 `npm install yarn -g` 安装

2. 通过 `yarn` 来操作项目

   - `yarn dev` - 启动开发环境

   - `yarn build` - 打包项目
