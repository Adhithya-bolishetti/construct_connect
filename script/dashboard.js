
class Dashboard {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.workers = [];
        this.projects = this.loadProjectsFromStorage();
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
        this.showSection('workers');
    }

    // FIXED: Proper project storage management
    loadProjectsFromStorage() {
        try {
            const stored = localStorage.getItem('constructConnectProjects');
            const projects = stored ? JSON.parse(stored) : [];
            console.log('Projects loaded from storage:', projects);
            return projects;
        } catch (error) {
            console.error('Error loading projects from storage:', error);
            return [];
        }
    }

    saveProjectsToStorage() {
        try {
            localStorage.setItem('constructConnectProjects', JSON.stringify(this.projects));
            console.log('Projects saved to storage:', this.projects);
        } catch (error) {
            console.error('Error saving projects to storage:', error);
        }
    }

    loadUserProfile() {
        const userNameElement = document.getElementById('userName');
        const userTypeElement = document.getElementById('userType');
        
        if (userNameElement) {
            userNameElement.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        
        if (userTypeElement) {
            if (this.currentUser.accountType === 'customer') {
                userTypeElement.textContent = this.currentUser.company || 'Customer';
            } else if (this.currentUser.accountType === 'worker') {
                userTypeElement.textContent = this.formatProfession(this.currentUser.profession) || 'Worker';
            }
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation
        const navLinks = document.getElementById('links');
        if (navLinks) {
            navLinks.addEventListener('click', (e) => {
                e.preventDefault();
                const link = e.target.closest('a[data-section]');
                if (link) {
                    const section = link.getAttribute('data-section');
                    console.log('Navigation clicked:', section);
                    this.showSection(section);
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = "./index.html";
            });
        }

        // Search
        const searchButton = document.querySelector('#searchbar button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        const searchInput = document.getElementById('searchWorker');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Filters
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Edit Profile
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.openEditProfileModal();
            });
        }

        // Status Toggle
        const statusToggleBtn = document.getElementById('statusToggleBtn');
        if (statusToggleBtn) {
            statusToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleWorkerStatus();
            });
        }

        // Add Project (from profile)
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.openProjectModal();
            });
        }
    }

    setupModals() {
        console.log('Setting up modals...');
        
        // Edit Profile Modal
        const editProfileModal = document.getElementById('editProfileModal');
        const editProfileForm = document.getElementById('editProfileForm');

        if (editProfileModal && editProfileForm) {
            const editProfileClose = editProfileModal.querySelector('.close');
            if (editProfileClose) {
                editProfileClose.addEventListener('click', () => {
                    editProfileModal.style.display = 'none';
                });
            }

            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Project Modal
        const projectModal = document.getElementById('projectModal');
        const projectForm = document.getElementById('projectForm');

        if (projectModal && projectForm) {
            const projectClose = projectModal.querySelector('.close');
            if (projectClose) {
                projectClose.addEventListener('click', () => {
                    projectModal.style.display = 'none';
                });
            }

            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProject();
            });
        }

        // Review Modal
        const reviewModal = document.getElementById('reviewModal');
        const reviewForm = document.getElementById('reviewForm');

        if (reviewModal && reviewForm) {
            const reviewClose = reviewModal.querySelector('.close');
            if (reviewClose) {
                reviewClose.addEventListener('click', () => {
                    reviewModal.style.display = 'none';
                });
            }

            // Star rating
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = star.getAttribute('data-rating');
                    this.setRating(rating);
                });
            });

            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const editProfileModal = document.getElementById('editProfileModal');
            const projectModal = document.getElementById('projectModal');
            const reviewModal = document.getElementById('reviewModal');

            if (editProfileModal && e.target === editProfileModal) {
                editProfileModal.style.display = 'none';
            }
            if (projectModal && e.target === projectModal) {
                projectModal.style.display = 'none';
            }
            if (reviewModal && e.target === reviewModal) {
                reviewModal.style.display = 'none';
            }
        });
    }

    showSection(sectionName) {
        console.log('Showing section:', sectionName);
        
        // Hide all sections
        const sections = document.querySelectorAll('main section');
        sections.forEach(section => {
            section.classList.add('section-hidden');
            section.classList.remove('active-section');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('section-hidden');
            targetSection.classList.add('active-section');
            
            // Load data for the section when it's shown
            if (sectionName === 'workers') {
                this.loadWorkers();
            } else if (sectionName === 'projects') {
                this.loadProjects();
            } else if (sectionName === 'profile') {
                this.loadProfileData();
            }
            
            console.log(`Section ${sectionName} shown successfully`);
        } else {
            console.error(`Section ${sectionName} not found`);
        }

        // Update active nav link
        const navLinks = document.querySelectorAll('#links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`#links a[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Profile Section Methods
    loadProfileData() {
        console.log('Loading profile data...');
        
        // Set profile information
        const profileElements = {
            'profileName': `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            'profileFirstName': this.currentUser.firstName || '-',
            'profileLastName': this.currentUser.lastName || '-',
            'profileEmail': this.currentUser.email || '-',
            'profileMobile': this.currentUser.mobileNumber || '-',
            'profileAccountType': this.currentUser.accountType || '-',
            'profileProfession': this.currentUser.profession ? this.formatProfession(this.currentUser.profession) : '-',
            'profileExperience': this.currentUser.experience ? `${this.currentUser.experience} years` : '-',
            'profileCompany': this.currentUser.company || '-',
            'profileLocation': this.currentUser.location || '-',
            'profileLocationDetail': this.currentUser.location || '-'
        };

        Object.keys(profileElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = profileElements[id];
            }
        });
        
        // Show/hide sections based on account type
        const workerStatusSection = document.getElementById('workerStatusSection');
        const customerProjectsSection = document.getElementById('customerProjectsSection');
        
        if (this.currentUser.accountType === 'worker') {
            if (workerStatusSection) workerStatusSection.style.display = 'block';
            if (customerProjectsSection) customerProjectsSection.style.display = 'none';
            this.updateStatusButton();
        } else if (this.currentUser.accountType === 'customer') {
            if (workerStatusSection) workerStatusSection.style.display = 'none';
            if (customerProjectsSection) customerProjectsSection.style.display = 'block';
            this.loadUserProjects();
        }
    }

    openEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (!modal) return;

        // Pre-fill form with current user data
        document.getElementById('editFirstName').value = this.currentUser.firstName || '';
        document.getElementById('editLastName').value = this.currentUser.lastName || '';
        document.getElementById('editEmail').value = this.currentUser.email || '';
        document.getElementById('editMobile').value = this.currentUser.mobileNumber || '';
        document.getElementById('editLocation').value = this.currentUser.location || '';
        
        // Show/hide fields based on account type
        const workerFields = document.getElementById('editWorkerFields');
        const customerFields = document.getElementById('editCustomerFields');
        
        if (this.currentUser.accountType === 'worker') {
            if (workerFields) workerFields.style.display = 'block';
            if (customerFields) customerFields.style.display = 'none';
            document.getElementById('editProfession').value = this.currentUser.profession || '';
            document.getElementById('editExperience').value = this.currentUser.experience || '';
        } else if (this.currentUser.accountType === 'customer') {
            if (workerFields) workerFields.style.display = 'none';
            if (customerFields) customerFields.style.display = 'block';
            document.getElementById('editCompany').value = this.currentUser.company || '';
        }
        
        modal.style.display = 'block';
    }

    updateProfile() {
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const mobile = document.getElementById('editMobile').value;
        const location = document.getElementById('editLocation').value;
        
        if (!firstName || !lastName || !mobile) {
            alert('Please fill all required fields');
            return;
        }
        
        // Update current user
        this.currentUser.firstName = firstName;
        this.currentUser.lastName = lastName;
        this.currentUser.mobileNumber = mobile;
        this.currentUser.location = location;
        
        // Update specific fields based on account type
        if (this.currentUser.accountType === 'worker') {
            this.currentUser.profession = document.getElementById('editProfession').value;
            this.currentUser.experience = parseInt(document.getElementById('editExperience').value) || 0;
        } else if (this.currentUser.accountType === 'customer') {
            this.currentUser.company = document.getElementById('editCompany').value;
        }
        
        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('constructConnectUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        // Update UI
        this.loadUserProfile();
        this.loadProfileData();
        
        document.getElementById('editProfileModal').style.display = 'none';
        alert('Profile updated successfully!');
    }

    toggleWorkerStatus() {
        // Toggle worker status
        this.currentUser.status = this.currentUser.status === 'active' ? 'inactive' : 'active';
        
        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('constructConnectUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        this.updateStatusButton();
        alert(`Status updated to ${this.currentUser.status}`);
    }

    updateStatusButton() {
        const statusBtn = document.getElementById('statusToggleBtn');
        const statusText = document.getElementById('statusText');
        
        if (!statusBtn || !statusText) return;
        
        if (this.currentUser.status === 'active') {
            statusBtn.classList.remove('inactive');
            statusBtn.classList.add('active');
            statusText.textContent = 'Active';
        } else {
            statusBtn.classList.remove('active');
            statusBtn.classList.add('inactive');
            statusText.textContent = 'Inactive';
        }
    }

    loadUserProjects() {
        const container = document.getElementById('userProjectsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Get projects for current user
        const userProjects = this.projects.filter(project => project.customerId === this.currentUser.id);
        
        if (userProjects.length === 0) {
            container.innerHTML = `
                <div class="no-projects">
                    <i class="fa-solid fa-clipboard-list fa-2x" style="color: #7360DF; margin-bottom: 1rem;"></i>
                    <p>You haven't created any projects yet.</p>
                    <p>Click "Add New Project" to get started!</p>
                </div>
            `;
            return;
        }
        
        userProjects.forEach(project => {
            const projectCard = this.createUserProjectCard(project);
            container.appendChild(projectCard);
        });
    }

    createUserProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'user-project-card';
        
        card.innerHTML = `
            <div class="user-project-header">
                <h4>${project.title}</h4>
                <span class="project-status status-${project.status}">
                    ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
            </div>
            <div class="user-project-details">
                <p><strong>Work Type:</strong> ${this.formatWorkerTypes(project.workerTypes)}</p>
                <p><strong>Budget:</strong> ₹${project.budget.toLocaleString()}</p>
                <p><strong>Timeline:</strong> ${project.timeline} days</p>
                <p><strong>Location:</strong> ${project.location}</p>
                <p><strong>Posted:</strong> ${new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="user-project-actions">
                <button class="delete-btn" data-project-id="${project.id}">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add delete event listener
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                const projectId = e.currentTarget.getAttribute('data-project-id');
                this.deleteProject(projectId);
            });
        }
        
        return card;
    }

    // FIXED: Delete project method to properly sync both sections
    deleteProject(projectId) {
        console.log('Attempting to delete project:', projectId);
        console.log('Current projects before deletion:', this.projects);
        
        if (confirm('Are you sure you want to delete this project?')) {
            // Find the project to be deleted for logging
            const projectToDelete = this.projects.find(p => p.id === projectId);
            console.log('Project to delete:', projectToDelete);
            
            // Remove project from array
            this.projects = this.projects.filter(project => project.id !== projectId);
            console.log('Projects after deletion:', this.projects);
            
            // Update localStorage
            this.saveProjectsToStorage();
            
            // FIXED: Always refresh both project displays regardless of current section
            this.refreshAllProjectDisplays();
            
            alert('Project deleted successfully!');
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
        const status = document.getElementById('status').value;
        const sortBy = document.getElementById('sort').value;

        this.filterAndSortWorkers({ location, profession, status, sortBy });
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
                (worker.profession && worker.profession.toLowerCase().includes(searchTerm)) ||
                (worker.location && worker.location.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderWorkers(filtered);
    }

    filterAndSortWorkers(filters) {
        let filtered = this.workers;

        // Apply location filter
        if (filters.location) {
            filtered = filtered.filter(worker =>
                worker.location && worker.location.toLowerCase().includes(filters.location)
            );
        }

        // Apply profession filter
        if (filters.profession && filters.profession !== 'none') {
            filtered = filtered.filter(worker =>
                worker.profession === filters.profession
            );
        }

        // Apply status filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(worker =>
                worker.status === filters.status
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
                    return (b.experience || 0) - (a.experience || 0);
                case 'rating':
                    const aReviews = this.reviews.filter(review => review.workerId === a.id);
                    const bReviews = this.reviews.filter(review => review.workerId === b.id);
                    const aRating = aReviews.length > 0 ? aReviews.reduce((sum, review) => sum + review.rating, 0) / aReviews.length : 0;
                    const bRating = bReviews.length > 0 ? bReviews.reduce((sum, review) => sum + review.rating, 0) / bReviews.length : 0;
                    return bRating - aRating;
                default:
                    return 0;
            }
        });
    }

    renderWorkers(workers) {
        const container = document.getElementById('workers-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (workers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-users-slash fa-3x"></i>
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

    formatWorkerTypes(workerTypes) {
        if (!workerTypes || workerTypes.length === 0) return 'Not specified';
        return workerTypes.map(type => this.formatProfession(type)).join(', ');
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
                <p><strong>Experience:</strong> ${worker.experience || 0} years</p>
                <p><strong>Location:</strong> ${worker.location || 'Not specified'}</p>
                <p><strong>Rating:</strong> ${averageRating} ${typeof averageRating === 'string' ? '' : '⭐'}</p>
                <p><strong>Status:</strong> <span class="status-badge ${worker.status || 'inactive'}">${worker.status ? worker.status.charAt(0).toUpperCase() + worker.status.slice(1) : 'Inactive'}</span></p>
                <p><strong>Contact:</strong> ${worker.mobileNumber || 'N/A'}</p>
                
                <div class="worker-actions">
                    <button class="contact-btn" data-worker-id="${worker.id}">
                        <i class="fa-solid fa-phone"></i> Contact
                    </button>
                    <button class="review-btn" data-worker-id="${worker.id}">
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
        
        // Add event listeners to buttons
        const contactBtn = card.querySelector('.contact-btn');
        const reviewBtn = card.querySelector('.review-btn');
        
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => {
                const workerId = e.currentTarget.getAttribute('data-worker-id');
                this.contactWorker(workerId);
            });
        }
        
        if (reviewBtn) {
            reviewBtn.addEventListener('click', (e) => {
                const workerId = e.currentTarget.getAttribute('data-worker-id');
                this.openReviewModal(workerId);
            });
        }
        
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
        const modal = document.getElementById('projectModal');
        if (!modal) {
            console.error('Project modal not found');
            return;
        }

        // Pre-fill contact details with user info
        const contactName = document.getElementById('contactName');
        const contactPhone = document.getElementById('contactPhone');
        const contactEmail = document.getElementById('contactEmail');
        const projectLocation = document.getElementById('projectLocation');

        if (contactName) contactName.value = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        if (contactPhone) contactPhone.value = this.currentUser.mobileNumber || '';
        if (contactEmail) contactEmail.value = this.currentUser.email || '';
        if (projectLocation) projectLocation.value = this.currentUser.location || '';
        
        modal.style.display = 'block';
        console.log('Project modal opened');
    }

    addProject() {
        console.log('Starting to add project...');
        
        // Get form values
        const title = document.getElementById('projectTitle')?.value;
        const description = document.getElementById('projectDescription')?.value;
        const workerTypes = Array.from(document.getElementById('projectWorkers')?.selectedOptions || [])
                                .map(option => option.value);
        const budget = parseInt(document.getElementById('projectBudget')?.value) || 0;
        const timeline = parseInt(document.getElementById('projectTimeline')?.value) || 0;
        const location = document.getElementById('projectLocation')?.value || this.currentUser.location;
        
        // Contact details
        const contactName = document.getElementById('contactName')?.value;
        const contactPhone = document.getElementById('contactPhone')?.value;
        const contactEmail = document.getElementById('contactEmail')?.value;
        const preferredContact = document.getElementById('preferredContact')?.value;

        console.log('Form values:', {
            title, description, workerTypes, budget, timeline, location,
            contactName, contactPhone, contactEmail, preferredContact
        });

        // Validation
        if (!title || !description || !budget || !timeline || !contactName || !contactPhone) {
            alert('Please fill all required fields');
            return;
        }

        const project = {
            id: 'project_' + Date.now(),
            title: title.trim(),
            description: description.trim(),
            workerTypes: workerTypes,
            budget: budget,
            timeline: timeline,
            location: location.trim(),
            customerId: this.currentUser.id,
            customerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
            contactDetails: {
                name: contactName.trim(),
                phone: contactPhone.trim(),
                email: (contactEmail || '').trim(),
                preferredMethod: preferredContact || 'any'
            },
            status: 'open',
            createdAt: new Date().toISOString()
        };

        console.log('New project object:', project);

        // Add to projects array
        this.projects.push(project);
        
        // Save to storage
        this.saveProjectsToStorage();
        
        // Close modal
        document.getElementById('projectModal').style.display = 'none';
        
        // Reset form
        document.getElementById('projectForm').reset();
        
        // Refresh displays
        this.refreshAllProjectDisplays();
        
        alert('Project posted successfully!');
        console.log('Project added successfully');
    }

    // FIXED: Enhanced refresh method to ensure both sections are always synchronized
    refreshAllProjectDisplays() {
        console.log('Refreshing all project displays...');
        
        // Always reload from storage first to ensure we have the latest data
        this.projects = this.loadProjectsFromStorage();
        
        // Refresh user projects in profile section (customer's own projects)
        this.loadUserProjects();
        
        // Refresh main projects section (all projects)
        this.loadProjects();
        
        console.log('All project displays refreshed');
    }

    loadProjects() {
        console.log('Loading projects for display...');
        
        // Note: We don't reload from storage here because refreshAllProjectDisplays already did it
        // This ensures we're always working with the same data
        
        console.log('Projects to display:', this.projects);
        this.renderProjects(this.projects);
    }

    renderProjects(projects) {
        const container = document.getElementById('projects-container');
        if (!container) {
            console.log('Projects container not found (section might be hidden)');
            return;
        }

        console.log('Rendering projects in container');
        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clipboard-list fa-3x"></i>
                    <h3>No projects available</h3>
                    <p>Check back later for new projects</p>
                </div>
            `;
            console.log('No projects to display');
            return;
        }

        console.log(`Rendering ${projects.length} projects`);
        
        projects.forEach((project, index) => {
            console.log(`Rendering project ${index + 1}:`, project);
            try {
                const card = this.createProjectCard(project);
                if (card) {
                    container.appendChild(card);
                }
            } catch (error) {
                console.error(`Error rendering project ${index + 1}:`, error, project);
            }
        });
    }

    createProjectCard(project) {
        if (!project) {
            console.error('Cannot create card for undefined project');
            return null;
        }

        const card = document.createElement('div');
        card.className = 'project-card';
        
        const contactIcon = this.getContactIcon(project.contactDetails?.preferredMethod);
        const contactMethod = this.formatContactMethod(project.contactDetails?.preferredMethod);
        
        card.innerHTML = `
            <div class="project-header">
                <div class="project-title">
                    <h3>${project.title || 'Untitled Project'}</h3>
                    <p style="color: #ccc; margin: 0;">${project.description || 'No description'}</p>
                </div>
                <span class="project-status status-${project.status || 'open'}">
                    ${(project.status || 'open').charAt(0).toUpperCase() + (project.status || 'open').slice(1)}
                </span>
            </div>
            
            <div class="project-details">
                <p><strong><i class="fa-solid fa-briefcase"></i> Worker Types Needed:</strong> ${this.formatWorkerTypes(project.workerTypes)}</p>
                <p><strong><i class="fa-solid fa-indian-rupee-sign"></i> Budget:</strong> ₹${(project.budget || 0).toLocaleString()}</p>
                <p><strong><i class="fa-solid fa-calendar-days"></i> Timeline:</strong> ${project.timeline || 0} days</p>
                <p><strong><i class="fa-solid fa-location-dot"></i> Location:</strong> ${project.location || 'Not specified'}</p>
                <p><strong><i class="fa-solid fa-user"></i> Posted by:</strong> ${project.customerName || 'Unknown'}</p>
            </div>
            
            <!-- Contact Details Section -->
            <div class="contact-section">
                <h4><i class="fa-solid fa-address-book"></i> Contact Details:</h4>
                <div class="contact-details">
                    <p><strong><i class="fa-solid fa-user"></i> Contact Person:</strong> ${project.contactDetails?.name || 'Not specified'}</p>
                    <p><strong><i class="fa-solid fa-phone"></i> Phone:</strong> ${project.contactDetails?.phone || 'Not specified'}</p>
                    ${project.contactDetails?.email ? `<p><strong><i class="fa-solid fa-envelope"></i> Email:</strong> ${project.contactDetails.email}</p>` : ''}
                    <p><strong><i class="fa-solid fa-comment"></i> Preferred Contact:</strong> ${contactIcon} ${contactMethod}</p>
                </div>
                <div class="contact-actions">
                    <button class="contact-btn" data-project-id="${project.id}" data-contact-method="phone">
                        <i class="fa-solid fa-phone"></i> Call Now
                    </button>
                    <button class="whatsapp-btn" data-project-id="${project.id}" data-contact-method="whatsapp">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </button>
                    ${project.contactDetails?.email ? `
                    <button class="email-btn" data-project-id="${project.id}" data-contact-method="email">
                        <i class="fa-solid fa-envelope"></i> Email
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #444;">
                <small><i class="fa-solid fa-clock"></i> Posted: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}</small>
                <small><i class="fa-solid fa-eye"></i> ${Math.floor(Math.random() * 50) + 1} views</small>
            </div>
        `;
        
        // Add event listeners to contact buttons
        const contactButtons = card.querySelectorAll('.contact-btn, .whatsapp-btn, .email-btn');
        contactButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = e.currentTarget.getAttribute('data-project-id');
                const method = e.currentTarget.getAttribute('data-contact-method');
                this.contactProject(projectId, method);
            });
        });
        
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
        return methods[method] || method || 'Any Method';
    }

    contactProject(projectId, method) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found:', projectId);
            return;
        }

        const contact = project.contactDetails;
        if (!contact) {
            console.error('Contact details not found for project:', projectId);
            return;
        }
        
        switch(method) {
            case 'phone':
                alert(`Calling ${contact.name} at ${contact.phone}`);
                break;
            case 'whatsapp':
                const message = `Hi ${contact.name}, I'm interested in your project "${project.title}" on Construct Connect`;
                alert(`Opening WhatsApp to contact ${contact.name}\nMessage: ${message}`);
                break;
            case 'email':
                if (contact.email) {
                    const subject = `Interest in your project: ${project.title}`;
                    const body = `Dear ${contact.name},\n\nI am interested in your project "${project.title}" posted on Construct Connect.\n\nBest regards,\n${this.currentUser.firstName} ${this.currentUser.lastName}`;
                    alert(`Opening email to contact ${contact.name}\nSubject: ${subject}`);
                }
                break;
        }
    }

    // Review Methods
    openReviewModal(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;

        this.currentWorkerForReview = worker;
        
        const workerReviewName = document.getElementById('workerReviewName');
        const reviewWorkerId = document.getElementById('reviewWorkerId');
        
        if (workerReviewName) {
            workerReviewName.textContent = `${worker.firstName} ${worker.lastName}`;
        }
        
        if (reviewWorkerId) {
            reviewWorkerId.value = worker.id;
        }
        
        // Reset form
        document.getElementById('reviewForm').reset();
        this.setRating(0);
        
        document.getElementById('reviewModal').style.display = 'block';
    }

    setRating(rating) {
        const ratingInput = document.getElementById('reviewRating');
        if (ratingInput) {
            ratingInput.value = rating;
        }
        
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
    console.log('DOM loaded, initializing dashboard...');
    window.dashboard = new Dashboard();
});