
        // Variable global para recordar o xénero seleccionado (masculina/femenina)
        let activeGender = 'masculina';

function switchTab(evt, tabName) {
  // 1. Ocultar todos los paneles
  document.querySelectorAll('.panel').forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('active');
  });

  // 2. Desactivar todos los botones
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  // 3. Activar el panel seleccionado (#panel-clubes, #panel-equipos, etc.)
  const targetPanel = document.getElementById(`panel-${tabName}`) || document.getElementById(tabName);
  if (targetPanel) {
    targetPanel.style.display = 'block';
    targetPanel.classList.add('active');
  } else {
    console.error(`No se encontró el panel con ID: panel-${tabName}`);
  }

  // 4. Activar el botón pulsado
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  }
}

// Exposición global
window.switchTab = switchTab;

        // FUNCIÓN CORRIXIDA: Escoita o clic dos botóns superiores e cambia de liga
        function switchLeague(gender) {
            activeGender = gender;
            
            // Cambiar o estilo activo dos botóns superiores do selector
            document.querySelectorAll('.league-btn').forEach(btn => btn.classList.remove('active'));
            
            // Busca o botón pulsado usando o evento global e activa a súa clase visual
            if (event && event.target) {
                event.target.classList.add('active');
            }

            // Actualiza os contidos visibles de xeito automático
            refreshLeagueView();
        }
        function refreshLeagueView() {
            if (activeGender === 'masculina') {
                // Táboas de Clasificación de Equipos
                if(document.getElementById('tabla-masculina')) document.getElementById('tabla-masculina').style.display = 'table';
                if(document.getElementById('tabla-femenina')) document.getElementById('tabla-femenina').style.display = 'none';
                // Listas de Equipos
                if(document.getElementById('lista-equipos-masculina')) document.getElementById('lista-equipos-masculina').style.display = 'flex';
                if(document.getElementById('lista-equipos-femenina')) document.getElementById('lista-equipos-femenina').style.display = 'none';
                // Calendario Completo
                if(document.getElementById('calendario-completo-masculino')) document.getElementById('calendario-completo-masculino').style.display = 'block';
                if(document.getElementById('calendario-completo-femenino')) document.getElementById('calendario-completo-femenino').style.display = 'none';
                // Máximos Chavistas
                if(document.getElementById('chavistas-masculino')) document.getElementById('chavistas-masculino').style.display = 'block';
                if(document.getElementById('chavistas-femenino')) document.getElementById('chavistas-femenino').style.display = 'none';
            } else {
                // Táboas de Clasificación de Equipos
                if(document.getElementById('tabla-masculina')) document.getElementById('tabla-masculina').style.display = 'none';
                if(document.getElementById('tabla-femenina')) document.getElementById('tabla-femenina').style.display = 'table';
                // Listas de Equipos
                if(document.getElementById('lista-equipos-masculina')) document.getElementById('lista-equipos-masculina').style.display = 'none';
                if(document.getElementById('lista-equipos-femenina')) document.getElementById('lista-equipos-femenina').style.display = 'flex';
                // Calendario Completo
                if(document.getElementById('calendario-completo-masculino')) document.getElementById('calendario-completo-masculino').style.display = 'none';
                if(document.getElementById('calendario-completo-femenino')) document.getElementById('calendario-completo-femenino').style.display = 'block';
                // Máximos Chavistas
                if(document.getElementById('chavistas-masculino')) document.getElementById('chavistas-masculino').style.display = 'none';
                if(document.getElementById('chavistas-femenino')) document.getElementById('chavistas-femenino').style.display = 'block';
            }
        }


        // Función para abrir/pechar a lista de xogadores ao facer clic na tarxeta do equipo
        function togglePlayers(cardElement) {
            const dropdown = cardElement.querySelector('.players-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        }

    

