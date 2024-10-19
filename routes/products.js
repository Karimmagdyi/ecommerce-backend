const express=require('express')
const router=express.Router()
const productController=require('../controller/products')
const {authenticateJWT}=require('../middelware/authorization')

router.get('/products',authenticateJWT,productController.getAllProducts)
router.get('/product/:id',authenticateJWT,productController.getProductById)
router.post('/products',productController.PostAddProduct)
router.get('/category',productController.getCategory)
router.get('/category/products',productController.filteredProduct)
router.put('/edit-product',productController.updateProduct)
router.get('/products/search',productController.searchProduct)





module.exports=router