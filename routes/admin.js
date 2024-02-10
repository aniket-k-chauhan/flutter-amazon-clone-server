const express = require("express");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const { Product } = require("../models/product");
const Order = require("../models/order");
const adminRouter = express.Router();

// Add Product
adminRouter.post("/admin/add-product", auth, admin, async (req, res) => {
  try {
    const { name, description, price, quantity, category, images } = req.body;
    let product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      images,
    });

    product = await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all products
adminRouter.get("/admin/get-products", auth, admin, async (req, res) => {
  try {
    const products = await Product.find({});

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete product
adminRouter.delete(
  "/admin/delete-product/:id",
  auth,
  admin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        res.status(400).json({ message: "Product does not exists." });
      }

      res.json({ product, message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// get all orders
adminRouter.get("/admin/get-orders", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find({});

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post(
  "/admin/change-order-status",
  auth,
  admin,
  async (req, res) => {
    try {
      const { orderId } = req.body;

      let order = await Order.findById(orderId);

      order.status += 1;
      order = await order.save();

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

adminRouter.get("/admin/analytics", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    let totalEarnings = 0;
    let mobilesEarnings = 0;
    let essentialsEarnings = 0;
    let appliancesEarnings = 0;
    let booksEarnings = 0;
    let fashionEarnings = 0;

    for (let i = 0; i < orders.length; i++) {
      totalEarnings += orders[i].totalAmount;
    }

    // CATEGORY WISE ORDER EARNING
    mobilesEarnings = await fetchCategoryWiseProductEarnings("Mobiles");
    essentialsEarnings = await fetchCategoryWiseProductEarnings("Essentials");
    appliancesEarnings = await fetchCategoryWiseProductEarnings("Appliances");
    booksEarnings = await fetchCategoryWiseProductEarnings("Books");
    fashionEarnings = await fetchCategoryWiseProductEarnings("Fashion");

    let earnings = {
      totalEarnings,
      mobilesEarnings,
      essentialsEarnings,
      appliancesEarnings,
      booksEarnings,
      fashionEarnings,
    };

    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchCategoryWiseProductEarnings(category) {
  let earnings = 0;
  const categoryOrders = await Order.find({
    "products.product.category": category,
  });

  for (let i = 0; i < categoryOrders.length; i++) {
    for (let j = 0; j < categoryOrders[i].products.length; j++) {
      if (categoryOrders[i].products[j].product.category == category) {
        earnings +=
          categoryOrders[i].products[j].quantity *
          categoryOrders[i].products[j].product.price;
      }
    }
  }

  return earnings;
}

module.exports = adminRouter;
