const ship = document.getElementById("ship");
const board = document.getElementById("board");

let canCreateNextBullet = true; // Can create Ship Bullet
let canCreateNextBullets = true; // Can create Enemy Ship Bullet

const bulletSpeed = 5; // Ship Bullet Speed
const bulletSpeeds = 5; // Enemy Ship Bullet Speed

let bulletDamage = 1; // Bullet Damage
let shootingSpeed = 500; // Ship Shooting Speed
let shootingSpeeds = 500; // Enemy Ship Shooting Speed

let shipSpeed = 2; // Ship Speed
let shipHealth = 1; // Ship Health

let asteroidSpawnRate = 1250; // Asteroid Spawn Rate
let asteroidMoveSpeed = 200; // Asteroid Move Speed
let asteroidDestroyedCount = 0; // Asteroids Destroyed Count
let asteroidGenerationInterval; // Asteroids Generation Interval
let asteroidMovementInterval; // Asteroids Movement Interval
let asteroidHealth = 2; // Asteroid Health

let enemyShipGenerationInterval; // Enemy Ship Generation Interval
let enemyShipHealth = 25; // Enemy Ship Health

const shootInterval = 2000; // Enemy Ship Shooting Interval

// Controller object to manage keys
const controller = {
  37: { pressed: false, functionality: moveShipLeft }, // ArrowLeft
  39: { pressed: false, functionality: moveShipRight }, // ArrowRight
  32: { pressed: false, functionality: shootBullet }, // Space
};

function spawnBossIf() {
  // Check if X Asteroids have been destroyed
  if (asteroidDestroyedCount >= 10) {
    // Stop Asteroid intervals
    clearInterval(asteroidGenerationInterval);
    clearInterval(asteroidMovementInterval);

    let asteroids = document.getElementsByClassName("asteroids");
    while (asteroids.length > 0) {
      asteroids[0].remove();
    }

    startGeneratingEnemyShips();
    startMovingEnemyShips();

    asteroidDestroyedCount = 0;
    return;
  }
}
// Function to move Ship Left
function moveShipLeft() {
  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  if (left > 2) {
    ship.style.left = left - shipSpeed + "px";
  }
}

// Function to move Ship Right
function moveShipRight() {
  let left = parseInt(window.getComputedStyle(ship).getPropertyValue("left"));
  if (left < 548) {
    ship.style.left = left + shipSpeed + "px";
  }
}

// Function to Shoot a Bullet
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

  // Move Bullet Up
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

          console.log("asteroidhp" + health);
          if (health <= 0) {
            asteroid.parentElement.removeChild(asteroid);
            asteroidDestroyedCount++;
            spawnBossIf();
          } else {
            asteroid.setAttribute("health", health);
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

          console.log("enemyshiphp" + health);
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

    // Ship Bullet max Height
    if (bulletBottom >= board.offsetHeight - 25) {
      board.removeChild(bullet);
      clearInterval(moveBullet);
      return;
    }

    bullet.style.bottom = bulletBottom + bulletSpeed + "px"; // Bullet Speed upwards
  });
}

// Function to Enemy Ship Shoot a Bullet
function shootEnemyBullet() {
  ship.setAttribute("health", shipHealth);
  let enemyShips = document.getElementsByClassName("enemyShip");
  if (enemyShips.length === 0) {
    return;
  }
  let enemyShip = enemyShips[0];

  if (!canCreateNextBullets) return;

  let enemyShipRect = enemyShip.getBoundingClientRect();
  let enemyBullet = document.createElement("div");
  enemyBullet.classList.add("enemyBullet");
  let bulletWidth = 6;
  let bulletHeight = 40;

  // Change bullet's horizontal position
  enemyBullet.style.left = `${
    enemyShipRect.left + enemyShipRect.width / 2 - bulletWidth / 2 - 445
  }px`;

  // Change bullet's vertical position
  enemyBullet.style.top = `${
    enemyShipRect.top + enemyShipRect.height / 2 - bulletHeight / 2 + 15
  }px`;

  board.appendChild(enemyBullet);

  canCreateNextBullets = false;
  setTimeout(() => {
    canCreateNextBullets = true;
  }, shootingSpeeds);

  // Move Bullet Down
  let moveBullet = setInterval(() => {
    let bulletTop = parseInt(
      window.getComputedStyle(enemyBullet).getPropertyValue("top")
    );

    // Check for collision Bullet with Ship
    let ship = document.getElementById("ship");
    if (ship) {
      let shipBound = ship.getBoundingClientRect();
      let bulletBound = enemyBullet.getBoundingClientRect();

      if (
        bulletBound.left <= shipBound.right &&
        bulletBound.right >= shipBound.left &&
        bulletBound.bottom >= shipBound.top
      ) {
        board.removeChild(enemyBullet);
        clearInterval(moveBullet);
        let health = parseInt(ship.getAttribute("health"));

        health -= bulletDamage;
        console.log("shiphp" + health);
        if (health <= 0) {
          gameOver();
          return;
        } else {
          ship.setAttribute("health", health);
        }
        return;
      }
    }

    // Enemy Ship Bullet max Height
    if (bulletTop >= board.offsetHeight - 34) {
      board.removeChild(enemyBullet);
      clearInterval(moveBullet);
      return;
    }

    enemyBullet.style.top = bulletTop + bulletSpeeds + "px"; // Bullet Speed downwards
  }, 20);
}

// Function to Enemy Ship Start Auto Shooting
function startAutomaticShooting() {
  console.log("Starting automatic shooting...");
  setInterval(shootEnemyBullet, shootInterval); // Shooting every 1000ms
}

// Event listener Keydown
document.addEventListener("keydown", (e) => {
  if (controller[e.keyCode]) {
    controller[e.keyCode].pressed = true;
  }
});

// Event listener Keyup
document.addEventListener("keyup", (e) => {
  if (controller[e.keyCode]) {
    controller[e.keyCode].pressed = false;
  }
});

// Function to execute Key actions
function executeMoves() {
  Object.keys(controller).forEach((key) => {
    if (controller[key].pressed) {
      controller[key].functionality();
    }
  });
}

// Animation Loop
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

// Function to Move Asteroids
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

// Function to Generate Enemy Ships
function startGeneratingEnemyShips() {
  let enemyShip = document.createElement("div");
  enemyShip.classList.add("enemyShip");
  enemyShip.style.left = 240 + "px";
  enemyShip.setAttribute("health", enemyShipHealth);
  board.appendChild(enemyShip);
  startAutomaticShooting();
}

let isMovingLeft = true;
let isMovingUp = true;
let intervalId;
let moveDistance = 0;
let moveInterval = 0;
let changeDirectionInterval = 0;

const boundaryWidth = 600; // Width boundar
const boundaryHeight = 500; // Height boundary

function startMovingEnemyShips() {
  let enemyShips = document.getElementsByClassName("enemyShip");

  if (enemyShips.length === 0) {
    return;
  }

  let enemyShip = enemyShips[0];
  let enemyShipLeft = parseInt(
    window.getComputedStyle(enemyShip).getPropertyValue("left"),
    10
  );
  let enemyShipTop = parseInt(
    window.getComputedStyle(enemyShip).getPropertyValue("top"),
    10
  );

  function updatePosition() {
    if (isMovingLeft) {
      enemyShipLeft -= moveDistance;
    } else {
      enemyShipLeft += moveDistance;
    }

    if (isMovingUp) {
      enemyShipTop -= moveDistance;
    } else {
      enemyShipTop += moveDistance;
    }

    // Boundary checks
    if (enemyShipLeft < 0) {
      enemyShipLeft = 0;
      isMovingLeft = !isMovingLeft;
    } else if (enemyShipLeft + enemyShip.offsetWidth > boundaryWidth) {
      enemyShipLeft = boundaryWidth - enemyShip.offsetWidth;
      isMovingLeft = !isMovingLeft;
    }

    if (enemyShipTop < 0) {
      enemyShipTop = 0;
      isMovingUp = !isMovingUp;
    } else if (enemyShipTop + enemyShip.offsetHeight > boundaryHeight) {
      enemyShipTop = boundaryHeight - enemyShip.offsetHeight;
      isMovingUp = !isMovingUp;
    }
    enemyShip.style.left = enemyShipLeft + "px";
    enemyShip.style.top = enemyShipTop + "px";
  }

  function changeMovement() {
    isMovingLeft = Math.random() < 0.5; // Randomly decide direction left/right
    isMovingUp = Math.random() < 0.5; // Randomly decide direction up/down
    moveDistance = 1 + Math.random() * 5; /// VERY IMPORTANT /// Random distance between 5 and 25 pixels
    moveInterval = 50 + Math.random() * 50; // VERY IMPORTANT //// Random interval between 50ms and 100ms

    if (intervalId) {
      clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
      updatePosition();
    }, moveInterval);

    // VERY IMPORTANT //// Schedule next direction change
    setTimeout(changeMovement, 1000 + Math.random() * 2000);
  }
  changeMovement();
}
startGeneratingAsteroids();
startMovingAsteroids();
