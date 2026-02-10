# 旅行社交平台

一个集**个性化旅行记录、沉浸式内容发现、活跃旅行社区**于一体的社交化旅行生活平台。

## 项目概述

本项目是一个全栈旅行社交平台，支持用户记录旅行轨迹、分享游记、发现热门地点、与旅行爱好者互动等功能。

### 核心功能

- ✈️ **旅行记录**：GPS轨迹记录、地点标记、照片上传、游记编辑
- 🗺️ **地图导航**：实时定位、地点搜索、路线规划
- 👥 **社交互动**：关注、点赞、评论、收藏
- 📍 **地点整合**：同一地点的多维度内容整合
- 🌤️ **天气信息**：实时天气和预报
- 🤖 **AI功能**：图像识别、情感分析、内容推荐

## 技术栈

### 后端
- **Node.js** + **Express**：RESTful API服务
- **MongoDB** + **Mongoose**：数据存储
- **JWT**：用户认证
- **Socket.IO**：实时通信
- **Multer**：文件上传

### 前端Web
- **React**：用户界面框架
- **Ant Design**：UI组件库
- **React Router**：路由管理
- **React Query**：数据获取和缓存
- **Axios**：HTTP客户端

### 移动端
- **React Native** + **Expo**：跨平台移动应用
- **React Navigation**：导航管理
- **Expo Location**：位置服务
- **Expo Camera**：相机功能
- **React Native Maps**：地图显示

## 🚀 快速开始

### 手动启动（推荐 - 直接在终端运行命令）

**步骤1：打开命令提示符（CMD）或 PowerShell**

**步骤2：切换到项目目录**
```cmd
cd "C:\Users\25345\Desktop\移动互联网"
```

**步骤3：关闭可能占用端口的进程（如果遇到端口占用错误）**
```cmd
taskkill /F /IM node.exe
```

**步骤4：启动后端服务器（打开第一个终端窗口）**
```cmd
cd server
npm run dev
```
保持这个窗口打开，后端将在 http://localhost:5000 运行

**步骤5：启动前端服务器（打开第二个终端窗口）**
```cmd
cd "C:\Users\25345\Desktop\移动互联网\client"
npm start
```
保持这个窗口打开，前端将在 http://localhost:3000 运行

---

### 首次运行前的准备工作

**1. 安装依赖（只需运行一次）**
```cmd
cd "C:\Users\25345\Desktop\移动互联网"
npm run install-all
```

**2. 确保 MongoDB 正在运行**
- 检查 MongoDB 服务是否启动
- 或在任务管理器中查看是否有 MongoDB 进程

**3. 初始化数据库（首次运行）**
```cmd
cd "C:\Users\25345\Desktop\移动互联网\server"
node scripts/initDB.js
```

### 📋 启动前准备

**首次运行前，请确保：**

1. ✅ **安装Node.js** (>= 14.0.0)
   - 下载：https://nodejs.org/
   - 验证：`node --version`

2. ✅ **安装MongoDB** (>= 4.4.0)
   - 下载：https://www.mongodb.com/try/download/community
   - 安装时选择 "Install MongoDB as a Service"
   - 或使用MongoDB Atlas云数据库（无需安装，详见START.md）

3. ✅ **安装移动端依赖**（使用美颜功能需要）
   - 运行：`install-mobile-deps.bat`（Windows）
   - 或手动：`cd mobile && npm install expo-image-manipulator @react-native-community/slider`

**注意：** 首次运行前请确保已安装 Node.js 和 MongoDB

### 🌐 访问应用

启动成功后：
- **前端**: http://localhost:3000
- **后端API**: http://localhost:5000
- **健康检查**: http://localhost:5000/health

### 🔑 测试账号

数据库初始化后可使用：
- 邮箱: `traveler1@example.com` 密码: `123456`
- 邮箱: `traveler2@example.com` 密码: `123456`

## 项目结构

```
travel-platform/
├── server/          # 后端服务
│   ├── routes/      # API路由
│   ├── models/      # 数据模型
│   ├── scripts/     # 工具脚本
│   └── services/    # 业务服务
├── client/          # Web前端
│   └── src/         # 源代码
├── mobile/          # 移动端（React Native + Expo）
├── start.bat              # Windows启动脚本（可选）
├── generate-travels.bat   # 批量生成游记数据
├── kill-node-simple.bat   # 关闭Node.js进程（端口占用时使用）
├── kill-port-5000.bat     # 关闭占用端口5000的进程
├── install-mobile-deps.bat # 安装移动端依赖
└── README.md             # 项目文档
```

## API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户接口
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息
- `GET /api/users/search/:keyword` - 搜索用户

### 游记接口
- `GET /api/travels` - 获取游记列表
- `GET /api/travels/:id` - 获取游记详情
- `POST /api/travels` - 创建游记
- `PUT /api/travels/:id` - 更新游记
- `DELETE /api/travels/:id` - 删除游记
- `POST /api/travels/:id/like` - 点赞游记
- `POST /api/travels/:id/comment` - 评论游记
- `POST /api/travels/:id/collect` - 收藏游记

### 地点接口
- `GET /api/locations/:id` - 获取地点详情
- `GET /api/locations/search/nearby` - 搜索附近地点
- `GET /api/locations/search/:keyword` - 按关键词搜索地点
- `GET /api/locations/popular/list` - 获取热门地点

### 社交接口
- `POST /api/social/follow/:userId` - 关注/取消关注用户
- `GET /api/social/following/:userId` - 获取关注列表
- `GET /api/social/followers/:userId` - 获取粉丝列表
- `GET /api/social/recommend` - 获取推荐用户

### 文件接口
- `POST /api/files/upload` - 上传单张图片
- `POST /api/files/upload/multiple` - 上传多张图片

### 轨迹接口
- `POST /api/tracks/upload` - 上传GPS轨迹
- `GET /api/tracks/:travelId` - 获取轨迹

### 天气接口
- `GET /api/weather` - 获取天气信息

### 导航接口
- `POST /api/navigation/route/driving` - 驾车路线规划
- `POST /api/navigation/route/walking` - 步行路线规划
- `POST /api/navigation/route/transit` - 公交路线规划

## 功能特性

### 已实现功能

✅ 用户注册和登录  
✅ 游记创建、编辑、删除  
✅ 照片上传和管理  
✅ GPS轨迹记录  
✅ 地点搜索和整合  
✅ 社交互动（关注、点赞、评论、收藏）  
✅ 地图显示和定位  
✅ **路线规划/导航**（驾车、步行、公交）  
✅ 天气信息查询  
✅ **拍照美颜功能**（预设效果、手动调整）  
✅ 内容推荐（基础版）

### 待实现功能

🔄 AI图像识别和自动打标  
🔄 高级推荐算法  
🔄 实时消息推送  
🔄 视频上传和播放  
🔄 离线数据同步  
🔄 多语言支持

## 第三方服务集成

### 地图服务
- 高德地图API（推荐）
- 百度地图API（备选）

### 天气服务
- 心知天气API（推荐）
- 和风天气API（备选）

**配置天气API：**
1. 访问 https://www.seniverse.com/ 注册账号
2. 获取API密钥
3. 在 `server/.env` 文件中设置：`WEATHER_API_KEY=你的API密钥`
4. 重启服务器生效

**注意：** 如果不配置API密钥，系统会返回模拟天气数据用于开发测试

### 云存储
- 阿里云OSS
- 腾讯云COS

## 📚 配置说明

### 环境变量配置

在 `server/.env` 文件中配置（首次运行 `start.bat` 会自动创建）：

```env
# MongoDB连接
MONGODB_URI=mongodb://localhost:27017/travel_platform

# JWT密钥
JWT_SECRET=your-secret-key

# 天气API（可选）
WEATHER_API_KEY=your-weather-api-key

# DeepSeek AI API（用于AI写作和餐厅推荐）
DEEPSEEK_API_KEY=your-deepseek-api-key
```

## 开发指南

### 添加新功能

1. 在后端 `server/routes/` 创建新的路由文件
2. 在 `server/models/` 创建对应的数据模型
3. 在前端 `client/src/pages/` 创建新页面
4. 更新路由配置

### 数据库模型

主要数据模型：
- **User**：用户信息
- **Travel**：游记内容
- **Location**：地点信息

## 部署

### 生产环境配置要点

1. 设置 `NODE_ENV=production`
2. 配置生产数据库连接
3. 配置CDN和云存储
4. 设置HTTPS
5. 配置域名和反向代理

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系开发团队。

---

**注意**：本项目为教学示例项目，生产环境使用前请进行充分的安全审查和性能优化。
