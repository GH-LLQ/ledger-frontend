

# Ledger Frontend - 个人财务管理系统 (前端)

基于 React 18 + Vite + Ant Design 5 构建的单页应用 (SPA)。拥有现代化的 UI 设计和丰富的数据可视化图表。

## 🛠 技术栈

- **核心框架**: React 18, React Router v6
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5 (Antd)
- **状态与请求**: Axios (拦截器封装), React Hooks
- **数据可视化**: Apache ECharts (echarts-for-react)
- **时间处理**: Day.js

## ✨ 页面功能

- **登录/注册/找回密码**: 表单严格校验，基于 SMTP 邮箱验证码重置密码，Token 持久化存储。
- **数据概览 (Dashboard)**:
  - 收支卡片：动态展示当月收入、支出与结余。
  - 图表可视化：ECharts 饼图（分类支出占比）与折线图（近 6 个月收支趋势）。
  - 明细表格：支持按月份过滤、表头点击排序、后端分页查询。
  - 记账弹窗：支持新增和编辑回显，表单防呆设计（禁止选择未来日期，动态联动分类选项）。
- **分类/账户管理**: 完整的 CRUD 列表页，操作列带气泡确认删除。
- **个人信息**: 头像下拉菜单，支持修改邮箱绑定。

## 🚀 本地运行指南

### 1. 环境要求
- Node.js 18+
- npm 或 pnpm

### 2. 安装依赖
```bash
npm install
```

### 3.配置代理
修改 vite.config.js 中的代理目标（指向后端服务地址）：
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', 
      changeOrigin: true,
    }
  }
}
```
### 4. 启动项目
```bash
npm run dev
```
访问 http://localhost:5173