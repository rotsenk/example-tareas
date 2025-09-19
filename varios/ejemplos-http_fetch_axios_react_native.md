# Ejemplos básicos: Peticiones HTTP en React Native con fetch y axios

Las aplicaciones móviles modernas suelen necesitar comunicarse con un servidor para obtener o enviar datos. En React Native, esto se logra mediante **peticiones HTTP**. Aquí veremos cómo hacerlo usando **fetch** (nativo) y **axios** (librería externa).

---

## 1. Preparación del entorno

Antes de comenzar, asegúrate de tener un proyecto de React Native creado (por ejemplo con `npx react-native init MiApp`).

Si vas a usar `axios`, instálalo con:

```bash
npm install axios
# o
yarn add axios
```

---

## 2. Ejemplo con `fetch`

```tsx
// App.tsx o un componente cualquiera
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const App = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts/1")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la petición");
        }
        return response.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <Text>{data.body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});

export default App;
```

Este ejemplo obtiene un **post** de prueba desde JSONPlaceholder y lo muestra en pantalla.

---

## 3. Ejemplo con `axios`

```tsx
// App.tsx o un componente cualquiera
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";

const App = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/posts/1")
      .then((response) => setData(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      <Text>{data.body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});

export default App;
```

En este caso, `axios` simplifica la sintaxis y maneja automáticamente la conversión de la respuesta JSON.

---

## 4. Diferencias clave entre `fetch` y `axios`

| Característica        | fetch                          | axios                                    |
|-----------------------|--------------------------------|------------------------------------------|
| Nativo                | ✔️ Incluido en RN              | ❌ Requiere instalación externa           |
| Conversión a JSON     | Manual con `.json()`           | Automática                               |
| Manejo de errores     | Básico                        | Más detallado (status, mensajes, etc.)   |
| Interceptores         | ❌ No                         | ✔️ Sí                                    |
| Cancelación           | Complicada con AbortController | ✔️ Nativa                                |

---

## 5. Buenas prácticas

- Centraliza tus peticiones en un **servicio** (ej: `apiService.ts`).
- Maneja siempre **loading** y **error** states para mejorar la UX.
- Usa **interceptores en axios** para manejar autenticación (ej: tokens).
- Implementa **try/catch** si usas `async/await`.

