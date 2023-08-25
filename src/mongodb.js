const mongoose = require("mongoose") 


mongoose.connect("mongodb://127.0.0.1:27017/Logincred")
    .then(() => {
        console.log("Mongodb connected");
    })
    .catch((error) => {
        console.error("Mongodb connection error:", error);
    });



const LogInSchema = new mongoose.Schema({
    name :{
        type:String , 
        required :true   
    } , 
    password :{
        type:String , 
        required :true 
    },
    userType: {
        type: String, 
        required: true
    }    
})

const collection = new mongoose.model("LoginCollection" , LogInSchema) 
 
module.exports = collection 