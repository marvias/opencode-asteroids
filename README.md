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

| Tecla     | Acción              |
| --------- | ------------------- |
| `←` `→`   | Rotar nave          |
| `↑`       | Propulsar           |
| `Espacio` | Disparar            |
| `S`       | Cambiar de skin     |

## Skins

Cuatro apariencias para la nave, todas desbloqueadas. La tecla `S` rota a la siguiente (funciona en cualquier momento, incluso en la pantalla de `GAME OVER`) y la elección se guarda automáticamente en el navegador, así que se mantiene al recargar.

| Skin          | Descripción                      |
| ------------- | -------------------------------- |
| `CLÁSICA`     | Triángulo con muesca trasera      |
| `INTERCEPTOR` | Dardo esbelto                    |
| `CARGUERO`    | Caja de carga con popa mellada   |
| `SIGILOSA`    | Delta ancha tipo manta           |

El color de cada skin se aplica también a la llama del propulsor, a las balas y a los iconos de vida. Agregar una skin nueva es agregar un objeto a `SKINS` en `game.js`: `id`, `name`, `color` y `shape` (vértices de la silueta, con la nariz apuntando a `+x` y el centro en el origen).

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 150 |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- **Skins**: 4 apariencias de nave seleccionables con `S` y persistentes entre sesiones
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: al destruir asteroides puede caer un power-up cyan; al recogerlo la nave se mueve al doble de velocidad durante 5 segundos (indicador con barra de tiempo en pantalla)
- Power-up **Triple shot**: al destruir asteroides puede caer un power-up magenta; al recogerlo, cada disparo lanza 3 balas en abanico (una al centro y dos a ±11°) durante 5 segundos, con la misma cadencia normal. Se puede combinar con el de velocidad
- **Estrella fugaz**: asteroide dorado bonus que aparece cada 12 segundos (máximo una activa); se mueve muy rápido (~240 px/s), no se divide, da 150 puntos y desaparece con una pequeña explosión tras ~7 segundos
