# 个人记账

一个纯前端的个人记账工具，适合部署到 GitHub Pages、Cloudflare Pages 等静态网页托管服务。应用不需要服务器、不需要账号系统、不需要数据库，数据保存在当前浏览器的 `localStorage` 中。

## 功能

- 记录收入和支出
- 支持金额、日期、大分类、小分类、备注
- 支持新增、编辑、删除记录
- 支持大分类和小分类的新增、重命名、删除
- 月历视图，点击日期查看当天明细
- 本月收入、支出、结余统计
- 当天收入、支出、结余统计
- 支出分类统计
- 月预算进度
- JSON 导入和导出备份
- 手机浏览器适配

## 本地打开

直接用浏览器打开 `index.html` 即可：

```text
index.html
```

项目不需要安装依赖，也不需要启动开发服务器。

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库。
2. 上传以下文件到仓库根目录：
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. 打开仓库的 `Settings`。
4. 进入 `Pages`。
5. 在 `Build and deployment` 中选择：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
6. 保存后等待 GitHub Pages 发布。
7. 发布完成后，用 GitHub 提供的网址访问应用。

也可以把整个项目目录上传到 Cloudflare Pages，构建命令留空，输出目录选择仓库根目录。

## 数据保存

数据保存在浏览器本地的 `localStorage` 中，主要包括：

- 记账记录
- 月预算
- 自定义分类

这意味着：

- 同一个浏览器再次打开网页，数据会保留。
- 换浏览器、换设备、清除浏览器数据后，原数据不会自动出现。
- GitHub Pages 或 Cloudflare Pages 不会保存你的记账数据。

## JSON 备份

页面右上角有导入和导出按钮：

- 点击“导出”可以下载 JSON 备份文件。
- 点击“导入”可以选择之前导出的 JSON 文件恢复数据。

建议定期导出 JSON 文件，尤其是在换手机、换浏览器、清理浏览器缓存之前。

## 技术说明

- HTML + CSS + JavaScript
- 无服务器
- 无账号系统
- 无数据库
- 无构建步骤
- 使用相对路径引用资源，适合静态部署
