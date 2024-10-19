const Order = require("../model/order");
const Cart = require("../model/cart");
const Product = require("../model/product");
const { NotFound } = require("../utils/helper functions/handleError");

let orderInMemory={}
exports.postOrder = async (req, res, next) => {
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
      await Cart.findByIdAndDelete({ _id: cartId });
      delete orderInMemory[orderId]; // Remove the order from memory
      res
        .status(200)
        .json({ message: "Order created successfully", order: newOrder });
    }
  } catch (err) {
    console.log(err,'err');
    
    return next(
      new InternalServerError("An error occurred while processing the order")
    );
  }
};

exports.getOrder = async (req, res, next) => {
  const { userId } = req.query;
  console.log(userId,'userId');
  
  if (!userId) {
    return next(new NotFound("User id is required"));
  }
  const order = await Order.find({ userId: userId });
  console.log(order,'orders');
  
  if (!order) {
    return next(new NotFound(`there is no order with that id:${userId}`));
  }
  return res.status(200).json({ message: "orders", orders: order });
};
