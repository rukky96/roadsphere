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

  const userStats = document.querySelector('.user-stats');
  let isDown = false;
  let startX;
  let scrollLeft;

  userStats.addEventListener('mousedown', (e) => {
    isDown = true;
    userStats.classList.add('dragging');
    startX = e.pageX - userStats.offsetLeft;
    scrollLeft = userStats.scrollLeft;
  });

  userStats.addEventListener('mouseleave', () => {
    isDown = false;
    userStats.classList.remove('dragging');
  });

  userStats.addEventListener('mouseup', () => {
    isDown = false;
    userStats.classList.remove('dragging');
  });

  userStats.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - userStats.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed
    userStats.scrollLeft = scrollLeft - walk;
  });
