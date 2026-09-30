# 🌐 Tarea 3 · Frontend Básico Conectado a una API REST

Frontend ligero, limpio y moderno desarrollado en **HTML5, CSS3 y JavaScript estándar (Vanilla JS)**, diseñado para conectarse y consumir servicios de una API REST mediante operaciones HTTP asíncronas (`fetch`).

---

## 📋 Características Principales

- **Sin dependencias ni librerías externas**: No requiere instalar paquetes de Node (`npm`), herramientas de compilación ni servidores complejos. Abre directamente en el navegador.
- **Operaciones CRUD Completas**:
  - **GET**: Carga y visualiza los registros desde la API con indicador de carga (*spinner*).
  - **POST**: Formulario interactivo para enviar y crear nuevos registros en la API.
  - **PUT**: Edición de registros existentes directamente en la interfaz y sincronización con la API.
  - **DELETE**: Eliminación de registros con diálogo de confirmación y actualización del estado.
- **Buscador y Filtro en Tiempo Real**: Permite filtrar los registros descargados por título o contenido de manera instantánea.
- **Configuración de Endpoint Flexible**:
  - Viene configurado por defecto con la API pública de pruebas **JSONPlaceholder** (`https://jsonplaceholder.typicode.com/posts`), lista para funcionar de inmediato sin necesidad de levantar un backend propio.
  - Botones de preajuste rápido (Posts, Todos, Localhost).
  - Campo editable para ingresar cualquier URL de API propia o local (por ejemplo, `http://localhost:5000/api/tasks`).
- **Monitor HTTP en Pantalla**: Muestra en tiempo real el método HTTP utilizado (`GET`, `POST`, `PUT`, `DELETE`), el código de estado (`200 OK`, `201 Created`), el tiempo de respuesta en milisegundos y el JSON devuelto.
- **Notificaciones Dinámicas (Toast)**: Alertas visuales flotantes de éxito, error e información para cada acción realizada.

---

## 📁 Estructura del Proyecto

```text
Tarea-3/
│
├── index.html        # Estructura semántica y componentes de la interfaz
├── styles.css        # Diseño responsivo, variables CSS y estilos modernos
├── app.js            # Lógica de conexión con la API, peticiones fetch y manejo del DOM
└── README.md         # Documentación de la tarea y guía de uso
```

---

## 🚀 Cómo Ejecutar el Proyecto

Puedes abrir y probar el proyecto de cualquiera de las siguientes formas:

### Opción 1: Abrir directamente el archivo HTML (Método más rápido)
Haz doble clic sobre el archivo **`index.html`** para abrirlo en tu navegador favorito (Chrome, Edge, Firefox, Brave, Safari).

### Opción 2: Usar Visual Studio Code Live Server
Si utilizas **Visual Studio Code**:
1. Abre la carpeta del proyecto en VS Code.
2. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

### Opción 3: Servidor local simple con Python o Node
Si deseas servirlo mediante un servidor local:
- Con **Python 3**:
  ```bash
  python -m http.server 3000
  ```
- O con **Node.js**:
  ```bash
  npx serve .
  ```
Luego ingresa a `http://localhost:3000` en tu navegador.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica accesible.
- **CSS3**: Diseño responsivo con Flexbox, Grid y CSS Variables (soporte para móviles y escritorio).
- **JavaScript (ES6+)**: `async/await`, API `fetch`, manipulación nativa del DOM y gestión de eventos.
