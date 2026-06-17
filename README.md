# 个人记账

## 一、项目简介

这是一个自用的纯前端个人记账工具，体验目标类似轻量版 Zaim。项目不需要服务器、不需要账号、不需要数据库，适合部署到 GitHub Pages 这类静态网页托管服务。

技术栈：

- HTML
- CSS
- JavaScript
- localStorage
- PWA
- GitHub Pages

## 二、主要功能

- 首页 dashboard
- 收入 / 支出记录
- 计算器式输入
- 分类 / 子分类管理
- 图标自定义
- 履历列表
- 日历查看
- 收支分析
- 预算比
- 分类预算
- JSON 导入导出
- PWA 添加到主屏幕
- 离线打开基础页面

## 三、数据保存说明

数据保存在当前浏览器的 `localStorage` 中。

当前使用的 localStorage key：

- `personal-ledger.entries.v1`
- `personal-ledger.monthly-budget.v1`
- `personal-ledger.categories.v1`
- `personal-ledger.budgets.v1`
- `personal-ledger.profile.v1`

注意：

- 清除浏览器数据会导致账单丢失。
- 换手机 / 换浏览器不会自动同步。
- 重要数据必须定期导出 JSON 备份。
- 导入备份前建议先导出当前数据。

## 四、本地启动方法

进入项目目录后运行：

```bash
python -m http.server 8000
```

然后浏览器打开：

[http://localhost:8000](http://localhost:8000/)

PWA 和 service worker 需要通过 HTTP 环境测试，不建议直接双击 `index.html` 测试。

## 五、GitHub Pages 部署

1. 上传整个项目到 GitHub 仓库。
2. 打开仓库 `Settings`。
3. 进入 `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，Folder 选择 `/ (root)`。
6. 保存后等待 GitHub Pages 发布。
7. 部署完成后访问 GitHub Pages 地址。

项目使用相对路径，适合 GitHub Pages 子路径部署：

- `./manifest.json`
- `./service-worker.js`
- `./icons/...`

## 六、PWA 使用说明

手机浏览器打开 GitHub Pages 地址后，可以添加到主屏幕。

iPhone：

- Safari 打开网页
- 点击分享按钮
- 选择“添加到主屏幕”

Android：

- Chrome 打开网页
- 打开菜单
- 选择“添加到主屏幕”或“安装应用”

## 七、PWA 缓存更新说明

当前 service worker 缓存名：

```text
personal-ledger-cache-v1
```

如果以后修改 `app.js`、`styles.css`、`index.html`、`manifest.json`、图标等核心静态文件，建议同步修改 `service-worker.js` 里的缓存名，例如：

```text
personal-ledger-cache-v2
```

否则浏览器可能继续使用旧缓存。

## 八、导入导出说明

- 导出会生成 JSON 备份文件。
- 导入支持旧 `entries` 数组格式，也支持完整备份格式。
- 导入会按 `id` 合并，避免重复。
- 清空数据前一定要先导出备份。

## 九、项目限制

- 没有后端。
- 没有云同步。
- 没有银行联动。
- 没有 OCR。
- 数据只保存在当前浏览器。
- localStorage 容量有限，头像和背景图不宜过大。

## 十、开发注意事项

这些内容不能随便改，否则可能影响旧数据兼容：

- localStorage key
- `entries` 字段结构
- 导入导出兼容逻辑
- 预算数据结构
- 分类 normalize 逻辑
- service worker 缓存路径

## 十一、基础验收清单

- 首页能打开
- 新增支出正常
- 新增收入正常
- 编辑记录正常
- 删除记录正常
- 分类新增正常
- 子分类新增正常
- 分类删除不删除历史记录
- 分析页正常
- 预算页正常
- 导出正常
- 导入正常
- PWA manifest 可识别
- service worker 注册成功
