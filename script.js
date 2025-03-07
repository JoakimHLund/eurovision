document.addEventListener("DOMContentLoaded", function () {
    fetch("entries.json")
        .then(response => response.json())
        .then(entries => {
            const container = document.getElementById("entries-container");

            // Create sticky footer element
            const stickyFooter = document.createElement("div");
            stickyFooter.classList.add("sticky-footer");
            document.body.appendChild(stickyFooter);

            // Track selected count
            let selectedCount = 0;
            const maxSelections = 10;

            // Create an indicator element within the footer
            const selectionIndicator = document.createElement("div");
            selectionIndicator.classList.add("selection-indicator");
            stickyFooter.appendChild(selectionIndicator);

            // Update the text of the indicator
            function updateIndicator() {
                selectionIndicator.textContent = `${selectedCount}/${maxSelections} selected`;
            }

            // Initially show "0/10 selected"
            updateIndicator();

            // Add item to footer (if limit not exceeded)
            function addToFooter(entry) {
                if (selectedCount >= maxSelections) {
                    alert("You can only select up to 10 entries!");
                    return false;
                }

                const item = document.createElement("div");
                item.classList.add("footer-item");
                // Use country as the unique identifier
                item.setAttribute("data-country", entry.country);
                item.innerHTML = `<img src="${entry.heartimg}" alt="Heart Flag">`;
                stickyFooter.appendChild(item);

                selectedCount++;
                updateIndicator();
                return true; // indicates we actually added it
            }

            // Remove item from footer
            function removeFromFooter(country) {
                const item = stickyFooter.querySelector(`[data-country='${country}']`);
                if (item) {
                    stickyFooter.removeChild(item);
                    selectedCount--;
                    updateIndicator();
                }
            }

            // Process each entry from JSON
            entries.forEach(entry => {
                const entryWrapper = document.createElement("div");
                entryWrapper.classList.add("entry-wrapper");

                // Create the star box (favorite icon) outside the card
                const starBox = document.createElement("div");
                starBox.classList.add("star-box");
                starBox.innerHTML = `<img src="svg/Empty_Star.svg" alt="Star" class="star-icon">`;

                // Toggle star state on click
                starBox.addEventListener("click", function () {
                    const starIcon = starBox.querySelector(".star-icon");
                    if (starIcon.classList.contains("selected")) {
                        // Unselect
                        starIcon.classList.remove("selected");
                        starIcon.src = "svg/Empty_Star.svg";
                        removeFromFooter(entry.country);
                    } else {
                        // Attempt to add
                        const added = addToFooter(entry);
                        if (added) {
                            starIcon.classList.add("selected");
                            starIcon.src = "svg/Star_full.svg";
                        }
                    }
                });

                // Create the entry card element
                const card = document.createElement("div");
                card.classList.add("entry-card");

                // YouTube Embed (if available)
                let youtubeEmbed = "";
                if (entry.youtube.trim()) {
                    youtubeEmbed = `
                        <iframe
                            class="youtube-player"
                            src="https://www.youtube.com/embed/${entry.youtube}"
                            title="YouTube video player"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>
                    `;
                }

                // Spotify Embed (if available)
                let spotifyEmbed = "";
                if (entry.spotify.trim()) {
                    spotifyEmbed = `
                        <iframe
                            class="spotify-player"
                            src="https://open.spotify.com/embed/track/${entry.spotify}?utm_source=generator&theme=1"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy">
                        </iframe>
                    `;
                }

                // Fill card content
                card.innerHTML = `
                    <div class="left-content">
                        <img class="artist-img" src="${entry.artistimg}" alt="${entry.artist}"/>
                        <div class="entry-details">
                            <div class="entry-header">
                                <img class="heart-img" src="${entry.heartimg}" alt="Heart"/>
                                <span class="country-name">${entry.country}</span>
                            </div>
                            <div class="song">${entry.song}</div>
                            <div class="artist">${entry.artist}</div>
                            ${spotifyEmbed}
                        </div>
                    </div>
                    <div class="embed-container">
                        ${youtubeEmbed}
                    </div>
                `;

                // Add the star box and card to the wrapper, then to the container
                entryWrapper.appendChild(starBox);
                entryWrapper.appendChild(card);
                container.appendChild(entryWrapper);
            });
        })
        .catch(error => console.error("Error loading entries:", error));
});