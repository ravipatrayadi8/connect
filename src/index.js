const express = require("express")
const path = require("path")
const hbs = require("hbs")
const collection = require("./mongodb")
const log = collection.lcred
const details = collection.cart 
const session = require("express-session")
const sessionSecret = "temp"
const auth = require("../middleware/auth")

let items = []
let counter = {}
let counterObject = {}
let total = 0 

const app = express()

app.use(session({
    secret: sessionSecret
}))
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

app.set("view engine", "hbs")

app.get("/", auth.isLogout, (req, res) => {
    res.render("login")
})

app.get("/home", auth.isLogin, (req, res) => {
    res.render("home")
})

app.get("/login", auth.isLogout, (req, res) => {
    res.render("login")
})

app.get("/payment" , auth.isLogin , (req,res) =>{
    res.render("payment")  
})


app.get("/logout", auth.isLogin, async (req, res) => {
    try {
        req.session.destroy()
        items = []

        res.render("login")
    } catch (error) {
        console.log("You cannot go to that page!")
    }
})

app.get("/signup", auth.isLogout, (req, res) => {
    res.render("signup")
})

app.get("/super" , auth.isLogin , (req,res) =>{
    res.render("super")
})

app.get("/clerks", async (req, res) => {
    try {
      const logins = await log.find();
      res.render("clerks", { logins });
    } catch (error) {
      console.error(error.message);
    }
  });

app.get("/sales" , (req,res) =>{
    res.render("sales") 
})


hbs.registerHelper('isEqual', function (value1, value2, options) {
    return value1 === value2 ? options.fn(this) : options.inverse(this);
})

function createCounter(items) {
    const counter = new Map()

    for (const item of items) {
        const [fruit, price] = item.split('|')
        if (price > 0) {
            counter.set(item, (counter.get(item) || 0) + 1)
        } else {
            const newitem = fruit + '|' + (-price)
            if (counter.get(newitem) > 0) {
                counter.set(newitem, counter.get(newitem) - 1)
            }
        }
    }
    return counter
}

function findCost(counterObject) {
    let cost = 0
    for (const key in counterObject) {
        const [item, price] = key.split('|')
        const itemCount = counterObject[key]
        cost += (price * itemCount)
    }
    return cost
}

app.post('/update-password', async (req, res) => {
    try {
      const username = req.body.username;
      const newPassword = req.body.password;
  
      await log.updateOne({ name: username }, { $set: { password: newPassword } });
      res.redirect('/clerks') 
    } catch (error) {
      console.error(error)
    }
  })

app.post("/payment" , async(req ,res) =>{
    const tpay = req.body.pay

    const payedcart = {
        userId: req.session.user_id , 
        totalCost: total ,
        payType:req.body.pay ,
        payStat: true 
    }

    for (const key in counterObject) {
        if (counterObject.hasOwnProperty(key)) {
          const [fruit, index] = key.split('|') 
          const count = counterObject[key]          
          payedcart[`${fruit}Count`] = count
        }
    }
    await details.insertMany([payedcart])
    res.render("confirm")
})

app.post("/home", async (req, res) => {
    const userId = req.session.user_id
    items.push(req.body.item)
    counter = createCounter(items)
    counterObject = Object.fromEntries(counter)
    total = findCost(counterObject)
    console.log(counterObject)
    res.render("home", {total} )
})


app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.name,
        password: req.body.password,
        userType: req.body.userType
    }

    await log.insertMany([data])
    res.render("login")
})

app.post("/login", async (req, res) => {
    try {
        const user = await log.findOne({
            name: req.body.name
        })
        if (user.password === req.body.password) {
            if (user.userType === 'super') {
                res.render("super")
            } else if (user.userType === 'clerk') {
                req.session.user_id = user._id
                res.render("home")
            } else {
                res.send("User Does not exist")
            }
        } else {
            res.send("Wrong Password or Username")
        }
    } catch (error) {
        res.send("Can't find the User")
    }
})


app.listen(3000, () => {
    console.log("port connected")
})
