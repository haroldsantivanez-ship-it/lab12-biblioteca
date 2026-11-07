# Lab 12 – API Routes con Prisma + Supabase (parte de laboratorio)

El código de los Ejercicios 1 a 5 ya está hecho y probado. Te falta lo que necesita **tu cuenta** y **tus capturas**.

## Qué ya está hecho

| Archivo | Ejercicio |
|---|---|
| `prisma/schema.prisma` | Modelos `Author` y `Book` |
| `src/lib/prisma.ts` | Cliente Prisma |
| `src/app/api/authors/route.ts` | Ej. 1: GET y POST autores |
| `src/app/api/authors/[id]/route.ts` | Ej. 2: GET, PUT y DELETE autor por ID |
| `src/app/api/authors/[id]/books/route.ts` | Ej. 3: libros de un autor |
| `src/app/api/books/route.ts` | Ej. 4: GET (con filtro `?genre=`) y POST libros |
| `src/app/api/books/[id]/route.ts` | Ej. 5: GET, PUT y DELETE libro por ID |
| `postman/Lab12-Biblioteca.postman_collection.json` | Las 10 pruebas de Postman |

Diferencias con el PDF (son correcciones necesarias, puedes mencionarlas en tus conclusiones):

1. **`params` es una Promise** en Next.js 15/16. El código del PDF usa `params.id` directo; aquí se usa
   `const { id } = await params`. Sin esto, `npm run build` (y Vercel) falla.
2. **Prisma 6** (`prisma@6`): Prisma 7+ ya no acepta `url = env(...)` dentro del schema como en el PDF.
3. **Dos URLs de conexión** (`DATABASE_URL` con pooler y `DIRECT_URL`): la conexión directa
   `db.xxx.supabase.co` solo funciona por IPv6 y falla en muchas redes y en Vercel.
4. `catch (error: any)` se cambió por una función `prismaCode()` para que ESLint no marque errores.

## Pasos que debes hacer tú (con capturas)

### 1. Supabase (captura del proyecto creado)
1. Entra a https://supabase.com y crea un proyecto (anota la contraseña de la base de datos).
2. Botón **Connect** → pestaña **ORMs** → **Prisma**. Copia las dos líneas (`DATABASE_URL` y `DIRECT_URL`).
3. Pégalas en el archivo `.env` del proyecto y reemplaza `[YOUR-PASSWORD]` por tu contraseña.
   (Si la contraseña tiene caracteres como `@`, `#` o `/`, cámbiala por una solo con letras y números.)

### 2. TablePlus (captura de la conexión y de las tablas)
Host, usuario y puerto los sacas de **Connect → Session pooler**. SSL mode: `REQUIRED`.

### 3. Crear las tablas (captura de la terminal)
```bash
npx prisma db push
npx prisma generate
```
Luego en TablePlus actualiza (Ctrl+R) y toma captura de las tablas `Author` y `Book`.

### 4. Ejecutar la app (captura de la terminal)
```bash
npm run dev
```

### 5. Postman (una captura por cada prueba)
1. Postman → **Import** → elige `postman/Lab12-Biblioteca.postman_collection.json`.
2. Ejecuta las peticiones **en orden, de la 01 a la 10**. El ID del autor y del libro se guardan solos
   (variables `authorId` y `bookId`), no tienes que copiarlos.
3. En cada captura se debe ver: método + URL, el body (en POST/PUT) y la respuesta con el código de estado.

| # | Prueba | Respuesta esperada |
|---|---|---|
| 01 | GET todos los autores | 200 `[]` (la primera vez) |
| 02 | POST crear autor | 201 con el autor creado |
| 03 | GET autor por ID | 200 |
| 04 | PUT actualizar autor | 200 con la nueva bio |
| 05 | POST crear libro | 201 con el libro y su autor |
| 06 | GET todos los libros | 200 con 1 libro |
| 07 | GET libros `?genre=Novela` | 200 con el libro |
| 08 | GET libros del autor | 200 `totalBooks: 1` |
| 09 | GET libro por ID | 200 |
| 10 | DELETE libro | 200 "Libro eliminado correctamente" |

Si repites el POST de autor o de libro con los mismos datos, recibirás **409** (email o ISBN repetido):
eso es correcto, la validación funciona. Si quieres repetir todo desde cero, borra las filas en TablePlus.

### 6. Captura final en TablePlus
Muestra el autor guardado en la tabla `Author`. Así se ve que los datos llegaron a Supabase.
