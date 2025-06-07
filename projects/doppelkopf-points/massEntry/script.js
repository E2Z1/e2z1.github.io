const massEntryTable = document.getElementById("massEntryTable");
//contenteditable="true" oninput=""
fetch(server+"/functions/v1/getUsers", {
	method: "GET",
})
	.then((response) => response.json())
	.then((json) => {
		if (json.success) {
			let persons = [];
			json.users.sort((a,b) => a.name.localeCompare(b.name))
			for (let user of json.users) {
				persons.push(user.name);
			}
			massEntryTable.querySelector("table").innerHTML +=
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
