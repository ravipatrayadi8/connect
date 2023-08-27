const express = require("express") 
const path = require("path") 
const hbs = require("hbs")
const collection = require("./mongodb")
const log = collection.lcred
const details = collection.cart 
const session = require("express-session")
const sessionSecret = "temp" 
const auth = require("../middleware/auth")

const { Collection } = require('collectionsjs')
const items = []
const app = express()

app.use(session({secret:sessionSecret}))
app.use(express.json())
app.use(express.urlencoded({extended:false})) 

app.set("view engine" , "hbs") 

app.get("/" , auth.isLogout,  (req,res) =>{
    res.render("login")
});

app.get("/home" , auth.isLogin ,(req,res) =>{
    res.render("home") ; 
});

app.get("/login", auth.isLogout,(req,res) =>{
    res.render("login") ; 
});

app.get("/logout" , auth.isLogin ,  async(req,res) =>{
    try{
        req.session.destroy() 
        res.render("login") 
    }
    catch(error){
        console.log(error.message) 
    }
});

app.get("/signup", auth.isLogout,(req,res) =>{
    res.render("signup") ; 
}); 

function createCounter(items) {
    const counter = new Map();

    for (const item of items) {
        const [fruit,price] = item.split('|')
        if ( price > 0 ){
            counter.set(item, (counter.get(item) || 0) + 1);
        }
        else{
            const newitem = fruit + '|' + (-price) 
            if (counter.get(newitem) > 0) {
                counter.set(newitem, counter.get(newitem) - 1);
            }
        }
    }
    return counter;
  }

  function findCost(counterObject) {
    let cost = 0 ;  
    for (const key in counterObject) {
        const [item, price] = key.split('|')         
        const itemCount = counterObject[key]
        cost += (price * itemCount)  
      }
      return cost ; 
}


app.post("/home" , async (req,res) =>{
    console.log(req.session.user_id) 
    const userId = req.session.user_id 
    const existingDetail = await details.findOne({ userId });

    if (!existingDetail) {
      const ccart = {
        userId: req.session.user_id
      };
      await details.insertMany([ccart]);
    }
    items.push(req.body.item) 
    const counter = createCounter(items);
    const counterObject = Object.fromEntries(counter);
    console.log(counterObject)
    const total = findCost(counterObject)
    console.log(total) 
    res.render("home")  
}) 


app.post("/signup" , async (req,res) => {

    const data = {
        name:req.body.name , 
        password : req.body.password ,  
        userType: req.body.userType
    }

    await log.insertMany([data])
    res.render("login") 

})

app.post("/login" , async (req,res) => {
    try{
        const user = await log.findOne({name:req.body.name})
        if (user.password === req.body.password) {
            if (user.userType === 'super') {                
                res.render("super");
            } else if (user.userType === 'clerk') {
                req.session.user_id = user._id 
                console.log("session")
                console.log(req.session.user_id) 
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



    // const processedCounter = {};
    // for (const key in counterObject) {
    // const parts = key.split('|');
    // if (parts.length === 2) {
    //     const fruit = parts[0];
    //     const quantity = parts[1];
    //     processedCounter[fruit] = processedCounter[fruit] || {};
    //     processedCounter[fruit][quantity] = counterObject[key];
    // }
    // }