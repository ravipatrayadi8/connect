const mongoose = require("mongoose")


mongoose.connect("mongodb://127.0.0.1:27017/Logincred")
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.error("Mongodb connection error:", error);
  });

const LogInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true
  }
})

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Logincred',
    required: true
  },
  bananaCount: {
    type: Number,
    default: 0 
  },
  mangoCount: {
    type: Number,
    default: 0
  },
  appleCount: {
    type: Number,
    default: 0
  },
  kiwiCount: {
    type: Number,
    default: 0
  },
  totalCost:{
    type:Number , 
    default: 0 
  },
  paystat:{
    type: Boolean , 
    default: false
  }
});

const lcred = new mongoose.model("LoginCollection", LogInSchema)
const cart = new mongoose.model("CartDetails", cartSchema)

module.exports = {
  lcred,
  cart
}