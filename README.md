# CATU · Blindaje Preventivo v2.1

PWA de campo para **ejecutores del gasto** (ayuntamientos, secretarías, OPDS).  
Checklists Anexos A–E + reporte imprimible. Datos solo en el dispositivo (`localStorage`). Offline tras la primera apertura.

Centro de Auditoría Técnica y Urbana (CATU) · Aminadath Ramírez Villaseñor  
Contacto: revise el correo institucional CATU.

## Contenido del paquete

```
CATU_Blindaje_Preventivo_PWA/
  index.html
  manifest.json
  sw.js
  css/styles.css
  js/app.js
  js/data.js
  icons/
  README.md          ← este archivo
```

No requiere Node, base de datos ni cuentas.

---

## 1. Probar en su computadora

Descomprima el ZIP. En la carpeta:

```bash
# Opción A
python3 -m http.server 8080

# Opción B
npx --yes serve .
```

Abra `http://localhost:8080`. En Chrome o Edge: **Instalar aplicación**.

> No abra `index.html` con doble clic (`file://`). El service worker exige http(s).

---

## 2. Subir a GitHub (recomendado para compartir)

### Crear el repositorio

1. Entre a [https://github.com/new](https://github.com/new)
2. Nombre sugerido: `catu-blindaje-preventivo`
3. Público (para que los ayuntamientos instalen sin login)
4. **No** agregue README, .gitignore ni licencia (el ZIP ya trae README)
5. Crear repositorio

### Subir los archivos (opción fácil: web)

1. En el repo vacío pulse **uploading an existing file**
2. Arrastre **todo el contenido interno** de la carpeta (`index.html`, `css`, `js`, `icons`, `sw.js`, `manifest.json`, `README.md`, `.nojekyll`)
3. Commit: `CATU Blindaje Preventivo v2.1`

> Suba el **contenido**, no una carpeta extra. `index.html` debe quedar en la raíz del repo.

### Subir con Git (opción técnica)

```bash
cd CATU_Blindaje_Preventivo_PWA
git init
git add .
git commit -m "CATU Blindaje Preventivo v2.1"
git branch -M main
git remote add origin https://github.com/SU_USUARIO/catu-blindaje-preventivo.git
git push -u origin main
```

---

## 3. Publicar con GitHub Pages (URL para compartir)

1. En el repo: **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` · folder: `/ (root)`
4. Save
5. En 1–2 minutos la URL será:

`https://SU_USUARIO.github.io/catu-blindaje-preventivo/`

La PWA **requiere HTTPS** (GitHub Pages lo da). Esa es la liga que envía a dependencias.

### Cómo la instalan en el celular

- **Android / Chrome:** abrir la URL → menú → **Instalar aplicación** o **Agregar a la pantalla de inicio**
- **iPhone / Safari:** Compartir → **Agregar a pantalla de inicio**

La primera vez debe haber red. Después funciona offline.

---

## 4. Mensaje listo para enviar a prospectos

```
CATU — Blindaje Preventivo (PWA v2.1)

Herramienta de campo para el área ejecutora: checklists del expediente,
evidencia, contratación, control interno y bitácora (Ley 266 de Guerrero).

Liga: https://SU_USUARIO.github.io/catu-blindaje-preventivo/

No pide cuentas. El avance se guarda en el dispositivo.
Puede instalarse como aplicación y usarse en obra sin señal.
```

---

## 5. Alternativa: Netlify (arrastrar y soltar)

1. [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastre la carpeta `CATU_Blindaje_Preventivo_PWA`
3. Recibirá una URL `https://algo.netlify.app`

Útil si aún no configura GitHub Pages.

---

## Aviso

Documento de control preventivo. No sustituye el expediente oficial, la bitácora ni un dictamen de auditoría.  
Vigencia del programa: 30 de septiembre de 2027.
