const mongoose=require('mongoose')
const schema=mongoose.Schema
const cartSchema=new mongoose.Schema({
    userId:{
        type:schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            }
        }
    ],
})

cartSchema.virtual('totalPrice').get(function() {
    return this.products.reduce((acc, product) => {
        return acc + (product.productId.price * product.quantity);
    }, 0);
});
cartSchema.virtual('TotalQuantity').get(function(){
    return this.products.reduce((acc, product) => {
        return acc + product.quantity;
    },0)
})

cartSchema.set('toJSON', { virtuals: true });
module.exports=mongoose.model('cart',cartSchema)