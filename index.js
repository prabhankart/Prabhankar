const express = require("express");
const cors = require("cors");
require("./db/config"); 
require('dotenv').config();
// Ensure your database configuration is correct
const User = require("./db/User");
const Product = require("./db/Product");
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";
const app = express();

app.use(express.json());
app.use(cors());

// Middleware to verify the token
function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (token) {
    token = token.split(" ")[1];  // Extract the token part after "Bearer"
    
    Jwt.verify(token, jwtKey, (err, valid) => {
      if (err) {
        return res.status(401).send({ result: "Please provide a valid token" });
      } else {
        next();
      }
    });
  } else {
    res.status(403).send({ result: "Please add token with header" });
  }
}

// Register route
app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({ result: "Something went wrong..." });
    }
    res.send({ result, auth: token });
  });
});

// Login route
app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({ result: "Something went wrong..." });
        }
        res.send({ user, auth: token });
      });
    } else {
      res.send({ result: "No user found" });
    }
  } else {
    res.send({ result: "No user found" });
  }
});

// Protected route to add a product
app.post("/add-product", verifyToken, async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});

// Protected route to get all products
app.get("/products", verifyToken, async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({ result: "No products found" });
  }
});

// Protected route to delete a product by ID
app.delete("/product/:id", verifyToken, async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    if (result.deletedCount > 0) {
      res.send({ success: true, message: "Product deleted successfully" });
    } else {
      res.status(404).send({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Server error" });
  }
});

// Protected route to get a single product by ID
app.get("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No Record Found..." });
  }
});

// Protected route to update a product by ID
app.put("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  res.send(result);
});

// Protected search route
app.get("/search/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key, $options: "i" } },
      { company: { $regex: req.params.key, $options: "i" } },
      { category: { $regex: req.params.key, $options: "i" } },
    ],
  });
  res.send(result);
});

app.listen(process.env.PORT||5000, () => {
  console.log("Server is running on port 5000");
});
