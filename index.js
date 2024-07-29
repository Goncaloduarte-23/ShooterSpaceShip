let ship = document.getElementById("ship");
let board = document.getElementById("board");
let canCreateNextBullet = true;

window.addEventListener("keydown", (e) => {
  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  if (e.key == "ArrowLeft" && left > 0) {
    ship.style.left = left - 10 + "px";
  } else if (e.key == "ArrowRight" && left <= 540) {
    ship.style.left = left + 10 + "px";
  }

  if (e.keyCode === 32) {
    if (!canCreateNextBullet) {
      return;
    }

    let bullet = document.createElement("div");
    bullet.classList.add("bullets");

    canCreateNextBullet = false;
    let bulletInterval = setInterval(() => {
      canCreateNextBullet = true;
      clearInterval(bulletInterval);
    }, 2000);

    let moveBullet = setInterval(() => {
      let asteroids = document.getElementsByClassName("asteroids");

      for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i];
        if (asteroid != undefined) {
          let asteroidBound = asteroid.getBoundingClientRect();
          let bulletBound = bullet.getBoundingClientRect();

          if (
            bulletBound.left <= asteroidBound.right &&
            bulletBound.right >= asteroidBound.left &&
            bulletBound.top <= asteroidBound.bottom
          ) {
            asteroid.parentElement.removeChild(asteroid);
            board.removeChild(bullet);
            clearInterval(moveBullet);
            return;
          }
        }
      }
      let bulletBottom = parseInt(
        window.getComputedStyle(bullet).getPropertyValue("bottom")
      );
      if (bulletBottom >= 580) {
        board.removeChild(bullet);
        clearInterval(moveBullet);
        return;
      }
      bullet.style.left = left + 23 + "px";
      bullet.style.bottom = bulletBottom + 3 + "px";
      board.appendChild(bullet);
    });
  }
});

let generateAsteroids = setInterval(() => {
  let asteroid = document.createElement("div");
  asteroid.classList.add("asteroids");
  let asteroidLeft = parseInt(
    window.getComputedStyle(asteroid).getPropertyValue("left")
  );
  asteroid.style.left = Math.floor(Math.random() * 540) + "px";

  board.appendChild(asteroid);
}, 5000);

let moveAsteroids = setInterval(() => {
  let asteroids = document.getElementsByClassName("asteroids");

  if (asteroids != undefined) {
    for (let i = 0; i < asteroids.length; i++) {
      let asteroid = asteroids[i];
      let asteroidTop = parseInt(
        window.getComputedStyle(asteroid).getPropertyValue("top")
      );
      let asteroidBound = asteroid.getBoundingClientRect();
      let shipBound = ship.getBoundingClientRect();
      if (
        asteroidBound.left <= shipBound.right &&
        asteroidBound.right >= shipBound.left &&
        asteroidBound.top <= shipBound.bottom &&
        asteroidBound.bottom >= shipBound.top
      ) {
        alert("Game Over");
        clearInterval(moveAsteroids);
        window.location.reload();
        return;
      }
      if (asteroidTop >= 550) {
        alert("Game Over");
        clearInterval(moveAsteroids);
        window.location.reload();
      }
      asteroid.style.top = asteroidTop + 7 + "px";
    }
  }
}, 100);
