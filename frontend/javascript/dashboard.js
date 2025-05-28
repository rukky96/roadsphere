const menuBar = document.getElementById("menu-bar");
const sideBar = document.querySelector(".sidebar");

menuBar.addEventListener("click", () => {
    sideBar.style.display = "flex";
})

document.addEventListener("click", (e) => {
    if (!sideBar.contains(e.target) && !menuBar.contains(e.target) && window.innerWidth <= 1020) {
        sideBar.style.display = "none";
    }
})