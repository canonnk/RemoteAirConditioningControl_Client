# Univerify 一键登录配置指南

## 概述

本项目已集成uni-app的univerify一键登录功能，支持三大运营商（移动、联通、电信）的一键登录服务。

## 配置步骤

### 1. 开通univerify服务

1. 登录 [DCloud开发者中心](https://dev.dcloud.net.cn/)
2. 进入应用管理，选择你的应用
3. 在"各平台信息"中配置Android/iOS平台信息
4. 开通"univerify 一键登录"服务

### 2. 获取配置信息

开通服务后，你将获得：
- `appid`: 应用标识
- `apiKey`: API密钥  
- `apiSecret`: API密钥

### 3. 配置云函数

修改 `uniCloud-aliyun/cloudfunctions/common/uni-config-center/uni-id/config.json`:

```json
{
  "service": {
    "univerify": {
      "appid": "你的univerify_appid",
      "apiKey": "你的univerify_api_key", 
      "apiSecret": "你的univerify_api_secret"
    }
  }
}
```

### 4. 配置短信服务

同时需要配置短信服务作为备用登录方式：

```json
{
  "service": {
    "sms": {
      "name": "your-sms-service-name",
      "codeExpiresIn": 300,
      "smsKey": "your-sms-key",
      "smsSecret": "your-sms-secret"
    }
  }
}
```

### 5. 应用配置

在 `manifest.json` 中配置：

```json
{
  "app-plus": {
    "oauth": {
      "univerify": {
        "description": "一键登录"
      }
    }
  }
}
```

## 功能特性

### 一键登录流程

1. **环境检测**: 自动检测是否支持一键登录
2. **预登录**: 提前初始化登录环境，提升用户体验
3. **界面自定义**: 支持自定义登录界面样式
4. **安全验证**: 云端验证access_token，获取真实手机号
5. **用户管理**: 集成uni-id用户系统

### 短信验证码备用

- 当一键登录不可用时，自动降级到短信验证码登录
- 支持验证码发送频率限制
- 开发环境支持调试模式

### 错误处理

完善的错误处理机制：
- 30001: 一键登录服务初始化失败
- 30002: 用户取消登录  
- 30003: 未开通一键登录服务
- 30004: 应用未配置一键登录
- 30005: 一键登录服务不可用

## 测试说明

### 开发环境

- 一键登录需要在真机上测试，模拟器不支持
- 短信验证码在开发环境会返回调试验证码
- 建议先在HBuilderX中打包自定义基座进行测试

### 生产环境

- 确保已正确配置所有密钥信息
- 上架前需要在各大应用商店配置包名/Bundle ID
- 建议同时配置短信服务作为备用方案

## 安全建议

1. **密钥管理**: 所有密钥信息应存储在云函数配置中，不要硬编码在客户端
2. **Token验证**: 所有API调用都应验证用户token有效性
3. **频率限制**: 对短信发送和登录尝试进行频率限制
4. **日志记录**: 记录关键操作日志，便于问题排查

## 常见问题

### Q: 一键登录按钮点击无反应？
A: 检查是否在真机上测试，确认已正确配置univerify服务

### Q: 提示"未开通一键登录服务"？
A: 需要在DCloud开发者中心开通univerify服务

### Q: 获取手机号失败？
A: 检查云函数配置中的apiKey和apiSecret是否正确

### Q: 短信验证码收不到？
A: 检查短信服务配置，确认短信模板已审核通过

## 相关文档

- [uni-app univerify文档](https://uniapp.dcloud.net.cn/univerify.html)
- [uni-id文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id.html)
- [uniCloud云函数文档](https://uniapp.dcloud.net.cn/uniCloud/cf-functions.html)