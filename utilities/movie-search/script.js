class MovieSearchUtility {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.yearFilter = document.getElementById('year-filter');
        this.genreFilter = document.getElementById('genre-filter');
        this.qualityFilter = document.getElementById('quality-filter');
        this.resultsGrid = document.getElementById('results-grid');
        this.resultsCount = document.getElementById('results-count');
        this.loading = document.getElementById('loading');
        
        // Sample movie data for demonstration
        this.movies = [
            {
                id: 1,
                title: "Inception",
                year: 2010,
                rating: 8.8,
                duration: "2h 28m",
                genres: ["Action", "Sci-Fi", "Thriller"],
                quality: "1080p",
                poster: "",
                overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                streamingLinks: [
                    { service: "Netflix", quality: "1080p", subtitles: ["English", "Spanish", "French"], link: "#" },
                    { service: "Amazon Prime", quality: "4K", subtitles: ["English", "German", "Japanese"], link: "#" }
                ],
                downloadLinks: [
                    { quality: "1080p", size: "2.1 GB", subtitles: ["English", "Spanish"], link: "#" },
                    { quality: "720p", size: "1.2 GB", subtitles: ["English"], link: "#" }
                ]
            },
            {
                id: 2,
                title: "The Shawshank Redemption",
                year: 1994,
                rating: 9.3,
                duration: "2h 22m",
                genres: ["Drama"],
                quality: "4K",
                poster: "",
                overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                streamingLinks: [
                    { service: "HBO Max", quality: "4K", subtitles: ["English", "Spanish", "French", "German"], link: "#" }
                ],
                downloadLinks: [
                    { quality: "4K", size: "8.5 GB", subtitles: ["English", "Spanish", "French"], link: "#" },
                    { quality: "1080p", size: "3.2 GB", subtitles: ["English", "Spanish"], link: "#" }
                ]
            },
            {
                id: 3,
                title: "The Dark Knight",
                year: 2008,
                rating: 9.0,
                duration: "2h 32m",
                genres: ["Action", "Crime", "Drama"],
                quality: "4K",
                poster: "",
                overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                streamingLinks: [
                    { service: "HBO Max", quality: "4K", subtitles: ["English", "Spanish", "French", "German", "Italian"], link: "#" },
                    { service: "Amazon Prime", quality: "1080p", subtitles: ["English", "Spanish"], link: "#" }
                ],
                downloadLinks: [
                    { quality: "4K", size: "12.1 GB", subtitles: ["English", "Spanish", "French", "German"], link: "#" },
                    { quality: "1080p", size: "4.5 GB", subtitles: ["English", "Spanish"], link: "#" }
                ]
            },
            {
                id: 4,
                title: "Pulp Fiction",
                year: 1994,
                rating: 8.9,
                duration: "2h 34m",
                genres: ["Crime", "Drama"],
                quality: "1080p",
                poster: "",
                overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                streamingLinks: [
                    { service: "Netflix", quality: "1080p", subtitles: ["English", "Spanish", "French"], link: "#" }
                ],
                downloadLinks: [
                    { quality: "1080p", size: "2.8 GB", subtitles: ["English", "Spanish", "French"], link: "#" }
                ]
            },
            {
                id: 5,
                title: "Forrest Gump",
                year: 1994,
                rating: 8.8,
                duration: "2h 22m",
                genres: ["Drama", "Romance"],
                quality: "720p",
                poster: "",
                overview: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75.",
                streamingLinks: [
                    { service: "Apple TV+", quality: "1080p", subtitles: ["English", "Spanish", "French", "German"], link: "#" }
                ],
                downloadLinks: [
                    { quality: "1080p", size: "3.1 GB", subtitles: ["English", "Spanish"], link: "#" },
                    { quality: "720p", size: "1.8 GB", subtitles: ["English"], link: "#" }
                ]
            },
            {
                id: 6,
                title: "The Matrix",
                year: 1999,
                rating: 8.7,
                duration: "2h 16m",
                genres: ["Action", "Sci-Fi"],
                quality: "4K",
                poster: "",
                overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
                streamingLinks: [
                    { service: "Netflix", quality: "4K", subtitles: ["English", "Spanish", "French", "Japanese"], link: "#" }
                ],
                downloadLinks: [
                    { quality: "4K", size: "10.2 GB", subtitles: ["English", "Spanish", "French"], link: "#" },
                    { quality: "1080p", size: "3.8 GB", subtitles: ["English", "Spanish"], link: "#" }
                ]
            }
        ];
        
        this.filteredMovies = [...this.movies];
        
        this.initEventListeners();
        this.populateFilters();
    }
    
    initEventListeners() {
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        this.yearFilter.addEventListener('change', () => this.filterMovies());
        this.genreFilter.addEventListener('change', () => this.filterMovies());
        this.qualityFilter.addEventListener('change', () => this.filterMovies());
    }
    
    populateFilters() {
        // Populate years filter
        const years = [...new Set(this.movies.map(movie => movie.year))].sort((a, b) => b - a);
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.yearFilter.appendChild(option);
        });
        
        // Populate genres filter
        const genres = [...new Set(this.movies.flatMap(movie => movie.genres))].sort();
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            this.genreFilter.appendChild(option);
        });
    }
    
    performSearch() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            this.filteredMovies = this.movies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.genres.some(genre => genre.toLowerCase().includes(searchTerm))
            );
        } else {
            this.filteredMovies = [...this.movies];
        }
        
        this.applyFilters();
        this.displayResults();
    }
    
    filterMovies() {
        this.applyFilters();
        this.displayResults();
    }
    
    applyFilters() {
        const yearValue = this.yearFilter.value;
        const genreValue = this.genreFilter.value;
        const qualityValue = this.qualityFilter.value;
        
        this.filteredMovies = this.movies.filter(movie => {
            // Apply search term filter
            const searchTerm = this.searchInput.value.trim().toLowerCase();
            const matchesSearch = !searchTerm || 
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.genres.some(genre => genre.toLowerCase().includes(searchTerm));
            
            if (!matchesSearch) return false;
            
            // Apply year filter
            if (yearValue && movie.year != yearValue) return false;
            
            // Apply genre filter
            if (genreValue && !movie.genres.includes(genreValue)) return false;
            
            // Apply quality filter
            if (qualityValue && movie.quality !== qualityValue) return false;
            
            return true;
        });
    }
    
    displayResults() {
        this.resultsCount.textContent = `${this.filteredMovies.length} ${this.filteredMovies.length === 1 ? 'movie' : 'movies'} found`;
        
        if (this.filteredMovies.length === 0) {
            this.resultsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎬</div>
                    <h3>No Movies Found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        this.resultsGrid.innerHTML = this.filteredMovies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <div class="movie-poster">
                    <div class="movie-poster-placeholder">🎬</div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-year">${movie.year}</div>
                    <div class="movie-meta">
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            ${movie.rating}
                        </div>
                        <div class="movie-quality">${movie.quality}</div>
                    </div>
                    <div class="movie-links">
                        <div class="streaming-link">
                            <i class="fas fa-play"></i> Stream
                        </div>
                        <div class="download-link">
                            <i class="fas fa-download"></i> Download
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event listeners to movie cards
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const movieId = parseInt(card.getAttribute('data-id'));
                const movie = this.movies.find(m => m.id === movieId);
                if (movie) {
                    this.showMovieDetails(movie);
                }
            });
        });
    }
    
    showMovieDetails(movie) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2>${movie.title}</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-content">
                <div class="movie-detail-poster">
                    <div class="movie-detail-poster-placeholder">🎬</div>
                </div>
                <h2 class="movie-detail-title">${movie.title}</h2>
                <div class="movie-detail-meta">
                    <div class="movie-detail-rating">
                        <i class="fas fa-star"></i>
                        ${movie.rating}
                    </div>
                    <div class="movie-detail-year">
                        <i class="fas fa-calendar"></i>
                        ${movie.year}
                    </div>
                    <div class="movie-detail-duration">
                        <i class="fas fa-clock"></i>
                        ${movie.duration}
                    </div>
                </div>
                <div class="movie-detail-overview">
                    <h3>Overview</h3>
                    <p>${movie.overview}</p>
                </div>
                <div class="movie-detail-links">
                    <h3>Streaming Options</h3>
                    <div class="links-container">
                        ${movie.streamingLinks.map(link => `
                            <div class="link-card">
                                <div class="link-card-header">
                                    <div class="link-icon streaming-icon">
                                        <i class="fas fa-play"></i>
                                    </div>
                                    <h4>${link.service}</h4>
                                    <div class="movie-quality">${link.quality}</div>
                                </div>
                                <div class="link-info">
                                    <div class="link-info-item">
                                        <span class="link-info-label">Subtitles:</span>
                                        <span class="link-info-value">${link.subtitles.join(', ')}</span>
                                    </div>
                                </div>
                                <a href="${link.link}" class="link-button streaming-button" target="_blank">
                                    <i class="fas fa-external-link-alt"></i> Watch Now
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="movie-detail-links">
                    <h3>Download Options</h3>
                    <div class="links-container">
                        ${movie.downloadLinks.map(link => `
                            <div class="link-card">
                                <div class="link-card-header">
                                    <div class="link-icon download-icon">
                                        <i class="fas fa-download"></i>
                                    </div>
                                    <h4>Download</h4>
                                    <div class="movie-quality">${link.quality}</div>
                                </div>
                                <div class="link-info">
                                    <div class="link-info-item">
                                        <span class="link-info-label">Size:</span>
                                        <span class="link-info-value">${link.size}</span>
                                    </div>
                                    <div class="link-info-item">
                                        <span class="link-info-label">Subtitles:</span>
                                        <span class="link-info-value">${link.subtitles.join(', ')}</span>
                                    </div>
                                </div>
                                <a href="${link.link}" class="link-button download-button" target="_blank">
                                    <i class="fas fa-download"></i> Download
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        // Add close event listeners
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
    }
}

// Initialize the utility when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieSearchUtility();
});