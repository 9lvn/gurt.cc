const games = [
  {
    name: "Stack",
    image: "https://childrenandmedia.org.au/assets/images/app-reviews/Stack.png",
    link: "https://gurt.cc/stack/"
  },
  {
    name: "Block Blast",
    image: "https://m.media-amazon.com/images/I/71mDg3UjuqL.png",
    link: "https://gurt.cc/blockblast/"
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

const searchOverlay = document.getElementById("search-overlay");
const searchInput = document.getElementById("search-input");
const searchIcon = document.getElementById("search-icon");

// Show overlay with search bar pop-in
searchIcon.addEventListener("click", () => {
  searchOverlay.classList.add("active");
  searchInput.classList.remove("pop-out");
  searchInput.focus();
});

// Hide when clicking outside
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

// Pop-out on Enter, then filter
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const searchTerm = searchInput.value.trim();
    searchInput.classList.add("pop-out");

    setTimeout(() => {
      searchOverlay.classList.remove("active");
      searchInput.classList.remove("pop-out");
      displayGames(searchTerm);
      searchInput.value = "";
    }, 300); // Matches pop-out animation
  }
});
