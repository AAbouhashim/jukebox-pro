// Importing the necessary libraries and modules
const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");  // Importing Prisma client for database operations

// Route to get all tracks
// This route is accessible to all users (no authentication required)
router.get("/", async (req, res, next) => {
  try {
    // Fetch all tracks from the database
    const tracks = await prisma.track.findMany();
    res.json(tracks);  // Send the fetched tracks as a JSON response
  } catch (e) {
    next(e);  // Pass any error that occurs to the error handler
  }
});

// Route to get a specific track by ID, including playlists associated with the track
// If the user is logged in, it will also include the playlists that they own
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;  // Extract the track ID from the route parameters

  // Check if the user is logged in and determine whether to include playlists they own
  const includePlaylists = req.user
    ? { where: { ownerId: req.user.id } }  // If user is logged in, include only playlists they own
    : false;  // If no user is logged in, don't include playlists

  try {
    // Fetch the track by ID, and conditionally include playlists based on user authentication
    const track = await prisma.track.findUniqueOrThrow({
      where: { id: +id },  // Convert the ID to a number and fetch the track
      include: { playlists: includePlaylists },  // Include playlists if the user is logged in
    });
    res.json(track);  // Send the track details as a JSON response
  } catch (e) {
    next(e);  // Pass any error that occurs to the error handler
  }
});