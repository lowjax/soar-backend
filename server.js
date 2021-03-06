

const rateLimit = require('express-rate-limit')
const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bcryptjs = require ('bcryptjs');
const cors = require('cors')



const server = express()


const corsOptions = {
    // origin: 'http://localhost:3000',
    origin: ['https://www.soarphysio.com', 'https://soar-backend.herokuapp.com', 'https://www.soarphysio.com/', '*'],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browser (IE11, various smartTvs) choke on 204
    
    
}

server.use(cors(corsOptions))


// use the express-static middleware
server.use(express.static("public"))

server.use(cookieParser());

///acess token 
const port = process.env.PORT





//importing express session to declare the variables
// const rateLimit = require('express-rate-limit')
const slowDown = require("express-slow-down");
const logModel = require("./backend/models/logModel")

// Enable middleware for JSON and urlencoded form data
server.use(express.json())
server.use(express.urlencoded({
    extended: true
}))


server.use(cookieParser())

// Enable session middleware so that we have state
server.use(session({
    secret: 'secret phrase abc123',
    resave: false,
    
//change below here

    saveUninitialized: false,
    cookie: {
        path: '/',
        secure: true
    } // Should be turned to true in production (HTTPS only)
}))



// exress rate limiiting *********************
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 500, // 12 hour duration in milliseconds
    max: 1000, // Limit each IP to 500 requests per `window` (here, per 24 hours)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
const speedLimiter = slowDown({
    windowMs: 500,
    delayAfter: 1,
    delayMs: 500,
});

// apply to all request
server.use(speedLimiter, limiter);
// server.user(limiter)

// const corsOptions = {
//     // origin: 'http://localhost:3000',
//     origin: ['https://www.soarphysio.com', 'https://soar-backend.herokuapp.com', 'https://www.soarphysio.com/', '*'],
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//     optionsSuccessStatus: 200 // some legacy browser (IE11, various smartTvs) choke on 204
    
    
// }

// server.use(cors(corsOptions))

// server.listen(80, function () {
//     console.log('CORS-enabled web server listening on port 80')
// })




// Custom Middleware ip whitelisting
// server.use((req, res, next) => {
//     let validIps = ['::12','::1', '127.0.0.1']; // Put your IP whitelist in this array
    
//       if(validIps.includes(req.ip)){
//           // IP is ok, so go on
//           console.log("IP ok");
//           next();
//       }
//       else{
//           // Invalid ip
//           console.log("Bad IP: " + req.ip);
//           const err = new Error("Bad IP: " + req.ip);
//           next(err);
//       }
//     })



server.use((req, res, next) => {
    console.log(`${req.method} - ${req.url},`);

    // the user is logged in if the have session data
    console.log(req.session)
    let userLoggedIn = req.session.user != null
    console.log(1, userLoggedIn)
    //define a list of allowed urls for non-logged in users
    let allowedURLs = [
        // "/index.html",
        //  "https://soar-backend.herokuapp.com/",
         "https://www.soarphysio.com/",
        "/api/users/login",
        "/api/users/create",
        "/index.js",
        "/api/content",
        //  "/api/users/logout",
        //  "/logout.html",

    ]



    let adminOnlyURLS = [
        
        "/IndexAdmin",
        "/SelectionAdmin",
        "/AdminUserCRUD",
        "/SportCRUD",
        "/NavbarAdmin",
        "/contentcontainerAdmin",
        "/SelectionAdmin",
        "/LogoutAdmin",
        "/CreateAccountAdmin",
        "/ThemeAdmin",
        "/CreateSport",
        "https://www.soarphysio.com/AdminUserCRUD",
        "https://www.soarphysio.com/SportCRUD",
        "https://www.soarphysio.com/SportCRUD",
        "https://www.soarphysio.com/IndexAdmin",
        "https://www.soarphysio.com/ContentcontainerAdmin",
        "https://www.soarphysio.com/ThemeAdmin",
        "https://www.soarphysio.com/LogoutAdmin",
        "https://www.soarphysio.com/CreateSport"
    ]

    // if the user is logged in 
    if (userLoggedIn) {
        console.log(userLoggedIn)
        // let them through
        if (adminOnlyURLS.includes(req.originalUrl) && req.session.user.accessRights !== "admin") {
            console.log('heello 1')
            res.redirect("/login");
        } else {
            next()
        }
    } else {
        if (allowedURLs.includes(req.originalUrl)) {
            //allows the guest user through
            next()
        } else {

            res.redirect("/index.html")
            //if not allowed - reditect to the login page
            console.log('heello')

        }
    }
    

})
    // Error handler
    // server.use((err, req, res, next) => {
    //     console.log('Error handler', err);
    //     res.status(err.status || 500);
    //     res.send(err);
    // });

// // Serve static frontend resources
// server.use(express.static("frontend"))




// the routes in my code structure are intended to interact with the various controllers for the execution of specific queries as stored in the modules.
// these routes can be found at the bottom of this file. these routes are declared and required for use in this application to alter data using the various
// method request within. Through the API's, these requests interact with specific tables, and table columns in our database to GET, POST, PUT, and DELETE
// the information within



/// Link up the user controller
const userController = require("./backend/controllers/userController")
server.use("/api", userController)


/// Link up the content controller
const contentController = require("./backend/controllers/contentController")
server.use("/api", contentController)


/// Link up the injury controller
const injuryController = require("./backend/controllers/injuryController")
server.use("/api", injuryController)


/// Link up the sport controller
const sportController = require("./backend/controllers/sportController")
server.use("/api", sportController)


/// Link up the favorites controller
const favoritesController = require("./backend/controllers/favoritesController")
server.use("/api", favoritesController)



/// Link up the body controller
const bodyController = require("./backend/controllers/bodyController")
server.use("/api", bodyController)


// // Start the express server
// server.listen(port, () => {
//     console.log("Backend listening on http://localhost:" + port)
// })

// Start the express server
server.listen(process.env.PORT || 3000, () => {
    console.log("backend is listeing on http://localhost:3000")
})