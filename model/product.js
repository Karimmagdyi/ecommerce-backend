const mongoose=require('mongoose')
const category = require('./category')
const schema=mongoose.Schema

const productSchema=new schema({
    name:String,
    price: Number,
    image: String,
    description: String,
    quantity:Number,
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    locked:{
        type:Number,
        default:0
    },
    sold:{
        type:Number,
        default:0
    },
    isBestSeller:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('product',productSchema)