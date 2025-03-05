document.addEventListener("DOMContentLoaded", function () {
    fetch("entries.json")
        .then(response => response.json())
        .then(entries => {
            const container = document.getElementById("entries-container");

            // Create sticky footer element
            const stickyFooter = document.createElement("div");
            stickyFooter.classList.add("sticky-footer");
            document.body.appendChild(stickyFooter);

            function addToFooter(entry) {
                const item = document.createElement("div");
                item.classList.add("footer-item");
                // Use country as the unique identifier
                item.setAttribute("data-country", entry.country);
                item.innerHTML = `<img src="${entry.heartimg}" alt="Heart Flag">`;
                stickyFooter.appendChild(item);
            }

            function removeFromFooter(country) {
                const item = stickyFooter.querySelector(`[data-country='${country}']`);
                if (item) {
                    stickyFooter.removeChild(item);
                }
            }

            entries.forEach(entry => {
                // Create a wrapper that holds both the star box and the entry card
                const entryWrapper = document.createElement("div");
                entryWrapper.classList.add("entry-wrapper");

                // Create the star box element (outside the entry card)
                const starBox = document.createElement("div");
                starBox.classList.add("star-box");
                starBox.innerHTML = `<img src="svg/Empty_Star.svg" alt="Star" class="star-icon">`;

                // Toggle star state on click
                starBox.addEventListener("click", function () {
                    const starIcon = starBox.querySelector(".star-icon");
                    if (starIcon.classList.contains("selected")) {
                        starIcon.classList.remove("selected");
                        starIcon.src = "svg/Empty_Star.svg";
                        removeFromFooter(entry.id);
                    } else {
                        starIcon.classList.add("selected");
                        starIcon.src = "svg/Star_full.svg";
                        addToFooter(entry);
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

                // Append the star box and the entry card to the wrapper
                entryWrapper.appendChild(starBox);
                entryWrapper.appendChild(card);

                // Append the wrapper to the container
                container.appendChild(entryWrapper);
            });
        })
        .catch(error => console.error("Error loading entries:", error));
});
