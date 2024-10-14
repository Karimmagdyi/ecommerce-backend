const Product = require("../model/product");
const Category = require("../model/category");
const category = require("../model/category");
const cart = require("../model/cart");
const user = require("../model/user");
const Order = require("../model/order");
const product = require("../model/product");
const {
  BadRequest,
  InternalServerError,
  NotFound,
} = require("../utils/helper functions/handleError");

getAllProducts = async (req, res, next) => {
  try {
    const filter = { category: "Devices" };
    const pipeline = [
      { $sort: { sold: -1 } }, // Sort by sold in descending order
      {
        $setWindowFields: {
          sortBy: { sold: -1 }, // Sort again to ensure top-sold ranking
          output: {
            rank: { $rank: {} }, // Rank field to assign positions
          },
        },
      },
      {
        $addFields: {
          isBestSeller: {
            $cond: {
              if: { $lte: ["$rank", 3] }, // Mark top 3 as bestsellers
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1, // Include the _id
          name: 1, // Include product name
          sold: 1, // Include sold field
          isBestSeller: 1,
          image: 1,
          quantity: 1,
          locked: 1,
          category: 1,
        },
      },
    ];

    const products = await product.aggregate(pipeline).exec();

    return res.status(200).json({ products: products });
  } catch (err) {
    return next(new InternalServerError("error while getting the products"));
  }
};

PostAddProduct = async (req, res, next) => {
  const { name, image, price, description, category } = req.body;

  // Check if all fields are provided
  if (!name || !image || !price || !description || !category) {
    return next(new BadRequest("All the field is required"));
  }

  try {
    // let categoryDoc = await Category.findOne({ name: category });

    // if (!categoryDoc) {
    //   categoryDoc = new Category({ name: category });
    //   await categoryDoc.save();
    // }

    let categoryDoc = await Category.findOneAndUpdate(
      { name: category },
      {},
      { upsert: true }
    );

    const product = new Product({
      name,
      price,
      image,
      description,
      category: categoryDoc._id,
      quantity: 5,
    });
    await product.save();
    res.status(200).json({ msg: "Product added successfully", product });
  } catch (error) {
    return next(new InternalServerError("Error adding product"));
  }
};

getCategory = (req, res, next) => {
  try {
    Category.find().then((category) => {
      res.status(200).json({ category: category });
    });
  } catch {
    return next(new NotFound("Not Found Category"));
  }
};

getProductById = (req, res, next) => {
  try {
    Product.findById(req.params.id).then((product) => {
      res.status(200).json({ product: product });
    });
  } catch {
    return next(
      new NotFound(`Not Found product with that id ${req.params.id}`)
    );
  }
};

updateProduct = async (req, res, next) => {
  try {
    const { name, image, price, description, productId } = req.body;
    console.log(req.body, "body");

    //findByIdAndUpdate
    const product = await Product.findById(productId);
    console.log(product, "updated product");
    product.name = name;
    product.price = price;
    product.image = image;
    product.description = description;
    const updatedProduct = await product.save();
    res
      .status(200)
      .json({ msg: "Product updated successfully", product: updatedProduct });
  } catch {
    return next(new BadRequest("cannot update the product"));
  }
};

filteredProduct = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    if (!categoryId) {
      return res.status(400).json({ msg: "Please provide category id" });
    }
    const products = await Product.find({ category: categoryId });
    return res.status(200).json({ products: products });
  } catch {
    return next(new NotFound("products Not Found"));
  }
};
//cron jobs
const postOrder = async (req, res, next) => {
  console.log(req.body, "body");

  try {
    const { cartId, products, userId, totalPrice, paymentStatus, orderId } =
      req.body;

    if (!cartId || !products || !userId || !totalPrice || !paymentStatus) {
      return next(new InternalServerError("all fields is required"));
    }

    if (paymentStatus === "pending") {
      const generatedOrderId = `${userId}-${Date.now()}`;
      console.log(generatedOrderId, "uuid");

      orderInMemory[generatedOrderId] = {
        cartId: cartId,
        products: products,
        userId: userId,
        totalPrice: totalPrice,
        paymentStatus: paymentStatus,
      };

      for (const product of products) {
        const productDoc = await Product.findById(product.productId);
        if (productDoc) {
          productDoc.locked += product.quantity;
          await productDoc.save();
          setTimeout(async () => {
            productDoc.locked -= product.quantity;
            await productDoc.save();
          }, 600000);
        } else {
          return next(
            new NotFound(`Not Found product with that id ${product.productId}`)
          );
        }
      }

      res
        .status(200)
        .json({ message: "Order is pending", orderId: generatedOrderId });
    } else if (paymentStatus === "paid") {
      const order = orderInMemory[orderId]; // Retrieve the order using orderId from request

      if (!order) {
        return next(new NotFound(`Not Found order with that id ${orderId}`));
      }

      // Process the order
      for (const product of order.products) {
        const productDoc = await Product.findById(product.productId);
        if (productDoc) {
          productDoc.locked -= product.quantity;
          productDoc.quantity -= product.quantity;
          productDoc.sold += product.quantity;
          await productDoc.save();
        } else {
          return next(
            new NotFound(`Not Found product with that id ${product.productId}`)
          );
        }
      }

      const newOrder = new Order({
        cartId: cartId,
        products: order.products,
        userId: userId,
        totalPrice: totalPrice,
        paymentStatus: "paid",
      });

      console.log(orderInMemory, "order in memory");

      await newOrder.save();
      await cart.findByIdAndDelete({ _id: cartId });
      delete orderInMemory[orderId]; // Remove the order from memory
      res
        .status(200)
        .json({ message: "Order created successfully", order: newOrder });
    }
  } catch (err) {
    return next(
      new InternalServerError("An error occurred while processing the order")
    );
  }
};

module.exports = {
  getAllProducts,
  PostAddProduct,
  getCategory,
  getProductById,
  updateProduct,
  filteredProduct,
  postOrder,
};
