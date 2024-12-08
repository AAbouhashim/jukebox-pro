// Import required libraries
const express = require("express");
const router = express.Router();

// JWT handling setup
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Function to create a JWT token for a user
// It takes the user's ID, signs the token, and sets an expiration time of 1 day
function createToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

// Import Prisma client to interact with the database
const prisma = require("../prisma");

// Middleware to check if the request has a valid JWT token
// If a valid token is found, the corresponding user is attached to the request object
router.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7); // Extract the token from the "Bearer <token>" format

  // If no token is provided, proceed to the next middleware
  if (!token) return next();

  try {
    // Verify the token and retrieve the user ID
    const { id } = jwt.verify(token, JWT_SECRET);

    // Look up the user in the database and attach it to the request object
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    req.user = user; // Attach the user to the request object for future use
    next();
  } catch (e) {
    // If token verification fails, pass the error to the error handler
    next(e);
  }
});

// Route to register a new user
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // Register the user in the database (using a custom Prisma method)
    const user = await prisma.user.register(username, password);

    // Create a JWT token for the newly created user
    const token = createToken(user.id);

    // Send the token in the response
    res.status(201).json({ token });
  } catch (e) {
    // If any error occurs during registration, pass it to the error handler
    next(e);
  }
});

// Route to log in an existing user
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    // Verify the user's credentials and retrieve the user object
    const user = await prisma.user.login(username, password);

    // Create a JWT token for the logged-in user
    const token = createToken(user.id);

    // Send the token in the response
    res.json({ token });
  } catch (e) {
    // If login fails, pass the error to the error handler
    next(e);
  }
});

// Middleware to authenticate that the user is logged in
// This function checks if there is a valid user object attached to the request
function authenticate(req, res, next) {
  if (req.user) {
    next(); // If the user is logged in, proceed to the next middleware or route
  } else {
    // If not logged in, send a 401 Unauthorized error
    next({ status: 401, message: "You must be logged in." });
  }
}

// Export the router and authenticate function for use in other parts of the app
module.exports = {
  router,
  authenticate,
};