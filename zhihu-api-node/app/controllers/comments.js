const Comment = require('../model/comments')

class CommentsCtl{
  async checkCommentExist(ctx,next){
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    if(!comment){ctx.throw(404,'the comment is not exist')}
    if(ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId){
      ctx.throw(404,'评论不存在')
    }
    if(ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId){
      ctx.throw(404,'评论不存在')
    }
    ctx.state.comment = comment
    await next()
  }
  async find(ctx){
    const {per_page = 10} = ctx.query
    const page = Math.max(ctx.query.page * 1,1) -1
    const perPage = Math.max(per_page * 1,1)
    const q = new RegExp(ctx.query.q)
    const {questionId,answerId} = ctx.params
    const { rootCommentId } = ctx.query
    ctx.body = await Comment
    .find({content:q,questionId,answerId,rootCommentId})
    .limit(perPage).skip(page*perPage)
    .populate('commentator replyTo')
  }

  async findById(ctx){
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +'+f).join('')
    const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
    ctx.body = comment
  }

  async create(ctx){
    ctx.verifyParams({
      content: {type:'string',required:true},
      rootCommentId: {type:'string',required:false},
      replyTo: {type:'string',required:false},
    })
    const commentator = ctx.state.user._id
    const { questionId,answerId } = ctx.params
    const comment = await new Comment({...ctx.request.body,commentator,questionId,answerId}).save()
    ctx.body = comment
  }

  async update(ctx){
    ctx.verifyParams({
      content: {type:'string',required:false},
    })
    const {content} = ctx.request.body
    await ctx.state.comment.update(content)
    ctx.body = ctx.state.comment
  }

  async delete(ctx){
    await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
  }

  async checkCommentator(ctx,next){
    const {comment} = ctx.state
    if(comment.commentator.toString() !== ctx.state.user._id){
      ctx.throw(403,'没有权限')
    }
    await next()
  }
}

module.exports = new CommentsCtl()