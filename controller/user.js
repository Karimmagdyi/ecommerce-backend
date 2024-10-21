const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cart = require("../model/cart");
const io = require("../socekts");
const Product = require("../model/product");
const { default: mongoose } = require("mongoose");
const {
  InternalServerError,
  NotFound,
  ValidationError,
} = require("../utils/helper functions/handleError");

exports.postSignup = (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;
  console.log(req.body);

  // Check for required fields
  if (!name || !email || !password) {
    return next(new ValidationError("Please add all fields"));
  }

  // Check if the user already exists
  User.findOne({ email: email })
    .then((userExist) => {
      if (userExist) {
        return next(new ValidationError("email already exist"));
      }
      return bcrypt.hash(password, 12); // Hash the password if user doesn't exist
    })
    .then((hashedPassword) => {
      const user = new User({
        name,
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false, // Default to false if not provided
      });
      return user.save(); // Save the user to the database
    })
    .then((user) => {
      res.json({ message: "User created successfully", user: user });
    })
    .catch((err) => {
      // Ensure headers are not sent before sending the response
      if (!res.headersSent) {
        return next(new InternalServerError("internal server error"));
      }
    });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ValidationError("Please add all fields"));
  }
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return next(new ValidationError("Invalid email or password"));
    }
    bcrypt.compare(password, user.password).then((doMatch) => {
      if (!doMatch) {
        return next(new ValidationError("Invalid email or password"));
      }
      const token = jwt.sign(
        { id: user.id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );
      io.getIo().on("connection", (socket) => {
        console.log("user connected");
      });
      res.json({ token: token, user: user });
    });
  });
};

exports.getUser = (req, res, next) => {
  const userId = req.query.userId;
  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      return next(new NotFound("User not found"));
    }
    return res.json({ user: user });
  });
};

exports.editProfilePicture = (req, res, next) => {
  const userId = req.body.userId;
  console.log(userId, "id");

  console.log("Uploaded file:", req.file);
  const picture = req.file;
  if (!picture) {
    return next(new ValidationError('"No file uploaded."'));
  }
  const relativePath = `/images/${picture.filename}`;
  User.findOneAndUpdate(
    { _id: userId },
    { profilePicture: relativePath },
    { new: true }
  )
    .then((user) => {
      return res.json({
        message: "Profile picture updated successfully",
        user: user,
      });
    })
    .catch((err) => {
      return next(new InternalServerError("cannot update profile picture"));
    });
};

exports.postUserCart = async (req, res, next) => {
  const userId = req.body.userId;
  const productId = req.body.productId;
  const session = await mongoose.startSession();

  try {
    //
    session.startTransaction();
    const product = await Product.findOne({ _id: productId }).session(session);
    if (!product) {
      await session.abortTransaction();
      return next(new NotFound("Product not found"));
    }
    //check if the cart exist
    let cart = await Cart.findOne({ userId })
      .session(session)
      .populate("products.productId");
    if (!cart) {
      const newCart = new Cart({
        userId: userId,
        products: [{ productId: productId, quantity: 1 }],
      });
      cart = await newCart.save({ session });
    }
    //Check if the product exist in the cart
    else {
      const productIndex = cart.products.findIndex((product) =>
        product.productId.equals(productId)
      );

      if (productIndex !== -1) {
        if (cart.products[productIndex].quantity < product.quantity) {
          cart.products[productIndex].quantity += 1;
        } else {
          return next(new InternalServerError("No Items Lefts"));
        }
      } else {
        cart.products.push({
          productId: productId,
          quantity: 1,
        });
      }
      cart = await cart.save({ session });
    }

    await session.commitTransaction();

    const io = require("../socekts").getIo();
    io.emit("productUpdated", {
      productId,
      quantity: product.quantity,
      sold: product.locked,
    });

    res.status(200).json({
      message: "Cart updated successfully",
      cart: cart,
    });
  } catch (err) {
    if (session.transaction.state === "TRANSACTION_IN_PROGRESS") {
      await session.abortTransaction();
    }
    return next(new InternalServerError("Error updating cart:"));
  } finally {
    session.endSession();
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return next(new ValidationError("userId is required"));
    }
    console.log(userId, "id");
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return next(new NotFound("cart not found"));
    }

    return res.json({ cart: cart });
  } catch {
    return next(new InternalServerError("Error fetching cart"));
  }
};




