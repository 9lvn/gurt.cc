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
    name: "Stickman Hook",
    image: "https://img.poki-cdn.com/cdn-cgi/image/quality=78,width=1200,height=1200,fit=cover,f=png/99e090d154caf30f3625df7e456d5984.png",
    link: "https://gurt.cc/stickman/"
  },
  {
    name: "Subway Surfers",
    image: "https://play-lh.googleusercontent.com/xrp1TmYQoexB5tTC37xS7jXemTRUQDWi72SL6iqOPZ-bzjvN_tUWBRgYNUOVB1NseA",
    link: "https://gurt.cc/subwaysurfers/"
  },
  {
    name: "Level Devil",
    image: "https://leveldevil.vip/logo.png",
    link: "https://gurt.cc/leveldevil"
  },
  {
    name: "Level Devil 2",
    image: "https://level-devil.io/cache/data/image/game/level-devil-2-f180x180.webp",
    link: "https://gurt.cc/leveldevil2"
  }
];

const grid = document.getElementById('game-grid');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayGames(filter = "") {
  grid.innerHTML = ""; // Clear

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(filter.toLowerCase())
  );

  shuffleArray(filteredGames); // random order every time

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
