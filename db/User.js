const mongoose = require('mongoose'); 
const express = require('express');
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
});
module.exports = mongoose.model("users",userSchema)