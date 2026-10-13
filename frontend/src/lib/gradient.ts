/** Hash determinístico del slug → una "pintura" abstracta: dos manchas de luz
 *  desaturadas sobre fondo carbón, más un toque del acento ocre. Un proyecto
 *  siempre recibe la misma composición, sin necesidad de imágenes. */
export function gradientFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const n = Math.abs(hash)
  const h1 = n % 360
  const h2 = (h1 + 50) % 360
  const x1 = 15 + (n % 50)
  const y1 = 10 + ((n >> 5) % 40)
  const x2 = 50 + ((n >> 9) % 45)
  const y2 = 55 + ((n >> 13) % 40)
  return [
    `radial-gradient(circle at ${x1}% ${y1}%, hsl(${h1} 28% 30% / 0.9), transparent 55%)`,
    `radial-gradient(circle at ${x2}% ${y2}%, hsl(${h2} 22% 22% / 0.85), transparent 60%)`,
    `radial-gradient(circle at ${100 - x1}% ${100 - y1}%, rgb(201 164 108 / 0.18), transparent 45%)`,
    '#141310',
  ].join(', ')
}
