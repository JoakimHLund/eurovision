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

    // Create ranking slots
    const rankLabels = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
    rankLabels.forEach(label => {
        const slot = document.createElement("div");
        slot.classList.add("rank-slot");
        slot.setAttribute("data-rank", label);

        const labelEl = document.createElement("div");
        labelEl.classList.add("rank-label");
        labelEl.textContent = label;

        slot.appendChild(labelEl);
        slotsContainer.appendChild(slot);

        // Make slots droppable
        slot.addEventListener("dragover", e => {
            e.preventDefault();
            slot.classList.add("dragover");
        });

        slot.addEventListener("dragleave", () => {
            slot.classList.remove("dragover");
        });

        slot.addEventListener("drop", e => {
            e.preventDefault();
            slot.classList.remove("dragover");
            const draggedId = e.dataTransfer.getData("text/plain");
            const draggedCard = document.getElementById(draggedId);
        
            const existingCard = slot.querySelector(".entry-card");
        
            // If there's already a card in the slot, swap positions
            if (existingCard && draggedCard !== existingCard) {
                const fromSlot = draggedCard.parentElement;
                slot.replaceChild(draggedCard, existingCard);
                fromSlot.appendChild(existingCard);
            } else if (!existingCard) {
                // Just move it if slot is empty
                if (draggedCard.parentElement) {
                    draggedCard.parentElement.removeChild(draggedCard);
                }
                slot.appendChild(draggedCard);
            }
        });
        
    });

    // Render entry cards
    selectedEntries.forEach(entry => {
        const card = document.createElement("div");
        card.classList.add("entry-card");
        card.setAttribute("draggable", "true");
        card.id = `entry-${entry.country.replace(/\s+/g, "-")}`;

        card.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", card.id);
        });

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
        cardsContainer.appendChild(card);
    });
});
