const express = require("express");
const User = require("../models/user");
const { Product } = require("../models/product");
const auth = require("../middlewares/auth");
const Order = require("../models/order");
const userRouter = express.Router();

// add item to cart
userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user;

    const product = await Product.findById(id);
    let user = await User.findById(userId);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isInCart = false;
      for (let i = 0; i < user.cart.length; i++) {
        let cartItem = user.cart[i];
        if (cartItem.product._id.equals(product._id)) {
          cartItem.quantity += 1;
          isInCart = true;
          break;
        }
      }

      if (!isInCart) {
        user.cart.push({ product, quantity: 1 });
      }
    }

    user = await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// remove item from cart
userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const product = await Product.findById(id);
    let user = await User.findById(userId);

    for (let i = 0; i < user.cart.length; i++) {
      const cartItem = user.cart[i];
      if (cartItem.product._id.equals(product._id)) {
        if (cartItem.quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          cartItem.quantity -= 1;
        }
      }
    }

    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// save user address
userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user;

    let user = await User.findById(userId);

    user.address = address;

    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// order product
userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalAmount, address } = req.body;
    const userId = req.user;
    let products = [];

    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);

      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      } else {
        return res
          .status(400)
          .json({ message: `${product.name} is out of stock!` });
      }
    }

    let user = await User.findById(userId);
    user.cart = [];
    user = await user.save();

    let order = new Order({
      products,
      address,
      totalAmount,
      userId,
      orderedAt: new Date().getTime(),
    });

    order = await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all user orders
userRouter.get("/api/my-orders", auth, async (req, res) => {
  try {
    const userId = req.user;

    const orders = await Order.find({ userId });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = userRouter;
