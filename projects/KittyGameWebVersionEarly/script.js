const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')



canvas.width = Math.min(window.innerWidth-20,window.innerHeight-20)
canvas.height = Math.min(window.innerWidth-20,window.innerHeight-20)







size = 15

const cat = new Image()
cat.src = "./assets/kitty.png"
const wall = new Image()
wall.src = "./assets/wall.png"
const path = new Image()
path.src = "./assets/path.png"

x = 1
y = 1
geschw = 0.07





function draw() {
    window.requestAnimationFrame(draw)
    c.clearRect(0,0,canvas.width,canvas.height)
    c.drawImage(cat,x*canvas.width/size,y*canvas.width/size,canvas.width/size,canvas.height/size)



}
draw()



window.addEventListener("keydown", (e) => {
    if (e.key == "w" && y - geschw > 0) {
        y -= geschw
    }
    if (e.key == "a" && x - geschw > 0){
        x -= geschw
    }
    if (e.key == "s" && y + geschw < size-1){
        y += geschw
    }
    if (e.key == "d" && x + geschw < size-1){
        x += geschw
    }
})