class Dashboard {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.workers = [];
        this.projects = JSON.parse(localStorage.getItem('constructConnectProjects')) || [];
        this.reviews = JSON.parse(localStorage.getItem('constructConnectReviews')) || [];
        this.currentWorkerForReview = null;
        this.init();
    }

    init() {
        if (!this.currentUser || !this.currentUser.profileComplete) {
            window.location.href = "./index.html";
            return;
        }

        this.loadUserProfile();
        this.setupEventListeners();
        this.setupModals();
        this.loadWorkers();
        this.loadProjects();
        this.showSection('workers');
    }

    loadUserProfile() {
        document.getElementById('userName').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        
        const userTypeElement = document.getElementById('userType');
        if (this.currentUser.accountType === 'contractor') {
            userTypeElement.textContent = this.currentUser.company || 'Contractor';
        } else if (this.currentUser.accountType === 'worker') {
            userTypeElement.textContent = this.formatProfession(this.currentUser.profession) || 'Worker';
        } else {
            userTypeElement.textContent = 'Customer';
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('#links a[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section') || 
                              e.target.closest('a').getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = "./index.html";
        });

        // Search
        document.querySelector('#searchbar button').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchWorker').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filters
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Add Project
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });
    }

    setupModals() {
        // Project Modal
        const projectModal = document.getElementById('projectModal');
        const projectForm = document.getElementById('projectForm');

        document.querySelector('#projectModal .close').addEventListener('click', () => {
            projectModal.style.display = 'none';
        });

        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProject();
        });

        // Review Modal
        const reviewModal = document.getElementById('reviewModal');
        const reviewForm = document.getElementById('reviewForm');

        document.querySelector('#reviewModal .close').addEventListener('click', () => {
            reviewModal.style.display = 'none';
        });

        // Star rating
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                const rating = star.getAttribute('data-rating');
                this.setRating(rating);
            });
        });

        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.style.display = 'none';
            }
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('section-hidden');
            section.classList.remove('active-section');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('section-hidden');
            targetSection.classList.add('active-section');
        }

        // Update active nav link
        document.querySelectorAll('#links a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`#links a[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Workers Section Methods
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
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });
    }

    renderWorkers(workers) {
        const container = document.getElementById('workers-container');
        container.innerHTML = '';

        if (workers.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-users-slash fa-3x" style="color: #7360DF; margin-bottom: 1rem;"></i>
                    <h3>No workers found</h3>
                    <p>Try adjusting your search criteria or check back later</p>
                </div>
            `;
            return;
        }

        workers.forEach(worker => {
            const card = this.createWorkerCard(worker);
            container.appendChild(card);
        });
    }

    formatProfession(profession) {
        const professionMap = {
            'architect': 'Architect',
            'civil-engineer': 'Civil Engineer',
            'structural-engineer': 'Structural Engineer',
            'site-engineer': 'Site Engineer',
            'carpenter': 'Carpenter',
            'electrician': 'Electrician',
            'plumber': 'Plumber',
            'painter': 'Painter',
            'mason': 'Mason',
            'welder': 'Welder',
            'fabricator': 'Fabricator',
            'fitter': 'Fitter',
            'mechanic': 'Mechanic',
            'technician': 'Technician',
            'other': 'Other'
        };
        
        return professionMap[profession] || profession;
    }

    createWorkerCard(worker) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const workerReviews = this.reviews.filter(review => review.workerId === worker.id);
        const averageRating = workerReviews.length > 0 
            ? (workerReviews.reduce((sum, review) => sum + review.rating, 0) / workerReviews.length).toFixed(1)
            : 'No ratings';

        card.innerHTML = `
            <img src="./assets/workerProfile.png" alt="${worker.firstName}">
            <div class="name">
                <h1>${worker.firstName} ${worker.lastName}</h1>
                <p>${this.formatProfession(worker.profession)}</p> 
            </div>
            <div class="details">
                <p><strong>Experience:</strong> ${worker.experience} years</p>
                <p><strong>Location:</strong> ${worker.location}</p>
                <p><strong>Rating:</strong> ${averageRating} ${typeof averageRating === 'string' ? '' : '⭐'}</p>
                <p><strong>Contact:</strong> ${worker.mobileNumber || 'N/A'}</p>
                
                <div class="worker-actions">
                    <button class="contact-btn" onclick="dashboard.contactWorker('${worker.id}')">
                        <i class="fa-solid fa-phone"></i> Contact
                    </button>
                    <button class="review-btn" onclick="dashboard.openReviewModal('${worker.id}')">
                        <i class="fa-solid fa-star"></i> Add Review
                    </button>
                </div>

                ${workerReviews.length > 0 ? `
                    <div class="reviews-section">
                        <h4>Recent Reviews:</h4>
                        ${workerReviews.slice(0, 2).map(review => `
                            <div class="review-item">
                                <div class="review-header">
                                    <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                                    <small>${new Date(review.date).toLocaleDateString()}</small>
                                </div>
                                <p class="review-comment">"${review.comment}"</p>
                            </div>
                        `).join('')}
                        ${workerReviews.length > 2 ? `<p><small>+${workerReviews.length - 2} more reviews</small></p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        return card;
    }

    contactWorker(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (worker) {
            alert(`Contacting ${worker.firstName} ${worker.lastName}\nPhone: ${worker.mobileNumber || 'Not available'}\nProfession: ${this.formatProfession(worker.profession)}`);
        }
    }

    // Projects Section Methods
    openProjectModal() {
        document.getElementById('projectModal').style.display = 'block';
        document.getElementById('projectForm').reset();
    }

    addProject() {
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const workType = document.getElementById('projectType').value;
        const budget = document.getElementById('projectBudget').value;
        const timeline = document.getElementById('projectTimeline').value;
        const location = document.getElementById('projectLocation').value;
        
        // Contact details
        const contactName = document.getElementById('contactName').value;
        const contactPhone = document.getElementById('contactPhone').value;
        const contactEmail = document.getElementById('contactEmail').value;
        const preferredContact = document.getElementById('preferredContact').value;

        const project = {
            id: Date.now().toString(),
            title,
            description,
            workType,
            budget: parseInt(budget),
            timeline: parseInt(timeline),
            location,
            customerId: this.currentUser.id,
            customerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            // Contact details
            contactDetails: {
                name: contactName,
                phone: contactPhone,
                email: contactEmail,
                preferredMethod: preferredContact
            },
            status: 'open',
            createdAt: new Date().toISOString()
        };

        this.projects.push(project);
        localStorage.setItem('constructConnectProjects', JSON.stringify(this.projects));

        document.getElementById('projectModal').style.display = 'none';
        this.loadProjects();
        
        alert('Project posted successfully!');
    }

    loadProjects() {
        // Show only projects for current user if they're a customer
        let userProjects = this.projects;
        if (this.currentUser.accountType === 'customer') {
            userProjects = this.projects.filter(project => project.customerId === this.currentUser.id);
        }

        this.renderProjects(userProjects);
    }

    renderProjects(projects) {
        const container = document.getElementById('projects-container');
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-clipboard-list fa-3x" style="color: #7360DF; margin-bottom: 1rem;"></i>
                    <h3>No projects yet</h3>
                    <p>${this.currentUser.accountType === 'customer' ? 'Create your first project to get started!' : 'No projects available at the moment'}</p>
                </div>
            `;
            return;
        }

        projects.forEach(project => {
            const card = this.createProjectCard(project);
            container.appendChild(card);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const contactIcon = this.getContactIcon(project.contactDetails.preferredMethod);
        const contactMethod = this.formatContactMethod(project.contactDetails.preferredMethod);
        
        card.innerHTML = `
            <div class="project-header">
                <div class="project-title">
                    <h3>${project.title}</h3>
                    <p style="color: #ccc; margin: 0;">${project.description}</p>
                </div>
                <span class="project-status status-${project.status}">
                    ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
            </div>
            
            <div class="project-details">
                <p><strong><i class="fa-solid fa-briefcase"></i> Work Type:</strong> ${this.formatProfession(project.workType)}</p>
                <p><strong><i class="fa-solid fa-indian-rupee-sign"></i> Budget:</strong> ₹${project.budget.toLocaleString()}</p>
                <p><strong><i class="fa-solid fa-calendar-days"></i> Timeline:</strong> ${project.timeline} days</p>
                <p><strong><i class="fa-solid fa-location-dot"></i> Location:</strong> ${project.location}</p>
                <p><strong><i class="fa-solid fa-user"></i> Posted by:</strong> ${project.customerName}</p>
            </div>
            
            <!-- Contact Details Section -->
            <div class="contact-section">
                <h4><i class="fa-solid fa-address-book"></i> Contact Details:</h4>
                <div class="contact-details">
                    <p><strong><i class="fa-solid fa-user"></i> Contact Person:</strong> ${project.contactDetails.name}</p>
                    <p><strong><i class="fa-solid fa-phone"></i> Phone:</strong> ${project.contactDetails.phone}</p>
                    ${project.contactDetails.email ? `<p><strong><i class="fa-solid fa-envelope"></i> Email:</strong> ${project.contactDetails.email}</p>` : ''}
                    <p><strong><i class="fa-solid fa-comment"></i> Preferred Contact:</strong> ${contactIcon} ${contactMethod}</p>
                </div>
                <div class="contact-actions">
                    <button class="contact-btn" onclick="dashboard.contactProject('${project.id}', 'phone')">
                        <i class="fa-solid fa-phone"></i> Call Now
                    </button>
                    <button class="whatsapp-btn" onclick="dashboard.contactProject('${project.id}', 'whatsapp')">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </button>
                    ${project.contactDetails.email ? `
                    <button class="email-btn" onclick="dashboard.contactProject('${project.id}', 'email')">
                        <i class="fa-solid fa-envelope"></i> Email
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #444;">
                <small><i class="fa-solid fa-clock"></i> Posted: ${new Date(project.createdAt).toLocaleDateString()}</small>
                <small><i class="fa-solid fa-eye"></i> ${Math.floor(Math.random() * 50) + 1} views</small>
            </div>
        `;
        
        return card;
    }

    getContactIcon(method) {
        const icons = {
            'phone': '📞',
            'whatsapp': '💬',
            'email': '📧',
            'any': '📱'
        };
        return icons[method] || '📱';
    }

    formatContactMethod(method) {
        const methods = {
            'phone': 'Phone Call',
            'whatsapp': 'WhatsApp',
            'email': 'Email',
            'any': 'Any Method'
        };
        return methods[method] || method;
    }

    contactProject(projectId, method) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const contact = project.contactDetails;
        
        switch(method) {
            case 'phone':
                alert(`Calling ${contact.name} at ${contact.phone}`);
                // In a real app, you would use: window.open(`tel:${contact.phone}`);
                break;
            case 'whatsapp':
                const message = `Hi ${contact.name}, I'm interested in your project "${project.title}" on Construct Connect`;
                const whatsappUrl = `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                alert(`Opening WhatsApp to contact ${contact.name}`);
                // In a real app, you would use: window.open(whatsappUrl, '_blank');
                break;
            case 'email':
                if (contact.email) {
                    const subject = `Interest in your project: ${project.title}`;
                    const body = `Dear ${contact.name},\n\nI am interested in your project "${project.title}" posted on Construct Connect.\n\nBest regards,\n${this.currentUser.firstName} ${this.currentUser.lastName}`;
                    const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    alert(`Opening email to contact ${contact.name}`);
                    // In a real app, you would use: window.open(mailtoUrl);
                }
                break;
        }
    }

    // Review Methods
    openReviewModal(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;

        this.currentWorkerForReview = worker;
        document.getElementById('workerReviewName').textContent = 
            `${worker.firstName} ${worker.lastName}`;
        document.getElementById('reviewWorkerId').value = worker.id;
        
        // Reset form
        document.getElementById('reviewForm').reset();
        this.setRating(0);
        
        document.getElementById('reviewModal').style.display = 'block';
    }

    setRating(rating) {
        document.getElementById('reviewRating').value = rating;
        
        document.querySelectorAll('.star').forEach(star => {
            const starRating = star.getAttribute('data-rating');
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    submitReview() {
        const workerId = document.getElementById('reviewWorkerId').value;
        const rating = document.getElementById('reviewRating').value;
        const comment = document.getElementById('reviewComment').value;

        if (!rating || rating === '0') {
            alert('Please select a rating');
            return;
        }

        const review = {
            id: Date.now().toString(),
            workerId,
            customerId: this.currentUser.id,
            customerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            rating: parseInt(rating),
            comment,
            date: new Date().toISOString()
        };

        this.reviews.push(review);
        localStorage.setItem('constructConnectReviews', JSON.stringify(this.reviews));

        document.getElementById('reviewModal').style.display = 'none';
        this.loadWorkers(); // Reload to show updated reviews
        
        alert('Review submitted successfully!');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});