// User data storage (simulating a database)
let users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

function signup() {
    window.location.href = "./signup.html";
}

function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill all the fields");
        return;
    }

    // Find user by email or username
    const user = users.find(u => 
        u.email === email || u.username === email
    );

    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (!user.profileComplete) {
            window.location.href = "./profile.html";
        } else {
            window.location.href = "./dashboard.html";
        }
    } else {
        alert("Invalid email/username or password");
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