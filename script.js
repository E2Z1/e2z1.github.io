var x = 1
function buttonaction() {
    document.getElementById("headline").innerHTML = "Das "+String(x)+". mal gedrückt"
    x += 1
}
function reset() {
    x = 1
    document.getElementById("headline").innerHTML = "Kein Score"
}
