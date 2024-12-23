# Guía de Configuración y Ejecución

Esta guía detalla los pasos necesarios para configurar y ejecutar la aplicación dockerizada en tu máquina local.

---

## Requisitos previos

1. **Node.js**: Asegúrate de tener instalada la versión 20.18 o superior.
   - [Descargar Node.js](https://nodejs.org/)
2. **Docker y Docker Compose**: Instala Docker y Docker Compose según tu sistema operativo.
   - [Descargar Docker](https://www.docker.com/products/docker-desktop/)

---

## Pasos de Configuración

1. **Configurar las variables de entorno**:
   - Copia el archivo `.env.example` que se encuentra en la raíz del proyecto.
   - Crea un nuevo archivo llamado `.env.local` en la raíz y pega el contenido copiado.

2. **Generar el secreto para Auth**:
   - Ejecuta el siguiente comando desde la raíz del proyecto en la terminal:
     ```bash
     npx auth secret
     ```
   - Cuando se te indique, **sobreescribe la variable existente** `AUTH_SECRET` en el archivo `.env.local`.
   - **Importante**: Elimina las comillas dobles del secreto generado antes de guardar el archivo.

---

## Iniciar la aplicación
1. Abre una terminal en la raen la raíz del proyecto y ejecuta el siguiente comando para instalar las dependencias:
   ```bash
   npm install
   ```

2. Abre una terminal en la raíz del proyecto y ejecuta el siguiente comando:
   ```bash
   docker compose up --build
   ```
   - **Nota**: En **Linux**, puedes necesitar permisos administrativos:
     ```bash
     sudo docker compose up --build
     ```

3. Una vez que la aplicación esté en funcionamiento, accede a través de tu navegador:
   - [http://localhost:3000](http://localhost:3000)

   **Importante:**

   En algunas ocasiones, no te permitirá registrarte al iniciar la aplicación. Esto es debido a que el script para generar la base de datos no se ejecuta correctamente porque la base de datos esta reiniciando en el momento preciso que se ejecuta. Para solucionarlo, simplemente vuelve a ejecutar el script.
   ```bash
   docker compose up --build
   ```

---

## Acceso a los Servicios

### 1. **S3 Bucket (MinIO)**
   - Abre tu navegador y dirígete a:
     - [http://localhost:9000](http://localhost:9000)
   - Introduce las credenciales configuradas en el archivo `.env.local`:
     - **Usuario**: `MINIO_ROOT_USER`
     - **Contraseña**: `MINIO_ROOT_PASSWORD`

### 2. **Base de datos PostgreSQL**
   - Para explorar y gestionar los datos en PostgreSQL, instala las dependencias del proyecto. Desde la raíz ejecuta:
      ```bash
     npm install
     ```
     
   - Una ver terminada la instalación, desde la raíz ejecuta:
     ```bash
     npm run drizzle:studio
     ```
   - Luego, abre [https://local.drizzle.studio](https://local.drizzle.studio) en tu navegador.

---

## Notas adicionales

- Si necesitas detener la aplicación, usa:
  ```bash
  docker compose down
  ```
- Asegúrate de que ningún otro servicio esté usando los puertos `3000`, `9000` y `5432`, o los configurados en tu archivo `.env.local` y `compose.yml`.

## Ejecución de pruebas

Para la ejecución de pruebas, es necesario tener el contenedor `postgres-test` y `minio` en ejecución.

Una vez estén corriendo, ejecutar el siguiente comando desde la raíz del proyecto:
   ```bash
   npm run drizzle:push-test
   ```
Finalmente, ejecutar las pruebas desde el mismo directorio:
   ```bash
   npm run test
   ```