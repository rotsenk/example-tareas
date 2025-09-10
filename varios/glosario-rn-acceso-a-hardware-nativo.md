# Glosario de Términos Clave en RN - Acceso y Control de Hardware Nativo en Aplicaciones Móviles con React Native

## Runtime
El **runtime** es el entorno de ejecución en el que se corre un programa. Incluye el motor que interpreta o ejecuta el código, maneja la memoria, y gestiona la interacción con el sistema operativo.  
Ejemplo: En React Native, el runtime de JavaScript suele ser **Hermes** o **JavaScriptCore**.

---

## Bridge
El **Bridge** en React Native es el mecanismo que permite la comunicación entre el mundo de **JavaScript** y el mundo **nativo** (Java/Objective-C/Swift).  
Ejemplo: cuando invocas la cámara desde JS, la instrucción viaja a través del Bridge hacia el módulo nativo de cámara.

---

## Serialización
La **serialización** es el proceso de convertir estructuras de datos u objetos en un formato que pueda transmitirse o almacenarse (ej. JSON, binario).  
Ejemplo: enviar un objeto desde JS hacia nativo requiere serializarlo en un formato entendible en ambos lados.

---

## Blobs
Un **Blob** (Binary Large Object) es una representación de datos binarios crudos (como imágenes, audio, video o archivos) que pueden transmitirse o almacenarse.  
Ejemplo: una foto capturada por la cámara puede representarse como un Blob antes de enviarse a un servidor.

---

## Polling
El **polling** es una técnica de comunicación donde una aplicación hace solicitudes periódicas para verificar si hay nuevos datos o eventos disponibles.  
Ejemplo: en una app, hacer una petición al servidor cada 5 segundos para revisar si hay nuevas notificaciones.

---

## Concurrencia
La **concurrencia** es la capacidad de un sistema para manejar múltiples tareas de forma solapada en el tiempo, aunque no necesariamente simultánea.  
Ejemplo: una app puede estar descargando datos, escuchando eventos de GPS y respondiendo al usuario al mismo tiempo.

---

## Manejo de Hilos
El **manejo de hilos (threads)** consiste en cómo un programa distribuye su ejecución en distintos hilos de procesamiento. Cada hilo puede ejecutar tareas en paralelo o concurrentemente.  
Ejemplo: en React Native, la UI se maneja en un hilo principal (UI Thread), mientras que la lógica de JS corre en el **JS Thread**, y operaciones pesadas pueden moverse a **Background Threads**.
