import React, { useState, useEffect, useMemo } from 'react';

const PRESETS = [
  { label: 'Posts (JSONPlaceholder)', url: 'https://jsonplaceholder.typicode.com/posts' },
  { label: 'Todos (JSONPlaceholder)', url: 'https://jsonplaceholder.typicode.com/todos' },
  { label: 'Productos (FakeStore)', url: 'https://fakestoreapi.com/products' },
];

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [inputUrl, setInputUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Formulario
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Monitor HTTP
  const [httpLog, setHttpLog] = useState('Esperando peticiones a la API...');

  // Notificaciones Toast
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const logRequest = (method, url, status, timeMs, responseBody) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${method} ${url}\nStatus: ${status} | Latencia: ${timeMs}ms\n\nRespuesta:\n${JSON.stringify(responseBody, null, 2)}`;
    setHttpLog(formatted);
  };

  // 1. GET: Cargar datos desde la API
  const fetchItems = async (urlToFetch = apiUrl) => {
    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const response = await fetch(urlToFetch, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const elapsed = Math.round(performance.now() - start);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.statusText})`);
      }

      const data = await response.json();
      let list = Array.isArray(data) ? data : data.data || data.products || [];

      // Limitar a los primeros 25 para vista ágil
      if (list.length > 25) {
        list = list.slice(0, 25);
      }

      const mapped = list.map((item) => ({
        id: item.id || Date.now() + Math.floor(Math.random() * 1000),
        title: item.title || item.name || 'Sin título',
        body: item.body || item.description || (item.completed !== undefined ? `Estado: ${item.completed ? 'Completado' : 'Pendiente'}` : ''),
      }));

      setItems(mapped);
      logRequest('GET', urlToFetch, response.status, elapsed, {
        totalRecibidos: mapped.length,
        muestra: mapped.slice(0, 2),
      });
      showToast(`Se cargaron ${mapped.length} registros desde la API`, 'success');
    } catch (err) {
      console.error(err);
      setError(`No se pudo conectar con la API: ${err.message}`);
      logRequest('GET', urlToFetch, 'ERROR', Math.round(performance.now() - start), { error: err.message });
      showToast(`Error al consultar API: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(apiUrl);
  }, [apiUrl]);

  // Cambiar URL de API
  const handleConnectUrl = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      showToast('Ingresa una URL válida', 'error');
      return;
    }
    setApiUrl(inputUrl.trim());
    cancelEdit();
  };

  const handleSelectPreset = (url) => {
    setInputUrl(url);
    setApiUrl(url);
    cancelEdit();
  };

  // 2. POST / PUT: Crear o actualizar registro
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('El título es requerido', 'error');
      return;
    }

    setSubmitting(true);
    const start = performance.now();

    if (editingId !== null) {
      // Operación PUT
      const endpoint = `${apiUrl.replace(/\/$/, '')}/${editingId}`;
      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ id: editingId, title, body }),
        });
        const elapsed = Math.round(performance.now() - start);
        let resData = {};
        try {
          resData = await response.json();
        } catch (_) {}

        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, title, body } : item))
        );
        logRequest('PUT', endpoint, response.status, elapsed, resData);
        showToast(`Registro #${editingId} actualizado con éxito`, 'success');
        cancelEdit();
      } catch (err) {
        showToast(`Error al actualizar: ${err.message}`, 'error');
        logRequest('PUT', endpoint, 'ERROR', Math.round(performance.now() - start), { error: err.message });
      } finally {
        setSubmitting(false);
      }
    } else {
      // Operación POST
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ title, body }),
        });
        const elapsed = Math.round(performance.now() - start);
        const resData = await response.json();

        const newItem = {
          id: resData.id || Date.now(),
          title,
          body,
        };

        setItems((prev) => [newItem, ...prev]);
        logRequest('POST', apiUrl, response.status, elapsed, resData);
        showToast('Registro creado exitosamente en la API', 'success');
        setTitle('');
        setBody('');
      } catch (err) {
        showToast(`Error al crear: ${err.message}`, 'error');
        logRequest('POST', apiUrl, 'ERROR', Math.round(performance.now() - start), { error: err.message });
      } finally {
        setSubmitting(false);
      }
    }
  };

  // 3. DELETE: Eliminar registro
  const handleDelete = async (id) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro #${id}?`)) {
      return;
    }

    const start = performance.now();
    const endpoint = `${apiUrl.replace(/\/$/, '')}/${id}`;

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      const elapsed = Math.round(performance.now() - start);

      setItems((prev) => prev.filter((item) => item.id !== id));
      logRequest('DELETE', endpoint, response.status, elapsed, { eliminado: id });
      showToast(`Registro #${id} eliminado en la API`, 'success');

      if (editingId === id) {
        cancelEdit();
      }
    } catch (err) {
      showToast(`Error al eliminar: ${err.message}`, 'error');
      logRequest('DELETE', endpoint, 'ERROR', Math.round(performance.now() - start), { error: err.message });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
  };

  // Filtrado en memoria
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.body && item.body.toLowerCase().includes(q))
    );
  }, [items, search]);

  return (
    <div className="app-container">
      {/* Encabezado */}
      <header className="header">
        <div className="header-brand">
          <span className="logo-icon">⚛️</span>
          <div>
            <h1>Frontend en React</h1>
            <p className="subtitle">Consumo de API REST (GET, POST, PUT, DELETE) con hooks y componentes</p>
          </div>
        </div>
        <div className="header-status">
          <span className={`status-badge ${error ? 'status-error' : loading ? 'status-loading' : 'status-online'}`}>
            <span className="status-dot"></span>
            {error ? 'Error de conexión' : loading ? 'Conectando...' : 'API en línea'}
          </span>
        </div>
      </header>

      {/* Configuración de API */}
      <section className="api-config-card">
        <form onSubmit={handleConnectUrl} className="config-row">
          <label htmlFor="apiUrlInput"><strong>URL de la API:</strong></label>
          <div className="input-with-button">
            <input
              id="apiUrlInput"
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://tu-api.com/endpoint"
              required
            />
            <button type="submit" className="btn btn-secondary">
              Conectar
            </button>
          </div>
        </form>
        <div className="preset-row">
          <span className="preset-label">Preajustes rápidos:</span>
          {PRESETS.map((p) => (
            <button
              key={p.url}
              type="button"
              className={`btn-preset ${apiUrl === p.url ? 'active' : ''}`}
              onClick={() => handleSelectPreset(p.url)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Layout principal */}
      <main className="main-layout">
        {/* Columna Izquierda: Formulario y Monitor HTTP */}
        <section className="card form-card">
          <div className="card-header">
            <h2>{editingId !== null ? `✏️ Editando Registro #${editingId}` : '➕ Nuevo Registro en API'}</h2>
            {editingId !== null && <span className="badge-editing">Modo edición</span>}
          </div>

          <form onSubmit={handleSubmitForm}>
            <div className="form-group">
              <label htmlFor="title">Título / Nombre <span className="required">*</span></label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Desplegar en Vercel con React..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="body">Descripción / Detalle</label>
              <textarea
                id="body"
                rows="4"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe los detalles aquí..."
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Enviando...' : editingId !== null ? 'Guardar cambios en API' : 'Guardar en API'}
              </button>
              {editingId !== null && (
                <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Consola HTTP en pantalla */}
          <div className="http-log-box">
            <div className="http-log-title">
              <span>📡 Monitor de Peticiones HTTP</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => setHttpLog('Consola de peticiones limpia.')}
              >
                Limpiar
              </button>
            </div>
            <pre className="http-log-content">{httpLog}</pre>
          </div>
        </section>

        {/* Columna Derecha: Listado de datos */}
        <section className="card list-card">
          <div className="card-header list-header">
            <div>
              <h2>📋 Registros de la API</h2>
              <p className="section-desc">Datos sincronizados mediante peticiones GET</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fetchItems(apiUrl)}
              title="Recargar lista"
            >
              🔄 Recargar
            </button>
          </div>

          {/* Buscador */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Buscar por título o contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="count-badge">
              {filteredItems.length} registros
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="state-box">
              <div className="spinner"></div>
              <p>Consultando la API...</p>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="state-box error-box">
              <span className="state-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn btn-outline" onClick={() => fetchItems(apiUrl)}>
                Reintentar
              </button>
            </div>
          )}

          {/* Estado vacío */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="state-box">
              <span className="state-icon">📭</span>
              <p>No se encontraron registros para mostrar.</p>
            </div>
          )}

          {/* Lista de tarjetas */}
          {!loading && !error && filteredItems.length > 0 && (
            <div className="items-list">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h3>{item.title}</h3>
                    <span className="item-id">#{item.id}</span>
                  </div>
                  {item.body ? <p className="item-body">{item.body}</p> : null}
                  <div className="item-footer">
                    <button
                      type="button"
                      className="btn-edit-sm"
                      onClick={() => startEdit(item)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Contenedor de Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
