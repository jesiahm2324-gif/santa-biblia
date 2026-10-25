# Santa Biblia · Reina-Valera 1909

App web instalable: lectura, menú de libros, favoritos, autoestudio, seguimiento de lectura diaria y envío por WhatsApp. Funciona sin conexión después de la primera visita.

## Archivos

- `index.html`: la app.
- `biblia.json`: el texto completo de la Reina-Valera 1909 (66 libros, 1 189 capítulos), de dominio público.
- `manifest.webmanifest`, `icon-*.png`, `maskable-512.png`, `apple-touch-icon.png` y `favicon.*`: nombre, colores e ícono para instalarla.
- `sw.js`: guarda la app y el texto para leer sin internet.

## Publicar en GitHub Pages

1. En GitHub, crea un repositorio nuevo y público, por ejemplo `santa-biblia`.
2. Toca **Add file → Upload files** y sube los 11 archivos de esta carpeta (todos van juntos, sin subcarpetas). Confirma con **Commit changes**.
3. Ve a **Settings → Pages**. En **Source** elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y toca **Save**.
4. Espera uno o dos minutos. La dirección será `https://TU-USUARIO.github.io/santa-biblia/`.

## Instalar en el teléfono

- **Android (Chrome):** abre la dirección y toca **Instalar la app** en la portada, o el menú ⋮ → **Instalar app**.
- **iPhone (Safari):** abre la dirección, toca **Compartir** → **Agregar a inicio**.

## Actualizar la app más adelante

Sube los archivos nuevos al mismo repositorio y cambia en `sw.js` la línea `const VERSION = 'santa-biblia-v1';` a `v2`, `v3`, etc. Así los teléfonos reciben la versión nueva.

Los favoritos, notas y avance de cada persona se guardan en su propio teléfono.
