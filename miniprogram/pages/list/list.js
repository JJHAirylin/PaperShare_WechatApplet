//chat.js
//获取应用实例
const util = require('../../utils/util.js'); 

const app = getApp()
const friends = require('./list-mock-data.js')

Page({
  data: {
    friends: friends.list,
    postlist: null,
    update: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  gotoChat(event) {
    const currentUser = event.currentTarget.dataset.user;
    wx.navigateTo({
      url: '../chatroom/chatroom?nickname=' + currentUser.nickname
    })
  },
  refresh: function () {
    var that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'get_chat_history',
      success: function (res) {
        //提取数据
        var data = res.result.chatlist.data
        for (let i = 0; i < data.length; i++) {
          console.log(data[i])
          data[i].update_time = util.formatTime(new Date(data[i].update_time))
        }
        wx.hideLoading()
        that.setData({
          chatlist: data
        })
        wx.stopPullDownRefresh()
      },
      fail: console.error
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.startPullDownRefresh()
    this.refresh()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    if (this.data.update) {
      wx.startPullDownRefresh()
      this.refresh()
      this.setData({
        update: false
      })
    }

    wx.getStorage({
      key: 'userInfo',
      success: function (res) {

      },
      fail: function () {
        that.userInfoAuthorize()
      }
    })
  },
  /**
   * 用户认证
   */
  userInfoAuthorize: function () {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) { // 存储用户信息
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo.nickName)
              console.log(util.formatTime(new Date()))

              wx.setStorage({
                key: app.globalData.userInfo,
                data: res.userInfo,
              })
              app.globalData.wechatNickName = res.userInfo.nickName
              app.globalData.wechatAvatarUrl = res.userInfo.avatarUrl
            }
          })
        } else { // 跳转到授权页面 
          wx.navigateTo({
            url: '/pages/authorize/authorize',
          })
        }
      }
    })
  },
  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh: function () {
    this.refresh()
  },
  onLClick: function (e) {
    console.log(e.currentTarget.dataset.chatid)
    wx.navigateTo({
      url: '../chatroom/chatroom?chatid=' + e.currentTarget.dataset.chatid,
    })
  }
})
