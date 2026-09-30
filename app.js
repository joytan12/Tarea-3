/**
 * ====================================================================
 * Frontend Básico Conectado a API REST
 * Realiza operaciones CRUD completas (GET, POST, PUT, DELETE) con fetch
 * ====================================================================
 */

// Estado global de la aplicación
const state = {
  apiUrl: "https://jsonplaceholder.typicode.com/posts",
  items: [],
  editingId: null,
  isLoading: false,
};

// Referencias al DOM
const elements = {
  apiUrlInput: document.getElementById("apiUrlInput"),
  btnApplyApi: document.getElementById("btnApplyApi"),
  presetButtons: document.querySelectorAll(".btn-preset"),
  apiStatusBadge: document.getElementById("apiStatusBadge"),
  apiStatusText: document.getElementById("apiStatusText"),

  // Formulario
  itemForm: document.getElementById("itemForm"),
  itemId: document.getElementById("itemId"),
  itemTitle: document.getElementById("itemTitle"),
  itemBody: document.getElementById("itemBody"),
  btnSubmitForm: document.getElementById("btnSubmitForm"),
  submitBtnText: document.getElementById("submitBtnText"),
  btnCancelEdit: document.getElementById("btnCancelEdit"),
  formTitle: document.getElementById("formTitle"),
  editingBadge: document.getElementById("editingBadge"),

  // Registro HTTP
  httpLogContent: document.getElementById("httpLogContent"),
  btnClearLog: document.getElementById("btnClearLog"),

  // Listado y estados
  itemsList: document.getElementById("itemsList"),
  itemsCount: document.getElementById("itemsCount"),
  searchInput: document.getElementById("searchInput"),
  btnReload: document.getElementById("btnReload"),
  loadingState: document.getElementById("loadingState"),
  errorState: document.getElementById("errorState"),
  errorMessage: document.getElementById("errorMessage"),
  btnRetry: document.getElementById("btnRetry"),
  emptyState: document.getElementById("emptyState"),
  toastContainer: document.getElementById("toastContainer"),
};

// ====================================================================
// INICIALIZACIÓN
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadItemsFromApi();
});

// ====================================================================
// CONFIGURACIÓN DE EVENTOS
// ====================================================================
function setupEventListeners() {
  // Cambio manual de URL de API
  elements.btnApplyApi.addEventListener("click", () => {
    const newUrl = elements.apiUrlInput.value.trim();
    if (!newUrl) {
      showToast("Ingresa una URL válida de API", "error");
      return;
    }
    state.apiUrl = newUrl;
    updateActivePresetButton(newUrl);
    loadItemsFromApi();
  });

  // Botones de presets rápidos (Posts, Todos, Localhost)
  elements.presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      elements.apiUrlInput.value = url;
      state.apiUrl = url;
      updateActivePresetButton(url);
      loadItemsFromApi();
    });
  });

  // Enviar formulario (Crear o Actualizar)
  elements.itemForm.addEventListener("submit", handleFormSubmit);

  // Cancelar edición
  elements.btnCancelEdit.addEventListener("click", cancelEditMode);

  // Búsqueda en vivo
  elements.searchInput.addEventListener("input", handleSearch);

  // Botones de recarga
  elements.btnReload.addEventListener("click", loadItemsFromApi);
  elements.btnRetry.addEventListener("click", loadItemsFromApi);

  // Limpiar consola de log HTTP
  elements.btnClearLog.addEventListener("click", () => {
    elements.httpLogContent.textContent = "Consola de peticiones limpia.";
  });
}

function updateActivePresetButton(currentUrl) {
  elements.presetButtons.forEach((btn) => {
    if (btn.dataset.url === currentUrl) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// ====================================================================
// PETICIONES A LA API (CRUD)
// ====================================================================

/**
 * 1. GET: Carga el listado de elementos desde la API
 */
async function loadItemsFromApi() {
  setLoading(true);
  updateApiStatus("loading", "Conectando...");
  const startTime = performance.now();

  try {
    const response = await fetch(state.apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    
    // Normalizar datos (soporta arreglo de posts, todos o propiedad data)
    let list = Array.isArray(data) ? data : data.data || data.tasks || [];
    
    // Si la API devuelve demasiados elementos (ej. 100 posts de jsonplaceholder), limitamos a 20 para visualización limpia
    if (list.length > 20) {
      list = list.slice(0, 20);
    }

    state.items = list.map((item) => ({
      id: item.id || Date.now(),
      title: item.title || item.name || "Sin título",
      body: item.body || item.description || (item.completed !== undefined ? `Estado: ${item.completed ? 'Completada' : 'Pendiente'}` : ""),
    }));

    renderItems(state.items);
    updateApiStatus("online", "Conectado a la API");
    logHttp("GET", state.apiUrl, response.status, elapsed, {
      totalRecibidos: state.items.length,
      muestra: state.items.slice(0, 2),
    });
    showToast(`Se cargaron ${state.items.length} registros desde la API`, "success");
  } catch (err) {
    console.error("Error al cargar desde la API:", err);
    updateApiStatus("error", "Error de conexión");
    showError(`Error al consultar ${state.apiUrl}: ${err.message}`);
    logHttp("GET", state.apiUrl, "ERROR", Math.round(performance.now() - startTime), { error: err.message });
  } finally {
    setLoading(false);
  }
}

/**
 * 2. POST / PUT: Manejo de creación o edición según el estado
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const title = elements.itemTitle.value.trim();
  const body = elements.itemBody.value.trim();

  if (!title) {
    showToast("El título es obligatorio", "error");
    return;
  }

  if (state.editingId !== null) {
    await updateItemInApi(state.editingId, { title, body });
  } else {
    await createItemInApi({ title, body });
  }
}

/**
 * POST: Crea un nuevo registro en la API
 */
async function createItemInApi(payload) {
  setSubmitLoading(true, "Creando...");
  const startTime = performance.now();

  try {
    const response = await fetch(state.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Math.round(performance.now() - startTime);
    const result = await response.json();

    logHttp("POST", state.apiUrl, response.status, elapsed, result);

    if (response.ok || response.status === 201) {
      // Agregamos el nuevo registro al inicio de nuestra lista local
      const newItem = {
        id: result.id || Date.now(),
        title: payload.title,
        body: payload.body,
      };

      state.items.unshift(newItem);
      renderItems(state.items);
      elements.itemForm.reset();
      showToast("¡Registro creado exitosamente en la API! (Status 201)", "success");
    } else {
      throw new Error(`Código de error HTTP: ${response.status}`);
    }
  } catch (err) {
    console.error("Error al crear registro:", err);
    showToast(`No se pudo crear en la API: ${err.message}`, "error");
    logHttp("POST", state.apiUrl, "ERROR", Math.round(performance.now() - startTime), { error: err.message });
  } finally {
    setSubmitLoading(false);
  }
}

/**
 * 3. PUT: Actualiza un registro existente en la API
 */
async function updateItemInApi(id, payload) {
  setSubmitLoading(true, "Actualizando...");
  const startTime = performance.now();
  const urlWithId = `${state.apiUrl.replace(/\/$/, "")}/${id}`;

  try {
    const response = await fetch(urlWithId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ id, ...payload }),
    });

    const elapsed = Math.round(performance.now() - startTime);
    let result = {};
    try {
      result = await response.json();
    } catch (_) {}

    logHttp("PUT", urlWithId, response.status, elapsed, result);

    // Actualizamos localmente el elemento
    const index = state.items.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      state.items[index] = {
        ...state.items[index],
        title: payload.title,
        body: payload.body,
      };
      renderItems(state.items);
    }

    cancelEditMode();
    showToast(`Registro #${id} actualizado en la API (Status ${response.status})`, "success");
  } catch (err) {
    console.error("Error al actualizar:", err);
    showToast(`Error al actualizar en la API: ${err.message}`, "error");
    logHttp("PUT", urlWithId, "ERROR", Math.round(performance.now() - startTime), { error: err.message });
  } finally {
    setSubmitLoading(false);
  }
}

/**
 * 4. DELETE: Elimina un registro de la API
 */
async function deleteItemFromApi(id) {
  if (!confirm(`¿Estás seguro de eliminar el registro #${id}?`)) {
    return;
  }

  const startTime = performance.now();
  const urlWithId = `${state.apiUrl.replace(/\/$/, "")}/${id}`;

  try {
    const response = await fetch(urlWithId, {
      method: "DELETE",
    });

    const elapsed = Math.round(performance.now() - startTime);
    logHttp("DELETE", urlWithId, response.status, elapsed, { idEliminado: id });

    // Removemos el elemento del estado local
    state.items = state.items.filter((item) => String(item.id) !== String(id));
    renderItems(state.items);

    // Si estábamos editando este mismo elemento, reseteamos el formulario
    if (state.editingId === id) {
      cancelEditMode();
    }

    showToast(`Registro #${id} eliminado en la API (Status ${response.status})`, "success");
  } catch (err) {
    console.error("Error al eliminar:", err);
    showToast(`Error al eliminar en la API: ${err.message}`, "error");
    logHttp("DELETE", urlWithId, "ERROR", Math.round(performance.now() - startTime), { error: err.message });
  }
}

// ====================================================================
// RENDERIZADO Y MANIPULACIÓN DEL DOM
// ====================================================================

function renderItems(itemsToRender) {
  elements.itemsList.innerHTML = "";
  elements.itemsCount.textContent = itemsToRender.length;

  if (itemsToRender.length === 0) {
    elements.emptyState.classList.remove("hidden");
    return;
  }
  elements.emptyState.classList.add("hidden");

  itemsToRender.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";

    // Encabezado con título e ID
    const header = document.createElement("div");
    header.className = "item-header";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const idBadge = document.createElement("span");
    idBadge.className = "item-id";
    idBadge.textContent = `#${item.id}`;

    header.appendChild(title);
    header.appendChild(idBadge);
    card.appendChild(header);

    // Cuerpo o descripción
    if (item.body) {
      const body = document.createElement("p");
      body.className = "item-body";
      body.textContent = item.body;
      card.appendChild(body);
    }

    // Pie con botones de acción (Editar y Eliminar)
    const footer = document.createElement("div");
    footer.className = "item-footer";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn-edit-sm";
    btnEdit.textContent = "✏️ Editar";
    btnEdit.addEventListener("click", () => enterEditMode(item));

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.className = "btn-danger-sm";
    btnDelete.textContent = "🗑️ Eliminar";
    btnDelete.addEventListener("click", () => deleteItemFromApi(item.id));

    footer.appendChild(btnEdit);
    footer.appendChild(btnDelete);
    card.appendChild(footer);

    elements.itemsList.appendChild(card);
  });
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderItems(state.items);
    return;
  }

  const filtered = state.items.filter((item) => {
    const titleMatch = item.title && item.title.toLowerCase().includes(query);
    const bodyMatch = item.body && item.body.toLowerCase().includes(query);
    return titleMatch || bodyMatch;
  });

  renderItems(filtered);
}

// ====================================================================
// MODOS DE EDICIÓN Y ESTADOS DE INTERFAZ
// ====================================================================

function enterEditMode(item) {
  state.editingId = item.id;
  elements.itemId.value = item.id;
  elements.itemTitle.value = item.title;
  elements.itemBody.value = item.body || "";

  elements.formTitle.textContent = `✏️ Editando #${item.id}`;
  elements.submitBtnText.textContent = "Guardar cambios en API";
  elements.editingBadge.classList.remove("hidden");
  elements.btnCancelEdit.classList.remove("hidden");

  // Hacer scroll suave hacia el formulario si está en móvil
  elements.itemTitle.focus();
}

function cancelEditMode() {
  state.editingId = null;
  elements.itemId.value = "";
  elements.itemForm.reset();

  elements.formTitle.textContent = "➕ Nuevo Registro";
  elements.submitBtnText.textContent = "Guardar en API";
  elements.editingBadge.classList.add("hidden");
  elements.btnCancelEdit.classList.add("hidden");
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  if (isLoading) {
    elements.loadingState.classList.remove("hidden");
    elements.errorState.classList.add("hidden");
    elements.emptyState.classList.add("hidden");
    elements.itemsList.classList.add("hidden");
  } else {
    elements.loadingState.classList.add("hidden");
    elements.itemsList.classList.remove("hidden");
  }
}

function setSubmitLoading(isLoading, text = "Enviando...") {
  elements.btnSubmitForm.disabled = isLoading;
  elements.submitBtnText.textContent = isLoading ? text : (state.editingId ? "Guardar cambios en API" : "Guardar en API");
}

function showError(msg) {
  elements.errorState.classList.remove("hidden");
  elements.errorMessage.textContent = msg;
  elements.itemsList.classList.add("hidden");
}

function updateApiStatus(status, text) {
  elements.apiStatusBadge.className = `status-badge status-${status}`;
  elements.apiStatusText.textContent = text;
}

// ====================================================================
// REGISTRO DE RESPUESTAS HTTP (CONSOLA EN PANTALLA)
// ====================================================================
function logHttp(method, url, status, timeMs, responseBody) {
  const timestamp = new Date().toLocaleTimeString();
  const summary = `[${timestamp}] ${method} ${url}\nStatus: ${status} | Tiempo: ${timeMs}ms\n\nRespuesta:\n${JSON.stringify(responseBody, null, 2)}`;
  elements.httpLogContent.textContent = summary;
}

// ====================================================================
// NOTIFICACIONES TOAST FLOTANTES
// ====================================================================
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
