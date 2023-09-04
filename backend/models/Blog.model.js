const mongoose = require("mongoose")


const BlogSchema = mongoose.Schema({
    title : {type : String},
    category : {type : String},
    Author  : {type : String},
    Content   : {type : String},
    user_id : {type : String, required : true}
})

const BlogModel = mongoose.model("task", BlogSchema)

module.exports = {BlogModel}