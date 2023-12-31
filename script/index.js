function signup()
{
    document.getElementById("email").removeAttribute("required");
    document.getElementById("password").removeAttribute("required");
    //removeattribute
    window.location.href = "./signup.html";
}
function login()
{
    window.location.href = "./dashboard.html";
}