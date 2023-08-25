const express = require("express") 
const path = require("path") 
const hbs = require("hbs")
const collection = require("./mongodb")
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false})) 


app.set("view engine" , "hbs") 


app.get("/" , (req,res) =>{
    res.render("login")
});

app.get("/login", (req, res) => {
    res.render("login"); 
});

app.get("/signup", (req, res) => {
    res.render("signup");
});


app.post("/signup" , async (req,res) => {

    const data = {
        name:req.body.name , 
        password : req.body.password ,  
        userType: req.body.userType
    }

    await collection.insertMany([data])
    res.render("login") 

})

app.post("/login" , async (req,res) => {
    try{
        const user = await collection.findOne({name:req.body.name})
        
        if (user.password === req.body.password) {
            if (user.userType === 'super') {                
                res.render("super");
            } else if (user.userType === 'clerk') {
                res.render("home");
            } else {
                res.send("User Does not exist");
            }
        } 
        else {
            res.send("Wrong Password or Username");
        }
    }
    catch (error) {
        res.send("Can't find the User") ; 
    }

})

app.listen(3000 , () =>{
    console.log("port connected") ;  
}) ;  