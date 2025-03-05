document.addEventListener("DOMContentLoaded", function () {
    fetch("entries.json")
        .then(response => response.json())
        .then(entries => {
            const container = document.getElementById("entries-container");

            entries.forEach(entry => {
                const card = document.createElement("div");
                card.classList.add("entry-card");

                // YouTube Embed (only if there's a valid link)
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

                // Spotify Embed (only if there's a valid link)
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

                container.appendChild(card);
            });
        })
        .catch(error => console.error("Error loading entries:", error));
});
