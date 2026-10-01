# 📱 Tarea 3 · Frontend en React Native Conectado a API REST

Aplicación frontend construida con **React Native** y **Expo (con soporte Web)**, diseñada para consumir e interactuar con servicios de una API REST mediante operaciones HTTP asíncronas (`fetch`) y desplegarse automáticamente en **Vercel** usando **GitHub Actions**.

---

## 📋 Características

- **Construido 100% en React Native**:
  - Componentes nativos: `View`, `Text`, `FlatList`, `TextInput`, `TouchableOpacity`, `ActivityIndicator`, `SafeAreaView`, `StyleSheet`.
  - Multiplataforma: Corre en **Web**, **Android** e **iOS**.
- **Operaciones CRUD con API REST**:
  - **GET**: Carga y renderizado dinámico de elementos con `FlatList`.
  - **POST**: Formulario integrado para crear nuevos registros en la API.
  - **PUT**: Edición interactiva de registros existentes.
  - **DELETE**: Eliminación de registros con actualización reactiva en pantalla.
- **Buscador en tiempo real**: Filtrado instantáneo por título o contenido.
- **Configuración de Endpoints**:
  - Selector y campo editable de URL de API.
  - Preajustes rápidos para *JSONPlaceholder* (Posts, Todos) y *FakeStore API* (Productos).
- **Consola de Monitoreo HTTP**: Registra en vivo el método (`GET`, `POST`, `PUT`, `DELETE`), status code HTTP, latencia (ms) y el JSON devuelto.
- **CI/CD Automatizado con GitHub Actions para Vercel**:
  - En cada `push` a la rama `main`, GitHub Actions compila la versión web estática con Expo (`npx expo export --platform web`) y la despliega automáticamente a producción en **Vercel**.

---

## 📁 Estructura del Proyecto

```text
Tarea-3/
│
├── App.js                     # Componente principal de React Native
├── index.js                   # Punto de entrada de Expo (registerRootComponent)
├── app.json                   # Configuración del proyecto Expo
├── package.json               # Dependencias y scripts de ejecución
├── .gitignore                 # Archivos ignorados por git (node_modules, dist, etc.)
│
├── .github/
│   └── workflows/
│       └── deploy-vercel.yml  # Pipeline CI/CD de GitHub Actions para Vercel
│
├── assets/                    # Íconos y recursos visuales
└── README.md                  # Documentación
```

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar en modo Web (Navegador)
```bash
npm run web
```
Abre automáticamente la aplicación en tu navegador web en `http://localhost:8081`.

### 3. Iniciar con Expo (Móvil / Web)
```bash
npx expo start
```
- Presiona **`w`** en la terminal para abrir en el navegador web.
- O escanea el código QR con la app **Expo Go** en tu teléfono Android o iOS.

### 4. Probar la compilación para Vercel (Producción Web)
```bash
npm run build:web
```
Esto genera la carpeta `dist/` con todos los archivos estáticos listos para desplegarse.

---

## ☁️ Despliegue Automático en Vercel con GitHub Actions

El repositorio cuenta con el workflow [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml). Para que el despliegue automático funcione al hacer `push` a `main`, agrega los siguientes secretos en tu repositorio de GitHub (**Settings → Secrets and variables → Actions → Repository secrets**):

1. `VERCEL_TOKEN`: Token personal de Vercel.
2. `VERCEL_ORG_ID`: ID de tu organización o cuenta en Vercel.
3. `VERCEL_PROJECT_ID`: ID del proyecto en Vercel.
