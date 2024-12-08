// Load environment variables from a .env file into process.env
require("dotenv").config();

// Import the Express framework to create a server
const express = require("express");
const app = express(); // Initialize an Express application
const PORT = 3000; // Define the port the server will listen on

// Middleware to log HTTP requests in a "dev" format (method, URL, status code, etc.)
app.use(require("morgan")("dev"));

// Middleware to parse incoming JSON payloads in request bodies
app.use(express.json());

// Use the authentication router defined in the "./api/auth" module
app.use(require("./api/auth").router);

// Define routes for playlists and tracks under their respective endpoints
app.use("/playlists", require("./api/playlists")); // Handles routes related to playlists
app.use("/tracks", require("./api/tracks")); // Handles routes related to tracks

// Middleware to handle unmatched routes (404 error)
app.use((req, res, next) => {
  next({ status: 404, message: "Endpoint not found." }); // Forward a 404 error to the error-handling middleware
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging
  res.status(err.status ?? 500); // Set the HTTP status code (default to 500 for server errors)
  res.json(err.message ?? "Sorry, something broke :("); // Send the error message as a JSON response
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`); // Log that the server is running
});