const path = require('path')

class Homectl {
  index(ctx){
    ctx.body = '<h1>this router index</h1>'
  }
  upload(ctx){
    const file = ctx.request.files.file
    const basename = path.basename(file.path)
    ctx.body = { url:`${ctx.origin}/uploads/${basename}`}
  }
}

module.exports = new Homectl()