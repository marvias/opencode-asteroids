# AGENTS.md

## Stack
- HTML5 Canvas + JavaScript ES6+ plano. **Cero dependencias, cero bundler, cero build.**
- Toda la lógica vive en `game.js` (un solo archivo, cargado como `<script>` clásico desde `index.html` — no es módulo ES, no uses `import`/`export`). Empieza con `'use strict'`.
- `index.html` es solo el shell: canvas + CSS inline.

## Correr / verificar
- `npx serve .` → `http://localhost:3000`. También funciona abrir `index.html` directo (el script no es módulo).
- **No hay tests, ni linter, ni formatter, ni typecheck, ni CI.** No existe ningún comando de validación: la única forma de verificar es jugar en el navegador.

## Arquitectura
- `game.js`: clases `Bullet`, `Asteroid`, `Ship`, `Particle`; estado global en `let` a nivel de módulo (`ship, bullets, asteroids, particles, score, lives, level, state`); `state` ∈ `'playing' | 'dead' | 'gameover'`.
- Flujo: `initGame()` al final del archivo → `requestAnimationFrame(loop)` → `update(dt)` + `draw()` cada frame.
- Todo se mueve con **delta-seconds**: cada `update(dt)` recibe segundos y el loop lo clampa con `Math.min(dt, 0.05)`. No migrar a lógica por frame.
- Tablas de tamaño/velocidad/puntos por tamaño de asteroide en `RADII` / `SPEEDS` / `POINTS`, indexadas 1..3 (índice 0 sin usar).

## Gotchas
- **El tamaño del canvas está duplicado**: atributos `width`/`height` del `<canvas>` en `index.html` **y** `const W = 800; const H = 600;` en `game.js`. Si cambiás uno, cambiá el otro.
- El espacio es **toroidal**: toda posición pasa por `wrap(v, max)`. Las coordenadas nunca deben salir de `[0, W)` / `[0, H)`.
- `pressed(code)` consume el flag `justPressed` (edge-triggered, una sola vez por tecla). `keys[code]` es level-triggered. No confundir.
- `Asteroid.split()` y las colisiones se resuelven marcando `dead` y filtrando los arrays al final del update, no durante el recorrido.

## Conventions
- **Código, clases y comentarios en inglés; todo el texto visible al usuario en español** (`SCORE`, `NIVEL`, `GAME OVER`, `PUNTAJE`, `ESPACIO PARA REINICIAR`). `index.html` tiene `lang="es"`.
- Controles y puntuación documentados en `README.md` — es el doc de referencia; actualizarlo junto a cualquier cambio en controles o puntos.
