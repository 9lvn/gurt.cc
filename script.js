const games = [
  {
    name: "Stack",
    image: "https://childrenandmedia.org.au/assets/images/app-reviews/Stack.png",
    link: "https://gurt.cc/stack/"
  },
  {
    name: "Platformer",
    image: "https://via.placeholder.com/300x300.png?text=Platformer",
    link: "games/platformer/index.html"
  },
  {
    name: "Puzzle Game",
    image: "https://via.placeholder.com/500x700.png?text=Puzzle+Game",
    link: "games/puzzle/index.html"
  }
];

const grid = document.getElementById('game-grid');

function displayGames(filter = "") {
  grid.innerHTML = ""; // Clear

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (filteredGames.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No games found.";
    message.style.fontSize = "1.2rem";
    message.style.color = "#ccc";
    grid.appendChild(message);
    return;
  }

  filteredGames.forEach(game => {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = game.link;
    card.target = "_blank";

    const img = document.createElement("img");
    img.src = game.image;
    img.alt = game.name;

    card.appendChild(img);
    grid.appendChild(card);
  });
}

displayGames(); // Initial display

// Search overlay toggle
const searchOverlay = document.getElementById("search-overlay");
const searchInput = document.getElementById("search-input");
const searchIcon = document.getElementById("search-icon");

searchIcon.addEventListener("click", () => {
  searchOverlay.classList.add("active");
  searchInput.focus();
});

searchOverlay.addEventListener("click", (e) => {
  if (e.target === searchOverlay && searchOverlay.classList.contains("active")) {
    searchOverlay.classList.remove("active");
    searchInput.value = "";
    displayGames(); // Reset to all games
  }
});

// Live filter (optional, remains for previewing while typing)
searchInput.addEventListener("input", (e) => {
  displayGames(e.target.value);
});

// ✅ NEW: Search on Enter key press
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const searchTerm = searchInput.value.trim();
    searchOverlay.classList.remove("active"); // Hide overlay
    displayGames(searchTerm); // Filter results
    searchInput.value = ""; // Clear input (optional)
  }
});
