var score = 0
function buttonaction() {
    score += 1
    document.getElementById("headline").innerHTML = String(score)
}
function reset() {
    score = 0
    document.getElementById("headline").innerHTML = "No Score"
}
