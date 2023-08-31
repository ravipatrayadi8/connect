
const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {} else {
            res.render('login')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}


function checkRole(role) {
    return async (req, res, next) => {
      try {
        const userId = req.session.user_id
        console.log(userId)
        const user = log.findOne({})
        if (user && user.userType === role) {
          next()
        } else {
          res.status(403).send('Access denied');
        }
      } catch (error) {
        res.status(500).send('Internal Server Error');
      }
    };
  }

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.render('home')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    isLogin,
    isLogout,
}