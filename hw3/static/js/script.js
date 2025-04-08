document.addEventListener("DOMContentLoaded", function () {
  const searchIcon = document.getElementById("search-icon");
  const clearIcon = document.getElementById("clear-icon");
  const searchInput = document.getElementById("search-input");
  const resultsDiv = document.getElementById("results");
  const artistDetailsDiv = document.getElementById("artist-details");
  const loadingDiv = document.getElementById("loading");

  // Initially hide the artist details div
  artistDetailsDiv.style.display = "none";

  let isFirstSearch = true;

  // CLEAR ICON
  clearIcon.addEventListener("click", () => {
    searchInput.value = "";
  });

  // SEARCH ICON
  searchIcon.addEventListener("click", performSearch);

  // SEARCH ENTER
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // SEARCH
  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      // Input Empty Warning
      if (!searchInput.checkValidity()) {
        searchInput.reportValidity();
        return;
      }
      return;
    }
    // Update with new search results
    artistDetailsDiv.innerHTML = "";
    // Show the Loading only for the first search. For subsequent searches, show the loading icon in the results area.
    if (isFirstSearch) {
      resultsDiv.innerHTML = "";
      showLoading();
    } else {
      showLoading();
    }

    // Hide artist details div when performing a new search
    artistDetailsDiv.style.display = "none";

    // Send an AJAX request to the backend /search endpoint
    fetch(`/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        // For an update, clear the results div and display the new search results
        resultsDiv.innerHTML = "";
        if (data.error) {
          resultsDiv.innerHTML = `<p>${data.error}</p>`;
        } else if (data.artists.length === 0) {
          // If no search results, display 'No results found.'
          resultsDiv.innerHTML = `<p class="no-results">No results found.</p>`;
        } else {
          // Success. Display the search results on the screen
          displayResults(data.artists);
          isFirstSearch = false; // Set to false after the first search
        }
      })
      .catch((error) => {
        hideLoading();
        resultsDiv.innerHTML = `<p>Error: ${error}</p>`;
      });
  }

  // Function to add search results (artist cards) to the screen
  function displayResults(artists) {
    artists.forEach((artist) => {
      // Create a card element
      const card = document.createElement("div");
      card.className = "artist-card";
      card.dataset.id = artist.id;

      // Create an artist thumbnail image
      const img = document.createElement("img");
      // If the thumbnail is missing or is "missing_image", use the Artsy logo image
      if (artist.thumbnail && !artist.thumbnail.includes("missing_image")) {
        img.src = artist.thumbnail;
      } else {
        // No thumbnail image available
        img.src = "/static/images/artsy_logo.svg";
      }
      card.appendChild(img);

      // Create a <p> element to display the artist's name
      const namePara = document.createElement("p");
      namePara.textContent = artist.name;
      card.appendChild(namePara);

      // Add an event listener to request the selected artist's details when the card is clicked
      card.addEventListener("click", function () {
        // Remove the selected state from other cards and mark the current card as selected
        document
          .querySelectorAll(".artist-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        fetchArtistDetails(artist.id);
      });

      // Add the card to the results area
      resultsDiv.appendChild(card);
    });
  }

  // Function to fetch details for the selected artist
  function fetchArtistDetails(artistId) {
    // Clear existing details and display the loading animation
    artistDetailsDiv.innerHTML = "";
    showLoading();

    // Show artist details div when fetching details
    artistDetailsDiv.style.display = "block";

    // Send an AJAX request to the backend /artist endpoint
    fetch(`/artist?id=${encodeURIComponent(artistId)}`)
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        if (data.error) {
          artistDetailsDiv.innerHTML = `<p>${data.error}</p>`;
        } else {
          // Display the details on the screen
          displayArtistDetails(data.artist);
        }
      })
      .catch((error) => {
        hideLoading();
        artistDetailsDiv.innerHTML = `<p>Error: ${error}</p>`;
      });
  }

  // Function to display the artist details on the screen
  function displayArtistDetails(artist) {
    // Display the artist's name, birth/death years, nationality, and biography
    const detailsHtml = `
            <p class="artist-name">${artist.name} (${artist.birthday || ""} ${
      artist.deathday ? "- " + artist.deathday : "- "
    })</p>
            <p class="artist-nationality">${artist.nationality || ""}</p>
            <p>${artist.biography || ""}</p>
        `;
    artistDetailsDiv.innerHTML = detailsHtml;
  }

  // Function to show the loading animation
  function showLoading() {
    loadingDiv.classList.remove("hidden");
  }

  // Function to hide the loading animation
  function hideLoading() {
    loadingDiv.classList.add("hidden");
  }
});
