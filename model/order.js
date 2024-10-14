const mongoose=require('mongoose')
const schema=mongoose.Schema
const orderSchema=new schema({
    cartId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cart'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    products:{
        type:Array,
    },
    totalPrice:{
        type:Number
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
      },

},{timestamps:true})

module.exports=mongoose.model('order',orderSchema)