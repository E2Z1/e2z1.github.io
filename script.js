if (window.location.href.startsWith("http://localhost") || window.location.href.startsWith("http://127.0.0.1")) {
    document.getElementsByTagName("title")[0].innerText = "[DEV] " + document.getElementsByTagName("title")[0].innerText
}

