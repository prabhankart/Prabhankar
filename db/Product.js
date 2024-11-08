const mongoose = require('mongoose'); 
const express = require('express');
const productSchema = new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
    company:String
});
module.exports = mongoose.model("products",productSchema)