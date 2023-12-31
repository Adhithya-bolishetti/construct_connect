//insert form when radio button is clicked
function insertForm() {
    var wform = document.getElementById("worker");
    var radio=document.getElementById("workerRadio");
    var cform = document.getElementById("contractor");
    console.log(radio.checked);
    if(radio.checked)
    {
        cform.style.display = "none";
        wform.style.display = "flex";
        wform.style.flexDirection = "column";
    }
    else{
        wform.style.display = "none";
        cform.style.display = "flex";
        cform.style.flexDirection = "column";
    }
}
function goBack() {

    let x =document.getElementsByTagNameNS(input);
    for (let i = 0; i < x.length; i++) {
        x[i].removeAttribute("required");
        console.log(x[i]);
    }
    window.location.href = "index.html";
}