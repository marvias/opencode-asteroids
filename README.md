# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 150 |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: al destruir asteroides puede caer un power-up cyan; al recogerlo la nave se mueve al doble de velocidad durante 5 segundos (indicador con barra de tiempo en pantalla)
- Power-up **Escudo**: al destruir asteroides puede caer un power-up violeta (icono de burbuja); al recogerlo, la nave se rodea de un anillo protector durante 8 segundos (indicador con barra de tiempo en pantalla). Mientras esté activo **ningún asteroide puede matar a la nave**: cada impacto vaporiza el asteroide, suma sus puntos y descuenta 2,5 segundos de escudo (no se parte en fragmentos), así que aguanta unos 3 golpes antes de agotarse
- **Estrella fugaz**: asteroide dorado bonus que aparece cada 12 segundos (máximo una activa); se mueve muy rápido (~240 px/s), no se divide, da 150 puntos y desaparece con una pequeña explosión tras ~7 segundos
