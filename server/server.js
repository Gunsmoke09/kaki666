const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');
const rateLimit = require('express-rate-limit');

const indexRouter = require("./src/routes/index");

const app = express();

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

const mongoDB = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/handcraft";

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  exposedHeaders: ["Authorization","Link"],
  origin: '*'
}));

// Basic rate limiters
const authenticatedLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  message: 'Too many requests, please try again later.',
});
const nonAuthenticatedLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});

app.use((req, res, next) => {
  if (req.user) {
    authenticatedLimiter(req, res, next); // Apply authenticated rate limit
  } else {
    nonAuthenticatedLimiter(req, res, next); // Apply non-authenticated rate limit
  }
});

app.use((req, res, next) => {
  console.log(`Received request for route: ${req.originalUrl}`);
  next()
});

app.use("/api", indexRouter);
 
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;