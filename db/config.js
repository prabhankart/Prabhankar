require('dotenv').config();  // Load .env file variables

const mongoose = require("mongoose");
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("MONGO_URI is not defined in .env file");
} else {
  mongoose.connect(dbURI)  // No need for 'useNewUrlParser' or 'useUnifiedTopology'
    .then(() => console.log("Connected to MongoDB successfully!"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));
}

