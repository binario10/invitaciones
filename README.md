# Plataforma Multi-Cliente de Invitaciones Digitales (`invite.uberreyes.com`)

Sistema Full-Stack con **React 18 + Vite + CSS Modular Puro + PHP Nativo** para crear, administrar y alojar invitaciones sociales (`/:slug`), con álbum colaborativo (`/:slug/album`) y panel administrativo (`/admin`).

---

## 1. Contraseña del Panel Administrativo (`/admin`)

* **Contraseña por defecto incluida:** `Admin2026!`
* Para cambiarla, genera tu propio hash en PHP ejecutando en terminal:
  ```bash
  php -r "echo password_hash('TuNuevaContraseñaSegura', PASSWORD_DEFAULT) . PHP_EOL;"
  ```
* Pega el hash resultante en `api/config.php` dentro de `ADMIN_PASSWORD_HASH` y cambia `ADMIN_TOKEN_SECRET`.

---

## 2. Ejecución en Local (`localhost`)

1. Instala dependencias:
   ```bash
   npm install
   ```
2. En una terminal desde la raíz del proyecto, levanta PHP:
   ```bash
   php -S localhost:8000
   ```
3. En otra terminal desde la raíz del proyecto, levanta Vite:
   ```bash
   npm run dev
   ```
4. Abre:
   * **Panel Admin:** `http://localhost:5173/admin`
   * **Invitación Demo:** `http://localhost:5173/karina-brayan`
   * **Álbum Demo:** `http://localhost:5173/karina-brayan/album`
