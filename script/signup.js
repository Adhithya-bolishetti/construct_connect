function goBack() {
    let x = document.getElementsByTagName("input");
    console.log(x);
    for (let i = 0; i < x.length; i++) {
        x[i].removeAttribute("required");
        console.log(x[i]);
    }
    window.location.href = "./index.html";
}

function signup() {
    const firstName = document.getElementById("fname").value;
    const lastName = document.getElementById("lname").value;
    const mobile = document.getElementById("mobile").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("cpassword").value;
    const accountType = document.querySelector('input[name="actype"]:checked')?.value;

    // Validation
    if (!firstName || !lastName || !mobile || !password || !confirmPassword || !accountType) {
        alert("Please fill all required fields");
        return;
    }

    // Mobile number validation
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('constructConnectUsers')) || [];
    const existingUser = users.find(u => u.mobileNumber === mobile);
    
    if (existingUser) {
        alert("User with this mobile number already exists");
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        mobileNumber: mobile,
        password,
        accountType,
        profileComplete: false,
        createdAt: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('constructConnectUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    alert("Account created successfully! Please complete your profile.");
    window.location.href = "./profile.html";
}

// Make functions global
window.goBack = goBack;
window.signup = signup;