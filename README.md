# README

## Paper Share

一款试卷分享微信⼩程序，包括了基本的试卷带图分享、成员评论、聊天室交流、云端应⽤等。基于官⽅微信开发者平台，基本实现了设计需求，可成为当前⼤学⽣校内资料分享需求的⼀种客观解决⽅案。

A test paper sharing widget program, including the basic test paper with picture sharing, member comments, chat room communication, cloud applications and so on. Based on the official Wechat developer platform, t he design requirements are basically realized, which can be an objective solution to the current college students' demand for information sharing.

### 模块及功能
本⼩程序共分为以下⼏个模块：⽤户登录，试卷上传，评论展示与聊天室功能。在对应的每⼀模块下分有⽤户详情，试卷标签，图⽚评论等附加功能。

- ⽤户登录模块 `pages/authorize`：采⽤微信⽤户授权登录⽅式，接⼊微信账号信息，同时为单个⽤户设置了个⼈问题展示⻚⾯，⽅便个⼈⽤户管理、查看个⼈提出的信息。

- 试卷上传 `pages/publish`：具有图⽚上传和⽂字上传两种功能，可同时实现多种试卷形式的提交与互动。其余⽤户可在每份试卷的评论区进⾏评论交流 `pages/comment`，与试卷提交者与其他⽤户交流。每⼀份试卷还可由提交者上传不同的标签，存⼊云数据库后可在后台进⾏进⼀步分析处理，同时⽅便⽤户查看使⽤⾃⼰想要的资料。

- 试卷查看 `pages/post list` & `pages/post list`：⾸⻚以时间顺序显示当前科⽬所有上传的试卷资料与学习内容，⽤户可逐⼀察看，进⾏下载评论等功能。

- 聊天室 `pages/chat room`：在⼩程序主体功能为公共开放的基础上，添加⽤户⼩范围聊天室功能。在原有的基本功能实现之外增加更针对性的社交功能与私密性，使得整体⼩程序实⽤程度与应⽤范围进⼀步拓宽，完成了已有功能的补充。

- 云开发在本⼩程序中的应⽤：本⼩程序使⽤微信云函数和云数据库完成了相关设计，试卷内容与⽤户详情同步上传云数据库，同时使⽤了云函数简化开发流程。云数据库中存放了⽤户上传的试卷内容，单份试卷浏览详情，⽤户消息等内容，⽅便后台调⽤处理。

### 预览

![登录页面](PaperShare_WechatApplet/DemoImage/组合 1.jpg)

