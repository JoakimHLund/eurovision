import { loadPlayers, updatePlayerScores } from "./playerscore.js";

const rankedList = document.getElementById("ranked-list");
const unrankedList = document.getElementById("unranked-list");

let rankedEntries = [];

document.addEventListener("DOMContentLoaded", async () => {
  const entriesRes = await fetch("entries.json");
  const entries = await entriesRes.json();

  const sortedEntries = entries
  .filter(e => String(e.eliminated).toLowerCase() !== "true")
  .sort((a, b) => {
    const scoreA = typeof a.score === "number" ? a.score : Infinity;
    const scoreB = typeof b.score === "number" ? b.score : Infinity;
    return scoreA - scoreB;
  });


  await loadPlayers();

  sortedEntries.forEach(entry => {
    const row = createEntryRow(entry);
    unrankedList.appendChild(row);
  });
});

function createEntryRow(entry, rank = "–", showScore = false) {
  const row = document.createElement("div");
  row.classList.add("entry-row");

  row.innerHTML = `
    <div class="rank">${rank}.</div>
    <div class="entry-info">
      <img src="${entry.heartimg}" alt="${entry.country}" />
      <span>${entry.country}</span>
    </div>
    <div class="score">${showScore ? (entry.score ?? "–") : "–"}</div>
  `;

  if (!showScore) {
    row.addEventListener("click", () => {
      rankedEntries.push(entry);
      row.remove();
      renderRanked();
    });
  }

  return row;
}

function renderRanked() {
  rankedList.innerHTML = "";
  rankedEntries
    .sort((a, b) => b.score - a.score)
    .forEach((entry, index) => {
      const row = createEntryRow(entry, index + 1, true);
      rankedList.appendChild(row);
    });

  updatePlayerScores(rankedEntries);
}
