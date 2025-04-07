document.addEventListener("DOMContentLoaded", function () {
    fetch("entries.json")
        .then(response => response.json())
        .then(entries => {
            const container = document.getElementById("entries-container");

            // Sticky footer setup
            const stickyFooter = document.createElement("div");
            stickyFooter.classList.add("sticky-footer");
            document.body.appendChild(stickyFooter);

            let selectedCount = 0;
            const maxSelections = 10;
            const selectedCountries = new Set();

            const selectionIndicator = document.createElement("div");
            selectionIndicator.classList.add("selection-indicator");
            stickyFooter.appendChild(selectionIndicator);

            const continueButton = document.createElement("button");
            continueButton.textContent = "Continue";
            continueButton.disabled = true;
            continueButton.classList.add("continue-button");
            stickyFooter.appendChild(continueButton);

            function updateIndicator() {
                selectionIndicator.textContent = `${selectedCount}/${maxSelections} selected`;
                continueButton.disabled = selectedCount !== maxSelections;
            }

            updateIndicator();

            function addToFooter(entry) {
                if (selectedCount >= maxSelections) {
                    alert("You can only select up to 10 entries!");
                    return false;
                }

                const item = document.createElement("div");
                item.classList.add("footer-item");
                item.setAttribute("data-country", entry.country);
                item.innerHTML = `<img src="${entry.heartimg}" alt="Heart Flag">`;
                stickyFooter.appendChild(item);

                selectedCount++;
                selectedCountries.add(entry.country);
                updateIndicator();
                return true;
            }

            function removeFromFooter(country) {
                const item = stickyFooter.querySelector(`[data-country='${country}']`);
                if (item) {
                    stickyFooter.removeChild(item);
                    selectedCount--;
                    selectedCountries.delete(country);
                    updateIndicator();
                }
            }

            continueButton.addEventListener("click", () => {
                if (selectedCountries.size === maxSelections) {
                    const params = Array.from(selectedCountries)
                        .map(country => encodeURIComponent(country))
                        .join(",");
                    window.location.href = `ranking.html?entries=${params}`;
                }
            });

            entries.forEach(entry => {
                const entryWrapper = document.createElement("div");
                entryWrapper.classList.add("entry-wrapper");

                // Star box
                const starBox = document.createElement("div");
                starBox.classList.add("star-box");
                starBox.innerHTML = `<img src="svg/Empty_Star.svg" alt="Star" class="star-icon">`;

                starBox.addEventListener("click", function () {
                    const starIcon = starBox.querySelector(".star-icon");
                    if (starIcon.classList.contains("selected")) {
                        starIcon.classList.remove("selected");
                        starIcon.src = "svg/Empty_Star.svg";
                        removeFromFooter(entry.country);
                    } else {
                        const added = addToFooter(entry);
                        if (added) {
                            starIcon.classList.add("selected");
                            starIcon.src = "svg/Star_full.svg";
                        }
                    }
                });

                // Entry card
                const card = document.createElement("div");
                card.classList.add("entry-card");

                const cardMain = document.createElement("div");
                cardMain.classList.add("card-main-content");

                // Left content
                const leftContent = document.createElement("div");
                leftContent.classList.add("left-content");
                leftContent.innerHTML = `
                    <img class="artist-img" src="${entry.artistimg}" alt="${entry.artist}"/>
                    <div class="entry-details">
                        <div class="entry-header">
                            <img class="heart-img" src="${entry.heartimg}" alt="Heart"/>
                            <span class="country-name">${entry.country}</span>
                        </div>
                        <div class="song">${entry.song}</div>
                        <div class="artist">${entry.artist}</div>
                    </div>
                `;

                // Spotify embed
                const embedContainer = document.createElement("div");
                embedContainer.classList.add("embed-container");

                const spotifyEmbed = document.createElement("iframe");
                spotifyEmbed.className = "spotify-player";
                spotifyEmbed.src = `https://open.spotify.com/embed/track/${entry.spotify}?utm_source=generator&theme=1`;
                spotifyEmbed.frameBorder = "0";
                spotifyEmbed.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
                spotifyEmbed.loading = "lazy";

                embedContainer.appendChild(spotifyEmbed);
                cardMain.appendChild(leftContent);
                cardMain.appendChild(embedContainer);

                // Description / YouTube toggle
                if ((entry.description && entry.description.trim()) || (entry.youtube && entry.youtube.trim())) {
                    const chevronBtn = document.createElement("button");
                    chevronBtn.classList.add("chevron-toggle");
                    chevronBtn.innerHTML = "▼";

                    const descriptionDiv = document.createElement("div");
                    descriptionDiv.classList.add("entry-description");
                    descriptionDiv.style.display = "none";

                    if (entry.description && entry.description.trim()) {
                        const paragraphs = entry.description.split(/\r?\n\r?\n/);
                        descriptionDiv.innerHTML = paragraphs
                            .map(p => `<p>${p.trim()}</p>`)
                            .join("");
                    }

                    const youtubeContainer = document.createElement("div");
                    youtubeContainer.classList.add("embed-container");
                    youtubeContainer.style.marginTop = "12px";

                    const expandedContent = document.createElement("div");
                    expandedContent.classList.add("expanded-content");
                    expandedContent.style.display = "none";

                    if (entry.description && entry.description.trim()) {
                        expandedContent.appendChild(descriptionDiv);
                    }
                    if (entry.youtube && entry.youtube.trim()) {
                        expandedContent.appendChild(youtubeContainer);
                    }

                    let isVisible = false;

                    chevronBtn.addEventListener("click", () => {
                        isVisible = !isVisible;
                        expandedContent.style.display = isVisible ? "flex" : "none";
                        chevronBtn.innerHTML = isVisible ? "▲" : "▼";

                        if (descriptionDiv) {
                            descriptionDiv.style.display = isVisible ? "block" : "none";
                        }

                        if (isVisible && !youtubeContainer.hasChildNodes() && entry.youtube.trim()) {
                            const iframe = document.createElement("iframe");
                            iframe.className = "youtube-player";
                            iframe.src = `https://www.youtube.com/embed/${entry.youtube}`;
                            iframe.title = "YouTube video player";
                            iframe.frameBorder = "0";
                            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                            iframe.referrerPolicy = "strict-origin-when-cross-origin";
                            iframe.allowFullscreen = true;
                            youtubeContainer.appendChild(iframe);
                        } else if (!isVisible && youtubeContainer.hasChildNodes()) {
                            youtubeContainer.innerHTML = "";
                        }
                    });

                    cardMain.appendChild(chevronBtn);
                    card.appendChild(cardMain);
                    card.appendChild(expandedContent);
                } else {
                    card.appendChild(cardMain);
                }

                entryWrapper.appendChild(starBox);
                entryWrapper.appendChild(card);
                container.appendChild(entryWrapper);
            });
        })
        .catch(error => console.error("Error loading entries:", error));
});
