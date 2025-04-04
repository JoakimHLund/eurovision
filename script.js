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

            const selectionIndicator = document.createElement("div");
            selectionIndicator.classList.add("selection-indicator");
            stickyFooter.appendChild(selectionIndicator);

            function updateIndicator() {
                selectionIndicator.textContent = `${selectedCount}/${maxSelections} selected`;
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
                updateIndicator();
                return true;
            }

            function removeFromFooter(country) {
                const item = stickyFooter.querySelector(`[data-country='${country}']`);
                if (item) {
                    stickyFooter.removeChild(item);
                    selectedCount--;
                    updateIndicator();
                }
            }

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

                // Main card content wrapper
                const cardMain = document.createElement("div");
                cardMain.classList.add("card-main-content");

                // Left side
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

                // Right side - Spotify embed
                const embedContainer = document.createElement("div");
                embedContainer.classList.add("embed-container");

                const spotifyEmbed = document.createElement("iframe");
                spotifyEmbed.className = "spotify-player";
                spotifyEmbed.src = `https://open.spotify.com/embed/track/${entry.spotify}?utm_source=generator&theme=1`;
                spotifyEmbed.frameBorder = "0";
                spotifyEmbed.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
                spotifyEmbed.loading = "lazy";

                embedContainer.appendChild(spotifyEmbed);

                // Add left and right to main content
                cardMain.appendChild(leftContent);
                cardMain.appendChild(embedContainer);

                // Optional chevron, description and YouTube
                let descriptionDiv;
                if ((entry.description && entry.description.trim()) || (entry.youtube && entry.youtube.trim())) {
                    const chevronBtn = document.createElement("button");
                    chevronBtn.classList.add("chevron-toggle");
                    chevronBtn.innerHTML = "▼";
                
                    const descriptionDiv = document.createElement("div");
                    descriptionDiv.classList.add("entry-description");
                    if (entry.description && entry.description.trim()) {
                        const paragraphs = entry.description.split(/\r?\n\r?\n/); // or /\n+/ if using single line breaks
                        descriptionDiv.innerHTML = paragraphs
                            .map(p => `<p>${p.trim()}</p>`)
                            .join("");
                    }
                    
                    descriptionDiv.style.display = "none";
                
                    const youtubeContainer = document.createElement("div");
                    youtubeContainer.classList.add("embed-container");
                    youtubeContainer.style.marginTop = "12px";
                
                    const expandedContent = document.createElement("div");
                    expandedContent.classList.add("expanded-content");
                    expandedContent.style.display = "none";
                
                    // Only append if they exist
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
