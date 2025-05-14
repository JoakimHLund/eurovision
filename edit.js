const db = window.firebaseDB;
const getDoc = window.firebaseGetDoc;
const doc = window.firebaseDoc;
const updateDoc = window.firebaseUpdateDoc;

const slotsContainer = document.getElementById("slots-container");
const saveBtn = document.getElementById("save-btn");

const rankLabels = [
  { label: "1st", emoji: "🥇", multiplier: 12 },
  { label: "2nd", emoji: "🥈", multiplier: 10 },
  { label: "3rd", emoji: "🥉", multiplier: 8 },
  { label: "4th", emoji: "", multiplier: 7 },
  { label: "5th", emoji: "", multiplier: 6 },
  { label: "6th", emoji: "", multiplier: 5 },
  { label: "7th", emoji: "", multiplier: 4 },
  { label: "8th", emoji: "", multiplier: 3 },
  { label: "9th", emoji: "", multiplier: 2 },
  { label: "10th", emoji: "", multiplier: 1 }
];

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get("id");

  if (!docId) {
    alert("Missing document ID in URL.");
    return;
  }

  try {
    const docRef = doc(db, "rankings", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("Ranking not found.");
      return;
    }

    const data = docSnap.data();
    const currentRankings = data.rankings;

    const response = await fetch("entries.json");
    const allEntries = await response.json();

    const countryToEntry = {};
    allEntries.forEach(entry => {
      countryToEntry[entry.country] = entry;
    });

    const selectedCountries = new Set();

rankLabels.forEach(({ label, emoji, multiplier }, index) => {
  const slotWrapper = document.createElement("div");
  slotWrapper.classList.add("rank-slot");

  const labelEl = document.createElement("div");
  labelEl.classList.add("rank-label");
  labelEl.textContent = `${emoji} ${label} (${multiplier}x multiplier)`;

  const dropZone = document.createElement("div");
  dropZone.classList.add("slot-dropzone");

  const country = currentRankings[`rank_${index + 1}`];
  const entry = countryToEntry[country];

  if (entry) {
    selectedCountries.add(entry.country);

    const card = createCard(entry, allEntries, selectedCountries, (newEntry) => {
      selectedCountries.delete(entry.country);
      selectedCountries.add(newEntry.country);
      const newCard = createCard(newEntry, allEntries, selectedCountries, () => {});
      dropZone.innerHTML = "";
      dropZone.appendChild(newCard);
    });

    dropZone.appendChild(card);
  }

  slotWrapper.appendChild(labelEl);
  slotWrapper.appendChild(dropZone);
  slotsContainer.appendChild(slotWrapper);
});

    // Enable drag-and-drop on slots
    document.querySelectorAll(".slot-dropzone").forEach(zone => {
      Sortable.create(zone, {
        group: { name: "ranking", pull: true, put: true },
        animation: 150,
        sort: false,
        onAdd(evt) {
          const newCard = evt.item;
          const oldCard = Array.from(zone.children).find(child => child !== newCard);
          if (oldCard) {
            evt.from.appendChild(oldCard);
          }
        }
      });
    });

    saveBtn.style.display = "block";
    saveBtn.addEventListener("click", async () => {
      const updatedRankings = {};
      const dropzones = document.querySelectorAll(".slot-dropzone");

      dropzones.forEach((zone, index) => {
        const card = zone.firstElementChild;
        if (card) {
          const country = card.querySelector(".country").textContent;
          updatedRankings[`rank_${index + 1}`] = country;
        }
      });

      try {
        await updateDoc(docRef, {
          rankings: updatedRankings,
          editedAt: new Date().toISOString()
        });
        alert("Rankings updated!");
      } catch (err) {
        console.error("Error updating document:", err);
        alert("Failed to save changes.");
      }
    });

  } catch (error) {
    console.error("Error loading rankings:", error);
    alert("Failed to load data.");
  }
});

function createCard(entry, allEntries, selectedCountries, onReplace) {
    const card = document.createElement("div");
    card.classList.add("entry-card");
    card.id = `entry-${entry.country.replace(/\s+/g, "-")}`;
  
    const flag = document.createElement("img");
    flag.src = entry.heartimg;
    flag.alt = `${entry.country} Flag`;
  
    const info = document.createElement("div");
    info.classList.add("entry-info");
    info.innerHTML = `
      <div class="country">${entry.country}</div>
      <div class="song">${entry.song}</div>
    `;
  
    const replaceBtn = document.createElement("button");
    replaceBtn.textContent = "Replace";
    replaceBtn.classList.add("replace-btn");
  
    replaceBtn.addEventListener("click", () => {
      showReplaceModal(entry, allEntries, selectedCountries, onReplace);
    });
  
    card.appendChild(flag);
    card.appendChild(info);
    card.appendChild(replaceBtn);
    return card;
  }
  
  function showReplaceModal(currentEntry, allEntries, selectedCountries, onReplace) {
    const modal = document.getElementById("replace-modal");
    const optionsGrid = document.getElementById("replacement-options");
    const cancelBtn = document.getElementById("cancel-replace");
  
    // Clear previous options
    optionsGrid.innerHTML = "";
  
    const validEntries = allEntries.filter(e =>
      !e.eliminated &&
      e.country !== currentEntry.country &&
      !selectedCountries.has(e.country)
    );
  
    validEntries.forEach(entry => {
      const option = document.createElement("div");
      option.classList.add("option-card");
  
      const img = document.createElement("img");
      img.src = entry.heartimg;
      img.alt = `${entry.country} Heart`;
  
      const name = document.createElement("span");
      name.textContent = entry.country;
  
      option.appendChild(img);
      option.appendChild(name);
  
      option.addEventListener("click", () => {
        modal.style.display = "none";
        onReplace(entry);
      });
  
      optionsGrid.appendChild(option);
    });
  
    cancelBtn.onclick = () => {
      modal.style.display = "none";
    };
  
    modal.style.display = "flex";
  }
  