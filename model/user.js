const mongoose=require('mongoose')
const product = require('./product')
const { boolean } = require('webidl-conversions')
const { type } = require('os')
const schema=mongoose.Schema

const userSchema=new schema({
    name:String,
    email:String,
    password:String,
    admin:{type:Boolean,default:false},
    profilePicture: {
        type: String,
        default: '',
    },
})

module.exports=mongoose.model('user',userSchema)