width = 8
height = 13
cur = 33
fontDesigner = document.getElementById("fontDesigner")
canvas = fontDesigner.querySelector("#canvas")
font = []
function updateCanvas() {
    canvas.innerHTML = ""
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            canvas.innerHTML += `<button onclick="clickedPixel(${x}, ${y})" class="pixel"></button>`
        }
        canvas.innerHTML += "<br>"
    }
}
updateCanvas()
document.querySelector("#width_inp").addEventListener("change", () => {
    width = Number(document.querySelector("#width_inp").value)
    updateCanvas()
}); 
document.querySelector("#height_inp").addEventListener("change", () => {
    height = Number(document.querySelector("#height_inp").value)
    updateCanvas()
}); 

function start() {
    document.querySelector("#width_inp").remove()
    document.querySelector("#height_inp").remove()
    document.querySelector("label").remove()
    document.querySelector("label").remove()
    //FONT[c-32][FONT_HEIGHT - y] & (1 << (FONT_WIDTH - x))
    font[0] = []
    for (var y = 0; y < height; y++) {
        font[0].push(0)
    }
}
/*
window.onbeforeunload = function () {
    if (!document.querySelector("#width_inp")) {
        return confirm()
    }
}*/

function clickedPixel(x, y) {
    if (document.querySelector("#width_inp")) {
        start()
    }
    var cur = canvas.querySelectorAll(".pixel")[y*width+x].style.backgroundColor
    canvas.querySelectorAll(".pixel")[y*width+x].style.backgroundColor = (cur == "rgb(0, 0, 0)" ? "#FFFFFF" : "#000000")
}

function next() {
    if (document.querySelector("#width_inp")) {
        start()
        return
    }
    font[cur-32] = []
    for (var y = 0; y < height; y++) {
        line = 0
        for (var x = 0; x < width; x++) {
            if (canvas.querySelectorAll(".pixel")[y*width+x].style.backgroundColor == "rgb(0, 0, 0)") {
                line += 1 << x
                // font[cur-32][FONT_HEIGHT - y] & (1 << (FONT_WIDTH - x)))
            }
        }
        font[cur-32].push(line)
    }
    cur++
    document.getElementById("curChar").innerText = String.fromCharCode(cur)
    updateCanvas()
}


function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copy(text) {
    var copyText = document.createElement("input")
    copyText.value = text
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
  }

function compile() {
    text = `const unsigned char font[${font.length}][${height}] = {\n`

    font.forEach(char => {
        text += "{"
        char.forEach(byte => {
            text += "0x" + byte.toString(16) + ", "
        });
        text = text.slice(0, -2);
        text += '},\n'
    });

    text = text.slice(0, -2);
    text += '};'
    copy(text)
}

