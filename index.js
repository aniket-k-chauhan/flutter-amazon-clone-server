// IMPORTS FROM PACKAGES
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// IMPORTS FROM OTHER FILES
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");

// INIT
const PORT = process.env.PORT || 3000;
const USER = process.env.MONGODB_USER;
const PASSWORD = process.env.MONGODB_PASSWORD;
const app = express();
const DB_URI = `mongodb+srv://${USER}:${PASSWORD}@cluster0.luk8mdf.mongodb.net/?retryWrites=true&w=majority`;

// middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

// connection
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connection successful");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Connected at ${PORT}`);
});
