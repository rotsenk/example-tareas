import { useState } from 'react';

function ListaTareas() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState('');

  const agregarTarea = () => {
    if (nuevaTarea.trim() === '') return;
    setTareas([...tareas, nuevaTarea]);
    setNuevaTarea('');
  };

  const eliminarTarea = (indice) => {
    const tareasFiltradas = tareas.filter((_, i) => i !== indice);
    setTareas(tareasFiltradas);
  };

  return (
    <div>
      <input
        placeholder="Escribe una tarea"
        value={nuevaTarea}
        onChange={(e) => setNuevaTarea(e.target.value)}
      />
      <button onClick={agregarTarea}>Agregar</button>

      <ul>
        {tareas.map((tarea, i) => (
          <li key={i}>
            {tarea} <button onClick={() => eliminarTarea(i)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaTareas;
