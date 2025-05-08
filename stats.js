const db = window.firebaseDB;
const collection = window.firebaseCollection;
const getDocs = window.firebaseGetDocs;

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("entries.json");
  const entries = await response.json();

  const countryStats = {};
  entries.forEach(entry => {
    countryStats[entry.country] = {
      ...entry,
      pickedBy: 0,
      totalRank: 0,
      totalPoints: 0
    };
  });

  const snapshot = await getDocs(collection(db, "rankings"));

  snapshot.forEach(doc => {
    const data = doc.data();
    const rankings = data.rankings;

    for (let i = 1; i <= 10; i++) {
      const country = rankings[`rank_${i}`];
      if (countryStats[country]) {
        countryStats[country].pickedBy += 1;
        countryStats[country].totalRank += i;

        // Eurovision-style points
        const points = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1][i - 1];
        countryStats[country].totalPoints += points;
      }
    }
  });

  const tableBody = document.querySelector("#stats-table tbody");

  const sortedCountries = Object.values(countryStats).sort((a, b) => b.totalPoints - a.totalPoints);

  sortedCountries.forEach(entry => {
    const row = document.createElement("tr");

    const entryCell = document.createElement("td");
    entryCell.innerHTML = `
      <div class="entry">
        <img src="${entry.heartimg}" alt="${entry.country}" />
        <span>${entry.country}</span>
      </div>
    `;

    const pickedByCell = document.createElement("td");
    pickedByCell.textContent = entry.pickedBy;

    const avgRatingCell = document.createElement("td");
    if (entry.pickedBy === 0) {
      avgRatingCell.textContent = "N/A";
    } else {
      avgRatingCell.textContent = (entry.totalRank / entry.pickedBy).toFixed(2);
    }

    const scoreCell = document.createElement("td");
    scoreCell.textContent = entry.totalPoints;

    row.appendChild(entryCell);
    row.appendChild(pickedByCell);
    row.appendChild(avgRatingCell);
    row.appendChild(scoreCell);

    tableBody.appendChild(row);
  });
});
