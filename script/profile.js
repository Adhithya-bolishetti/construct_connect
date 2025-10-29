function insertForm() {
    const workerForm = document.getElementById("worker");
    const contractorForm = document.getElementById("contractor");
    const customerForm = document.getElementById("customer");
    const workerRadio = document.getElementById("workerRadio");
    const contractorRadio = document.getElementById("contractorRadio");
    const customerRadio = document.getElementById("customerRadio");
    
    if (workerRadio.checked) {
        contractorForm.style.display = "none";
        customerForm.style.display = "none";
        workerForm.style.display = "block";
    } else if (contractorRadio.checked) {
        workerForm.style.display = "none";
        customerForm.style.display = "none";
        contractorForm.style.display = "block";
    } else if (customerRadio.checked) {
        workerForm.style.display = "none";
        contractorForm.style.display = "none";
        customerForm.style.display = "block";
    }
}

function dashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('constructConnectUsers'));
    
    const firstName = document.getElementById("fname").value;
    const lastName = document.getElementById("lname").value;
    const mobileNumber = document.getElementById("mobilenumber").value;
    const accountType = document.querySelector('input[name="actype"]:checked')?.value;

    if (!firstName || !lastName || !mobileNumber || !accountType) {
        alert("Please fill all required fields");
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
        const location = document.getElementById("location").value;

        if (!profession || !experience || !location) {
            alert("Please fill all worker details");
            return;
        }

        userData = {
            ...userData,
            profession,
            experience: parseInt(experience),
            location
        };
    } else if (accountType === 'contractor') {
        const company = document.getElementById("company").value;
        const location = document.getElementById("location").value;

        if (!company || !location) {
            alert("Please fill all contractor details");
            return;
        }

        userData = {
            ...userData,
            company,
            location
        };
    } else if (accountType === 'customer') {
        const company = document.getElementById("company").value;
        const location = document.getElementById("location").value;
        const workTypes = Array.from(document.getElementById("workTypes").selectedOptions)
                               .map(option => option.value);

        if (!location || workTypes.length === 0) {
            alert("Please fill location and select at least one work type");
            return;
        }

        userData = {
            ...userData,
            company: company || 'Individual Customer',
            location,
            workTypes
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
    document.querySelector('form').reset();
    document.getElementById("worker").style.display = "none";
    document.getElementById("contractor").style.display = "none";
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
            }
        }
    }
});

// Make functions global
window.insertForm = insertForm;
window.dashboard = dashboard;
window.clearForm = clearForm;