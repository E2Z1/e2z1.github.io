let fullTable;

function setAddr() {
    document.body.innerHTML += `
    
  <div class="popUp">
    <h3>Enter the start of the server address:</h3>
    <input type="text" name="add" id="srv_addr">
    <button onclick="localStorage.setItem('server', 'https://'+document.getElementById('srv_addr').value+'dymszuuaqyugwf.supabase.co'); window.location.reload()">Save</button>
  </div>`
    
}
if (!localStorage.getItem("server")) {
    setAddr();
}
const server = localStorage.getItem("server");
if (document.getElementById("quote")) {
    const quotes = ["Doppelkopf ist die META", "Skillissue", "Der Sinn des Lebens ist Doppelkopf", "Ein Tag ohne Doppelkopf ist ein Tag ohne Sinn", "Entweder spielt man Doppelkopf oder man sieht das eigene Leben an einem vorbeiziehen", "Oeddeloeddeldoeddel", "Das ist nen goofie Blatt"]
    document.getElementById("quote").innerText = "„" + quotes[Math.floor(Math.random() * quotes.length)] + "“";
}

function getCurrent() {
    fetch(server+"/functions/v1/getCurrent", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((json) => {
            if (json.success) {
                let table = document.getElementById("cur").querySelector("table");
                let html = `<tr><th>No.</th>`;
                for (let user of json.users) {
                    html += `<th>${user.name}</th>`;
                }
                html += `<th>Böcke</th></tr><tr><td>${json.data.id}</td>`;
                for (let user of json.users) {
                    html += `<td>${user.points}</td>`;
                }
                html += `<td>${json.data.bock}</td></tr>`;
                table.innerHTML = html;
            } else console.error(json.message);
        });
}
function getAll() {
    fetch(server+"/functions/v1/getAll", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((json) => {
            if (json.success) {
				fullTable = json;
                showTable();
            } else console.error(json.message);
        });
}
function addRound() {
    const personFields = document.getElementById("personFields");
    let sum = 0;
    let data = {}
    let valuesForNext = [];
    const persons = personFields.querySelectorAll(".person");
    const numbers = personFields.querySelectorAll(".number");
    for (let i = 0; i < 4; i++) {
        let number = numbers[i].value;
        if (number != Number(number) || Number(number) == 0)
            return;
        data[persons[i].value] = Number(number);
        valuesForNext.push(persons[i].value);
        sum += Number(number);
    }
    valuesForNext.push(personFields.querySelector("#eintragender").value);
    localStorage.setItem("lastPlayers", JSON.stringify(valuesForNext));
    if (Object.keys(data).length != 4)
        return
    if (sum !== 0)
        return;

    fetch(server+"/functions/v1/addRound", {
        method: "POST",
        body: JSON.stringify({
            points: data,
            eintraeger: personFields.querySelector("#eintragender").value,
            bock: personFields.querySelector("#bock").checked
        }),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
        .then((response) => response.json())
        .then((json) => {
            if (json.success) {
                document.location.href = ".."
            } else console.error(json.message);
        });
}
function getAddUsers() {
    fetch(server+"/functions/v1/getUsers", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((json) => {
            if (json.success) {
                const personFields = document.getElementById("personFields");
                let persons = [];
                for (let user of json.users) {
                    persons.push(user.name);
                }
                for (let i = 0; i < 4; i++) {
                    let div = document.createElement("div");
                    div.innerHTML = `
                        <select class='person'>
                            ${persons.map(person => `<option value="${person}">${person}</option>`).join("")}
                        </select>
                        <input type="number" class="number" placeholder="Enter points" required>
                    `;
                    personFields.appendChild(div);
                }
                personFields.innerHTML += `
                <br>
                <label>You: </label>
                <select id="eintragender">
                            ${persons.map(person => `<option value="${person}">${person}</option>`).join("")}
                </select>
                <br>
                <br>
                <label>New Bocks? </label>
                <input type="checkbox" id="bock">
                <br>

                <button id="addRoundBtn" onclick="addRound()">Add Round</button>

                `;
                const lastValues = localStorage.getItem("lastPlayers") ? JSON.parse(localStorage.getItem("lastPlayers")) : [" ", " ", " ", " ", " "];
                for (let i = 0; i < personFields.querySelectorAll("select").length; i++) {
                    personFields.querySelectorAll("select")[i].value = lastValues[i];
                }
            } else console.error(json.message);
        });
}

class BarChart {
    constructor (title, data, canvas, isPercentage) {
        this.title = title;
        this.data = data;
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.isPercentage = isPercentage;
        this.draw();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `${this.canvas.height/25}px Arial`;
        let maxVal = Math.max(...Object.values(this.data));
        if (maxVal == 0)
            maxVal = 1;     //to not divide by zero
        const minVal = Math.min(...Object.values(this.data), 0);   //wanted to make avg win/lose points in one plot -> negative values
                                                                //and total points ofc
        const barWidth = (this.canvas.width - 20) / (Object.keys(this.data).length * 1.5);
        const scaleFactor = (this.canvas.height * 0.9 - 4 - this.canvas.height/25) / (maxVal - minVal);
        const zeroPoint = this.canvas.height * 0.9 + minVal * scaleFactor;


        for (let i = 0; i < Object.keys(this.data).length; i++) {
            const key = Object.keys(this.data).sort()[i];
            const val = this.data[key];
            const x = 20 + i * (barWidth) + barWidth * 0.25;
            const height = val * scaleFactor;
            const y = zeroPoint - height;

            this.ctx.fillStyle = "#FFF";
            this.ctx.fillRect(x, y, barWidth/1.5, height);
    
            let valText = "" + Math.round(val*100)/100;
            if (this.isPercentage) {
                valText = "" + Math.round(val*100) + "%";
            }
            if (val < 0) {
                this.ctx.fillText(valText, x, zeroPoint - height + 2 + this.canvas.height/25);
            } else {
                this.ctx.fillText(valText, x, zeroPoint - height - 4);
            }
            if (val < 0) {
                this.ctx.fillText(key.slice(0,4), x, zeroPoint - 4);
            } else {
                this.ctx.fillText(key.slice(0,4), x, zeroPoint + 2 + this.canvas.height/25);
            }
        }
    }
}

function getDistinctColors(n) {
    const colors = [];
    const hueStep = 360 / n;    //to be differntaible from purple
    
    for (let i = 0; i < n; i++) {
      const hue = i * hueStep;
      const color = `hsl(${hue}, 100%, 50%)`;
      colors.push(color);
    }
    if (n == 9) {   //for now
        return ['hsl(0, 100%, 50%)','hsl(25, 100.00%, 50.00%)','hsl(57, 100.00%, 50.00%)',
            'hsl(84, 100.00%, 72.50%)','hsl(160, 100%, 50%)','hsl(178, 100.00%, 50.00%)',
            'hsl(286, 100.00%, 82.70%)','hsl(316, 100%, 71%)','hsl(320, 100.00%, 56.90%)']
    }
    return colors;
  }




class Graph {
    constructor (title, data, canvas) {
        this.title = title;
        this.data = data;
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.draw();
        this.canvas.onclick = event => {
            if (event.detail == 2) {
                this.canvas.requestFullscreen();
            }
        }
        let self = this;
        const w = canvas.width;
        const h = canvas.height;
        window.addEventListener('resize', function() {
            if (document.fullscreenElement) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                self.draw()
            } else {
                canvas.width = w;
                canvas.height = h;
                self.draw()
            }
        });
    }
    draw() {
        const colors = getDistinctColors(Object.keys(this.data).length);
        let maxVal = 0;
        let minVal = 0;
        let length = 0;

        for (let i = 0; i < Object.keys(this.data).length; i++) {
            const cur = this.data[Object.keys(this.data)[i]];
            for (let j = 0; j < cur.length; j++) {
                if (cur[j][1] > maxVal) {
                    maxVal = cur[j][1];
                }
                if (cur[j][1] < minVal) {
                    minVal = cur[j][1];
                }
            }
            if (cur.length > 0 && cur[cur.length-1][0] > length) {
                length = cur[cur.length-1][0];
            }
        }


        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `${this.canvas.height/20}px Arial`;
        if (maxVal == 0)
            maxVal = 1;     //to not divide by zero
        const scaleFactorY = (this.canvas.height * 0.9 - 20) / (maxVal - minVal);
        const scaleFactorX = (this.canvas.width * 0.9 - 20) / length;
        const zeroPointY = this.canvas.height * 0.9 + minVal * scaleFactorY;

        

        for (let i = 0; i < Object.keys(this.data).length; i++) {
            const key = Object.keys(this.data).sort()[i];
            const val = this.data[key];

            this.ctx.fillStyle = colors[i];
            this.ctx.strokeStyle = colors[i];
            this.ctx.lineWidth = this.canvas.height/300;

            this.ctx.beginPath();
            let tVal;
            for (let j = 0; j < Object.keys(val).length; j++) {
                tVal = val[Object.keys(val)[j]];
                this.ctx.lineTo(tVal[0]*scaleFactorX, zeroPointY - tVal[1]*scaleFactorY);
            }
            this.ctx.lineTo(length*scaleFactorX, zeroPointY - tVal[1]*scaleFactorY);
            this.ctx.stroke();
    
            this.ctx.fillText(key.slice(0,4), length*scaleFactorX, zeroPointY - tVal[1]*scaleFactorY+this.canvas.height/60);

        }
    }
}


function getLastWeeksDate() {
	let date = new Date();
	date.setDate(date.getDate()-6);	//with today 1 week
	return date;
}
function getLastMonthsDate() {
	let date = new Date();
	date.setMonth(date.getMonth()-1);
	return date;
}

function getLocalDateFromInput(inputValue) {
	const [year, month, day] = inputValue.split('-').map(Number);
	return new Date(year, month - 1, day); // month is 0-based
}  

function showTable() {
	const from = document.getElementById("fromTime").value ? getLocalDateFromInput(document.getElementById("fromTime").value) : null;
	const to = document.getElementById("toTime").value ? getLocalDateFromInput(document.getElementById("toTime").value) : null;
	if (to)
		to.setDate(to.getDate()+1);
	const data = fullTable.data.filter((el) => {
		const d = new Date(el.time);
		return (to === null || d < to) && (from === null || d > from);
	});

	let csv = "No.";
	let table = document.getElementById("full").querySelector("table");
	let html = "";
	let header = `<tr><th>No.</th>`;
	let users = {};
	let points = []
	for (let i = 0; i < fullTable.users.length; i++) {
		header += `<th>${fullTable.users.sort((a,b) => a.name.localeCompare(b.name))[i].name}</th>`;
		csv += `;${fullTable.users.sort((a,b) => a.name.localeCompare(b.name))[i].name}`;
		users[fullTable.users.sort((a,b) => a.name.localeCompare(b.name))[i].name] = i;
		points.push(0);
	}
	header += "<th>Böcke</th><th>Time</th></tr>";
	csv += ";Böcke;Einträger;Zeit\n";
	let row;
	let i = 0;
	for (let round of data) {
		i++;
		row = ""
		for (let value of Object.keys(round.points)) {
			points[users[value]] += round.points[value];
		}
		row += `<tr><td>${i}</td>`;
		csv += `${i}`;
		for (let i = 0; i < fullTable.users.length; i++) {
			row += `<td>${points[i]}</td>`;
			csv += `;${points[i]}`;
		}
		row += `<td>${round.bock}</td><td>${new Date(round.time).toLocaleString()}</td></tr>`;
		csv += `;${round.bock};${round.eintragender};${round.time}\n`;
		html = row + html;
	}
	table.innerHTML = header + html;
	const blob = new Blob([csv], { type: "text/csv" });
	document.getElementById("downloadBtn").href = URL.createObjectURL(blob);
	document.getElementById("downloadBtn").download = "doppelkopf.csv";
	doStats(data, fullTable.users);
}

function doStats(data, users) {
    let userNames = [];
    let participation = {};
    let wins = {};
    let soli = {};
    let soliWins = {};
    let eintragender = {};
    let winPoints = {};
    let losePoints = {};
    let avgPoints = {};
    let totalPoints = {};
    let noBockPoints = {};
    let pointSources = {};
    let individualPointHistory = {} //for graph
    let bocks = 0.0;

    for (let user of users) {
        userNames.push(user.name);
        participation[user.name] = 0;
        soli[user.name] = 0;
        soliWins[user.name] = 0;
        winPoints[user.name] = 0;
        losePoints[user.name] = 0;
        avgPoints[user.name] = 0;
        wins[user.name] = 0;
        totalPoints[user.name] = 0;
        noBockPoints[user.name] = 0;
        pointSources[user.name] = {};
		for (let sourceUser of users) {
			pointSources[user.name][sourceUser.name] = 0;
		}
        eintragender[user.name] = 0;
        individualPointHistory[user.name] = [[0,0]];
    }

    let isBock = false;
	let i = 0;
    for (let round of data) {
		i++;
        if (Object.keys(round.points).length == 0)
            continue;



        if (round.eintragender != null && round.eintragender != "" && round.eintragender != " ") {
            eintragender[round.eintragender] += 1;
        }
        if (Number(round.bock) > 0) {
            bocks += 1.0;
        }
        for (let player of Object.keys(round.points)) {
            participation[player] += 1;
            totalPoints[player] += round.points[player];

            let oldVal = individualPointHistory[player][individualPointHistory[player].length-1][1];

            individualPointHistory[player].push([i, oldVal + round.points[player]]);
            if (isBock) {
                noBockPoints[player] += round.points[player]/2;
            } else {
                noBockPoints[player] += round.points[player];
            }
            if (round.points[player] > 0) {
                wins[player] += 1;
                winPoints[player] += round.points[player];
            } else if (round.points[player] < 0) {
                losePoints[player] -= round.points[player];
            }
            avgPoints[player] += round.points[player];

			for (let sourcePlayer of Object.keys(round.points)) {
				const src = round.points[sourcePlayer];
				const dest = round.points[player];
				if (-src == dest) {		//with how many people the points are shared
					pointSources[player][sourcePlayer] += dest/2;	//normal
				} else if (-src == dest*3) {
					pointSources[player][sourcePlayer] += dest;	//against solo player
				} else if (-src == dest/3) {
					pointSources[player][sourcePlayer] += dest/3;		//solo player
				}
			}
        }

        //prob overly complicated but whatever
        const count = {};
        for (let num of Object.values(round.points)) {
            count[num] = (count[num] || 0) + 1;
        }
        if (Object.values(count)[0] == 3) {
            for (let player of Object.keys(round.points)) {
                if (round.points[player] == Number(Object.keys(count)[1])) {
                    soli[player] += 1;
                    if (round.points[player] > 0) {
                        soliWins[player] += 1;
                    }
                }
            }
            
        } else if (Object.values(count)[1] == 3) {
            for (let player of Object.keys(round.points)) {
                if (round.points[player] == Number(Object.keys(count)[0])) {
                    soli[player] += 1;
                    if (round.points[player] > 0) {
                        soliWins[player] += 1;
                    }
                }
            }
        }
        if (round.bock > 0) {
            isBock = true;
        } else {
            isBock = false;
        }

    }
    for (let user of userNames) {
        if (data.length-1 > 1) {
            if (participation[user] > 0) {
                if (wins[user] > 0) {
                    winPoints[user] /= wins[user];
                }
                if (participation[user] - wins[user] > 0) { //technically inaccurate beacuse of round with 0 points but whatever
                    losePoints[user] /= participation[user] - wins[user];
                }
                avgPoints[user] /= participation[user];
                if (soli[user] > 0) {
                    soliWins[user] /= soli[user];
                }
                wins[user] /= participation[user];
                soli[user] /= participation[user];
                
            }
            participation[user] /= data.length-1;
            eintragender[user] /= data.length-1;
            
        }

    }
    if (data.length-1 > 1) {
        bocks /= data.length-1;
    }
    new BarChart("Total Points", totalPoints, document.getElementById("totalPoints"), false);    //title, data, canvas, siPercentage
    new Graph("Point History", individualPointHistory, document.getElementById("totalPointsGraph"));    //title, data, canvas, siPercentage
    new BarChart("Participation", participation, document.getElementById("participation"), true);    //title, data, canvas, siPercentage 
    new BarChart("Average points", avgPoints, document.getElementById("avgP"), false);    //title, data, canvas, siPercentage
    new BarChart("Average Win points", winPoints, document.getElementById("winP"), false);    //title, data, canvas, siPercentage
    new BarChart("Average Lose points", losePoints, document.getElementById("loseP"), false);    //title, data, canvas, siPercentage
    new BarChart("Wins", wins, document.getElementById("wins"), true);    //title, data, canvas, siPercentage
    new BarChart("Eintragender", eintragender, document.getElementById("eintragender"), true);    //title, data, canvas, siPercentage
    new BarChart("Soli", soli, document.getElementById("soli"), true);    //title, data, canvas, siPercentage
    new BarChart("Soli Wins", soliWins, document.getElementById("soliWins"), true);    //title, data, canvas, siPercentage
    new BarChart("No Bocks", noBockPoints, document.getElementById("noBock"), false);    //title, data, canvas, siPercentage
    document.getElementById("num_bocks").innerText = "" + Math.round(bocks*1000)/10 + "% of the rounds were Böckis."
	//sources
	document.getElementById("pointSources").innerHTML = "";
	for (let destPlayer of Object.entries(pointSources)) {
		const srces = Object.entries(destPlayer[1]);
		const gain = srces.filter(num => num[1] > 0);
		const lose = srces.filter(num => num[1] < 0);
		lose.sort((a, b) => a[1]-b[1]);
		gain.sort((a, b) => b[1]-a[1]);
		let gainTable = "";
		for (let plPlayer of gain) {
			gainTable += `<tr><td>${plPlayer[0]}</td><td>${Math.round(plPlayer[1]*10)/10}</td></tr>`;
		}
		let loseTable = "";
		for (let plPlayer of lose) {
			loseTable += `<tr><td>${plPlayer[0]}</td><td>${-Math.round(plPlayer[1]*10)/10}</td></tr>`;
		}
		document.getElementById("pointSources").innerHTML += `
			<div>
				<h4>${destPlayer[0]}</h4>
				<div>
					<div>
						<h5>Points Gained</h5>
						<table>${gainTable}</table>
					</div>
					<div>
						<h5>Points Lost</h5>
						<table>${loseTable}</table>
					</div>
				</div>
			</div>
		`;
	}
}

if (document.getElementById("cur")) {
    getCurrent();
}

if (document.getElementById("full")) {
    getAll();

	document.getElementById("fromTime").onchange = showTable;

	document.getElementById("toTime").onchange = showTable;
}
if (document.getElementById("addRound")) {
    getAddUsers();
}
