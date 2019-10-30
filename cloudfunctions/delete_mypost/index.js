// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  await db.collection('comment_collection').where({
    postid: event.postid
  }).remove()

  await db.collection('post_collection').where({
    _id: event.postid
  }).remove()

  return
}