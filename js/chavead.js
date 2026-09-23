    // CONFIGURACIÓN SUPABASE
    const SUPABASE_URL = 'https://tlpkxrwwdosrzqcqwybq.supabase.co/';
    const SUPABASE_ANON_KEY = 'sb_publishable_C2pLthVQIIFVGAYJP4JPjw_5n1VwXIh';
    
    // Asignación explícita del cliente
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // CONTROL DE SESIÓN
    async function checkAuth() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        cargarTodo();
      } else {
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
      }
    }

    async function login() {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errBox = document.getElementById('login-error');

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        errBox.innerText = error.message;
        errBox.style.display = 'block';
      } else {
        errBox.style.display = 'none';
        checkAuth();
      }
    }

    async function logout() {
      await supabaseClient.auth.signOut();
      checkAuth();
    }

    function switchTab(e, tab) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      if (e && e.target) e.target.classList.add('active');
      document.getElementById('panel-' + tab).classList.add('active');
    }

    function resetForm(prefix) {
      const idEl = document.getElementById(prefix + '-id');
      if (idEl) idEl.value = '';
      const form = idEl ? idEl.closest('form') : null;
      if (form) form.reset();
    }

    // CARGA GENERAL
    async function cargarTodo() {
      await cargarEquipos();
      cargarTemporadas();
      cargarJugadores();
      cargarPartidos();
      cargarEventos();
    }

    // 1. TEMPORADAS CRUD
    async function cargarTemporadas() {
      const { data, error } = await supabaseClient.from('temporadas').select('*').order('id', { ascending: false });
      if (error) return console.error(error);
      const tbody = document.querySelector('#tabla-temporadas tbody');
      tbody.innerHTML = (data || []).map(t => `
        <tr>
          <td>${t.id}</td>
          <td><b>${t.nombre}</b></td>
          <td>${t.fecha_inicio || '-'}</td>
          <td>${t.activa ? '✅ Si' : '❌ No'}</td>
          <td class="action-btns">
            <button onclick="editarTemporada(${t.id}, '${t.nombre}', '${t.fecha_inicio || ''}', ${t.activa})">Editar</button>
            <button onclick="eliminar('temporadas', ${t.id}, cargarTemporadas)" class="btn-danger">Borrar</button>
          </td>
        </tr>
      `).join('');
    }

    function editarTemporada(id, nombre, fecha_inicio, activa) {
      document.getElementById('temp-id').value = id;
      document.getElementById('temp-nombre').value = nombre;
      document.getElementById('temp-inicio').value = fecha_inicio;
      document.getElementById('temp-activa').value = activa ? 'true' : 'false';
    }

    async function guardarTemporada(e) {
      e.preventDefault();
      const id = document.getElementById('temp-id').value;
      const nombre = document.getElementById('temp-nombre').value;
      const fecha_inicio = document.getElementById('temp-inicio').value || null;
      const activa = document.getElementById('temp-activa').value === 'true';

      const payload = { nombre, fecha_inicio, activa };
      const { error } = id 
        ? await supabaseClient.from('temporadas').update(payload).eq('id', id)
        : await supabaseClient.from('temporadas').insert([payload]);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        resetForm('temp');
        cargarTemporadas();
      }
    }

    // 2. EQUIPOS CRUD
async function cargarEquipos() {
  const { data, error } = await supabaseClient
    .from('equipos')
    .select('*')
    .order('nombre');

  if (error) {
    console.error('Error al cargar equipos:', error.message);
    return;
  }

  const equipos = data || [];

  // 1. Rellenar la tabla de equipos (protegido contra 'null' si no existe en la vista)
  const tbody = document.querySelector('#tabla-equipos tbody');
  if (tbody) {
    tbody.innerHTML = equipos.map(eq => {
      // Escapar comillas simples para evitar errores en las funciones onclick
      const nombreEscapado = (eq.nombre || '').replace(/'/g, "\\'");
      const localidadEscapada = (eq.localidad || '').replace(/'/g, "\\'");

      return `
        <tr>
          <td>${eq.id}</td>
          <td><b>${eq.nombre}</b></td>
          <td>${eq.localidad || '-'}</td>
          <td class="action-btns">
            <button onclick="editarEquipo(${eq.id}, '${nombreEscapado}', '${localidadEscapada}')">Editar</button>
            <button onclick="eliminar('equipos', ${eq.id}, cargarEquipos)" class="btn-danger">Borrar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Generar el HTML de las opciones una sola vez para reutilizarlo
  const opcionesEquipos = equipos.map(eq => `<option value="${eq.id}">${eq.nombre}</option>`).join('');

  // 3. Rellenar desplegables de Partidos (Local y Visitante) con opción por defecto
  const selectsPartidos = [
    document.getElementById('part-local'),
    document.getElementById('part-visitante')
  ];

  selectsPartidos.forEach(s => {
    if (s) {
      s.innerHTML = '<option value="">-- Selecciona Equipo --</option>' + opcionesEquipos;
    }
  });

  // 4. Rellenar desplegable de Jugadores
  const selectJugEquipo = document.getElementById('jug-equipo');
  if (selectJugEquipo) {
    selectJugEquipo.innerHTML = '<option value="">-- Sen Equipo (Libre) --</option>' + opcionesEquipos;
  }
}

    function editarEquipo(id, nombre, localidad) {
      document.getElementById('eq-id').value = id;
      document.getElementById('eq-nombre').value = nombre;
      document.getElementById('eq-localidad').value = localidad;
    }

    async function guardarEquipo(e) {
      e.preventDefault();
      const id = document.getElementById('eq-id').value;
      const nombre = document.getElementById('eq-nombre').value;
      const localidad = document.getElementById('eq-localidad').value;

      const payload = { nombre, localidad };
      const { error } = id 
        ? await supabaseClient.from('equipos').update(payload).eq('id', id)
        : await supabaseClient.from('equipos').insert([payload]);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        resetForm('eq');
        await cargarEquipos();
        cargarJugadores();
      }
    }

    // 3. JUGADORES CRUD
 // Función auxiliar para escapar texto en atributos HTML
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");
}

// Ejemplo corregido en cargarJugadores:
async function cargarJugadores() {
  const { data, error } = await supabaseClient
    .from('jugadores')
    .select('*, equipos(nombre)')
    .order('apellidos');

  if (error) return console.error(error);

  const tbody = document.querySelector('#tabla-jugadores tbody');
  tbody.innerHTML = (data || []).map(j => {
    const nombreEquipo = j.equipos ? j.equipos.nombre : '<em style="color:var(--muted)">Sin equipo</em>';
    const nom = escapeHTML(j.nombre);
    const ape = escapeHTML(j.apellidos);
    const ali = escapeHTML(j.alias || '');

    return `
      <tr>
        <td>${j.id}</td>
        <td>${j.apellidos}, ${j.nombre}</td>
        <td>${j.alias || '-'}</td>
        <td><b>${nombreEquipo}</b></td>
        <td class="action-btns">
          <button onclick="editarJugador(${j.id}, '${nom}', '${ape}', '${ali}', ${j.equipo_id || 'null'})">Editar</button>
          <button onclick="eliminar('jugadores', ${j.id}, cargarJugadores)" class="btn-danger">Borrar</button>
        </td>
      </tr>
    `;
  }).join('');
}
    function editarJugador(id, nombre, apellidos, alias, equipoId) {
      document.getElementById('jug-id').value = id;
      document.getElementById('jug-nombre').value = nombre;
      document.getElementById('jug-apellidos').value = apellidos;
      document.getElementById('jug-alias').value = alias;
      document.getElementById('jug-equipo').value = equipoId || '';
    }

    async function guardarJugador(e) {
      e.preventDefault();
      const id = document.getElementById('jug-id').value;
      const nombre = document.getElementById('jug-nombre').value;
      const apellidos = document.getElementById('jug-apellidos').value;
      const alias = document.getElementById('jug-alias').value;
      const equipoVal = document.getElementById('jug-equipo').value;
      const equipo_id = equipoVal ? parseInt(equipoVal) : null;

      const payload = { nombre, apellidos, alias, equipo_id };
      const { error } = id 
        ? await supabaseClient.from('jugadores').update(payload).eq('id', id)
        : await supabaseClient.from('jugadores').insert([payload]);

      if (error) {
        alert('Error al guardar jugador: ' + error.message);
      } else {
        resetForm('jug');
        cargarJugadores();
      }
    }

    // 4. PARTIDOS CRUD
// Variable global para guardar temporalmente los partidos cargados
let listaPartidos = [];

async function cargarPartidos() {
  const { data, error } = await supabaseClient.from('vista_calendario').select('*');
  
  if (error) {
    console.error("Error al cargar partidos:", error);
    return;
  }

  listaPartidos = data || []; // Guardamos los partidos
  const tbody = document.querySelector('#tabla-partidos tbody');

  tbody.innerHTML = listaPartidos.map(p => {
    const id = p.partido_id || p.id;
    return `
      <tr>
        <td>${p.jornada || ''}</td>
        <td>${p.equipo_local || ''}</td>
        <td>${p.equipo_visitante || ''}</td>
        <td><b>${p.puntos_local ?? 0} - ${p.puntos_visitante ?? 0}</b></td>
        <td>${p.chaves_local ?? 0} / ${p.chaves_visitante ?? 0}</td>
        <td>${p.estado || ''}</td>
        <td class="action-btns">
          <button onclick="prepararEdicion(${id})">Editar</button>
          <button onclick="eliminar('partidos', ${id}, cargarPartidos)" class="btn-danger">Borrar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Función auxiliar para buscar el partido sin problemas de sintaxis en HTML
function prepararEdicion(id) {
  const partido = listaPartidos.find(p => (p.partido_id || p.id) === id);
  if (partido) {
    editarPartido(partido);
  }
}

async function editarPartido(p) {
  const id = p.partido_id || p.id;

  document.getElementById('part-id').value = id;
  document.getElementById('part-jornada').value = p.jornada || '';
  document.getElementById('part-local').value = p.equipo_local_id || '';
  document.getElementById('part-visitante').value = p.equipo_visitante_id || '';
  document.getElementById('part-pts-loc').value = p.puntos_local ?? 0;
  document.getElementById('part-pts-vis').value = p.puntos_visitante ?? 0;
  document.getElementById('part-chv-loc').value = p.chaves_local ?? 0;
  document.getElementById('part-chv-vis').value = p.chaves_visitante ?? 0;
  document.getElementById('part-estado').value = p.estado || 'finalizado';

  // Forzar la actualización de la lista de jugadores de ambos equipos
  await actualizarVistaJugadores();
}

async function guardarPartido(e) {
  e.preventDefault();

  const id = document.getElementById('part-id')?.value;
  const jornada = parseInt(document.getElementById('part-jornada')?.value);
  const equipo_local_id = parseInt(document.getElementById('part-local')?.value);
  const equipo_visitante_id = parseInt(document.getElementById('part-visitante')?.value);

  if (!equipo_local_id || !equipo_visitante_id) {
    alert("⚠️ Debes seleccionar equipo local y visitante.");
    return;
  }

  // 1. Datos básicos del partido
  const payloadPartido = {
    jornada,
    equipo_local_id,
    equipo_visitante_id,
    puntos_local: parseInt(document.getElementById('part-pts-loc')?.value) || 0,
    puntos_visitante: parseInt(document.getElementById('part-pts-vis')?.value) || 0,
    estado: document.getElementById('part-estado')?.value || 'finalizado'
  };

  // 2. Insertar o Actualizar en 'partidos'
  let partidoIdGuardado = id;

  if (id) {
    const { error } = await supabaseClient.from('partidos').update(payloadPartido).eq('id', id);
    if (error) { alert("Error al actualizar partido: " + error.message); return; }
  } else {
    const { data, error } = await supabaseClient.from('partidos').insert([payloadPartido]).select('id').single();
    if (error) { alert("Error al crear partido: " + error.message); return; }
    partidoIdGuardado = data.id;
  }

  // 3. Recopilar chaves de los jugadores desde los inputs cargados
  const inputsJugadores = document.querySelectorAll('.input-chaves-jugador');
  const registrosChaves = [];

  inputsJugadores.forEach(input => {
    const jugadorId = parseInt(input.getAttribute('data-jugador-id'));
    const chaves = parseInt(input.value) || 0;

    registrosChaves.push({
      partido_id: partidoIdGuardado,
      jugador_id: jugadorId,
      chaves: chaves
    });
  });

  // 4. Guardar chaves individuales en 'partido_jugadores'
  if (registrosChaves.length > 0) {
    const { error: errPj } = await supabaseClient
      .from('partido_jugadores')
      .upsert(registrosChaves, { onConflict: 'partido_id, jugador_id' });

    if (errPj) {
      console.error("Error al guardar chaves de jugadores:", errPj);
      alert("El partido se guardó, pero hubo un error al guardar las chaves individuales.");
      return;
    }
  }

  alert("✅ Partido y chaves de jugadores guardados correctamente");
  
  // Limpiar formulario y recargar
  resetForm('part');
  document.getElementById('seccion-jugadores').style.display = 'none';
  cargarPartidos();
}

// 5. EVENTOS CRUD
// 1. Cargar eventos ordenando por 'fecha_hora'

// Función auxiliar para renderizar el lugar
// Función para dar formato al campo lugar en la tabla
function formatearLugar(lugar) {
  if (!lugar) return '-';
  if (lugar.startsWith('http://') || lugar.startsWith('https://')) {
    return `<a href="${lugar}" target="_blank" rel="noopener" style="color: #0066cc; font-weight: bold; text-decoration: underline;">📍 Ver no mapa</a>`;
  }
  return lugar;
}

// Función para abrir Google Maps desde el formulario
function abrirGoogleMaps() {
  const lugarInput = document.getElementById('eve-lugar')?.value.trim();
  if (lugarInput) {
    if (lugarInput.startsWith('http://') || lugarInput.startsWith('https://')) {
      window.open(lugarInput, '_blank');
    } else {
      const query = encodeURIComponent(lugarInput);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  } else {
    window.open('https://www.google.com/maps', '_blank');
  }
}



// 2. Cargar evento en el formulario para editar


function editarEvento(id, titulo, fechaHora, lugar, ubicacion, comentarios) {
  const elId = document.getElementById('eve-id');
  const elTitulo = document.getElementById('eve-titulo');
  const elFecha = document.getElementById('eve-fecha');
  const elLugar = document.getElementById('eve-lugar');
  const elUbicacion = document.getElementById('eve-ubicacion');
  const elComentarios = document.getElementById('eve-comentarios');

  if (elId) elId.value = id;
  if (elTitulo) elTitulo.value = titulo;
  
  if (elFecha && fechaHora) {
    // Formatear la fecha a ISO local para el input datetime-local (YYYY-MM-THH:mm)
    const fechaObj = new Date(fechaHora);
    const tzOffset = fechaObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(fechaObj.getTime() - tzOffset)).toISOString().slice(0, 16);
    elFecha.value = localISOTime;
  } else if (elFecha) {
    elFecha.value = '';
  }

  if (elLugar) elLugar.value = lugar || '';
  if (elUbicacion) elUbicacion.value = ubicacion || '';
  if (elComentarios) elComentarios.value = comentarios || '';
}
    // ELIMINACIÓN GENÉRICA
async function eliminar(tabla, id, callback) {
  if (!id) return;
  
  if (confirm(`¿Seguro que desexas eliminar este rexistro de ${tabla}?`)) {
    const { error } = await supabaseClient.from(tabla).delete().eq('id', id);
    
    if (error) {
      // Si el error es de clave foránea al borrar (código PostgreSQL 23503)
      if (error.code === '23503') {
        alert('⚠️ Non se pode eliminar este rexistro porque ten datos vinculados noutras táboas (por exemplo, partidos ou xogadores asociados).');
      } else {
        alert('Error al eliminar: ' + error.message);
      }
    } else {
      callback();
    }
  }
}
async function guardarChavesPartido(partidoId, listaPuntuacionesJugadores) {
  /* 
    'listaPuntuacionesJugadores' debe ser un array con este formato:
    [
      { partido_id: 10, jugador_id: 3, chaves: 4 },
      { partido_id: 10, jugador_id: 5, chaves: 2 },
      { partido_id: 10, jugador_id: 12, chaves: 6 }
    ]
  */

  const { data, error } = await supabaseClient
    .from('partido_jugadores')
    .upsert(listaPuntuacionesJugadores, { onConflict: 'partido_id, jugador_id' });

  if (error) {
    console.error("Error al guardar chaves de jugadores:", error);
    alert("Error al guardar puntuaciones individuales");
  } else {
    alert("✅ Puntuaciones de jugadores guardadas. Totales de equipo actualizados automáticamente.");
  }
}
    async function cargarRankingJugadores(temporadaId) {
  const { data, error } = await supabaseClient
    .from('vista_ranking_jugadores')
    .select('*')
    .eq('temporada_id', temporadaId)
    .order('total_chaves', { ascending: false });

  if (error) {
    console.error("Error cargando ranking:", error);
    return;
  }

  console.log("Ranking de jugadores:", data);
  // Dibujar tabla con data: jugador_nombre, equipo_nombre, total_chaves, partidos_jugados
}
    // INICIALIZAR
    window.addEventListener('DOMContentLoaded', checkAuth);

    // Detectar cuando cambia la selección de equipos en el formulario
document.getElementById('part-local')?.addEventListener('change', actualizarVistaJugadores);
document.getElementById('part-visitante')?.addEventListener('change', actualizarVistaJugadores);

async function actualizarVistaJugadores() {
  const localId = document.getElementById('part-local').value;
  const visitanteId = document.getElementById('part-visitante').value;
  const partidoId = document.getElementById('part-id')?.value; // Si estamos editando

  const secJugadores = document.getElementById('seccion-jugadores');

  if (!localId || !visitanteId) {
    secJugadores.style.display = 'none';
    return;
  }

  secJugadores.style.display = 'block';

  // Cargar jugadores de ambos equipos en paralelo
  await Promise.all([
    cargarListaJugadores(localId, 'contenedor-jugadores-local', partidoId),
    cargarListaJugadores(visitanteId, 'contenedor-jugadores-visita', partidoId)
  ]);
}

// Carga e inserta las filas de inputs por jugador
async function cargarListaJugadores(equipoId, contenedorId, partidoId) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = '<p>Cargando jugadores...</p>';

  // 1. Obtener los jugadores del equipo
  const { data: jugadores, error: errJ } = await supabaseClient
    .from('jugadores')
    .select('id, nombre')
    .eq('equipo_id', equipoId)
    .order('nombre');

  if (errJ || !jugadores || jugadores.length === 0) {
    contenedor.innerHTML = '<p style="color:gray;">No hay jugadores registrados en este equipo.</p>';
    return;
  }

  // 2. Si estamos editando un partido, obtener las chaves previas guardadas
  let chavesGuardadas = {};
  if (partidoId) {
    const { data: pjData } = await supabaseClient
      .from('partido_jugadores')
      .select('jugador_id, chaves')
      .eq('partido_id', partidoId);

    if (pjData) {
      pjData.forEach(item => {
        chavesGuardadas[item.jugador_id] = item.chaves;
      });
    }
  }

  // 3. Generar el HTML de los inputs
  let html = '';
  jugadores.forEach(j => {
    const valorChaves = chavesGuardadas[j.id] !== undefined ? chavesGuardadas[j.id] : 0;
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <label for="jugador-chaves-${j.id}">${j.nombre}</label>
        <input 
          type="number" 
          class="input-chaves-jugador" 
          data-jugador-id="${j.id}" 
          id="jugador-chaves-${j.id}" 
          value="${valorChaves}" 
          min="0" 
          style="width: 70px; text-align: center;"
        />
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

let mapaPicker = null;
let marcadorPicker = null;
let coordsSeleccionadas = null;

const LAT_DEFECTO = 42.8805;
const LNG_DEFECTO = -8.5457;

// --- GESTIÓN DEL MAPA Y GEOLOCALIZACIÓN ---
function abrirModalMapa() {
  const modal = document.getElementById('modal-mapa');
  if (modal) modal.style.display = 'flex';

  if (!mapaPicker) {
    mapaPicker = L.map('mapa-picker').setView([LAT_DEFECTO, LNG_DEFECTO], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapaPicker);

    mapaPicker.on('click', function(e) {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      coordsSeleccionadas = { lat, lng };

      if (marcadorPicker) {
        marcadorPicker.setLatLng(e.latlng);
      } else {
        marcadorPicker = L.marker(e.latlng).addTo(mapaPicker);
      }

      document.getElementById('coords-texto').innerHTML = `<b>Coordenadas:</b> ${lat}, ${lng}`;
    });
  }

  setTimeout(() => {
    mapaPicker.invalidateSize();
  }, 200);
}

function cerrarModalMapa() {
  const modal = document.getElementById('modal-mapa');
  if (modal) modal.style.display = 'none';
}

async function confirmarUbicacionMapa() {
  if (!coordsSeleccionadas) {
    alert('⚠️ Por favor, fai clic primeiro nun punto do mapa.');
    return;
  }

  const { lat, lng } = coordsSeleccionadas;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  // 1. Guardar el enlace interactivo en 'ubicacion'
  const elUbicacion = document.getElementById('eve-ubicacion');
  if (elUbicacion) elUbicacion.value = mapsUrl;

  // 2. Obtener la dirección aproximada mediante geocodificación inversa y ponerla en 'lugar'
  const elLugar = document.getElementById('eve-lugar');
  if (elLugar) {
    elLugar.value = 'Buscando dirección...';
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.display_name) {
          const partes = data.display_name.split(',');
          // Tomar los 3 primeros niveles de dirección (ej. Calle, Barrio/Pueblo, Municipio)
          const direccionCorta = partes.slice(0, 3).join(',').trim();
          elLugar.value = direccionCorta || data.display_name;
        } else {
          elLugar.value = `${lat}, ${lng}`;
        }
      } else {
        elLugar.value = `${lat}, ${lng}`;
      }
    } catch (err) {
      console.warn('Error al obtener dirección:', err);
      elLugar.value = `${lat}, ${lng}`;
    }
  }

  cerrarModalMapa();
}

// Auxiliar para formatear la celda Ubicación en la tabla
function formatearUbicacion(ubicacion) {
  if (!ubicacion) return '-';
  if (ubicacion.startsWith('http://') || ubicacion.startsWith('https://')) {
    return `<a href="${ubicacion}" target="_blank" rel="noopener" style="color: #0066cc; font-weight: bold; text-decoration: underline;">📍 Ver no mapa</a>`;
  }
  return ubicacion;
}

// --- CRUD DE EVENTOS ---
async function cargarEventos() {
  const { data, error } = await supabaseClient
    .from('eventos')
    .select('*')
    .order('fecha_hora', { ascending: true });

  if (error) {
    console.error('Error cargando eventos:', error.message);
    return;
  }

  const tbody = document.querySelector('#tabla-eventos tbody');
  if (tbody) {
    tbody.innerHTML = (data || []).map(ev => {
      const tituloEsc = (ev.titulo || '').replace(/'/g, "\\'");
      const lugarEsc = (ev.lugar || '').replace(/'/g, "\\'");
      const ubicacionEsc = (ev.ubicacion || '').replace(/'/g, "\\'");
      const comentariosEsc = (ev.comentarios || '').replace(/'/g, "\\'");
      const fechaVal = ev.fecha_hora || '';

      return `
        <tr>
          <td>${fechaVal ? new Date(fechaVal).toLocaleString('gl-ES', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
          <td><b>${ev.titulo}</b></td>
          <td>${ev.lugar || '-'}</td>
          <td>${formatearUbicacion(ev.ubicacion)}</td>
          <td>${ev.comentarios || '-'}</td>
          <td class="action-btns">
            <button onclick="editarEvento(${ev.id}, '${tituloEsc}', '${fechaVal}', '${lugarEsc}', '${ubicacionEsc}', '${comentariosEsc}')">Editar</button>
            <button onclick="eliminar('eventos', ${ev.id}, cargarEventos)" class="btn-danger">Borrar</button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function editarEvento(id, titulo, fechaHora, lugar, ubicacion, comentarios) {
  const elId = document.getElementById('eve-id');
  const elTitulo = document.getElementById('eve-titulo');
  const elFecha = document.getElementById('eve-fecha');
  const elLugar = document.getElementById('eve-lugar');
  const elUbicacion = document.getElementById('eve-ubicacion');
  const elComentarios = document.getElementById('eve-comentarios');

  if (elId) elId.value = id;
  if (elTitulo) elTitulo.value = titulo;
  if (elFecha) elFecha.value = fechaHora ? fechaHora.slice(0, 16) : '';
  if (elLugar) elLugar.value = lugar || '';
  if (elUbicacion) elUbicacion.value = ubicacion || '';
  if (elComentarios) elComentarios.value = comentarios || '';
}

async function guardarEvento(e) {
  e.preventDefault();

  const id = document.getElementById('eve-id')?.value;
  const titulo = document.getElementById('eve-titulo')?.value;
  const fechaInput = document.getElementById('eve-fecha')?.value;
  const lugar = document.getElementById('eve-lugar')?.value || '';
  const ubicacion = document.getElementById('eve-ubicacion')?.value || '';
  const comentarios = document.getElementById('eve-comentarios')?.value || '';

  if (!titulo || !fechaInput) {
    alert('⚠️ Por favor, rechea o título e a data do evento.');
    return;
  }

  const fechaISO = new Date(fechaInput).toISOString();

  const payload = {
    titulo,
    fecha_hora: fechaISO,
    lugar,
    ubicacion,
    comentarios
  };

  const { error } = id
    ? await supabaseClient.from('eventos').update(payload).eq('id', id)
    : await supabaseClient.from('eventos').insert([payload]);

  if (error) {
    console.error('Error Supabase:', error);
    alert(`Error ao gardar evento: ${error.message}`);
  } else {
    alert('✅ Evento gardado correctamente');
    resetForm('eve');
    cargarEventos();
  }
}
    
