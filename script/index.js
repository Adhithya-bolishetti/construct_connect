// User data storage (simulating a database)
let users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function signup() {
    window.location.href = "./signup.html";
}

function login() {
    let mobile = document.getElementById("mobile").value;
    let password = document.getElementById("password").value;

    if (!mobile || !password) {
        alert("Please fill all the fields");
        return;
    }

    // Mobile number validation
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    // Find user by mobile number
    const user = users.find(u => u.mobileNumber === mobile);

    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (!user.profileComplete) {
            window.location.href = "./profile.html";
        } else {
            window.location.href = "./dashboard.html";
        }
    } else {
        alert("Invalid mobile number or password");
    }
}

// Check if user is already logged in
if (currentUser && window.location.pathname.includes('index.html')) {
    if (!currentUser.profileComplete) {
        window.location.href = "./profile.html";
    } else {
        window.location.href = "./dashboard.html";
    }
}

// Make functions global
window.signup = signup;
window.login = login;