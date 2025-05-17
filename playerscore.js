import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyC9XUaWmUil7_IKOeS_7_s3XMP8zhLT_bM",
  authDomain: "eurovision-1aab3.firebaseapp.com",
  projectId: "eurovision-1aab3",
  storageBucket: "eurovision-1aab3.appspot.com",
  messagingSenderId: "1027692031608",
  appId: "1:1027692031608:web:04ac81204c85cccd39c78d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state
export let players = [];
const previousScores = new Map();

function getMultiplierForRank(rank) {
    switch (rank) {
      case 1: return 12;
      case 2: return 10;
      case 3: return 8;
      case 4: return 7;
      case 5: return 6;
      case 6: return 5;
      case 7: return 4;
      case 8: return 3;
      case 9: return 2;
      case 10: return 1;
      default: return 0;
    }
  }

  function formatScore(score) {
    return score.toLocaleString("en-US");
  }
  

export async function loadPlayers() {
  const snapshot = await getDocs(collection(db, "rankings"));
  players = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    players.push({
      id: doc.id,
      name: data.name || "Unknown",
      team: data.team || "NoTeam",
      rankings: Object.values(data.rankings || {}),
      liveScore: 0
    });
  });

  renderPlayers();
}

export function updatePlayerScores(rankedEntries) {
    const gainedMap = new Map();
  
    // 1. Determine score difference with multiplier applied
    players.forEach(player => {
      const oldScore = previousScores.get(player.id) || 0;
      let total = 0;
  
      rankedEntries.forEach(entry => {
        const idx = player.rankings.indexOf(entry.country);
        if (idx !== -1 && typeof entry.score === "number") {
          const multiplier = getMultiplierForRank(idx + 1);
          total += entry.score * multiplier;
        }
      });
  
        player._newScore = total;
        player._scoreDiff = total - oldScore;
        player._gainedPoints = total > oldScore;
        previousScores.set(player.id, total);
        gainedMap.set(player.id, player._gainedPoints);

    });
  
    // 2. Highlight players who gained
    document.querySelectorAll(".player-row").forEach(row => {
      const id = row.dataset.id;
      if (gainedMap.get(id)) {
        row.classList.add("highlight");
      }
    });
  
    // 3. Wait then animate
    setTimeout(() => {
      players.forEach(p => {
        p.liveScore = p._newScore;
      });
      renderPlayers();
    }, 1000);
  }
  

function renderPlayers() {
    const container = document.getElementById("player-columns");
    const oldRows = new Map();
    const oldRects = new Map();
  
    // Store old rows and their positions
    container.querySelectorAll(".player-row").forEach(row => {
      oldRows.set(row.dataset.id, row);
      oldRects.set(row.dataset.id, row.getBoundingClientRect());
    });
  
    const sorted = [...players].sort((a, b) => b.liveScore - a.liveScore);
  
    // Create or reuse columns
    let [left, right] = container.querySelectorAll(".player-column");
    if (!left || !right) {
      container.innerHTML = "";
      left = document.createElement("div");
      right = document.createElement("div");
      left.classList.add("player-column");
      right.classList.add("player-column");
      container.appendChild(left);
      container.appendChild(right);
    } else {
      left.innerHTML = "";
      right.innerHTML = "";
    }
  
    // Reinsert rows in new order
    sorted.forEach((player, index) => {
      let row = oldRows.get(player.id);
  
      if (!row) {
        // If not existing, create new
        row = document.createElement("div");
        row.classList.add("player-row");
        row.dataset.id = player.id;
      }
  
      row.innerHTML = `
        <div class="rank">${index + 1}.</div>
        <div class="entry-info">
          <span>(${player.team}) ${player.name}</span>
        </div>
        <div class="score">${formatScore(player.liveScore)}</div>
        <span class="score-indicator"></span>

      `;
  
      const oldRect = oldRects.get(player.id);
      requestAnimationFrame(() => {
        const newRect = row.getBoundingClientRect();
        if (oldRect) {
          const deltaY = oldRect.top - newRect.top;
          if (deltaY !== 0) {
            row.style.transition = "none";
            row.style.transform = `translateY(${deltaY}px)`;
            requestAnimationFrame(() => {
              row.style.transition = "transform 0.4s ease";
              row.style.transform = "";
            });
          }
        }
      });
      // Animate +score bubble if gained
    if (player._gainedPoints && player._scoreDiff > 0) {
        const bubble = row.querySelector(".score-indicator");
        bubble.textContent = `+${formatScore(player._scoreDiff)}`;
        bubble.classList.add("score-pop");
    
        setTimeout(() => bubble.classList.remove("score-pop"), 2500);
    }
  
      if (player._gainedPoints) {
        row.classList.add("highlight");
        setTimeout(() => row.classList.remove("highlight"), 1400);
      }
  
      if (index < 10) {
        left.appendChild(row);
      } else {
        right.appendChild(row);
      }
    });
  }
  