'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const hexToRgb = hex => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle, color = '#fff') {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.color = color;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

// ── Estrella fugaz ────────────────────────────────────────────────────────────
const SHOOTING_STAR_SPEED    = 240;      // px/s, más rápida que un asteroide normal
const SHOOTING_STAR_TTL      = 7;        // segundos antes de desaparecer
const SHOOTING_STAR_POINTS   = 150;
const SHOOTING_STAR_COLOR    = '#ffd94d';
const SHOOTING_STAR_INTERVAL = 12;       // segundos entre apariciones
const SHOOTING_STAR_BLINK    = 2;        // últimos segundos con parpadeo

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.points = POINTS[size];
    this.isShootingStar = false;
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// Bonus rápido que desaparece con el tiempo y no se divide
class ShootingStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 1);
    this.isShootingStar = true;
    this.points = SHOOTING_STAR_POINTS;
    this.ttl = SHOOTING_STAR_TTL;
    this.expired = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SHOOTING_STAR_SPEED + rand(-20, 20);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0 && !this.dead) {
      this.dead = true;
      this.expired = true;
    }
  }

  split() {
    return [];
  }

  draw() {
    // Parpadeo antes de desaparecer
    if (this.ttl < SHOOTING_STAR_BLINK && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    // Estela en dirección contraria al movimiento
    ctx.strokeStyle = SHOOTING_STAR_COLOR;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-this.vx * 0.12, -this.vy * 0.12);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.rotate(this.rot);
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Skins ─────────────────────────────────────────────────────────────────────
// Cada silueta son vértices en coordenadas locales: nariz hacia +x, centro en (0,0).
const SKIN_STORAGE_KEY = 'asteroids.skin';

const SKINS = [
  {
    id: 'classic',
    name: 'CLÁSICA',
    color: '#ffffff',
    shape: [[20, 0], [-12, -9], [-7, 0], [-12, 9]],
  },
  {
    id: 'interceptor',
    name: 'INTERCEPTOR',
    color: '#a6ff4d',
    shape: [[22, 0], [-8, -5], [-2, 0], [-8, 5]],
  },
  {
    id: 'freighter',
    name: 'CARGUERO',
    color: '#ffb347',
    shape: [[12, 0], [7, -5], [7, -10], [-14, -10], [-10, 0], [-14, 10], [7, 10], [7, 5]],
  },
  {
    id: 'stealth',
    name: 'SIGILOSA',
    color: '#ff5ec4',
    shape: [[16, 0], [-15, -12], [-4, 0], [-15, 12]],
  },
];

let skinIndex = 0;

function getSkin() {
  return SKINS[skinIndex];
}

// Extremos de la silueta: punta (ancla del disparo) y cola (ancla de la llama)
function extremes(shape) {
  const xs = shape.map(p => p[0]);
  return { nose: Math.max(...xs), tail: Math.min(...xs) };
}

// Contorno cerrado de la silueta en el path actual (no dibuja: cada sitio
// define su propio grosor y color)
function traceShape(shape) {
  ctx.beginPath();
  ctx.moveTo(shape[0][0], shape[0][1]);
  for (let i = 1; i < shape.length; i++)
    ctx.lineTo(shape[i][0], shape[i][1]);
  ctx.closePath();
}

function cycleSkin() {
  skinIndex = (skinIndex + 1) % SKINS.length;
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, getSkin().id);
  } catch (e) { /* sin persistencia disponible */ }
}

function loadSkin() {
  try {
    const saved = localStorage.getItem(SKIN_STORAGE_KEY);
    const index = SKINS.findIndex(s => s.id === saved);
    if (index !== -1) skinIndex = index;
  } catch (e) { /* sin persistencia disponible */ }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedBoostTtl = 0;
    this.tripleShotTtl = 0;
    this.dead          = false;
  }

  // Color del power-up activo, o null si no hay ninguno
  activeColor() {
    if (this.speedBoostTtl > 0) return SPEED_POWERUP_COLOR;
    if (this.tripleShotTtl > 0) return TRIPLE_SHOT_COLOR;
    return null;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;
    const thrustMult = this.speedBoostTtl > 0 ? SPEED_MULTIPLIER : 1;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * thrustMult * dt;
      this.vy += Math.sin(this.angle) * THRUST * thrustMult * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    if (this.speedBoostTtl > 0) this.speedBoostTtl -= dt;
    if (this.tripleShotTtl > 0) this.tripleShotTtl -= dt;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const { nose } = extremes(getSkin().shape);
    const ox = this.x + Math.cos(this.angle) * nose;
    const oy = this.y + Math.sin(this.angle) * nose;
    const bulletColor = getSkin().color;

    if (this.tripleShotTtl <= 0) return [new Bullet(ox, oy, this.angle, bulletColor)];

    // Abanico: bala al centro + 2 laterales a ±TRIPLE_SHOT_SPREAD
    return [0, -1, 1].map(dir => new Bullet(ox, oy, this.angle + dir * TRIPLE_SHOT_SPREAD, bulletColor));
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    const skin = getSkin();
    const { tail } = extremes(skin.shape);
    const boosted = this.speedBoostTtl > 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    const activeColor = this.activeColor();
    ctx.strokeStyle = activeColor || skin.color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    traceShape(skin.shape);
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(tail, -4);
      ctx.lineTo(tail - rand(6, 14), 0);
      ctx.lineTo(tail,  4);
      if (activeColor) {
        ctx.strokeStyle = `rgba(${activeColor.startsWith('#') ? hexToRgb(activeColor) : POWERUP_RGB},0.9)`;
      } else {
        ctx.strokeStyle = 'rgba(255,130,0,0.85)';
        ctx.globalAlpha = 0.85;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y, color = '255,255,255') {
    this.x  = x;
    this.y  = y;
    this.color = color;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(${this.color},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power ups ─────────────────────────────────────────────────────────────────
const POWERUP_CHANCE = 0.08; // drop chance when an asteroid is destroyed
const POWERUP_TTL    = 8;    // seconds before despawning if not picked up

const SPEED_BOOST_DURATION = 5;    // seconds of double speed
const SPEED_MULTIPLIER     = 2;
const SPEED_POWERUP_COLOR  = '#4dd7ff';

const TRIPLE_SHOT_DURATION = 5;    // seconds of triple shot
const TRIPLE_SHOT_SPREAD   = 0.2;  // rad (~11°) de apertura del abanico
const TRIPLE_SHOT_COLOR    = '#ff5ec4';

class PowerUp {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.radius = 12;
    this.ttl    = POWERUP_TTL;
    this.pulse  = 0;
    this.dead   = false;
  }

  get rgb() { return hexToRgb(this.color); }

  update(dt) {
    this.pulse += dt * 3;
    this.ttl   -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo antes de expirar
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    const r = this.radius + Math.sin(this.pulse) * 2;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Halo exterior
    ctx.strokeStyle = `rgba(${this.rgb},0.35)`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';
    this.drawIcon();
    ctx.stroke();

    ctx.restore();
  }

  drawIcon() {}
  applyTo() {}
}

class SpeedPowerUp extends PowerUp {
  constructor(x, y) {
    super(x, y);
    this.color    = SPEED_POWERUP_COLOR;
    this.duration = SPEED_BOOST_DURATION;
  }

  applyTo(ship) { ship.speedBoostTtl = this.duration; }

  // Icono: doble chevron hacia la derecha
  drawIcon() {
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo( 1,  0);
    ctx.lineTo(-5,  6);
    ctx.moveTo( 1, -6);
    ctx.lineTo( 7,  0);
    ctx.lineTo( 1,  6);
  }
}

class TripleShotPowerUp extends PowerUp {
  constructor(x, y) {
    super(x, y);
    this.color    = TRIPLE_SHOT_COLOR;
    this.duration = TRIPLE_SHOT_DURATION;
  }

  applyTo(ship) { ship.tripleShotTtl = this.duration; }

  // Icono: abanico de 3 rayos con la misma apertura del disparo real
  drawIcon() {
    const ORIGIN_Y = 6;
    const LEN = 11;
    for (const dir of [-1, 0, 1]) {
      const a = -Math.PI / 2 + dir * TRIPLE_SHOT_SPREAD;
      ctx.moveTo(0, ORIGIN_Y);
      ctx.lineTo(Math.cos(a) * LEN, ORIGIN_Y + Math.sin(a) * LEN);
    }
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerUps;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let shootingStarTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnShootingStar() {
  const SAFE_DIST = 130;
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - ship.x, y - ship.y) < SAFE_DIST);
  asteroids.push(new ShootingStar(x, y));
}

function handleExpiredShootingStars() {
  for (const a of asteroids) {
    if (a.isShootingStar && a.dead && a.expired) {
      a.expired = false;
      explode(a.x, a.y, 6);
    }
  }
  asteroids = asteroids.filter(a => !a.dead);
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerUps  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  shootingStarTimer = SHOOTING_STAR_INTERVAL;
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerUps  = [];
  asteroids = asteroids.filter(a => a.isShootingStar && !a.dead);
  ship.reset();
  shootingStarTimer = SHOOTING_STAR_INTERVAL;
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8, color) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
}

const POWERUP_TYPES = [SpeedPowerUp, TripleShotPowerUp];

function maybeSpawnPowerUp(x, y) {
  if (Math.random() >= POWERUP_CHANCE) return;
  const Type = POWERUP_TYPES[randInt(0, POWERUP_TYPES.length - 1)];
  powerUps.push(new Type(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  // Cambio de skin disponible en cualquier estado
  if (pressed('KeyS')) cycleSkin();

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    powerUps.forEach(p => p.update(dt));
    powerUps  = powerUps.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    handleExpiredShootingStars();
    powerUps.forEach(p => p.update(dt));
    powerUps  = powerUps.filter(p => !p.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerUps.forEach(p => p.update(dt));

  handleExpiredShootingStars();

  // Aparición por tiempo, máximo una activa
  shootingStarTimer -= dt;
  if (shootingStarTimer <= 0) {
    shootingStarTimer = SHOOTING_STAR_INTERVAL;
    if (!asteroids.some(a => a.isShootingStar)) spawnShootingStar();
  }

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += a.points;
        explode(a.x, a.y, a.size * 5);
        maybeSpawnPowerUp(a.x, a.y);
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        killShip();
        break;
      }
    }
  }

  // Nave vs power-up
  for (const pu of powerUps) {
    if (!pu.dead && dist(ship, pu) < ship.radius + pu.radius) {
      pu.dead = true;
      pu.applyTo(ship);
      explode(ship.x, ship.y, 10, pu.rgb);
    }
  }
  powerUps = powerUps.filter(p => !p.dead);

  // Nivel completado (la estrella fugaz es bonus y no bloquea el avance)
  if (!asteroids.some(a => !a.isShootingStar)) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
const LIFE_ICON_SCALE = 0.45;

function drawLifeIcon(x, y) {
  const skin = getSkin();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(LIFE_ICON_SCALE, LIFE_ICON_SCALE);
  ctx.strokeStyle = skin.color;
  ctx.lineWidth   = 1.2 / LIFE_ICON_SCALE;   // el scale también afecta al grosor
  ctx.lineJoin    = 'round';
  traceShape(skin.shape);
  ctx.stroke();
  ctx.restore();
}

// Power-ups activos, en el orden en que se apilan en el HUD
const ACTIVE_BOOSTS = [
  { get ttl() { return ship.speedBoostTtl; }, duration: SPEED_BOOST_DURATION, color: SPEED_POWERUP_COLOR,  label: 'VELOCIDAD' },
  { get ttl() { return ship.tripleShotTtl; }, duration: TRIPLE_SHOT_DURATION, color: TRIPLE_SHOT_COLOR,    label: 'TRIPLE' },
];

function drawBoostIndicator(boost, row) {
  const { ttl, duration, color, label } = boost;
  if (ttl <= 0) return;

  const barW = 60;
  const y = 45 + row * 18;

  ctx.fillStyle = color;
  ctx.font      = '12px monospace';
  ctx.fillText(`${label} ${ttl.toFixed(1)}s`, W / 2, y);

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(W / 2 - barW / 2, y + 7, barW, 4);
  ctx.fillStyle = color;
  ctx.fillRect(W / 2 - barW / 2, y + 7, barW * (ttl / duration), 4);
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  ACTIVE_BOOSTS.forEach((boost, row) => drawBoostIndicator(boost, row));

  // Skin actual
  const skin = getSkin();
  ctx.textAlign = 'left';
  ctx.font      = '12px monospace';
  ctx.fillStyle = skin.color;
  ctx.fillText(`SKIN: ${skin.name}`, 14, 44);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('S: CAMBIAR', 14, 60);
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  powerUps.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

loadSkin();
initGame();
requestAnimationFrame(loop);
