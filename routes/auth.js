const express=require('express')
const router=express.Router()
const authController=require('../controller/user')

router.post('/login',authController.postLogin)
router.post('/signup',authController.postSignup)
router.get('/user',authController.getUser)
router.post('/user',authController.editProfilePicture)

module.exports=router
