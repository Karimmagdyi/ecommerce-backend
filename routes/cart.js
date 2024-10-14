const express=require('express')
const router=express.Router()
const userController=require('../controller/user')

router.get('/cart',userController.getCart)
router.post('/cart',userController.postUserCart)


module.exports=router