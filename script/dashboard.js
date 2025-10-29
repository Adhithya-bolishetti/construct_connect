class Dashboard {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.workers = [];
        this.init();
    }

    init() {
        if (!this.currentUser || !this.currentUser.profileComplete) {
            window.location.href = "./index.html";
            return;
        }

        this.loadUserProfile();
        this.setupEventListeners();
        this.loadWorkers();
    }

    loadUserProfile() {
        document.querySelector('.profile h1').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.querySelector('.profile p').textContent = 
            this.currentUser.accountType === 'contractor' ? 
            `${this.currentUser.company}` : 
            `${this.currentUser.profession}`;
    }

    setupEventListeners() {
        // Search functionality
        document.querySelector('#searchbar button').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchWorker').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filter form
        document.querySelector('#filters input[type="button"]').addEventListener('click', () => {
            this.applyFilters();
        });

        // Logout
        const logoutLink = document.querySelector('a[href="#"]:last-child');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = "./index.html";
            });
        }
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchWorker').value.toLowerCase();
        this.filterWorkers(searchTerm);
    }

    applyFilters() {
        const location = document.getElementById('location').value.toLowerCase();
        const profession = document.getElementById('acType').value;
        const sortBy = document.getElementById('sort').value;

        this.filterAndSortWorkers({ location, profession, sortBy });
    }

    loadWorkers() {
        const users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
        this.workers = users.filter(user => 
            user.profileComplete && user.accountType === 'worker'
        );
        this.renderWorkers(this.workers);
    }

    filterWorkers(searchTerm) {
        let filtered = this.workers;
        
        if (searchTerm) {
            filtered = this.workers.filter(worker =>
                worker.firstName.toLowerCase().includes(searchTerm) ||
                worker.lastName.toLowerCase().includes(searchTerm) ||
                worker.profession.toLowerCase().includes(searchTerm) ||
                worker.location.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderWorkers(filtered);
    }

    filterAndSortWorkers(filters) {
        let filtered = this.workers;

        // Apply location filter
        if (filters.location) {
            filtered = filtered.filter(worker =>
                worker.location.toLowerCase().includes(filters.location)
            );
        }

        // Apply profession filter
        if (filters.profession && filters.profession !== 'none') {
            filtered = filtered.filter(worker =>
                worker.profession === filters.profession
            );
        }

        // Apply sorting
        if (filters.sortBy && filters.sortBy !== 'none') {
            filtered = this.sortWorkers(filtered, filters.sortBy);
        }

        this.renderWorkers(filtered);
    }

    sortWorkers(workers, sortBy) {
        return [...workers].sort((a, b) => {
            switch (sortBy) {
                case 'experience':
                    return b.experience - a.experience;
                case 'rating':
                    return b.rating - a.rating;
                case 'pay':
                    // For demo, using random pay values
                    return (b.pay || Math.random() * 1000) - (a.pay || Math.random() * 1000);
                default:
                    return 0;
            }
        });
    }

    renderWorkers(workers) {
        const section = document.querySelector('section');
        
        // Remove existing worker cards (keep the filters and heading)
        const existingCards = section.querySelectorAll('.card');
        existingCards.forEach(card => {
            if (!card.querySelector('h1') && !card.querySelector('#filters')) {
                card.remove();
            }
        });

        if (workers.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'card';
            noResults.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h3>No workers found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            section.appendChild(noResults);
            return;
        }

        workers.forEach(worker => {
            const card = this.createWorkerCard(worker);
            section.appendChild(card);
        });
    }

    createWorkerCard(worker) {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <img src="./assets/workerProfile.png" alt="${worker.firstName}">
            <div id="name">
                <h1>${worker.firstName} ${worker.lastName}</h1>
                <p>${worker.profession}</p> 
            </div>
            <div id="details">
                <p><strong>Experience:</strong> ${worker.experience} years</p>
                <p><strong>Location:</strong> ${worker.location}</p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(worker.rating)}${worker.rating < 5 ? '☆'.repeat(5 - worker.rating) : ''}</p>
                <p><strong>Contact:</strong> ${worker.mobileNumber || 'N/A'}</p>
                <button class="contact-btn" onclick="dashboard.contactWorker('${worker.id}')">
                    <i class="fa-solid fa-phone"></i> Contact
                </button>
            </div>
        `;
        
        return card;
    }

    contactWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (worker) {
            alert(`Contacting ${worker.firstName} ${worker.lastName}\nPhone: ${worker.mobileNumber || 'Not available'}\nProfession: ${worker.profession}`);
        }
    }
}

// Add CSS for contact button
const style = document.createElement('style');
style.textContent = `
    .contact-btn {
        background-color: #7360DF;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
        font-size: 0.9rem;
    }
    
    .contact-btn:hover {
        background-color: #F2AFEF;
        color: #000000;
    }
    
    #details p {
        margin: 0.5rem 0;
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});