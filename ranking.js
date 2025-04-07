document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const entriesParam = params.get("entries");
    const selectedCountries = entriesParam ? entriesParam.split(",").map(decodeURIComponent) : [];

    if (selectedCountries.length !== 10) {
        alert("Exactly 10 entries must be selected.");
        return;
    }

    const response = await fetch("entries.json");
    const allEntries = await response.json();
    const selectedEntries = allEntries.filter(entry => selectedCountries.includes(entry.country));

    const cardsContainer = document.getElementById("cards-container");
    const slotsContainer = document.getElementById("slots-container");

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
    
    rankLabels.forEach(({ label, emoji, multiplier }) => {
        const slotWrapper = document.createElement("div");
        slotWrapper.classList.add("rank-slot");
    
        const labelEl = document.createElement("div");
        labelEl.classList.add("rank-label");
        labelEl.textContent = `${emoji} ${label} (${multiplier}x multiplier)`;
    
        const dropZone = document.createElement("div");
        dropZone.classList.add("slot-dropzone");
    
        slotWrapper.appendChild(labelEl);
        slotWrapper.appendChild(dropZone);
        slotsContainer.appendChild(slotWrapper);
    });
    

    // Create cards
    selectedEntries.forEach(entry => {
        const card = createCard(entry);
        cardsContainer.appendChild(card);
    });

    // Left column (source)
    Sortable.create(cardsContainer, {
        group: {
            name: "ranking",
            pull: true,
            put: false
        },
        animation: 150,
        sort: true
    });

    // Right column (ranking dropzones) with swap logic
    document.querySelectorAll(".slot-dropzone").forEach(zone => {
        Sortable.create(zone, {
            group: {
                name: "ranking",
                pull: true,
                put: true
            },
            animation: 150,
            sort: false,
            onAdd: function (evt) {
                const newCard = evt.item;
                const oldCard = Array.from(zone.children).find(child => child !== newCard);

                if (oldCard) {
                    const fromZone = evt.from;
                    zone.replaceChild(newCard, oldCard);
                    fromZone.appendChild(oldCard);
                }
            }
        });
    });

    function createCard(entry) {
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

        card.appendChild(flag);
        card.appendChild(info);
        return card;
    }
});
