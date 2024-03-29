// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return {
    // 获取帖子列表
    postlist: await db.collection('post_collection').field({
      _id: true,
      author_id: true,
      content: true,
      typecontent: true,
      watch_count: true,
      update_time: true,
      typecontent: true
    }).orderBy('update_time', 'desc').get()

  }
}
