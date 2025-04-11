const express = require("express");
const router = express.Router();
const axios = require("axios");

// Function to retrieve Artsy XAPP_TOKEN on demand
async function getArtsyToken() {
  try {
    const response = await axios.post(
      "https://api.artsy.net/api/tokens/xapp_token",
      null,
      {
        params: {
          client_id: process.env.ARTSY_CLIENT_ID,
          client_secret: process.env.ARTSY_CLIENT_SECRET,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error(
      "Artsy token error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Search endpoint: /api/search?q=...
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Empty query" });
  try {
    const token = await getArtsyToken();
    const response = await axios.get("https://api.artsy.net/api/search", {
      headers: { "X-Xapp-Token": token },
      params: { q: query, size: 10, type: "artist" },
    });
    const results = response.data._embedded.results;
    const artists = results.map((result) => {
      const artistHref = result._links.self.href;
      const artistId = artistHref.substring(artistHref.lastIndexOf("/") + 1);
      return {
        id: artistId,
        name: result.title,
        thumbnail: result._links.thumbnail.href,
      };
    });
    res.json({ artists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search request failed" });
  }
});

// Artist details endpoint: /api/artist?id=...
router.get("/artist", async (req, res) => {
  const artistId = req.query.id;
  if (!artistId) return res.status(400).json({ error: "Missing artist id" });
  try {
    const token = await getArtsyToken();
    const response = await axios.get(
      `https://api.artsy.net/api/artists/${artistId}`,
      {
        headers: { "X-Xapp-Token": token },
      }
    );
    const data = response.data;
    res.json({
      artist: {
        name: data.name,
        birthday: data.birthday,
        deathday: data.deathday,
        nationality: data.nationality,
        biography: data.biography,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch artist details" });
  }
});

// Artworks endpoint: /api/artworks?artist_id=...
router.get("/artworks", async (req, res) => {
  const artistId = req.query.artist_id;
  if (!artistId) return res.status(400).json({ error: "Missing artist id" });
  try {
    const token = await getArtsyToken();
    const response = await axios.get("https://api.artsy.net/api/artworks", {
      headers: { "X-Xapp-Token": token },
      params: { artist_id: artistId, size: 10 },
    });
    const artworks = response.data._embedded.artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      date: artwork.date,
      thumbnail: artwork._links.thumbnail.href,
    }));
    res.json({ artworks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

// Genes endpoint: /api/genes?artwork_id=...
router.get("/genes", async (req, res) => {
  const artworkId = req.query.artwork_id;
  if (!artworkId) return res.status(400).json({ error: "Missing artwork id" });
  try {
    const token = await getArtsyToken();
    const response = await axios.get("https://api.artsy.net/api/genes", {
      headers: { "X-Xapp-Token": token },
      params: { artwork_id: artworkId, size: 10 },
    });
    const genes = response.data._embedded.genes.map((gene) => ({
      name: gene.name,
      thumbnail: gene._links.thumbnail.href,
    }));
    res.json({ genes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch genes" });
  }
});

// Similar artists endpoint: /api/similar-artists?artist_id=...
router.get("/similar-artists", async (req, res) => {
  const artistId = req.query.artist_id;
  if (!artistId) return res.status(400).json({ error: "Missing artist id" });
  try {
    const token = await getArtsyToken();
    const response = await axios.get("https://api.artsy.net/api/artists", {
      headers: { "X-Xapp-Token": token },
      params: { similar_to_artist_id: artistId },
    });
    const similarArtists = response.data._embedded.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      thumbnail: artist._links.thumbnail.href,
    }));
    res.json({ similarArtists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch similar artists" });
  }
});

module.exports = router;
