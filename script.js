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
  games
    .filter(game => game.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(game => {
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
  if (e.target === searchOverlay) {
    searchOverlay.classList.remove("active");
    searchInput.value = "";
    displayGames();
  }
});

// Live filter
searchInput.addEventListener("input", (e) => {
  displayGames(e.target.value);
});
