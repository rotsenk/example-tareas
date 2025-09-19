# Overview - Peticiones HTTP en React Native (fetch y axios)

**Descripción**: guía práctica y compacta en formato `.md` que muestra cómo realizar peticiones HTTP básicas y algunas buenas prácticas en React Native usando **fetch** y **axios**. Incluye ejemplos, manejo de errores, cancelación, subida de archivos y patrones de autenticación.

---

## Requisitos previos

- Tener un proyecto de React Native (Expo o bare React Native).
- Node.js y npm/yarn.
- Conocimientos básicos de React y hooks (`useEffect`, `useState`).

### Creación rápida de proyecto (opciones)

**Con Expo (rápido)**
```bash
npx create-expo-app MiApp
cd MiApp
npm start
```

**Con React Native CLI (bare)**
```bash
npx react-native init MiApp
cd MiApp
npx react-native run-android # o run-ios
```

---

## Instalación de dependencias recomendadas

```bash
# Axios + almacenamiento local
npm install axios @react-native-async-storage/async-storage

# Para almacenar tokens de forma segura (Expo)
expo install expo-secure-store

# O para bare RN (Keychain)
npm install react-native-keychain
```

> **Nota**: `AsyncStorage` sirve para cache no sensible; para tokens y credenciales usa `expo-secure-store` o `react-native-keychain`.

---

## 1) Uso básico de `fetch` (GET / POST)

### GET simple
```js
// obtenerPosts.js
export async function fetchPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return data;
}
```

### POST con JSON
```js
export async function createPost(token, title, body) {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server ${res.status}: ${text}`);
  }
  return res.json();
}
```

### Cancelación con `AbortController` (fetch)
```js
const controller = new AbortController();
const signal = controller.signal;

fetch('https://api.example.com/long', { signal })
  .then(r => r.json())
  .catch(err => {
    if (err.name === 'AbortError') console.log('cancelado');
    else console.error(err);
  });

// cancelar
controller.abort();
```

### Timeout con `Promise.race`
```js
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

async function fetchWithTimeout(url, opts = {}, ms = 10000) {
  return Promise.race([fetch(url, opts), timeout(ms)]);
}
```

---

## 2) Uso básico de `axios`

### Instalación

```bash
npm install axios
```

### Crear una instancia y uso simple
```js
// api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

// Uso
const { data } = await api.get('/posts');
```

### POST con axios
```js
const { data } = await api.post('/posts', { title, body }, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Cancelación con `AbortController` (axios soporta `signal`)
```js
const controller = new AbortController();
api.get('/posts', { signal: controller.signal })
  .then(resp => console.log(resp.data))
  .catch(err => {
    if (err.name === 'CanceledError' || err.message === 'canceled') console.log('cancelado');
    else console.error(err);
  });

// cancelar
controller.abort();
```

### Interceptor para añadir token automáticamente
```js
// auth-interceptor.js
import { api } from './api';
import * as SecureStore from 'expo-secure-store';

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 3) Patrón simple de refresh token (pseudo-ejemplo con axios)

> Este es un esquema simplificado. En producción hay que manejar concurrencia y race conditions.

```js
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // push a promise to the queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const { data } = await api.post('/auth/refresh', { refreshToken });
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 4) Subida de archivos (FormData)

### fetch
```js
async function uploadFile(uri, token) {
  const form = new FormData();
  form.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' });

  const res = await fetch('https://api.example.com/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // NO forzar Content-Type; dejar que el motor lo ponga con boundary
    },
    body: form,
  });
  return res.json();
}
```

### axios
```js
const form = new FormData();
form.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' });

await api.post('/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

> Nota: en algunos entornos no es necesario forzar `Content-Type`; si lo fijas manualmente, debes incluir el boundary.

---

## 5) Ejemplo práctico: `PostsScreen` con fetch + cancelación y pull-to-refresh

```js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const controllerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    controllerRef.current = new AbortController();
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', { signal: controllerRef.current.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      if (err.name === 'AbortError') console.log('fetch aborted');
      else console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => { if (controllerRef.current) controllerRef.current.abort(); };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={posts}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => <View style={{ padding: 10 }}><Text style={{ fontWeight: 'bold' }}>{item.title}</Text><Text>{item.body}</Text></View>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}
```

---

## 6) Retries (exponential backoff + jitter)

```js
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function retry(fn, retries = 3, baseDelay = 500) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries - 1) throw err;
      const jitter = Math.random() * 100;
      await wait(baseDelay * Math.pow(2, i) + jitter);
    }
  }
}

// uso
await retry(() => fetchWithTimeout('/some', {}, 8000));
```

---

## 7) Testing: cómo mockear peticiones

- `fetch`: usar `jest-fetch-mock` o sobrescribir `global.fetch` en tests.
- `axios`: usar `axios-mock-adapter` o `msw` (mock service worker) para tests más realistas.

Ejemplo rápido (jest):
```js
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ posts: [] }) }));
```

---

## 8) Buenas prácticas rápidas

- Siempre usar **HTTPS**.
- Guardar tokens sensibles en **SecureStore / Keychain**, no en AsyncStorage.
- Mostrar estados de `loading` y `error` al usuario.
- Cancelar peticiones cuando el componente se desmonta.
- Implementar reintentos con backoff para errores transitorios.
- Usar idempotency keys para operaciones que podrían reintentarse (p.ej. pagos).
- No loguear tokens ni información sensible.




