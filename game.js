const ship = document.getElementById("ship");
const board = document.getElementById("board");

let canCreateNextBullet = true; // Can create Ship Bullet
let canCreateNextBullets = true; // Can create Enemy Ship Bullet

const bulletSpeed = 5; // Ship Bullet Speed
const bulletSpeeds = 5; // Enemy Ship Bullet Speed

let bulletDamage = 1; // Bullet Damage
let shootingSpeed = 2000; // Ship Shooting Speed

let shipSpeed = 2; // Ship Speed
let shipHealth = 1; // Ship Health

let asteroidSpawnRate = 1500; // Asteroid Spawn Rate
let asteroidMoveSpeed = 200; // Asteroid Move Speed
let asteroidDestroyedCount = 0; // Asteroids Destroyed Count
let asteroidGenerationInterval; // Asteroids Generation Interval
let asteroidMovementInterval; // Asteroids Movement Interval
let asteroidHealth = 1; // Asteroid Health

let enemyShipGenerationInterval; // Enemy Ship Generation Interval
let enemyShipHealth = 20; // Enemy Ship Health 20
let bossShipHealth = 80; // Boss Ship Health 80

let shootingSpeeds = 1250; // Enemy Ship Shooting Speed
let shootInterval = 1000; // Enemy Ship Shooting Interval

let shootEnemyBulletIntervalID;

let isMovingLeft = true;
let isMovingUp = true;
let intervalId;
let moveDistance = 0;
let moveInterval = 0;
let changeDirectionInterval = 0;

const boundaryWidth = 600; // Width boundar
const boundaryHeight = 500; // Height boundary

let score = 0;
localStorage.setItem("score", score);

// Controller object to manage keys
const controller = {
  37: { pressed: false, functionality: moveShipLeft }, // ArrowLeft
  39: { pressed: false, functionality: moveShipRight }, // ArrowRight
  32: { pressed: false, functionality: shootBullet }, // Space
};

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

          if (health <= 0) {
            score += 100;
            updateScore();
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

    // Check for collision Bullet with Enemy Ship and Boss Ship
    let enemyShips = document.querySelectorAll(".enemyShip, .bossShip");
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

          if (health <= 0) {
            shipHealth++;
            score += 10000;
            updateScore();
            updateShipHealth();
            if (enemyShip.classList.contains("bossShip")) {
              congratulations();
              handleBulletCollision();
            }
            enemyShip.parentElement.removeChild(enemyShip);
            clearInterval(shootEnemyBulletIntervalID);

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
function shootEnemyBullet(bossId) {
  let enemyShips;
  if (bossId == 1) {
    enemyShips = document.getElementsByClassName("enemyShip");
  } else if (bossId == 2) {
    enemyShips = document.getElementsByClassName("bossShip");
  }
  if (enemyShips.length === 0) {
    return;
  }
  let enemyShip = enemyShips[0];

  if (!canCreateNextBullets) return;

  let enemyShipRect = enemyShip.getBoundingClientRect();
  let bulletWidth = 6;
  let bulletHeight = 40;

  let boardRect = board.getBoundingClientRect();

  if (bossId == 1) {
    // Single bullet for Enemy Ship
    createAndShootBullet(
      enemyShipRect.left -
        boardRect.left +
        enemyShipRect.width / 2 -
        bulletWidth / 2,
      enemyShipRect.top -
        boardRect.top +
        enemyShipRect.height / 2 -
        bulletHeight / 2 +
        60,
      bulletWidth,
      bulletHeight
    );
  } else if (bossId == 2) {
    // Double bullet for Boss Ship
    createAndShootBullet(
      enemyShipRect.left - boardRect.left + 25,
      enemyShipRect.top -
        boardRect.top +
        enemyShipRect.height / 2 -
        bulletHeight / 2 +
        60,
      bulletWidth,
      bulletHeight
    );

    createAndShootBullet(
      enemyShipRect.left -
        boardRect.left +
        enemyShipRect.width -
        bulletWidth -
        25,
      enemyShipRect.top -
        boardRect.top +
        enemyShipRect.height / 2 -
        bulletHeight / 2 +
        60,
      bulletWidth,
      bulletHeight
    );
  }

  canCreateNextBullets = false;
  setTimeout(() => {
    canCreateNextBullets = true;
  }, shootingSpeeds);

  // Enemy Ship Bullet Creation
  function createAndShootBullet(
    leftPosition,
    topPosition,
    bulletWidth,
    bulletHeight
  ) {
    let enemyBullet = document.createElement("div");
    enemyBullet.classList.add("enemyBullet");
    enemyBullet.style.position = "absolute";
    enemyBullet.style.left = `${leftPosition}px`;
    enemyBullet.style.top = `${topPosition}px`;
    board.appendChild(enemyBullet);

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

          shipHealth -= bulletDamage;
          updateShipHealth();

          if (shipHealth <= 0) {
            gameOver();
            return;
          }
          return;
        }
      }

      // Enemy Ship Bullet max Height
      if (bulletTop >= board.offsetHeight - bulletHeight) {
        board.removeChild(enemyBullet);
        clearInterval(moveBullet);
        return;
      }

      enemyBullet.style.top = bulletTop + bulletSpeeds + "px"; // Bullet Speed downwards
    }, 20);
  }
}

// Function to Enemy Ship Start Auto Shooting
function startAutomaticShooting(bossId) {
  shootEnemyBulletIntervalID = setInterval(
    shootEnemyBullet,
    shootInterval,
    bossId
  );
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
        (asteroidBound.left <= shipBound.right &&
          asteroidBound.right >= shipBound.left &&
          asteroidBound.top <= shipBound.bottom &&
          asteroidBound.bottom >= shipBound.top) ||
        asteroidTop >= 550
      ) {
        board.removeChild(asteroid);

        shipHealth--;
        updateShipHealth();

        if (shipHealth <= 0) {
          gameOver();
          return;
        }
        return;
      }
      asteroid.style.top = asteroidTop + 7 + "px";
    }
  }, asteroidMoveSpeed);
}

// Function to Generate Enemy Ships
function startGeneratingEnemyShips(bossId) {
  let enemyShip = document.createElement("div");
  if (bossId == 1) {
    enemyShip.classList.add("enemyShip");
    enemyShip.setAttribute("health", enemyShipHealth);
  } else if (bossId == 2) {
    enemyShip.classList.add("bossShip");
    enemyShip.setAttribute("health", bossShipHealth);
  }

  enemyShip.style.left = 240 + "px";
  board.appendChild(enemyShip);
  startAutomaticShooting(bossId);
}

// Function to Move Enemy Ships
function startMovingEnemyShips(bossId) {
  let enemyShips;
  if (bossId == 1) {
    enemyShips = document.getElementsByClassName("enemyShip");
  } else if (bossId == 2) {
    enemyShips = document.getElementsByClassName("bossShip");
  }

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

  // Boss Ship Random Movement
  function changeMovement() {
    isMovingLeft = Math.random() < 0.5; // Randomly decide direction left/right
    isMovingUp = Math.random() < 0.5; // Randomly decide direction up/down
    moveDistance = 2 + Math.random() * 5; /// VERY IMPORTANT /// Random distance between 5 and 25 pixels
    moveInterval = 50 + Math.random() * 100; // VERY IMPORTANT //// Random interval between 50ms and 100ms

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

function spawnBossIf() {
  // Check if X Asteroids have been destroyed
  if (asteroidDestroyedCount == 6) {
    // 6
    triggerMessage(1);
    shootingSpeed = 1700;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 14) {
    // 14
    triggerMessage(1);
    shootingSpeed = 1500;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 22) {
    // 22
    triggerMessage(1);
    shootingSpeed = 1300;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 28) {
    // 28
    triggerMessage(1);
    shootingSpeed = 1100;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 1) {
    // 35
    // Stop Asteroid intervals
    clearInterval(asteroidGenerationInterval);
    clearInterval(asteroidMovementInterval);

    let asteroids = document.getElementsByClassName("asteroids");
    while (asteroids.length > 0) {
      asteroids[0].remove();
    }
    asteroidSpawnRate = 1250;
    asteroidMoveSpeed = 150;
    asteroidHealth = 2;

    shootInterval = 1350;

    triggerMessage(2);
    startGeneratingEnemyShips(1);
    startMovingEnemyShips(1);
  } else if (asteroidDestroyedCount == 39) {
    // 39
    triggerMessage(1);
    shootingSpeed = 700;
    shipSpeed = 3;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 48) {
    // 48
    triggerMessage(1);
    shootingSpeed = 400;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 57) {
    // 57
    triggerMessage(1);
    shootingSpeed = 250;
    updateShipAttackSpeed();
  } else if (asteroidDestroyedCount == 65) {
    // 65
    // Stop Asteroid intervals
    clearInterval(asteroidGenerationInterval);
    clearInterval(asteroidMovementInterval);

    let asteroids = document.getElementsByClassName("asteroids");
    while (asteroids.length > 0) {
      asteroids[0].remove();
    }

    shootInterval = 750;

    triggerMessage(2);
    startGeneratingEnemyShips(2);
    startMovingEnemyShips(2);
  }
}

// Event Messages
function triggerMessage(messageId) {
  let message;
  if (messageId == 1) {
    message = document.getElementById("upgradeMessage");
  } else if (messageId == 2) {
    message = document.getElementById("bossMessage");
  }
  if (message) {
    message.classList.remove("hidden");
    message.classList.add("show");
    setTimeout(() => {
      message.classList.remove("show");
      setTimeout(() => {
        message.classList.add("hidden");
      }, 500);
    }, 2000);
  }
}

// Update Score
function updateScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = `Score: ${score}`;
  localStorage.setItem("score", score);
}

// Update Ship Health
function updateShipHealth() {
  const healthElement = document.getElementById("shipHealth");
  healthElement.textContent = `Health: ${shipHealth}`;
}

// Update Ship Attack Speed
function updateShipAttackSpeed() {
  const attackSpeedElement = document.getElementById("shipAttackSpeed");
  attackSpeedElement.textContent = `Attack Speed: ${shootingSpeed}`;
}

// Game Over
function gameOver() {
  clearInterval(shootEnemyBulletIntervalID);
  clearInterval(asteroidGenerationInterval);
  clearInterval(asteroidMovementInterval);
  localStorage.setItem("score", score);
  window.location.href = "gameover.html";
}

// Congratulations
function congratulations() {
  clearInterval(shootEnemyBulletIntervalID);
  clearInterval(asteroidGenerationInterval);
  clearInterval(asteroidMovementInterval);
  localStorage.setItem("score", score);
  window.location.href = "congratulations.html";
}

startGeneratingAsteroids();
startMovingAsteroids();
