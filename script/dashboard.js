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
        this.showSection('workers');
    }

    loadUserProfile() {
        document.getElementById('userName').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        
        const userTypeElement = document.getElementById('userType');
        if (this.currentUser.accountType === 'customer') {
            userTypeElement.textContent = this.currentUser.company || 'Customer';
        } else if (this.currentUser.accountType === 'worker') {
            userTypeElement.textContent = this.formatProfession(this.currentUser.profession) || 'Worker';
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

        // Edit Profile
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.openEditProfileModal();
        });

        // Status Toggle
        document.getElementById('statusToggleBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleWorkerStatus();
        });

        // Add Project (from profile)
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });
    }

    setupModals() {
        // Edit Profile Modal
        const editProfileModal = document.getElementById('editProfileModal');
        const editProfileForm = document.getElementById('editProfileForm');

        document.querySelector('#editProfileModal .close').addEventListener('click', () => {
            editProfileModal.style.display = 'none';
        });

        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

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
            if (e.target === editProfileModal) {
                editProfileModal.style.display = 'none';
            }
            if (e.target === projectModal) {
                projectModal.style.display = 'none';
            }
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
            }
        });
    }

    showSection(sectionName) {
        console.log('Showing section:', sectionName);
        
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
            
            // Load data for the section when it's shown
            if (sectionName === 'workers') {
                this.loadWorkers();
            } else if (sectionName === 'projects') {
                this.loadProjects();
            } else if (sectionName === 'profile') {
                this.loadProfileData();
            }
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

    // Profile Section Methods
    loadProfileData() {
        // Set profile information
        document.getElementById('profileName').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('profileFirstName').textContent = this.currentUser.firstName || '-';
        document.getElementById('profileLastName').textContent = this.currentUser.lastName || '-';
        document.getElementById('profileEmail').textContent = this.currentUser.email || '-';
        document.getElementById('profileMobile').textContent = this.currentUser.mobileNumber || '-';
        document.getElementById('profileAccountType').textContent = this.currentUser.accountType || '-';
        document.getElementById('profileProfession').textContent = this.currentUser.profession ? this.formatProfession(this.currentUser.profession) : '-';
        document.getElementById('profileExperience').textContent = this.currentUser.experience ? `${this.currentUser.experience} years` : '-';
        document.getElementById('profileCompany').textContent = this.currentUser.company || '-';
        document.getElementById('profileLocation').textContent = this.currentUser.location || '-';
        document.getElementById('profileLocationDetail').textContent = this.currentUser.location || '-';
        
        // Show/hide sections based on account type
        if (this.currentUser.accountType === 'worker') {
            document.getElementById('workerStatusSection').style.display = 'block';
            document.getElementById('customerProjectsSection').style.display = 'none';
            this.updateStatusButton();
        } else if (this.currentUser.accountType === 'customer') {
            document.getElementById('workerStatusSection').style.display = 'none';
            document.getElementById('customerProjectsSection').style.display = 'block';
            this.loadUserProjects();
        }
    }

    openEditProfileModal() {
        // Pre-fill form with current user data
        document.getElementById('editFirstName').value = this.currentUser.firstName || '';
        document.getElementById('editLastName').value = this.currentUser.lastName || '';
        document.getElementById('editEmail').value = this.currentUser.email || '';
        document.getElementById('editMobile').value = this.currentUser.mobileNumber || '';
        document.getElementById('editLocation').value = this.currentUser.location || '';
        
        // Show/hide fields based on account type
        if (this.currentUser.accountType === 'worker') {
            document.getElementById('editWorkerFields').style.display = 'block';
            document.getElementById('editCustomerFields').style.display = 'none';
            document.getElementById('editProfession').value = this.currentUser.profession || '';
            document.getElementById('editExperience').value = this.currentUser.experience || '';
        } else if (this.currentUser.accountType === 'customer') {
            document.getElementById('editWorkerFields').style.display = 'none';
            document.getElementById('editCustomerFields').style.display = 'block';
            document.getElementById('editCompany').value = this.currentUser.company || '';
        }
        
        document.getElementById('editProfileModal').style.display = 'block';
    }

    updateProfile() {
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const email = document.getElementById('editEmail').value;
        const mobile = document.getElementById('editMobile').value;
        const location = document.getElementById('editLocation').value;
        
        // Update current user
        this.currentUser.firstName = firstName;
        this.currentUser.lastName = lastName;
        this.currentUser.email = email;
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
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            const projectId = e.target.closest('.delete-btn').getAttribute('data-project-id');
            this.deleteProject(projectId);
        });
        
        return card;
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            // Remove project from array
            this.projects = this.projects.filter(project => project.id !== projectId);
            
            // Update localStorage
            localStorage.setItem('constructConnectProjects', JSON.stringify(this.projects));
            
            // Reload projects
            this.loadUserProjects();
            this.loadProjects(); // Reload main projects section if active
            
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
                <p><strong>Location:</strong> ${worker.location}</p>
                <p><strong>Rating:</strong> ${averageRating} ${typeof averageRating === 'string' ? '' : '⭐'}</p>
                <p><strong>Status:</strong> <span class="status-badge ${worker.status || 'inactive'}">${worker.status ? worker.status.charAt(0).toUpperCase() + worker.status.slice(1) : 'Inactive'}</span></p>
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
        // Pre-fill contact details with user info
        document.getElementById('contactName').value = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('contactPhone').value = this.currentUser.mobileNumber || '';
        document.getElementById('contactEmail').value = this.currentUser.email || '';
        document.getElementById('projectLocation').value = this.currentUser.location || '';
        
        document.getElementById('projectModal').style.display = 'block';
        document.getElementById('projectForm').reset();
    }

    addProject() {
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const workerTypes = Array.from(document.getElementById('projectWorkers').selectedOptions)
                                .map(option => option.value);
        const budget = document.getElementById('projectBudget').value;
        const timeline = document.getElementById('projectTimeline').value;
        const location = document.getElementById('projectLocation').value || this.currentUser.location;
        
        // Contact details
        const contactName = document.getElementById('contactName').value;
        const contactPhone = document.getElementById('contactPhone').value;
        const contactEmail = document.getElementById('contactEmail').value;
        const preferredContact = document.getElementById('preferredContact').value;

        // Validation
        if (!title || !description || !budget || !timeline || !contactName || !contactPhone) {
            alert('Please fill all required fields');
            return;
        }

        const project = {
            id: Date.now().toString(),
            title,
            description,
            workerTypes,
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

        console.log('Adding project:', project);

        // Update projects array and save to localStorage
        this.projects.push(project);
        localStorage.setItem('constructConnectProjects', JSON.stringify(this.projects));

        console.log('Projects after adding:', this.projects);

        // Close modal and refresh projects display
        document.getElementById('projectModal').style.display = 'none';
        
        // If we're currently in the profile section, reload the user projects
        if (document.getElementById('profile-section').classList.contains('active-section')) {
            this.loadUserProjects();
        }
        
        // Also reload main projects section if active
        if (document.getElementById('projects-section').classList.contains('active-section')) {
            this.loadProjects();
        }
        
        alert('Project posted successfully!');
    }

    loadProjects() {
        console.log('Loading projects...');
        
        // Always reload from localStorage to get latest data
        const storedProjects = localStorage.getItem('constructConnectProjects');
        console.log('Stored projects:', storedProjects);
        
        this.projects = storedProjects ? JSON.parse(storedProjects) : [];
        console.log('Projects found:', this.projects);

        this.renderProjects(this.projects);
    }

    renderProjects(projects) {
        const container = document.getElementById('projects-container');
        if (!container) {
            console.error('Projects container not found!');
            return;
        }

        console.log('Rendering projects:', projects);
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clipboard-list fa-3x"></i>
                    <h3>No projects available</h3>
                    <p>Check back later for new projects</p>
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
                <p><strong><i class="fa-solid fa-briefcase"></i> Worker Types Needed:</strong> ${this.formatWorkerTypes(project.workerTypes)}</p>
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