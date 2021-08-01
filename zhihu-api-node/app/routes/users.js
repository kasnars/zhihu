const jwt = require('koa-jwt')
const jsonwebtoken = require('jsonwebtoken')
const Router = require('koa-router')
const router = new Router({prefix: '/users'})
// const bodyparser = require('koa-bodyparser')
const { find,findById,create,update,delete:del,login,checkOwner,
  listFollowing,following, unfollowing, listFollower,
  checkUserExist, followingTopic, unfollowingTopic,
  listFollowingTopics,listQuestions,
  likeAnswer,unlikeAnswer,listlikingAnswers,
  dislikeAnswer,unDislikeAnswer,listDislikingAnswers,
  collectAnswer,unCollectAnswer,listCollectAnswers
} = require('../controllers/users')
const secret = require('../config')

const auth = jwt({secret:'kasnars-jwt'})
const { checkTopicExist} = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')

// 获取全部users
router.get('/', find)

// 请求体用request
// 新建用户
router.post('/',create)

//带id
//query用params
// 获取指定用户信息
router.get('/:id',findById)

// 修改指定用户
router.patch('/:id',auth, checkOwner, update)

// 删除指定用户
router.delete('/:id',auth, checkOwner, del)

// 
router.post('/login',login)

router.get('/:id/following',listFollowing)

router.put('/following/:id',auth,checkUserExist,following)

router.delete('/unfollowing/:id',auth,checkUserExist,unfollowing)

router.get('/:id/followers',listFollower)

router.put('/followingtopics/:id',auth,checkTopicExist,followingTopic)

router.delete('/unfollowingtopics/:id',auth,checkTopicExist,unfollowingTopic)

router.get('/:id/followingtopics',listFollowingTopics)

router.get('/:id/questions',listQuestions)

router.put('/likingAnswers/:id',auth,checkAnswerExist,likeAnswer,unDislikeAnswer)

router.delete('/unlikingAnswers/:id',auth,checkAnswerExist,unlikeAnswer)

router.get('/:id/likingAnswers',listlikingAnswers)

router.put('/dislikingAnswers/:id',auth,checkAnswerExist,dislikeAnswer,unlikeAnswer)

router.delete('/undislikingAnswers/:id',auth,checkAnswerExist,unDislikeAnswer)

router.get('/:id/dislikingAnswers',listDislikingAnswers)

router.put('/collectAnswers/:id',auth,checkAnswerExist,collectAnswer)

router.delete('/uncollectAnswers/:id',auth,unCollectAnswer,)

router.get('/:id/collectAnswers',listCollectAnswers)



module.exports = router