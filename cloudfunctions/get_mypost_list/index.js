// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  return {
    // 获取帖子列表
    mypostlist: await db.collection('post_collection').where({
      author_id: event.userInfo.openId
    }).orderBy('update_time', 'desc').get()
  }
}


/*
exports.main = async (event, context) => {
  return {
    // 获取帖子列表
    mypostlist: await db.collection('post_collection').field({
      _id: true,
      author_id: true,
      content: true,
      watch_count: true,
      update_time: true
    }).orderBy('update_time', 'desc').get()

  }
}
*/