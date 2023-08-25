const express = require("express") 
const path = require("path") 
const hbs = require("hbs")
const collection = require("./mongodb")
const app = express()
const { Collection } = require('collectionsjs');
const items = []


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
    items.push(req.body.item) 
    const counter = createCounter(items);
    const counterObject = Object.fromEntries(counter);
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