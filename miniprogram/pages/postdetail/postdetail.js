const util = require('../../utils/util.js');  
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentLoaded: false,
    imagesLoaded: false,
    commentLoaded: false,
    detail: {},
    imageUrls: [],
    maxContentLength: 300,
    comments: [],
    postid: '',
    topic: {}
  },
  refreshComment: function(postid){
    var that = this
    wx.cloud.callFunction({
      name: 'get_comment_for_post',
      data: {
        postid: postid,
      },
      success: function (res) {
        console.log(res.result.comment_list.data)
        var commentList = res.result.comment_list.data
        for (let i = 0; i < commentList.length; i++) {
          commentList[i].time = util.formatTime(new Date(commentList[i].time))
        }
        that.setData({
          comments: res.result.comment_list.data,
          commentLoaded: true
        })
        that.checkLoadFinish()
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    console.log('postid',options.postid)
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('post_collection').doc(options.postid).get({
      success: function (res) {
        console.log(res.data),
          that.topic = res.data;
        that.setData({
          topic: that.topic,
        })
      }
    })

    // 更新浏览次数，TODO本地如何及时同步
    wx.cloud.callFunction({
      name: 'update_watch_count',
      data: {
        postid: options.postid
      },
      success: function (res) {
        console.log('更新成功')
      }
    })

    // 获取内容
    wx.cloud.callFunction({
      // 云函数名称 
      name: 'get_post_detail',
      data: {
        postid: options.postid
      },
      success: function (res) {
        var postdetail = res.result.postdetail.data[0];
        postdetail.publish_time = util.formatTime(new Date(postdetail.publish_time))
        that.setData({
          detail: postdetail,
          contentLoaded: true
        })
        //下载图片
        that.downloadImages(postdetail.image_url)
      },
      fail: console.error
    })
    this.setData({
      postid: options.postid
    })

    // 获取评论
    this.refreshComment(options.postid)
  },
  /**
   * 从数据库获取图片的fileId，然后去云存储下载，最后加载出来
   */
  downloadImages: function(image_urls){
    var that = this
    if(image_urls.length == 0){
      that.setData({
        imageUrls: [],
        imagesLoaded: true
      })
    } else {
      var urls = []
      for(let i = 0; i < image_urls.length; i++) {
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
   * 带参跳转，发送评论
   */
  newComment: function (e) {
    wx.navigateTo({
      url: '../comment/comment'
    })
  },

  checkLoadFinish: function() {
    const that = this
    if (that.data.contentLoaded
          && that.data.imagesLoaded
          && that.data.commentLoaded){
      wx.hideLoading()
    }
  },
  onCClick: function (e) {
    console.log(e.currentTarget.dataset.postid)
    wx.navigateTo({
      url: '../chatroom/chatroom?postid=' + e.currentTarget.dataset.postid,
    })
  }
})
