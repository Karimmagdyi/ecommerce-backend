require('dotenv').config()
const express=require('express')
const bodyParser=require('body-parser')
const session=require('express-session')
const mongoDBStore=require('connect-mongodb-session')(session)
const mongoose=require('mongoose')
const cors=require('cors')
const app=express()
const productRouter=require('./routes/products')
const authRouter=require('./routes/auth')
const cartRouter=require('./routes/cart')
const multer=require('multer')
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // Import the path module
const fs = require('fs');
const handleError=require('./middelware/errorHandling')

app.use('/images', express.static(path.join(__dirname, 'images')));
const imagesDir = path.join(__dirname, 'images'); // __dirname gives the current directory
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir); // Create the directory
}
const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies or authorization headers
    optionsSuccessStatus: 200, // For legacy browser support
};

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function(req, file, cb) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(multer({storage:storage}).single('profilePicture'))

  app.use(productRouter)
  app.use(authRouter)
  app.use(cartRouter)
  app.use(handleError)


mongoose.connect(process.env.MONGODB_URI)
.then((result)=>{
   const server= app.listen(process.env.PORT||3002)
   console.log(`server running on port ${process.env.PORT||3002}`);
   const io = require('./socekts').init(server);
   io.on('connection',stream=>{
    console.log('Client connected')
   })
})
.catch((err)=>{
    console.log(err)
})






