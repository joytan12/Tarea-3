import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';

const PRESETS = [
  { label: 'Posts (JSONPlaceholder)', url: 'https://jsonplaceholder.typicode.com/posts' },
  { label: 'Todos (JSONPlaceholder)', url: 'https://jsonplaceholder.typicode.com/todos' },
  { label: 'Productos (FakeStore)', url: 'https://fakestoreapi.com/products' },
];

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/posts');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Formulario
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Consola de peticiones HTTP en pantalla
  const [httpLog, setHttpLog] = useState('Esperando peticiones a la API...');

  useEffect(() => {
    fetchItems(apiUrl);
  }, []);

  const notify = (msg, isError = false) => {
    if (Platform.OS === 'web') {
      window.alert ? window.alert(msg) : console.log(msg);
    } else {
      Alert.alert(isError ? 'Error' : 'Éxito', msg);
    }
  };

  const logRequest = (method, url, status, timeMs, sampleData) => {
    const time = new Date().toLocaleTimeString();
    const snippet = JSON.stringify(sampleData, null, 2);
    setHttpLog(
      `[${time}] ${method} ${url}\nStatus: ${status} | Latencia: ${timeMs}ms\n\nRespuesta:\n${snippet}`
    );
  };

  // 1. GET: Cargar elementos
  const fetchItems = async (targetUrl = apiUrl) => {
    setLoading(true);
    setError(null);
    const start = Date.now();

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const elapsed = Date.now() - start;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.statusText})`);
      }

      const data = await response.json();
      let list = Array.isArray(data) ? data : data.data || data.products || [];

      // Limitar a los primeros 25 elementos para fluidez
      if (list.length > 25) {
        list = list.slice(0, 25);
      }

      const formatted = list.map((item) => ({
        id: item.id || Date.now(),
        title: item.title || item.name || 'Sin título',
        body: item.body || item.description || (item.completed !== undefined ? `Estado: ${item.completed ? 'Completado' : 'Pendiente'}` : ''),
      }));

      setItems(formatted);
      logRequest('GET', targetUrl, response.status, elapsed, {
        total: formatted.length,
        muestra: formatted.slice(0, 1),
      });
    } catch (err) {
      console.error(err);
      setError(`No se pudo conectar a la API: ${err.message}`);
      logRequest('GET', targetUrl, 'ERROR', Date.now() - start, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. POST / PUT: Crear o actualizar
  const handleSave = async () => {
    if (!title.trim()) {
      notify('Por favor ingresa un título', true);
      return;
    }

    setSubmitting(true);
    const start = Date.now();

    if (editingId !== null) {
      // Operación PUT
      const endpoint = `${apiUrl.replace(/\/$/, '')}/${editingId}`;
      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ id: editingId, title, body }),
        });
        const elapsed = Date.now() - start;
        const resData = await response.json();

        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, title, body } : item))
        );
        logRequest('PUT', endpoint, response.status, elapsed, resData);
        notify(`Registro #${editingId} actualizado con éxito.`);
        cancelEdit();
      } catch (err) {
        notify(`Error al actualizar: ${err.message}`, true);
        logRequest('PUT', endpoint, 'ERROR', Date.now() - start, { error: err.message });
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
        const elapsed = Date.now() - start;
        const resData = await response.json();

        const newItem = {
          id: resData.id || Date.now(),
          title,
          body,
        };

        setItems((prev) => [newItem, ...prev]);
        logRequest('POST', apiUrl, response.status, elapsed, resData);
        notify('Registro creado exitosamente en la API.');
        setTitle('');
        setBody('');
      } catch (err) {
        notify(`Error al crear: ${err.message}`, true);
        logRequest('POST', apiUrl, 'ERROR', Date.now() - start, { error: err.message });
      } finally {
        setSubmitting(false);
      }
    }
  };

  // 3. DELETE: Eliminar elemento
  const handleDelete = async (id) => {
    const proceed = Platform.OS === 'web' 
      ? window.confirm ? window.confirm(`¿Deseas eliminar el registro #${id}?`) : true
      : true;

    if (!proceed) return;

    const start = Date.now();
    const endpoint = `${apiUrl.replace(/\/$/, '')}/${id}`;

    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      const elapsed = Date.now() - start;

      setItems((prev) => prev.filter((item) => item.id !== id));
      logRequest('DELETE', endpoint, response.status, elapsed, { eliminado: id });
      notify(`Registro #${id} eliminado en la API.`);

      if (editingId === id) {
        cancelEdit();
      }
    } catch (err) {
      notify(`Error al eliminar: ${err.message}`, true);
      logRequest('DELETE', endpoint, 'ERROR', Date.now() - start, { error: err.message });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
  };

  const handleSelectPreset = (url) => {
    setApiUrl(url);
    cancelEdit();
    fetchItems(url);
  };

  // Filtrado reactivo en memoria
  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.body && item.body.toLowerCase().includes(q));
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📱 React Native · Front API</Text>
          <Text style={styles.headerSubtitle}>
            Consumo de API REST (GET, POST, PUT, DELETE) con componentes nativos
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, error ? styles.badgeError : styles.badgeSuccess]}>
              <Text style={error ? styles.badgeErrorText : styles.badgeSuccessText}>
                {error ? '⚠️ Error de conexión' : '🟢 API en línea'}
              </Text>
            </View>
          </View>
        </View>

        {/* Selector y configuración de API */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>URL del Endpoint:</Text>
          <View style={styles.urlRow}>
            <TextInput
              style={styles.urlInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="https://..."
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.btnSecondary} onPress={() => fetchItems(apiUrl)}>
              <Text style={styles.btnSecondaryText}>Conectar</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.cardLabel, { marginTop: 10 }]}>Preajustes rápidos:</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.url}
                style={[styles.presetBtn, apiUrl === p.url && styles.presetBtnActive]}
                onPress={() => handleSelectPreset(p.url)}
              >
                <Text style={[styles.presetBtnText, apiUrl === p.url && styles.presetBtnTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Formulario Crear / Editar */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {editingId !== null ? `✏️ Editando Registro #${editingId}` : '➕ Nuevo Registro en API'}
          </Text>

          <Text style={styles.inputLabel}>Título / Nombre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Aprender React Native..."
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Descripción / Detalle</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Escribe el contenido..."
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={3}
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.btnPrimary, submitting && styles.btnDisabled]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText}>
                  {editingId !== null ? 'Actualizar en API' : 'Guardar en API'}
                </Text>
              )}
            </TouchableOpacity>

            {editingId !== null && (
              <TouchableOpacity style={styles.btnCancel} onPress={cancelEdit}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Monitor HTTP en pantalla */}
        <View style={styles.card}>
          <View style={styles.logHeader}>
            <Text style={styles.cardLabel}>📡 Monitor de Peticiones HTTP:</Text>
            <TouchableOpacity onPress={() => setHttpLog('Consola limpia.')}>
              <Text style={styles.linkText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logBox}>
            <Text style={styles.logText}>{httpLog}</Text>
          </View>
        </View>

        {/* Buscador y estadísticas */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Buscar en resultados..."
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredItems.length} registros</Text>
          </View>
        </View>

        {/* Estado de carga */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Cargando datos desde la API...</Text>
          </View>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.btnRetry} onPress={() => fetchItems(apiUrl)}>
              <Text style={styles.btnRetryText}>Reintentar conexión</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Listado de elementos */}
        {!loading && !error && filteredItems.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>📭 No hay elementos para mostrar.</Text>
          </View>
        )}

        {!loading &&
          filteredItems.map((item) => (
            <View key={String(item.id)} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>#{item.id}</Text>
                </View>
              </View>

              {Boolean(item.body) && <Text style={styles.itemBody}>{item.body}</Text>}

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.btnEdit} onPress={() => startEdit(item)}>
                  <Text style={styles.btnEditText}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.btnDeleteText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeSuccessText: {
    color: '#15803d',
    fontWeight: '600',
    fontSize: 12,
  },
  badgeError: {
    backgroundColor: '#fee2e2',
  },
  badgeErrorText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  urlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#f8fafc',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  btnSecondary: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  presetBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  presetBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  presetBtnText: {
    fontSize: 12,
    color: '#475569',
  },
  presetBtnTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    color: '#64748b',
    fontSize: 14,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  logBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  logText: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  countBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  centerBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  btnRetry: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  btnRetryText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  idBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
  },
  itemBody: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    lineHeight: 18,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  btnEdit: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  btnEditText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  btnDelete: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  btnDeleteText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
  },
});
