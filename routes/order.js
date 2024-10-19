const express=require('express')
const router=express.Router()
const orderController=require('../controller/order')


router.get('/order',orderController.getOrder)
router.post('/order',orderController.postOrder)


module.exports=router