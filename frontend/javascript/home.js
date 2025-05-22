const menuBar = document.getElementById("menu-bar");
const navBar = document.querySelector("nav");

menuBar.addEventListener("click", () => {
    navBar.style.display = "flex";
})

document.addEventListener("click", (e) => {
    if (!navBar.contains(e.target) && !menuBar.contains(e.target) && window.innerWidth <= 1020) {
        navBar.style.display = "none";
    }
})