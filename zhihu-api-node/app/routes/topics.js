const jwt = require('koa-jwt')
const jsonwebtoken = require('jsonwebtoken')
const Router = require('koa-router')
const router = new Router({prefix: '/topics'})
// const bodyparser = require('koa-bodyparser')
const { find,findById,create,update, listTopicFollower,checkTopicExist,listQuestions} = require('../controllers/topics')
const secret = require('../config')

const auth = jwt({secret:'kasnars-jwt'})

router.get('/', find)


router.post('/',auth,create)

router.get('/:id',checkTopicExist,findById)

router.patch('/:id',auth, checkTopicExist,update)

router.get('/:id/followers',checkTopicExist,listTopicFollower)

router.get('/:id/questions',checkTopicExist,listQuestions)

module.exports = router