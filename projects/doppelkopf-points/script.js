
if (!localStorage.getItem("server")) {
    let start = prompt('start of server address');
    localStorage.setItem("server", "https://"+start+"dymszuuaqyugwf.supabase.co");
}
const server = localStorage.getItem("server");


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
                let table = document.getElementById("full").querySelector("table");
                let html = `<tr><th>No.</th>`;
                let users = {};
                let points = []
                for (let i = 0; i < json.users.length; i++) {
                    html += `<th>${json.users[i].name}</th>`;
                    users[json.users[i].name] = i;
                    points.push(0);
                }
                html += "<th>Böcke</th></tr>";
                for (let round of json.data) {
                    for (let value of Object.keys(round.points)) {
                        points[users[value]] += round.points[value];
                    }
                    html += `<tr><td>${round.id}</td>`;
                    for (let i = 0; i < json.users.length; i++) {
                        html += `<td>${points[i]}</td>`;
                    }
                    html += `<td>${round.bock}</td></tr>`;
                }
                table.innerHTML = html;
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
                <label>Bock? </label>
                <input type="checkbox" id="bock">
                <br>

                <button onclick="addRound()">Add Round</button>

                `;
                const lastValues = localStorage.getItem("lastPlayers") ? JSON.parse(localStorage.getItem("lastPlayers")) : [" ", " ", " ", " ", " "];
                for (let i = 0; i < personFields.querySelectorAll("select").length; i++) {
                    personFields.querySelectorAll("select")[i].value = lastValues[i];
                }
            } else console.error(json.message);
        });
}

if (document.getElementById("cur")) {
    getCurrent();
}

if (document.getElementById("full")) {
    getAll();
}
if (document.getElementById("addRound")) {
    getAddUsers();
}