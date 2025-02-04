//Im bored
//konami code
const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"]
var konami_idx = 0;
document.addEventListener('keydown', function(event) {
    if(event.code == konami[konami_idx]) {
        if (++konami_idx == konami.length) {
            document.getElementById("projects").innerHTML += `          <div class="card" onclick="window.location='./platformer';">
            <p id="title_img" style="margin-top: 30%; text-align: center; font-size: 100px;">???</p>
            <div class="container">
              <h4><b>???</b></h4> 
              <p id="year">???</p>
              <p>Don't expect much</p> 
            </div>
          </div>`
        } 
    }
    else {
        konami_idx = 0
    }
});
