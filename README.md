# TWKan Suwatte 书源

将 TWKan 的小说搜索、章节目录和正文解析移植为 Suwatte 插件。此书源为个人测试项目，不隶属于 TWKan 或 Suwatte。

## 安装

构建并启用 GitHub Pages 后，在 Suwatte 的 Settings → Sources → Manage Sources → Add Source List 中添加：

`https://daxen-x.github.io/twkan-suwatte/sources.json`

请注意：只有在 GitHub Actions 构建及 Pages 部署均成功后，该地址才有效。搜索和正文需在手机上测试。

## 开发

```bash
npm install
npm test
npm run build
```

生成的 `dist/sources.json` 和 `dist/sources/*.stt` 将由 GitHub Actions 发布。
