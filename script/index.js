function signup()
{
    document.getElementById("email").removeAttribute("required");
    document.getElementById("password").removeAttribute("required");
    window.location.href = "./signup.html";
}
function login()
{
    let email =document.getElementById("email");
    let password =document.getElementById("password");
    email.setAttribute("required","");
    password.setAttribute("required","");
    if(email.value == "" || password.value == "")
    {
        alert("Please fill all the fields");
        return;
    }
    window.location.href = "./dashboard.html";
}