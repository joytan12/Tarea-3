# ⚛️ Tarea 3 · Frontend en React Conectado a API REST

Aplicación frontend construida con **React (Vite)**, diseñada para conectarse e interactuar con servicios de una API REST mediante operaciones HTTP asíncronas (`fetch`) y desplegarse automáticamente en **Vercel** mediante **GitHub Actions**.

---

## 📋 Características

- **Desarrollado en React estándar ("React a secas")**:
  - Construido con **Vite** para una experiencia ultrarrápida y ligera.
  - Gestión de estado con React Hooks (`useState`, `useEffect`, `useMemo`).
  - Modular y limpio, sin sobrecarga de dependencias innecesarias.
- **Operaciones CRUD con API REST**:
  - **GET**: Carga y renderizado dinámico de registros con contador y spinner de carga.
  - **POST**: Formulario integrado para crear nuevos registros en la API.
  - **PUT**: Edición interactiva de registros existentes en la interfaz.
  - **DELETE**: Eliminación de registros con confirmación y sincronización en tiempo real.
- **Buscador en tiempo real**: Filtrado instantáneo en memoria por título o descripción.
- **Configuración de Endpoints**:
  - Selector y campo editable de URL de API.
  - Preajustes rápidos para *JSONPlaceholder* (Posts y Todos) y *FakeStore API* (Productos).
- **Consola de Monitoreo HTTP**: Registra en vivo el método (`GET`, `POST`, `PUT`, `DELETE`), status code HTTP (`200 OK`, `201 Created`), latencia (ms) y el JSON devuelto.
- **Notificaciones Toast**: Alertas flotantes animadas para éxito, error e información.
- **CI/CD Automatizado con GitHub Actions para Vercel**:
  - En cada `push` a la rama `main`, GitHub Actions compila el frontend con Vite (`npm run build`) y despliega automáticamente la carpeta `dist/` a producción en **Vercel**.

---

## 📁 Estructura del Proyecto

```text
Tarea-3/
│
├── index.html                 # Plantilla HTML base
├── vite.config.js             # Configuración de Vite y plugin de React
├── package.json               # Dependencias y scripts del proyecto
├── .gitignore                 # Archivos ignorados por git (node_modules, dist, etc.)
│
├── src/
│   ├── main.jsx               # Punto de entrada de ReactDOM
│   ├── App.jsx                # Componente principal con hooks y operaciones REST
│   └── index.css              # Estilos visuales modernos y responsivos
│
├── .github/
│   └── workflows/
│       └── deploy-vercel.yml  # Pipeline CI/CD de GitHub Actions para Vercel
│
└── README.md                  # Documentación
```

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre en tu navegador la URL que indique Vite (generalmente `http://localhost:5173`).

### 3. Compilar para producción (Build para Vercel)
```bash
npm run build
```
Genera la carpeta `dist/` optimizada y lista para producción.

---

## ☁️ Despliegue Automático en Vercel con GitHub Actions

El repositorio incluye el archivo [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml). Para que el despliegue automático funcione al hacer `push` a `main`, agrega los siguientes secretos en tu repositorio de GitHub (**Settings → Secrets and variables → Actions → Repository secrets**):

1. `VERCEL_TOKEN`: Token personal de Vercel.
2. `VERCEL_ORG_ID`: ID de tu organización o cuenta en Vercel.
3. `VERCEL_PROJECT_ID`: ID del proyecto en Vercel.
