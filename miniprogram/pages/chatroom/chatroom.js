/* 聊天窗口
 * 其中54px为回复框高度，css同
 * mode true为文本，false为语音
 * cancel true为取消录音，false为正常录音完毕并发送
 * 上拉超过50px为取消发送语音
 * status 0为normal，1为pressed，2为cancel
 * hud的尺寸是150*150
 */
const util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatLoaded:false,
    imagesLoaded: false,
    detail: {},
    imageUrls: [],
    maxChatLength: 300,
    chats: [],
    chatid: '',
    author_name: app.globalData.wechatNickName,
    author_avatar_url: app.globalData.wechatAvatarUrl,
    message_list: [{
      myself: 0,
      head_img_url: 'https://wx.qlogo.cn/mmopen/vi_32/9iaFEZQONMdNbicgCj2IqHDsicgMKUH7IhMsjAw0xEFBRbg2ZibFsTTpTWkmMRCjXhlNrh4ibOibYo9bBO9mTW3rq0jw/132',
      'msg_type': 'text',
      'content': '这道题的解题思路是：',
      create_time: '2019-06-29 14:00:19'
    },
    {
      myself: 1,
      head_img_url: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqCFu09YSGoFyCaia25U9RSKFWWPSibUwgNsFOnbCQP3qBf4NHthLQ8Zia2DIicqEicIa405zibmlEYnkLQ/132',
      'msg_type': 'image',
      'content': '../../images/cat.png',
      create_time: '2019-06-29 17:20:39'
    }
    ],
    scroll_height: wx.getSystemInfoSync().windowHeight - 54,
    page_index: 0,
    mode: true,
    cancel: false,
    status: 0,
    tips: ['按住 说话', '松开 结束', '取消 发送'],
    state: {
      'normal': 0,
      'pressed': 1,
      'cancel': 2
    },
    toView: ''
  },
  
  refreshChat: function (chatid) {
    var that = this
    wx.cloud.callFunction({
      name: 'get_chat_history',
      data: {
        chatid: chatid,
      },
      success: function (res) {
        console.log(res.result.chat_list.data)
        var chatList = res.result.chat_list.data
        for (let i = 0; i < chatList.length; i++) {
          chatList[i].time = util.formatTime(new Date(chatList[i].time))
        }
        that.setData({
          chats: res.result.chat_list.data,
          chatLoaded: true
        })
        that.checkLoadFinish()
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log('chatid', options.chatid)
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('chat_collection').add({
      data: {
        initiator: app.globalData.user,
        receiver: app.globalData.topic[0].user,
        text: "偏爱",
        myself: 1,
        msg_type: 'text',
        create_time: '2018-07-31 21:04:31'
      },
      success: function (res) {
        // 清空数据
        console.log("success")
      },
    })
    db.collection('chat_collection').doc(options.chatid).get({
      success: function (res) {
        console.log(res.data)
      }
    })

    // 获取评论
    this.refreshChat(options.chatid)

  },
  /**
   * 从数据库获取图片的fileId，然后去云存储下载，最后加载出来
   */
  downloadImages: function (image_urls) {
    var that = this
    if (image_urls.length == 0) {
      that.setData({
        imageUrls: [],
        imagesLoaded: true
      })
    } else {
      var urls = []
      for (let i = 0; i < image_urls.length; i++) {
        wx.cloud.downloadFile({
          fileID: image_urls[i],
          success: res => {
            // get temp file path
            console.log(res.tempFilePath)
            urls.push(res.tempFilePath)
            if (urls.length == image_urls.length) {
              console.log(urls)
              that.setData({
                imageUrls: urls,
                imagesLoaded: true
              })
              this.checkLoadFinish()
            }
          },
          fail: err => {
            // handle error
          }
        })

      }
    }
    this.checkLoadFinish()
  },

  /**
   * 带参跳转，发送
   */

  checkLoadFinish: function () {
    const that = this
    if (that.data.chatLoaded
      && that.data.imagesLoaded) {
      wx.hideLoading()
    }
  },

  reply: function (e) {
    var content = e.detail.value;
    if (content == '') {
      wx.showToast({
        title: '写点什么'
      });
      return;
    }
    var message_list = this.data.message_list;
    var message = {
      myself: 1,
      head_img_url: this.author_avatar_url,
      'msg_type': 'text',
      'content': content,
      create_time: '2018-07-31 21:04:31'
    }
    message_list.push(message);
    this.setData({
      message_list: message_list,
      content: '' // 清空输入框文本
    })
    this.scrollToBottom();
  },
  chooseImage: function () {
    // 选择图片供上传
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        // console.log(tempFilePaths);
        // 遍历多图
        tempFilePaths.forEach((tempFilePath) => {
          this.upload(tempFilePath, 'image');
        });
      }
    })
  },
  preview: function (e) {
    // 当前点击图片的地址
    var src = e.currentTarget.dataset.src;
    // 遍历出使用images
    var images = [];
    this.data.message_list.forEach(function (messasge) {
      if (messasge != null && messasge.msg_type == 'image') {
        images.push(messasge.content);
      }
    });
    // 预览图片
    wx.previewImage({
      urls: images,
      current: src
    });
  },
  switchMode: function () {
    // 切换语音与文本模式
    this.setData({
      mode: !this.data.mode
    });
  },
  record: function () {
    // 录音事件
    wx.startRecord({
      success: function (res) {
        if (!this.data.cancel) {
          this.upload(res.tempFilePath, 'voice');
        }
      },
      fail: function (res) {
        console.log(res);
        //录音失败
      },
      complete: function (res) {
        console.log(res);

      }
    })
  },
  stop: function () {
    wx.stopRecord();
  },
  touchStart: function (e) {
    // 触摸开始
    var startY = e.touches[0].clientY;
    // 记录初始Y值
    this.setData({
      startY: startY,
      status: this.data.state.pressed
    });
  },
  touchMove: function (e) {
    // 触摸移动
    var movedY = e.touches[0].clientY;
    var distance = this.data.startY - movedY;
    // console.log(distance);
    // 距离超过50，取消发送
    this.setData({
      status: distance > 50 ? this.data.state.cancel : this.data.state.pressed
    });
  },
  touchEnd: function (e) {
    // 触摸结束
    var endY = e.changedTouches[0].clientY;
    var distance = this.data.startY - endY;
    // console.log(distance);
    // 距离超过50，取消发送
    this.setData({
      cancel: distance > 50 ? true : false,
      status: this.data.state.normal
    });
    // 不论如何，都结束录音
    this.stop();
  },
  upload: function (tempFilePath, type) {
    // 开始上传
    wx.showLoading({
      title: '发送中'
    });
    // 语音与图片通用上传方法
    var formData = {
      third_session: wx.getStorageSync('third_session'),
      mpid: this.data.mpid,
      fans_id: this.data.to_uid,
      msg_type: type,
    };
    // console.log(tempFilePath);
    var message_list = this.data.message_list;
    var message = {
      myself: 1,
      head_img_url: 'http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqSucF9v6bKPfUPSTuQjpqmr8jAZEOgsFjFCHc73UIlUAgnI2nz6aFdnkRWAxxy1uZGfC82Yp7fMg/0',
      'msg_type': type,
      'content': tempFilePath,
      create_time: '2018-07-31 17:20:39'
    };
    message_list.push(message);
    this.setData({
      message_list: message_list
    })
    this.scrollToBottom()
    setTimeout(() => {
      wx.hideLoading();
    }, 500)
  },
  scrollToBottom: function () {
    this.setData({
      toView: 'row_' + (this.data.message_list.length - 1)
    });
  },
})