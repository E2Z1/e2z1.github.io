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