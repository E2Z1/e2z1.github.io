const server = localStorage.getItem("server");


function delRound() {
	fetch(server+"/functions/v1/deleteRound", {
        method: "POST",
        body: JSON.stringify({
			...JSON.parse(localStorage.getItem("creds")),
			td: Number(document.getElementById("td").value)
		}),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
        .then((response) => response.json())
        .then((json) => {
            if (json.success) {
                alert("Success");
				window.location.reload();
            } else {
				alert("Error");
			}
        });
}


function fetchRound() {

	fetch(server+"/functions/v1/getRound", {
        method: "POST",
        body: JSON.stringify({
			round: Number(document.getElementById("bdr").value)
		}),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
        .then((response) => response.json())
        .then((r) => {
            if (r.success) {
				fetch(server+"/functions/v1/getUsers", {
					method: "GET",
				})
					.then((response) => response.json())
					.then((json) => {
						if (json.success) {
							document.getElementById("addRound").innerHTML = '<div id="personFields"></div>';
							const personFields = document.getElementById("personFields");
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
									<input ${navigator.userAgent.match(/iPhone|iPod|iPad/i) ? 'type="number"' : 'type="text"'} class="number" placeholder="Enter points" required>
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

							<button id="addRoundBtn" onclick="chRound()">Change Round</button>

							`;
							const ents = Object.entries(r.round.points)
							for (let i = 0; i < personFields.querySelectorAll("div").length; i++) {
								personFields.querySelectorAll("div")[i].querySelector("select").value = ents[i][0];
								personFields.querySelectorAll("div")[i].querySelector("input").value = ents[i][1] * (r.bock ? 0.5 : 1);
							}
							personFields.querySelector("select#eintragender").value = r.round.eintragender;
							personFields.querySelector("input#bock").checked = r.round.bock == 4;

						} else console.error(json.message);
				});
            } else {
				alert("Error");
			}
        });
}

function chRound() {
	const personFields = document.getElementById("personFields");
	if (personFields.querySelector("#eintragender").value == "") {
		alert("The field for your identity was left empty!")
		return;
	}
    let sum = 0;
    let data = {};
    const persons = personFields.querySelectorAll(".person");
    const numbers = personFields.querySelectorAll(".number");
    for (let i = 0; i < 4; i++) {
        let number = numbers[i].value;
        if (number != Number(number)) {
			alert(`Invalid input for player ${persons[i].value} (Not a Number)!`);
			return;
		}
		if (persons[i].value == "") {
			alert(`The ${i+1}. field for a user was left empty`);
			return;
		}
        data[persons[i].value] = Number(number);
        sum += Number(number);
    }
    if (Object.keys(data).length != 4) {
		alert("Not enough players were listed!");
		return;
	}
    if (sum !== 0) {
		alert("The values don't add up to 0!");
		return;
	}


	document.getElementById("addRoundBtn").disabled = true;

    fetch(server+"/functions/v1/changeRound", {
        method: "POST",
        body: JSON.stringify({
			round: Number(document.getElementById("bdr").value),
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
                document.getElementById("addRound").innerHTML = '<div id="personFields"></div>';
            } else console.error(json.message);
        });
}