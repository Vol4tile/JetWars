let characterX = 0;
let characterY = 0;
let isMovingRight = false;
let isMovingLeft = false;
let isMovingUp = false;
let isMovingDown = false;
let enemies = [];
let bullets = [];
let score = 0;
let canShoot = true;
let gameOver = false; // Oyun devam ediyor mu?
const shotTime = 300;

const character = document.getElementById("character");
const scene = document.getElementById("scene");
const scoreDisplay = document.getElementById("score");

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight" && !gameOver) {
    isMovingRight = true;
  } else if (event.key === "ArrowLeft" && !gameOver) {
    isMovingLeft = true;
  } else if (event.key === "ArrowUp" && !gameOver) {
    isMovingUp = true;
  } else if (event.key === "ArrowDown" && !gameOver) {
    isMovingDown = true;
  } else if (event.key === " " && canShoot && !gameOver) {
    // Space tuşu ile ateş etme (ve ateş hızını sınırlama)
    fireBullet();
    canShoot = false; // Ateş ettikten sonra ateş hızını sınırla
    setTimeout(() => {
      canShoot = true; // Belirli bir süre sonra tekrar ateşe izin ver
    }, shotTime); // 500ms (yarım saniye) ateş hızı sınırlaması
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowRight") {
    isMovingRight = false;
  } else if (event.key === "ArrowLeft") {
    isMovingLeft = false;
  } else if (event.key === "ArrowUp") {
    isMovingUp = false;
  } else if (event.key === "ArrowDown") {
    isMovingDown = false;
  }
});

function moveCharacter() {
  if (isMovingRight && characterX < scene.clientWidth - character.clientWidth) {
    characterX += 5;
  }

  if (isMovingLeft && characterX > 0) {
    characterX -= 5;
  }

  if (isMovingUp && characterY < scene.clientHeight - character.clientHeight) {
    characterY += 5;
  }

  if (isMovingDown && characterY > 0) {
    characterY -= 5;
  }

  character.style.left = characterX + "px";
  character.style.bottom = characterY + "px";

  requestAnimationFrame(moveCharacter);
}
function createEnemy() {
  if (gameOver) {
    return false;
  }

  const enemy = document.createElement("div");
  enemy.className = "enemy";

  // Rastgele bir yükseklik değeri oluşturun
  const randomHeight = Math.floor(Math.random() * scene.clientHeight); // 0 ile sahne yüksekliği (clientHeight) arasında rastgele bir yükseklik

  // Düşmana başlangıç yüksekliğini ayarlayın
  enemy.style.bottom = randomHeight + "px";

  // Rastgele bir animasyon süresi oluşturun (örneğin, 2 ila 5 saniye arasında)
  const animationDuration = Math.random() * 3 + 2 + "s"; // Saniye cinsinden

  // Rastgele bir animasyon adı oluşturun
  const animationName = "enemyMove" + Date.now(); // Benzersiz bir isim animasyonların karışmaması için

  // Düşmanın animasyonunu tanımlayın
  const keyframes = `
    @keyframes ${animationName} {
      0% {
        left: 100%;
        transform: translateY(0);
      }
      50% {
        left: 50%;
        transform: translateY(${
          Math.random() > 0.5 ? 100 : -100
        }px); /* Rastgele yukarı veya aşağı hareket */
      }
      100% {
        left: -160px;
        transform: translateY(0);
      }
    }
  `;

  // Stili başa ekleyin ve animasyon süresini ve adını ayarlayın
  const style = document.createElement("style");
  style.innerHTML = keyframes;
  document.head.appendChild(style);

  // Animasyonu düşmana uygulayın
  enemy.style.animation = `${animationName} ${animationDuration} linear infinite`;

  scene.appendChild(enemy);
  enemies.push(enemy);

  const fireProbability = Math.random();
  if (fireProbability < 0.9) {
    // Örneğin, düşmanların yaklaşık %20'si ateş edebilir
    fireEnemyBullet(enemy);
  }
}

function moveEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    if (gameOver) continue; // Oyun sona erdiyse düşmanlar hareket etmesin
    // Düşmanın x konumu
    let enemyX = parseInt(
      window.getComputedStyle(enemy).getPropertyValue("left")
    );

    if (enemyX <= -100) {
      enemy.remove();
      enemies.splice(i, 1);
      i--; // Diziden bir öğe kaldırdık
      continue;
    } else {
      // Sadece oyuncu mermileri ile çarpışma kontrolü yapın
      for (let j = 0; j < bullets.length; j++) {
        let bullet = bullets[j];
        if (!bullet.classList.contains("enemy-bullet") && isCollision(bullet, enemy)) {
          enemy.remove();
          enemies.splice(i, 1);
          bullet.remove();
          bullets.splice(j, 1);
          score += 1;
          updateScore();
        }
      }

      // Düşman mermilerinin karaktere isabet etmesini kontrol edin
      for (let j = 0; j < bullets.length; j++) {
        let bullet = bullets[j];
        if (bullet.classList.contains("enemy-bullet") && isCollision(bullet, character)) {
          bullet.remove();
          bullets.splice(j, 1);
          // Karakterin canını 5 azaltın
          decreasePlayerHealth(20);
        }
      }
    }
  }
  requestAnimationFrame(moveEnemies);
}
function decreasePlayerHealth(amount) {
  // Can miktarını azaltın
  playerHealth -= amount;
  
  // Can miktarını ekranda güncelleyin
  updatePlayerHealth();
  
  // Eğer can sıfırsa oyunu bitirin
  if (playerHealth <= 0) {
    endGame();
  }
}

// Karakterin canını güncelleyen fonksiyon
function updatePlayerHealth() {
  playerHealthDisplay.innerText = "Health: " + playerHealth;
}

// Oyuncunun başlangıç can miktarı
let playerHealth = 100;

// Canı ekranda gösteren element
const playerHealthDisplay = document.getElementById("health");

function fireBullet() {
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.position = "absolute";
  bullet.style.left = characterX + 65 + "px"; // Karakterin sağ kenarından çıkması için
  bullet.style.bottom = characterY + 25 + "px"; // Karakterin ortasından çıkması için
  scene.appendChild(bullet);
  bullets.push(bullet);
}
function fireEnemyBullet(enemy) {
  const bullet = document.createElement("div");
  bullet.className = "enemy-bullet";
  bullet.style.position = "absolute";

  const enemyStyles = window.getComputedStyle(enemy);
  let enemyX = parseInt(enemyStyles.getPropertyValue("left"));
  let enemyY = parseInt(enemyStyles.getPropertyValue("bottom"));
  bullet.style.left = enemyX - 65 + "px"; // Karakterin sağ kenarından çıkması için
  bullet.style.bottom = enemyY + 25 + "px"; // Karakterin ortasından çıkması için
  scene.appendChild(bullet);
  bullets.push(bullet);
  console.log(bullet);
}

function moveBullets() {
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    const bulletStyles = window.getComputedStyle(bullet);
    let bulletX = parseInt(bulletStyles.getPropertyValue("left"));
    console.log(bulletX);
    if (bullet.classList.contains("enemy-bullet")) {
      // Düşman mermileri sola doğru hareket etmeli
      if (bulletX <= 0) {
        bullet.remove();
        bullets.splice(i, 1);
      } else {
        bulletX -= 20;
        bullet.style.left = bulletX + "px";
      }
    } else {
      // Oyuncu mermileri sağa doğru hareket etmeli
      if (bulletX >= scene.clientWidth) {
        bullet.remove();
        bullets.splice(i, 1);
      } else {
        bulletX += 20;
        bullet.style.left = bulletX + "px";
      }
    }
  }
  requestAnimationFrame(moveBullets);
}

function updateScore() {
  scoreDisplay.innerText = "Score: " + score;
  
}

// İki elementin çarpışıp çarpışmadığını kontrol eden fonksiyon
function isCollision(element1, element2) {
  let rect1 = element1.getBoundingClientRect();
  let rect2 = element2.getBoundingClientRect();

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function endGame() {
  // Oyunu bitirme işlemleri burada gerçekleştirilebilir
  // Örneğin, bir oyun sonu mesajı gösterilebilir veya oyunu yeniden başlatmak için bir düğme ekleyebilirsiniz.
  alert("Oyun bitti! Skorunuz: " + score);
  gameOver = true;
  clearInterval(interval);
}

moveCharacter();
let interval = setInterval(createEnemy, 1000); // Belirli aralıklarla düşman oluşturma
moveEnemies();
moveBullets();
updateScore();
