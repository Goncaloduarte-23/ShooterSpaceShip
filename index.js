let jet = document.getElementById("ship");
let board = document.getElementById("board");

window.addEventListener("keydown", (e) => {
  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  if (e.key == "ArrowLeft" && left > 0) {
    jet.style.left = left - 10 + "px";
  } else if (e.key == "ArrowRight" && left <= 540) {
    jet.style.left = left + 10 + "px";
  }
});
