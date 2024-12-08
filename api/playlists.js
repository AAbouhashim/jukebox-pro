// Importing the necessary libraries and modules
const express = require("express");
const router = express.Router();
module.exports = router;

const { authenticate } = require("./auth");  // Importing the authentication middleware
const prisma = require("../prisma");  // Importing Prisma client for database operations

// Route to get all playlists owned by the logged-in user
// This is a protected route, only accessible if the user is authenticated
router.get("/", authenticate, async (req, res, next) => {
  try {
    // Fetch playlists for the authenticated user
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: req.user.id },  // Filter playlists by the logged-in user's ID
    });
    res.json(playlists);  // Send the fetched playlists as a JSON response
  } catch (e) {
    next(e);  // Pass any error that occurs to the error handler
  }
});

// Route to create a new playlist for the logged-in user
// This is a protected route, only accessible if the user is authenticated
router.post("/", authenticate, async (req, res, next) => {
  const { name, description, trackIds } = req.body;  // Destructure the request body

  try {
    // Map the trackIds to an array of track objects for connecting them to the new playlist
    const tracks = trackIds.map((id) => ({ id }));

    // Create a new playlist in the database with the provided name, description, and associated tracks
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        ownerId: req.user.id,  // Set the owner to the logged-in user's ID
        tracks: { connect: tracks },  // Connect the tracks to the playlist using trackIds
      },
    });

    res.status(201).json(playlist);  // Respond with the newly created playlist
  } catch (e) {
    next(e);  // Pass any error that occurs to the error handler
  }
});

// Route to get a specific playlist by ID, including the tracks
// This is a protected route, only accessible if the user is authenticated
router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;  // Extract the playlist ID from the route parameters

  try {
    // Fetch the playlist by ID, including the associated tracks
    const playlist = await prisma.playlist.findUniqueOrThrow({
      where: { id: +id },  // Convert the ID to a number and fetch the playlist
      include: { tracks: true },  // Include the associated tracks in the response
    });

    // Check if the logged-in user is the owner of the playlist
    if (playlist.ownerId !== req.user.id) {
      next({ status: 403, message: "You do not own this playlist." });  // Return a 403 if the user is not the owner
    }

    res.json(playlist);  // Send the playlist details as a JSON response
  } catch (e) {
    next(e);  // Pass any error that occurs to the error handler
  }
});