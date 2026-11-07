// Carga autores y libros de ejemplo usando las API Routes.
// Uso (con la app corriendo):  npm run seed
// Opcional: BASE_URL=https://tu-app.vercel.app npm run seed
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

const data = [
  {
    author: { name: 'Gabriel García Márquez', email: 'gabo@example.com', nationality: 'Colombia', birthYear: 1927, bio: 'Premio Nobel de Literatura 1982' },
    books: [
      { title: 'Cien años de soledad', genre: 'Novela', publishedYear: 1967, pages: 417, isbn: '978-0307474728', description: 'Obra maestra del realismo mágico' },
      { title: 'La hojarasca', genre: 'Novela', publishedYear: 1955, pages: 137, description: 'Primera novela del autor, ambientada en Macondo' },
      { title: 'Relato de un náufrago', genre: 'Periodismo', publishedYear: 1970, pages: 112, description: 'Crónica de un marino que sobrevivió diez días en el mar' },
      { title: 'Crónica de una muerte anunciada', genre: 'Novela', publishedYear: 1981, pages: 122 },
      { title: 'El amor en los tiempos del cólera', genre: 'Novela', publishedYear: 1985, pages: 368, description: 'Una historia de amor que dura más de cincuenta años' },
      { title: 'Doce cuentos peregrinos', genre: 'Cuento', publishedYear: 1992, pages: 240 },
    ],
  },
  {
    author: { name: 'Mario Vargas Llosa', email: 'mvll@example.com', nationality: 'Perú', birthYear: 1936, bio: 'Premio Nobel de Literatura 2010' },
    books: [
      { title: 'La ciudad y los perros', genre: 'Novela', publishedYear: 1963, pages: 409, description: 'La vida de los cadetes del colegio militar Leoncio Prado' },
      { title: 'Conversación en La Catedral', genre: 'Novela', publishedYear: 1969, pages: 601 },
      { title: 'La fiesta del Chivo', genre: 'Novela', publishedYear: 2000, pages: 518 },
      { title: 'Travesuras de la niña mala', genre: 'Novela', publishedYear: 2006, pages: 375, description: 'Una historia de amor entre Lima, París, Londres y Madrid' },
    ],
  },
  {
    author: { name: 'Isabel Allende', email: 'isabel@example.com', nationality: 'Chile', birthYear: 1942, bio: 'Escritora chilena, una de las más leídas en español' },
    books: [
      { title: 'La casa de los espíritus', genre: 'Novela', publishedYear: 1982, pages: 433 },
      { title: 'Eva Luna', genre: 'Novela', publishedYear: 1987, pages: 304 },
      { title: 'Cuentos de Eva Luna', genre: 'Cuento', publishedYear: 1989, pages: 288 },
    ],
  },
  {
    author: { name: 'Jorge Luis Borges', email: 'borges@example.com', nationality: 'Argentina', birthYear: 1899 },
    books: [
      { title: 'Ficciones', genre: 'Cuento', publishedYear: 1944, pages: 203 },
      { title: 'El Aleph', genre: 'Cuento', publishedYear: 1949, pages: 146 },
    ],
  },
  {
    author: { name: 'César Vallejo', email: 'vallejo@example.com', nationality: 'Perú', birthYear: 1892, bio: 'Poeta peruano, figura de la vanguardia' },
    books: [
      { title: 'Los heraldos negros', genre: 'Poesía', publishedYear: 1919, pages: 160 },
      { title: 'Trilce', genre: 'Poesía', publishedYear: 1922, pages: 144, description: 'Poemario clave de la vanguardia latinoamericana' },
    ],
  },
]

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, json: await res.json() }
}

const existing = (await call('GET', '/api/authors')).json
let createdBooks = 0

for (const { author, books } of data) {
  let found = existing.find((a) => a.email === author.email)
  if (!found) {
    const r = await call('POST', '/api/authors', author)
    found = r.json
    console.log(`+ autor ${author.name} (${r.status})`)
  }
  const titles = new Set((found.books ?? []).map((b) => b.title))
  for (const book of books) {
    if (titles.has(book.title)) continue
    const r = await call('POST', '/api/books', { ...book, authorId: found.id })
    if (r.status === 201) createdBooks++
    else console.log(`! ${book.title}: ${r.json.error}`)
  }
}
console.log(`Listo: ${createdBooks} libro(s) creados en ${BASE}`)
