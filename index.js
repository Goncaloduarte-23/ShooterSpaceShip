const ship = document.getElementById("ship");
const board = document.getElementById("board");
let canCreateNextBullet = true;

const bulletSpeed = 5; // Bullet Speed
let bulletDamage = 1; // Bullet Damage
let shootingSpeed = 1000; // Shooting Speed

let shipSpeed = 2; // Ship Speed

let asteroidSpawnRate = 2000; // Asteroid Spawn Rate
let asteroidMoveSpeed = 100; // Asteroid Move Speed
let asteroidDestroyedCount = 0; // Asteroids Destroyed Count
let asteroidGenerationInterval; // Asteroids Generation Interval
let asteroidMovementInterval; // Asteroids Movement Interval
let asteroidHealth = 1; // Asteroid Health

const enemyShipSpawnRate = 500; // Enemy Ship Spawn Rate
const enemyShipMoveSpeed = 300; // Enemy Ship Movement Rate
let enemyShipGenerationInterval; // Enemy Ship Generation Interval
let enemyShipHealth = 10; // Enemy Ship Health

// Controller object to manage keys
const controller = {
  37: { pressed: false, functionality: moveShipLeft }, // ArrowLeft
  39: { pressed: false, functionality: moveShipRight }, // ArrowRight
  32: { pressed: false, functionality: shootBullet }, // Space
};

function spawnBossIf() {
  // Check if 20 asteroids have been destroyed
  if (asteroidDestroyedCount >= 0) {
    // Stop asteroid intervals
    clearInterval(asteroidGenerationInterval);
    clearInterval(asteroidMovementInterval);

    let asteroids = document.getElementsByClassName("asteroids");
    while (asteroids.length > 0) {
      asteroids[0].remove();
    }
    // Start generating enemy ships
    startGeneratingEnemyShips();
    startMovingEnemyShips();

    asteroidDestroyedCount = 0;
    return;
  }
}
// Function to move ship left
function moveShipLeft() {
  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  if (left > 2) {
    ship.style.left = left - shipSpeed + "px";
  }
}

// Function to move ship right
function moveShipRight() {
  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  if (left < 548) {
    ship.style.left = left + shipSpeed + "px";
  }
}

// Function to shoot a bullet
function shootBullet() {
  if (!canCreateNextBullet) return;

  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  let bullet = document.createElement("div");
  bullet.classList.add("bullets");
  bullet.style.left =
    left + ship.offsetWidth / 2 - bullet.offsetWidth / 2 - 3 + "px"; // Center bullet on ship
  bullet.style.bottom = "35px"; // Initial position just above the ship

  canCreateNextBullet = false;
  let bulletInterval = setInterval(() => {
    canCreateNextBullet = true;
    clearInterval(bulletInterval);
  }, shootingSpeed);

  board.appendChild(bullet);
  let moveBullet = setInterval(() => {
    let bulletBottom = parseInt(
      window.getComputedStyle(bullet).getPropertyValue("bottom")
    );

    // Check for collision Bullet with Asteroid
    let asteroids = document.getElementsByClassName("asteroids");
    for (let i = 0; i < asteroids.length; i++) {
      let asteroid = asteroids[i];
      if (asteroid) {
        let asteroidBound = asteroid.getBoundingClientRect();
        let bulletBound = bullet.getBoundingClientRect();

        if (
          bulletBound.left <= asteroidBound.right &&
          bulletBound.right >= asteroidBound.left &&
          bulletBound.top <= asteroidBound.bottom
        ) {
          let health = parseInt(asteroid.getAttribute("health"));
          health -= bulletDamage;
          console.log(health);
          if (health <= 0) {
            asteroid.parentElement.removeChild(asteroid);
            asteroidDestroyedCount++;
            spawnBossIf();
          }
          board.removeChild(bullet);
          clearInterval(moveBullet);
          return;
        }
      }
    }

    // Check for collision Bullet with Enemy Ship
    let enemyShips = document.getElementsByClassName("enemyShip");
    for (let i = 0; i < enemyShips.length; i++) {
      let enemyShip = enemyShips[i];
      if (enemyShip) {
        let enemyShipBound = enemyShip.getBoundingClientRect();
        let bulletBound = bullet.getBoundingClientRect();

        if (
          bulletBound.left <= enemyShipBound.right &&
          bulletBound.right >= enemyShipBound.left &&
          bulletBound.top <= enemyShipBound.bottom
        ) {
          board.removeChild(bullet);
          clearInterval(moveBullet);
          let health = parseInt(enemyShip.getAttribute("health"));
          health -= bulletDamage;
          console.log(health);
          if (health <= 0) {
            enemyShip.parentElement.removeChild(enemyShip);
            startGeneratingAsteroids();
            startMovingAsteroids();
          } else {
            enemyShip.setAttribute("health", health);
          }
          return;
        }
      }
    }

    // Move bullet
    if (bulletBottom >= board.offsetHeight - 20) {
      board.removeChild(bullet);
      clearInterval(moveBullet);
      return;
    }

    bullet.style.bottom = bulletBottom + bulletSpeed + "px"; // Bullet Speed upwards
  });
}

// Event listener keydown
document.addEventListener("keydown", (e) => {
  if (controller[e.keyCode]) {
    controller[e.keyCode].pressed = true;
  }
});

// Event listener keyup
document.addEventListener("keyup", (e) => {
  if (controller[e.keyCode]) {
    controller[e.keyCode].pressed = false;
  }
});

// Function to execute key actions
function executeMoves() {
  Object.keys(controller).forEach((key) => {
    if (controller[key].pressed) {
      controller[key].functionality();
    }
  });
}

// Animation loop
function animate() {
  executeMoves();
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate); // Start animation loop

// Game Over
function gameOver() {
  alert("Game Over");
  clearInterval(moveAsteroids);
  window.location.reload();
}

// Generate Asteroids
function startGeneratingAsteroids() {
  asteroidGenerationInterval = setInterval(() => {
    let asteroid = document.createElement("div");
    asteroid.classList.add("asteroids");
    asteroid.style.left = Math.floor(Math.random() * 550) + "px";
    asteroid.setAttribute("health", asteroidHealth);
    board.appendChild(asteroid);
  }, asteroidSpawnRate);
}

// Function to move asteroids
function startMovingAsteroids() {
  asteroidMovementInterval = setInterval(() => {
    let asteroids = document.getElementsByClassName("asteroids");

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
        gameOver();
        return;
      }
      if (asteroidTop >= 550) {
        gameOver();
      }
      asteroid.style.top = asteroidTop + 7 + "px";
    }
  }, asteroidMoveSpeed);
}

// Function to generate enemy ships
function startGeneratingEnemyShips() {
  let enemyShip = document.createElement("div");
  enemyShip.classList.add("enemyShip");
  enemyShip.style.left = 240 + "px";
  enemyShip.setAttribute("health", enemyShipHealth);
  board.appendChild(enemyShip);
}

// Function to move enemy ships
function startMovingEnemyShips() {
  setInterval(() => {
    let enemyShips = document.getElementsByClassName("enemyShip");

    for (let i = 0; i < enemyShips.length; i++) {
      let enemyShip = enemyShips[i];
      let enemyShipTop = parseInt(
        window.getComputedStyle(enemyShip).getPropertyValue("top")
      );
      let enemyShipBound = enemyShip.getBoundingClientRect();
      let shipBound = ship.getBoundingClientRect();

      if (
        enemyShipBound.left <= shipBound.right &&
        enemyShipBound.right >= shipBound.left &&
        enemyShipBound.top <= shipBound.bottom &&
        enemyShipBound.bottom >= shipBound.top
      ) {
        gameOver();
        return;
      }

      if (enemyShipTop >= 480) {
        enemyShip.remove();
      } else {
        enemyShip.style.top = enemyShipTop + 7 + "px";
      }
    }
  }, enemyShipMoveSpeed);
}

// Start the game by generating and moving asteroids
startGeneratingAsteroids();
startMovingAsteroids();
