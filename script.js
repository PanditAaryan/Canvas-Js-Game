const canvas = document.querySelector(".gameScreen");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;


//References to elements in HTML

const score = document.querySelector('#score');
const startGame = document.querySelector('#startGame')
const menu = document.querySelector('#menu')
const finalScore = document.querySelector('#finalScore')
const level = document.querySelector('#level')

//Creating Classes - Player, Enemy, Laser, Projectile

class Player {
  constructor(x, y, rad, colour) {
    this.x = x;
    this.y = y;
    this.radius = rad;
    this.color = colour;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class LaserProjectile {
  constructor(x, y, rad, colour, velocity) {
    this.x = x;
    this.y = y;
    this.radius = rad;
    this.color = colour;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, rad, colour, velocity) {
    this.x = x;
    this.y = y;
    this.radius = rad;
    this.color = colour;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const friction = 0.98
class Particle {
  constructor(x, y, rad, colour, velocity) {
    this.x = x;
    this.y = y;
    this.radius = rad;
    this.color = colour;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore()
  }

  update() {
    this.draw();
    this.velocity.x*=friction;
    this.velocity.y*=friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01
  }
}


//Global variables

const posX = canvas.width / 2;
const posY = canvas.height / 2;

let player = new Player(posX, posY, 15, "white");
let laser = [];
let enemies = [];
let particles = [];
let count = 0
let spawntime = 1000
let levelText = 0

//Initialization

function init() {
  player = new Player(posX, posY, 15, "white");
  laser = [];
  enemies = [];
  particles = [];
  count = 0
  spawntime = 1000
  levelText = 0
  score.innerHTML = 0
  finalScore.innerHeight = 0
  level.innerHTML = 0
}

//Function to Spawn Enemies
function spawnEnemy(spawntime) {
  setInterval(function () {
    let x;
    let y;
    const radius = Math.random() * (30 - 8) + 8;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      const y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    
    const color = `hsl(${Math.random() * 360}, 50%, 60%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, spawntime);
}

//Function to Update Levels
function levelUpdate(levelText) {
  if (count>=2000 && count<=2200) {
    levelText = 1
    level.innerHTML = levelText
    spawntime = 900
      setTimeout(() => {
        level.style.color = "rgb(252, 226, 42)"
        level.style.fontSize = "large"
      }, 100);
  }
  if (count>=5000 && count<=5200) {
    levelText = 2
    level.innerHTML = levelText
    spawntime = 750
      setTimeout(() => {
        level.style.color = "rgb(249, 74, 41)"
        level.style.fontSize = "x-large"
      }, 100);
  }
  if (count>=10000 && count<=10200) {
    levelText = 3
    level.innerHTML = levelText
    spawntime = 600
      setTimeout(() => {
        level.style.color = "rgb(214, 19, 85)"
        level.style.fontSize = "xx-large"
      }, 100);
  }
}

//Main Animation Function
let frameId;
function animate() {
  frameId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  //Fading Particles From Explosion
  particles.forEach((particle, i) =>{
    particle.update()
    if (particle.alpha<0.01) {
        particles.splice(i,1)
    } else {
        particle.update()}
  })

  //Shooting and Deleting Laser Projectiles
  laser.forEach((laserProjectile, i) => {
    laserProjectile.update();

    if (
      laserProjectile.x + laserProjectile.radius < 0 ||
      laserProjectile.x - laserProjectile.radius > canvas.width ||
      laserProjectile.y + laserProjectile.radius < 0 ||
      laserProjectile.y - laserProjectile.radius > canvas.height
    ) {
      setTimeout(() => {
        laser.splice(i, 1);
      }, 0);
    }
  });

  //Enemies Finding Player
  enemies.forEach((enemy, i) => {
    enemy.update();
    const dis = Math.hypot(
      enemy.x - canvas.width / 2,
      enemy.y - canvas.height / 2
    );

    // ENEMY touhces PLAYER -> Game ends.
    if (dis - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(frameId);
      menu.style.display = "flex"
      finalScore.innerHTML = count
    } 

    // When ENEMY touches LASER
    laser.forEach((laserProjectile, itr) => {
      const dis = Math.hypot(
        laserProjectile.x - enemy.x,
        laserProjectile.y - enemy.y
      );

      if (dis - enemy.radius - laserProjectile.radius < 1) {
        //Spawn Particle Explosion
        for (let i = 0; i < 8; i++) {
          particles.push(
            new Particle(laserProjectile.x, laserProjectile.y, Math.random()*2.5, enemy.color, {
              x: (Math.random()*6)*(Math.random()-0.5), 
              y: (Math.random()*6)*(Math.random()-0.5) })
          );
        }
        if (enemy.radius > 18) {
            count+=100
            score.innerHTML = count 
            gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            laser.splice(itr, 1);
          }, 0);
        } else {
          count+=200
          score.innerHTML = count  
          score.style.color = "rgb(250, 78, 171)"
          score.style.fontSize = "x-large"
          setTimeout(() => {
            enemies.splice(i, 1);
            laser.splice(itr, 1);
          }, 0);
          setTimeout(() => {
            score.style.color = "rgba(255,255,255)"
            score.style.fontSize = "large"
          }, 100);
        }
      }
    });
  });

  //Updation of Level
  levelUpdate(levelText)
}

//Event Listeners
window.addEventListener("click", function (e) {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  laser.push(
    new LaserProjectile(
      canvas.width / 2, canvas.height / 2, 5, "white", velocity)
    );
});

//(Re)Start event
startGame.addEventListener("click", function (e) {
  init()
  animate()
  spawnEnemy(spawntime)
  menu.style.display = 'none'
})