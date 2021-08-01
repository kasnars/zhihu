const jwt = require('koa-jwt')
const jsonwebtoken = require('jsonwebtoken')
const Router = require('koa-router')
const router = new Router({prefix: '/questions'})
// const bodyparser = require('koa-bodyparser')
const { find,findById,create,update, delete:del,checkQuestionExist,checkQuestioner} = require('../controllers/questions')
const secret = require('../config')

const auth = jwt({secret:'kasnars-jwt'})

router.get('/', find)


router.post('/',auth,create)

router.get('/:id',checkQuestionExist,findById)

router.patch('/:id',auth, checkQuestionExist,checkQuestioner,update)

router.delete('/:id',auth,checkQuestionExist,checkQuestioner,del)

module.exports = router