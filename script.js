if (window.location.href.startsWith("http://localhost") || window.location.href.startsWith("http://127.0.0.1")) {
    document.getElementsByTagName("title")[0].innerText = "[DEV] " + document.getElementsByTagName("title")[0].innerText;
}
if (localStorage.getItem("theme")) {
	document.body.setAttribute("data-theme", localStorage.getItem("theme"));
}

const themes = ["Default", "Catppuccin", "Gruvbox", "Nord", "Flashlight", "Dominic"];
function changeTheme(theme) {
	localStorage.setItem("theme", theme);
	document.body.setAttribute("data-theme", theme);
}

function getTheme() {
	if (!localStorage.getItem("theme"))
		return "default";
	return localStorage.getItem("theme");
}

function cycleTheme() {
	let c = themes.indexOf(getTheme());
	let n = themes[(c+1)%themes.length];
	changeTheme(n);
	return n;
}