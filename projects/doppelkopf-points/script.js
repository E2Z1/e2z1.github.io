let fullTable;

const hCanv = document.createElement("canvas");
hCanv.height = 600;
hCanv.width = 900;
const hCtx = hCanv.getContext("2d");

function setAddr() {
	if (document.getElementsByClassName("popUp").length != 0)
		return;
	document.body.innerHTML += `
	
  <div class="popUp">
	<h3>Enter the start of the server address:</h3>
	<input type="text" name="add" id="srv_addr">
	<button onclick="localStorage.setItem('server', 'https://'+document.getElementById('srv_addr').value+'dymszuuaqyugwf.supabase.co'); window.location.reload()">Save</button>
  </div>`;
	
}

function login() {
	if (document.getElementsByClassName("popUp").length != 0)
		return;
	document.body.innerHTML += `
  <div class="popUp">
	<input type="text" id="login_name" placeholder="name">
	<input type="text" id="login_pw" placeholder="password">
	<button onclick="sendLogin()">Login</button>
  </div>`;
}

function setSmoothness() {
	if (document.getElementsByClassName("popUp").length != 0)
		return;
	document.body.innerHTML += `
  <div class="popUp">
	<input type="number" id="smoothnessInput" placeholder="Graph Accuracy">
	<button onclick="localStorage.setItem('smoothness', document.getElementById('smoothnessInput').value); window.location.reload()">Set</button>
  </div>`;
}

function sendLogin() {
	const cred = JSON.stringify({
			name: document.getElementById("login_name").value,
			password: document.getElementById("login_pw").value
		});
	fetch(server+"/functions/v1/getAuthLevel", {
		method: "POST",
		body: cred,
		headers: {
			"Content-Type": "application/json; charset=UTF-8"
		}
	})
		.then((response) => response.json())
		.then((json) => {
			if (json.success) {
				if (json.auth.authlevel > 1)
					localStorage.setItem("isAdmin", json.auth.authlevel)
				else 
					localStorage.removeItem("isAdmin")
				localStorage.setItem("creds", cred);
				window.location.reload()
			} else {
				alert("Error");
			}
		});
}

if (!localStorage.getItem("server")) {
	setAddr();
}
const server = localStorage.getItem("server");
if (document.getElementById("quote")) {
	const quotes = ["Doppelkopf ist die META", "Skillissue", "Der Sinn des Lebens ist Doppelkopf", "Ein Tag ohne Doppelkopf ist ein Tag ohne Sinn", "Entweder spielt man Doppelkopf oder man sieht das eigene Leben an einem vorbeiziehen", "Oeddeloeddeldoeddel", "Das ist nen goofie Blatt", "Pik-10-Gameplay", "Gurten + Doppelkopf"];
	document.getElementById("quote").innerText = "„" + quotes[Math.floor(Math.random() * quotes.length)] + "“";
}

function isPWA() {
	return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
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


				let sorted = json.users.slice();
				sorted.sort((a, b) => b.points - a.points);
				let ranks = {};
				let points = 0;
				let prevCritPoint;
				let numSameRank = 0;
				for (let i of sorted) {
					if (i.points == prevCritPoint) {
						numSameRank++;
					} else {
						points += 1 + numSameRank;
						numSameRank = 0;
						prevCritPoint = i.points;
					}
					ranks[i.name] = points;
				}

				json.users.sort((a,b) => a.name.localeCompare(b.name))
				for (let user of json.users) {
					html += `<th>${user.name} (${ranks[user.name]})</th>`;
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
	if (personFields.querySelector("#eintragender").value == "") {
		alert("The field for your identity was left empty!");
		return;
	}
	if (document.getElementById("pointInput").value != Number(document.getElementById("pointInput").value)) {
		alert("The point field doesn't contain a valid number!");
		return;
	}
	let data = {};
	let valuesForNext = [];
	const persons = personFields.querySelectorAll(".person");
	const numbers = getPlayerPoints();
	if (numbers === null) {
		alert("Invalid selection!");
		return;
	}
	for (let i = 0; i < 4; i++) {
		let number = numbers[i];
		if (persons[i].value == "") {
			alert(`The ${i+1}. field for a user was left empty`);
			return;
		}
		data[persons[i].value] = number;
		valuesForNext.push(persons[i].value);
	}
	valuesForNext.push(personFields.querySelector("#eintragender").value);
	localStorage.setItem("lastPlayers", JSON.stringify(valuesForNext));
	if (Object.keys(data).length != 4) {
		alert("Not enough players were listed!");
		return;
	}


	document.getElementById("addRoundBtn").disabled = true;

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
				potIncreaseCycleIndex();
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
				document.getElementById("addRound").innerHTML = `<h2>Round no ${json.roundData.id} with ${json.roundData.bock} Bock</h2>` + document.getElementById("addRound").innerHTML
				const personFields = document.getElementById("personFields");
				personFields.innerHTML += `<input type="number" id="pointInput" placeholder="Enter round points" onchange="doPointPreview()">`;
				let persons = [];
				json.users.sort((a,b) => a.name.localeCompare(b.name))
				for (let user of json.users) {
					persons.push(user.name);
				}
				for (let i = 0; i < 4; i++) {
					let div = document.createElement("div");
					div.innerHTML = `
						<select class='person'>
							${persons.map(person => `<option value="${person}">${person}</option>`).join("")}
						</select>
						<input type="checkbox" onchange="doPointPreview()">
						<label>0</label>
					`;
					//<input ${navigator.userAgent.match(/iPhone|iPod|iPad/i) ? 'type="number"' : 'type="text"'} class="number" placeholder="Enter points" required>
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
				document.querySelector("#cycle").innerHTML += `<select id="nextAdded">
							${persons.map(person => `<option value="${person}">${person}</option>`).join("")}
				</select>
				<button id="addCycleMember" onclick="addCycleMember()">Add Cycle Member</button>
				`;
				document.getElementById("addRound").style.display = "block";

				cycleStuffOnLoad();


			} else console.error(json.message);
		});
}

function getPlayerPoints() {
	const roundPoints = Number(document.getElementById("pointInput").value);
	const personFieldDivs = document.getElementById("personFields").getElementsByTagName("div");
	let nWinners = 0;
	const points = [];
	for (let i = 0; i < 4; i++) {
		if (personFieldDivs[i].getElementsByTagName("input")[0].checked)
			nWinners++;
	}
	if (nWinners == 0 || nWinners == 4)
		return null;

	for (let i = 0; i < 4; i++) {
		if (personFieldDivs[i].getElementsByTagName("input")[0].checked)
			points.push(nWinners == 1 ? 3*roundPoints : roundPoints);
		else
			points.push(nWinners == 3 ? -3*roundPoints : -roundPoints);
	}
	return points;
}

function doPointPreview() {
	const personFieldDivs = document.getElementById("personFields").getElementsByTagName("div");
	const pp = getPlayerPoints();
	if (pp === null) {
		for (let i = 0; i < 4; i++)
			personFieldDivs[i].getElementsByTagName("label")[0].innerText = "0";
		return;
	}
	for (let i = 0; i < 4; i++) {
		personFieldDivs[i].getElementsByTagName("label")[0].innerText = pp[i];
	}
}

function cycleStuffOnLoad() {
	if (!localStorage.getItem("cycleMembers")) {
		localStorage.setItem("cycleMembers", "[]");
	}
	let mems = JSON.parse(localStorage.getItem("cycleMembers"));
	document.querySelector("#cycleMembers").innerHTML = "";
	for (let i of mems) {
		document.querySelector("#cycleMembers").innerHTML += `<a onclick="removeCycleMember('${i}')"> ${i} </a>`;
	}
	document.getElementById("doCycle").checked = localStorage.getItem("doCycle") == "true";
	if (localStorage.getItem("doCycle") == "true") {
		loadCurrentCycle();
	}
}

function potIncreaseCycleIndex() {
	if (localStorage.getItem("doCycle") == "true") {
		if (localStorage.getItem("cycleIndex") === null || localStorage.getItem("cycleIndex") == "NaN") {
			localStorage.setItem("cycleIndex", 0);
		}
		localStorage.setItem("cycleIndex", Number.parseInt(localStorage.getItem("cycleIndex"))+1);
	}
}

function loadCurrentCycle() {
	if (localStorage.getItem("cycleIndex") === null || localStorage.getItem("cycleIndex") == "NaN") {
		localStorage.setItem("cycleIndex", 0);
	}
	const ind = Number.parseInt(localStorage.getItem("cycleIndex"));
	const personFields = document.getElementById("personFields");
	const mems = JSON.parse(localStorage.getItem("cycleMembers"));
	for (let i = 0; i < 4; i++) {
		personFields.querySelectorAll("select")[i].value = mems[(i+ind)%mems.length];
	}
}

function setDoCylce() {
	localStorage.setItem("doCycle", document.getElementById("doCycle").checked);
	if (document.getElementById("doCycle").checked)
		loadCurrentCycle();
}

function addCycleMember() {
	if (!localStorage.getItem("cycleMembers")) {
		localStorage.setItem("cycleMembers", "[]");
	}
	let mems = JSON.parse(localStorage.getItem("cycleMembers"));
	if (mems.includes(document.getElementById("nextAdded").value))
		return;
	if (localStorage.getItem("cycleIndex") === null || localStorage.getItem("cycleIndex") == "NaN")
		localStorage.setItem("cycleIndex", 0);
	localStorage.setItem("cycleIndex", localStorage.getItem("cycleIndex")%mems.length);
	mems.push(document.getElementById("nextAdded").value);
	localStorage.setItem("cycleMembers", JSON.stringify(mems));
	cycleStuffOnLoad();
}

function removeCycleMember(member) {
	let mems = JSON.parse(localStorage.getItem("cycleMembers"));
	if (localStorage.getItem("cycleIndex") === null || localStorage.getItem("cycleIndex") == "NaN")
		localStorage.setItem("cycleIndex", 0);
	const starter = mems[localStorage.getItem("cycleIndex")%mems.length];
	mems = mems.filter(m => m != member);
	localStorage.setItem("cycleMembers", JSON.stringify(mems));
	if (mems.indexOf(starter) != -1)
		localStorage.setItem("cycleIndex", mems.indexOf(starter));
	cycleStuffOnLoad();

}

class BarChart {
	constructor (title, data, imgElem, isPercentage) {
		this.title = title;
		this.data = data;
		this.imgElem = imgElem;
		this.ctx = hCtx;//canvas.getContext("2d");
		this.canvas = hCanv;//canvas;
		this.isPercentage = isPercentage;
		this.draw();
	}
	draw() {
		this.imgElem.innerHTML = "";
		const data = this.data;
		const width = 450;
		const height = 300;

		let maxVal = Math.max(...Object.values(data));
		if (maxVal == 0)
			maxVal = 1;     //to not divide by zero
		const minVal = Math.min(...Object.values(data), 0);	//wanted to make avg win/lose points in one plot -> negative values
																	//and total points ofc
		const barWidth = (width - 20) / (Object.keys(data).length);
		const scaleFactor = (height * 0.9 - 4 - height/25) / (maxVal - minVal);
		const zeroPoint = Math.max(25,height * 0.9 + minVal * scaleFactor);


		for (let i = 0; i < Object.keys(data).length; i++) {
			const key = Object.keys(data).sort()[i];
			const val = data[key];
			const x = 20 + i * barWidth;
			const height = val * scaleFactor;
			const y = height > 0 ? zeroPoint - height : zeroPoint;

			this.imgElem.innerHTML += `<rect x="${x}" y="${y}" width="${barWidth/1.5}" height="${Math.abs(height)}" fill="white"/>`;

			let valText = "" + Math.round(val*100)/100;
			if (this.isPercentage) {
				valText = "" + Math.round(val*100) + "%";
			}
			if (val < 0) {
				this.imgElem.innerHTML += `<text font-size="13" x="${x}" y="${zeroPoint - height + 15}" fill="white">${valText}</text>`;
				this.imgElem.innerHTML += `<text font-size="18" x="${x}" y="${zeroPoint - 4}" fill="white">${key.slice(0,2)}</text>`;
			} else {
				this.imgElem.innerHTML += `<text font-size="13" x="${x}" y="${zeroPoint - height - 4}" fill="white">${valText}</text>`;
				this.imgElem.innerHTML += `<text font-size="18" x="${x}" y="${zeroPoint + 15}" fill="white">${key.slice(0,2)}</text>`;
			}
		}
	}
}

function getDistinctColors(n) {
	const colors = [];
	const hueStep = 360 / n;
	
	for (let i = 0; i < n; i++) {
	  const hue = i * hueStep;
	  const color = `hsl(${hue}, 100%, 50%)`;
	  colors.push(color);
	}
	return colors;
  }


let graphEventListeners = [];

class Graph {
	constructor (title, data, div) {
		this.title = title;
		this.data = data;
		this.canvas = document.createElement("canvas");
		this.canvas.height = 600;
		this.canvas.width = 900;
		this.div = div;
		div.innerHTML = "";
		div.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");
		div.className = "graph";
		this.imgElem = document.createElement('img');
		this.canvas.parentNode.insertBefore(this.imgElem, this.canvas);
		this.colors = getDistinctColors(Object.keys(this.data).length);
		this.maxVal = 0;
		this.minVal = 0;
		this.length = 0;
		for (let i = 0; i < Object.keys(this.data).length; i++) {
			const cur = this.data[Object.keys(this.data)[i]];
			for (let j = 0; j < cur.length; j++) {
				if (cur[j][1] > this.maxVal) {
					this.maxVal = cur[j][1];
				}
				if (cur[j][1] < this.minVal) {
					this.minVal = cur[j][1];
				}
			}
			if (cur.length > 0 && cur[cur.length-1][0] > this.length) {
				this.length = cur[cur.length-1][0];
			}
		}
		if (this.maxVal == 0)
			this.maxVal = 1;

		this.draw();
		this.div.onclick = event => {
			if (event.detail == 2) {
				if (document.fullscreenElement) {
					document.exitFullscreen();
				} else {
					this.div.requestFullscreen();
				}
			}
		}

		this.canvas.addEventListener("pointermove", (event) => this.drawOverlay(event.offsetX));
		this.canvas.addEventListener("pointerdown", (event) => {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			this.drawOverlay(x, y);
		});
		this.canvas.addEventListener("pointerleave", () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height));

		this._boundFsChange = this.fschange.bind(this);
		document.addEventListener('fullscreenchange', this._boundFsChange);
		graphEventListeners.push(this._boundFsChange);
	}
	drawOverlay(x) {
		this.ctx.font = `${this.canvas.height/20}px Arial`;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		const scaleFactorY = (this.canvas.height * 0.9 - 20) / (this.maxVal - this.minVal);
		const scaleFactorX = (this.canvas.width * 0.9 - 20) / this.length;
		const zeroPointY = this.canvas.height * 0.9 + this.minVal * scaleFactorY;
		const round = Math.min(Math.round(x*this.canvas.width/this.canvas.offsetWidth/scaleFactorX), this.length);
		const mX = round*scaleFactorX;
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(mX-this.canvas.height/400, 0, this.canvas.height/200, this.canvas.height-this.canvas.height/20);
		this.ctx.fillText(round, mX-this.canvas.height/40, this.canvas.height);
		for (let i = 0; i < Object.keys(this.data).length; i++) {
			const closest = this.data[Object.keys(this.data)[i]].reduce((prev, curr) => {
				return Math.abs(curr[0] - round) < Math.abs(prev[0] - round) ? curr : prev;
			});
			this.ctx.fillStyle = this.colors[i];
			this.ctx.fillRect(mX-this.canvas.height/100, zeroPointY-closest[1]*scaleFactorY-this.canvas.height/100, this.canvas.height/50, this.canvas.height/50)
			this.ctx.fillText(Math.round(closest[1]*10)/10, mX+this.canvas.height/40, zeroPointY-closest[1]*scaleFactorY+this.canvas.height/40);

		}

	}
	fschange() {
		const w = 900;
		const h = 600;
		if (document.fullscreenElement == this.div) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			hCanv.width = window.innerWidth;
			hCanv.height = window.innerHeight;
			this.draw()
			hCanv.width = w;
			hCanv.height = h;
		} else {
			if (this.canvas.width != w || this.canvas.height != h) {
				this.canvas.width = w;
				this.canvas.height = h;
				this.draw()
			}
		}
	}
	draw() {
		if (typeof OffscreenCanvas !== 'undefined' && window.Worker) {
			const worker = new Worker('../graphWorker.js');
			worker.postMessage({data: this.data, w: hCanv.width, h: hCanv.height,
				 diff: this.maxVal-this.minVal, colors: this.colors, length: this.length,
				  minVal: this.minVal, smoothness: localStorage.getItem("smoothness") ? localStorage.getItem("smoothness") : 1000});
			worker.onmessage = (e) => {
				this.imgElem.src = e.data;
				worker.terminate();
			}
		} else {
			const data = this.data;

			const width = hCanv.width;
			const height = hCanv.height;
			const scaleFactorY = (height * 0.9 - 20) / (this.maxVal-this.minVal);
			const scaleFactorX = (width * 0.9 - 20) / this.length;
			const zeroPointY = height * 0.9 + this.minVal * scaleFactorY;
			const smoothness = localStorage.getItem("smoothness") ? localStorage.getItem("smoothness") : 1000;

			let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="Arial" font-size="${height / 20}">`;

			for (let i = 0; i < Object.keys(data).length; i++) {
				const key = Object.keys(data).sort()[i];
				const val = data[key];

				let pathData = "";
				let tVal;

				for (let j = 0; j < val.length; j+=Math.ceil(val.length/smoothness)) {
					if (j != 0 && val[j-1][0] != val[j][0]-1) {	
						tVal = val[j-1];
						pathData += `L${(val[j][0]-1)*scaleFactorX},${zeroPointY - tVal[1]*scaleFactorY}`;
					}
					tVal = val[j];
					pathData += (j === 0 ? "M" : "L") + `${tVal[0]*scaleFactorX},${zeroPointY - tVal[1]*scaleFactorY}`;
				}
				tVal = val[val.length-1]
				pathData += `L${data.length * scaleFactorX},${zeroPointY - tVal[1] * scaleFactorY}`;

				svg += `
					<path d="${pathData}" fill="none" stroke="${this.colors[i]}" stroke-width="${height / 300}"/>
					<text x="${this.length * scaleFactorX}" y="${zeroPointY - tVal[1] * scaleFactorY + height / 60}" fill="${this.colors[i]}">
						${key.slice(0, 2)}
					</text>
				`;

			}
			
			svg += "</svg>";

			const blob = new Blob([svg], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			this.imgElem.src = url;
			console.log(url)
//            this.imgElem.onload = () => URL.revokeObjectURL(url);
		}
	}
	delete() {

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
	setTimeout(() => doStats(data, fullTable.users), 1);	//this way the table gets rendered even if the stats still take some time
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
	let maxWinStreak = {};
	let maxLoseStreak = {};
	let loseStreak = {};
	let winStreak = {};
	let totalPoints = {};
	let minPoints = {};
	let maxPoints = {};
	let noBockPoints = {};
	let eloPoints = {};
	let pointSources = {};
	let simP = {};
	let domP = {};
	let individualPointHistory = {} //for graph
	let individualPointHistory_nobock = {} //for graph
	let individualPointHistory_elo = {} //for graph
	let individualPointHistory_domp = {} //for graph
	let bocks = 0.0;

	for (let user of users) {
		userNames.push(user.name);
		participation[user.name] = 0;
		soli[user.name] = 0;
		soliWins[user.name] = 0;
		winPoints[user.name] = 0;
		losePoints[user.name] = 0;
		avgPoints[user.name] = 0;
		maxWinStreak[user.name] = 0;
		maxLoseStreak[user.name] = 0;
		winStreak[user.name] = 0;
		loseStreak[user.name] = 0;
		wins[user.name] = 0;
		totalPoints[user.name] = 0;
		minPoints[user.name] = 0;
		maxPoints[user.name] = 0;
		noBockPoints[user.name] = 0;
		eloPoints[user.name] = 1500;
		pointSources[user.name] = {};
		for (let sourceUser of users) {
			pointSources[user.name][sourceUser.name] = 0;
		}
		simP[user.name] = 0;
		domP[user.name] = 0;
		eintragender[user.name] = 0;
		individualPointHistory[user.name] = [[0,0]];
		individualPointHistory_nobock[user.name] = [[0,0]];
		individualPointHistory_elo[user.name] = [[0,0]];
		individualPointHistory_domp[user.name] = [[0,0]];
	}

	let isBock = false;
	let rnd = 0;
	for (let round of data) {
		rnd++;
		if (Object.keys(round.points).length == 0)
			continue;



		if (round.eintragender != null && round.eintragender != "" && round.eintragender != " ") {
			eintragender[round.eintragender] += 1;
		}
		if (Number(round.bock) > 0) {
			bocks += 1.0;
		}
		/*for (let player of userNames.filter(item => !Object.keys(round.points).includes(item))) {
			individualPointHistory[player].push([rnd, individualPointHistory[player][individualPointHistory[player].length-1][1]]);
			individualPointHistory_nobock[player].push([rnd, individualPointHistory_nobock[player][individualPointHistory_nobock[player].length-1][1]]);
			individualPointHistory_elo[player].push([rnd, individualPointHistory_elo[player][individualPointHistory_elo[player].length-1][1]]);
			individualPointHistory_domp[player].push([rnd, individualPointHistory_domp[player][individualPointHistory_domp[player].length-1][1]]);
		}*/
		for (let i = 0; i < Object.keys(round.points).length; i++) {
			let player = Object.keys(round.points)[i];
			let nb;
			if (isBock) {
				nb = round.points[player]/2;
			} else {
				nb = round.points[player];
			}
			participation[player] += 1;
			totalPoints[player] += round.points[player];
			maxPoints[player] = Math.max(maxPoints[player], totalPoints[player]);
			minPoints[player] = Math.min(minPoints[player], totalPoints[player]);

			let eloChange = 0;

			for (let j = 0; j < Object.keys(round.points).length; j++) {
				let p2 = Object.keys(round.points)[j];
				let nb2;
				if (isBock) {
					nb2 = round.points[p2]/2;
				} else {
					nb2 = round.points[p2];
				}
				const expect = 1 / (1 + Math.pow(10, (nb2 - nb) / 400));

				eloChange += Math.round(nb - expect);
			}

			eloPoints[player] += eloChange;

			let oldVal = individualPointHistory[player][individualPointHistory[player].length-1][1];
			individualPointHistory[player].push([rnd, oldVal + round.points[player]]);

			oldVal = individualPointHistory_nobock[player][individualPointHistory_nobock[player].length-1][1];
			individualPointHistory_nobock[player].push([rnd, oldVal + nb]);

			oldVal = individualPointHistory_elo[player][individualPointHistory_elo[player].length-1][1];
			individualPointHistory_elo[player].push([rnd, oldVal + eloChange]);

			noBockPoints[player] += nb;

			//domP
			let sumP = 0;
			let cntP = 0;
			let sumN = 0;
			let cntN = 0;
			for (let name in round.points) {
				if (round.points[name] > 0) {
					sumP += domP[name];
					cntP++;
				} else {
					sumN += domP[name];
					cntN++;
				}
			}
			const domPCha = cntP == 0 ? 0 : (1000-(sumP/cntP))/(1000-(sumN/cntN)) * nb;
			oldVal = individualPointHistory_domp[player][individualPointHistory_domp[player].length-1][1];
			individualPointHistory_domp[player].push([rnd, oldVal + domPCha]);
			domP[player] += domPCha;
			

			if (round.points[player] > 0) {
				wins[player] += 1;
				winPoints[player] += round.points[player];
				winStreak[player]++;
				maxWinStreak[player] = Math.max(maxWinStreak[player], winStreak[player]);
				loseStreak[player] = 0;
			} else if (round.points[player] < 0) {
				losePoints[player] -= round.points[player];
				winStreak[player] = 0;
				loseStreak[player]++;
				maxLoseStreak[player] = Math.max(maxLoseStreak[player], loseStreak[player]);
			} else {
				winStreak[player] = 0;
				loseStreak[player] = 0;
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
		if (data.length > 0) {
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
			participation[user] /= data.length;
			eintragender[user] /= data.length;
			
		}
		domP[user] = Math.round(domP[user]);
	}
	for (let criteria of [wins, totalPoints, maxPoints, minPoints, participation]) {
		let sorted = Object.entries(criteria);
		sorted.sort((a, b) => a[1] - b[1]);
		let points = 0;
		let prevCritPoint;
		let numSameRank = 0;
		for (let i of sorted) {
			if (i[1] == prevCritPoint) {
				numSameRank++;
			} else {
				points += 1 + numSameRank;
				numSameRank = 0;
				prevCritPoint = i[1];
			}
			simP[i[0]] += points;
		}
	}
	if (data.length > 0) {
		bocks /= data.length;
	}

	for (let list of graphEventListeners) {
		document.removeEventListener("fullscreenchange", list);
	}
	graphEventListeners = [];

	new BarChart("Total Points", totalPoints, document.getElementById("totalPoints"), false);    //title, data, canvas, siPercentage
	new Graph("Point History", individualPointHistory, document.getElementById("totalPointsGraph"));    //title, data, canvas, siPercentage
	new BarChart("Participation", participation, document.getElementById("participation"), true);    //title, data, canvas, siPercentage 
	new BarChart("Max Points", maxPoints, document.getElementById("maxPoints"), false);    //title, data, canvas, siPercentage 
	new BarChart("Min Points", minPoints, document.getElementById("minPoints"), false);    //title, data, canvas, siPercentage 
	new BarChart("Average points", avgPoints, document.getElementById("avgP"), false);    //title, data, canvas, siPercentage
	new BarChart("Average Win points", winPoints, document.getElementById("winP"), false);    //title, data, canvas, siPercentage
	new BarChart("Average Lose points", losePoints, document.getElementById("loseP"), false);    //title, data, canvas, siPercentage
	new BarChart("Max Losing Streak", maxLoseStreak, document.getElementById("loseStreak"), false);    //title, data, canvas, siPercentage
	new BarChart("Max Winning Streak", maxWinStreak, document.getElementById("winStreak"), false);    //title, data, canvas, siPercentage
	new BarChart("Wins", wins, document.getElementById("wins"), true);    //title, data, canvas, siPercentage
	new BarChart("Eintragender", eintragender, document.getElementById("eintragender"), true);    //title, data, canvas, siPercentage
	new BarChart("Soli", soli, document.getElementById("soli"), true);    //title, data, canvas, siPercentage
	new BarChart("Soli Wins", soliWins, document.getElementById("soliWins"), true);    //title, data, canvas, siPercentage
	new BarChart("No Bocks", noBockPoints, document.getElementById("noBock"), false);    //title, data, canvas, siPercentage
	new Graph("No Bock History", individualPointHistory_nobock, document.getElementById("noBockHistory"));
	new BarChart("ELO", eloPoints, document.getElementById("elo"), false);    //title, data, canvas, siPercentage
	new Graph("ELO History", individualPointHistory_elo, document.getElementById("eloHistory"));
	new BarChart("DomP", domP, document.getElementById("domp"), false);    //title, data, canvas, siPercentage
	new Graph("DomP History", individualPointHistory_domp, document.getElementById("dompHistory"));
	new BarChart("SimP", simP, document.getElementById("simP"), false);    //title, data, canvas, siPercentage
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

function toggleContents() {
	if (document.getElementById("contents").style.display == "block") {
		document.getElementById("contents").style.display = "none";
	} else {
		document.getElementById("contents").style.display = "block";
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

if (localStorage.getItem("isAdmin") && !location.pathname.includes("admin")) {
	document.getElementById("sub_nav").insertAdjacentHTML('afterend', '<a id="admin_tab" href="/projects/doppelkopf-points/admin">Admin</a>');
}
