function insertForm() {
    const workerForm = document.getElementById("worker");
    const customerForm = document.getElementById("customer");
    const workerRadio = document.getElementById("workerRadio");
    const customerRadio = document.getElementById("customerRadio");
    
    if (workerRadio.checked) {
        customerForm.style.display = "none";
        workerForm.style.display = "block";
    } else if (customerRadio.checked) {
        workerForm.style.display = "none";
        customerForm.style.display = "block";
    }
}

function submitProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
    
    const firstName = document.getElementById("fname").value;
    const lastName = document.getElementById("lname").value;
    const mobileNumber = document.getElementById("mobilenumber").value;
    const accountType = document.querySelector('input[name="actype"]:checked')?.value;

    // Basic validation
    if (!firstName || !lastName || !mobileNumber || !accountType) {
        alert("Please fill all required fields");
        return;
    }

    // Mobile number validation
    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    let userData = {
        ...currentUser,
        firstName,
        lastName,
        mobileNumber,
        accountType,
        profileComplete: true
    };

    if (accountType === 'worker') {
        const profession = document.getElementById("profession").value;
        const experience = document.getElementById("experience").value;
        const location = document.getElementById("workerLocation").value;

        // Worker validation - make fields optional
        userData = {
            ...userData,
            profession: profession || 'Not specified',
            experience: experience ? parseInt(experience) : 0,
            location: location || 'Not specified',
            status: 'inactive' // Default status for workers
        };
    } else if (accountType === 'customer') {
        const company = document.getElementById("company").value;
        const location = document.getElementById("customerLocation").value;

        // Customer validation - make location optional
        userData = {
            ...userData,
            company: company || 'Individual Customer',
            location: location || 'Not specified'
        };
    }

    // Update user in storage
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = userData;
        localStorage.setItem('constructConnectUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    alert("Profile completed successfully!");
    window.location.href = "./dashboard.html";
}

function clearForm() {
    document.getElementById('profileForm').reset();
    document.getElementById("worker").style.display = "none";
    document.getElementById("customer").style.display = "none";
}

// Load user data if exists
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById("fname").value = currentUser.firstName || '';
        document.getElementById("lname").value = currentUser.lastName || '';
        document.getElementById("mobilenumber").value = currentUser.mobileNumber || '';
        
        if (currentUser.accountType) {
            const radio = document.getElementById(`${currentUser.accountType}Radio`);
            if (radio) {
                radio.checked = true;
                insertForm();
                
                // Load existing data for the specific account type
                if (currentUser.accountType === 'worker') {
                    document.getElementById("profession").value = currentUser.profession || '';
                    document.getElementById("experience").value = currentUser.experience || '';
                    document.getElementById("workerLocation").value = currentUser.location || '';
                } else if (currentUser.accountType === 'customer') {
                    document.getElementById("company").value = currentUser.company || '';
                    document.getElementById("customerLocation").value = currentUser.location || '';
                }
            }
        }
    }
});

// Make functions global
window.insertForm = insertForm;
window.submitProfile = submitProfile;
window.clearForm = clearForm;