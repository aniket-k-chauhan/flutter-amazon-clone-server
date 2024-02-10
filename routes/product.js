const express = require("express");
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");
const productRouter = express.Router();

productRouter.get("/api/products", auth, async (req, res) => {
  try {
    const category = req.query.category;

    const products = await Product.find({ category });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/products/search/:query", auth, async (req, res) => {
  try {
    const searchQuery = req.params.query;

    const products = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating } = req.body;
    const userId = req.user;
    let product = await Product.findById(id);
    let ratings = product.ratings;

    for (let i = 0; i < ratings.length; i++) {
      if (ratings[i].userId === userId) {
        ratings.splice(i, 1);
        break;
      }
    }

    const ratingSchema = {
      userId,
      rating,
    };

    ratings.push(ratingSchema);

    product = await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/deal-of-the-day", auth, async (req, res) => {
  try {
    let products = await Product.find({});

    products = products.sort((product1, product2) => {
      let product1Sum = 0;
      let product2Sum = 0;

      for (let i = 0; i < product1.ratings.length; i++) {
        product1Sum += product1.ratings[i].rating;
      }
      for (let i = 0; i < product2.ratings.length; i++) {
        product2Sum += product2.ratings[i].rating;
      }

      return product1Sum < product2Sum ? 1 : -1;
    });

    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = productRouter;
