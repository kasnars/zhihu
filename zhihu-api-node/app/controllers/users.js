
const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config')
const User = require('../model/users')
const Question = require('../model/questions')
const Answer = require('../model/answers')

class Userctl{
  // 查询所有用户
  async find(ctx){
    const {per_page = 10} = ctx.query
    const page = Math.max(ctx.query.page * 1,1) -1
    const perPage = Math.max(per_page * 1,1)
    ctx.body = await User.find({name:new RegExp(ctx.query.q)}).limit(perPage).skip(page*perPage)
  }

  // 通过指定id查找用户
  async findById(ctx){
    let { fields } = ctx.query
    if (!fields){ fields = ';'}
    const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('')
    const populateStr = fields.split(';').filter(f => f).map(f =>{
      if(f === 'employments'){
        return 'employments.company employments.job'
      }
      if(f === 'educations'){
        return 'educations.school educations.major'
      }
      return f
    }).join(' ')
    const user =  await User.findById(ctx.params.id).select(selectFields)
    .populate(populateStr)
    if(!user){ ctx.throw(404,'not found the user,please check the id') }
    ctx.body = user
  }

  // 创建一个新用户
  async create(ctx){
    ctx.verifyParams({
      name:{type:'string',required:true},
      password:{ type:'string', required:true}
    })
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({name})
    if(repeatedUser){
      ctx.throw(409,'the username is be used')
    }
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }

  // 通过id更新指定用户信息
  async update(ctx){
    ctx.verifyParams({
      name:{ type:'string',required:false },
      password:{ type:'string', required:false },
      avatal_url:{type:'string', required:false },
      gender:{type:'string', required:false},
      headline:{type:'string', required:false},
      locations:{type:'array',itemType:'string', required:false},
      business:{type:'string', required:false},
      employments:{type:'array', itenType:'string',required:false},
      educations:{type:'array', itenType:'string',required:false}, 
    })
    const user = await User.findByIdAndUpdate(ctx.params.id,ctx.request.body)
    if(!user){ ctx.throw(404,'not found the user,please check the id') }
    ctx.body = user
  }

  // 通过id删除指定用户并返回204
  async delete(ctx){
    const user =  await User.findByIdAndRemove(ctx.params.id)
    if(!user){ ctx.throw(404,'not found the user,please check the id') }
    ctx.status = 204
  }

  // 登录
  async login(ctx){
    ctx.verifyParams({
      name:{type:'string',required:true},
      password:{ type:'string', required:true}
    })
    const user = await User.findOne(ctx.request.body)
    if(!user){
      ctx.throw(401,'username is not be sgin or password is error')
    }
    const { _id,name } = user
    const token = jsonwebtoken.sign({_id,name},secret,{expiresIn:'1d'})
    ctx.body = { token }
  }

// 验证是否为自己操作本身中间件
  async checkOwner(ctx,next){
    if(ctx.params.id !== ctx.state.user._id){
      ctx.throw(403,'you want to change an other')
    }
    await next()
  }


  // 检查用户是否存在中间件
  async checkUserExist(ctx,next){
    const user = await User.findById(ctx.params.id)
    if(!user){ctx.throw(404,'the user is not exist')}
    await next()
  }
  // 获取某人关注列表
  async listFollowing(ctx){
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if(!user){ctx.throw(404)}
    ctx.body = user.following
  }

  // 关注
  async following(ctx){
    const me = await User.findById(ctx.state.user._id).select('+following')
    if(!me.following.map(id => id.toString()).includes(ctx.params.id)){
      me.following.push(ctx.params.id)
      me.save()
      console.log('关注成功')
    }
    ctx.status = 204
  }

  // 取关
  async unfollowing(ctx){
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
    if(index > -1){
      me.following.splice(index,1)
      me.save()
      console.log('取消关注')
    }
    ctx.status = 204
  }

  // 获取当前用户粉丝列表
  async listFollower(ctx){
    const users = await User.find({following: ctx.params.id})
    ctx.body = users
  }


    // 关注话题
    async followingTopic(ctx){
      const me = await User.findById(ctx.state.user._id).select('+followingTopics')
      if(!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)){
        me.followingTopics.push(ctx.params.id)
        me.save()
        console.log('关注成功')
      }
      ctx.status = 204
    }
  
    // 取关话题
    async unfollowingTopic(ctx){
      const me = await User.findById(ctx.state.user._id).select('+followingTopics')
      const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
      if(index > -1){
        me.followingTopics.splice(index,1)
        me.save()
        console.log('取消关注')
      }
      ctx.status = 204
    }

    // 获取某人关注话题列表
    async listFollowingTopics(ctx){
      const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
      if(!user){ctx.throw(404,'the user is not found')}
      ctx.body = user.followingTopics
    }

    async listQuestions(ctx){
      const questions = await Question.find({questioner: ctx.params.id})
      ctx.body = questions
    }

    async likeAnswer(ctx,next){
      const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
      if(!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)){
        me.likingAnswers.push(ctx.params.id)
        me.save()
        console.log('点赞')
        await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount:1}})
      }
      ctx.status = 204
      await next()
    }
  

    async unlikeAnswer(ctx){
      const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
      const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
      if(index > -1){
        me.likingAnswers.splice(index,1)
        me.save()
        console.log('取消赞')
        await Answer.findByIdAndUpdate(ctx.params.id,{$inc:{voteCount:-1}})
      }
      ctx.status = 204
    }


    async listlikingAnswers(ctx){
      const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
      if(!user){ctx.throw(404,'the user is not found')}
      ctx.body = user.likingAnswers
    }

    async dislikeAnswer(ctx,next){
      const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
      if(!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)){
        me.dislikingAnswers.push(ctx.params.id)
        me.save()
        console.log('踩')
      }
      ctx.status = 204
      await next()
    }
  

    async unDislikeAnswer(ctx){
      const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
      const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
      if(index > -1){
        me.dislikingAnswers.splice(index,1)
        me.save()
        console.log('取消踩')
      }
      ctx.status = 204
    }


    async listDislikingAnswers(ctx){
      const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
      if(!user){ctx.throw(404,'the user is not found')}
      ctx.body = user.dislikingAnswers
    }




    async collectAnswer(ctx,next){
      const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
      if(!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)){
        me.collectingAnswers.push(ctx.params.id)
        me.save()
        console.log('收藏成功')
      }
      ctx.status = 204
      await next()
    }
  

    async unCollectAnswer(ctx){
      const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
      const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
      if(index > -1){
        me.collectingAnswers.splice(index,1)
        me.save()
        console.log('取消收藏')
      }
      ctx.status = 204
    }


    async listCollectAnswers(ctx){
      const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
      if(!user){ctx.throw(404,'the user is not found')}
      ctx.body = user.collectingAnswers
    }
}

module.exports = new Userctl()