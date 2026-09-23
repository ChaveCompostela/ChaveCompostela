
        // Variable global para recordar o xénero seleccionado (masculina/femenina)
        let activeGender = 'masculina';

        function switchView(viewName, element) {
            document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            
            document.getElementById(`view-${viewName}`).classList.add('active');
            element.classList.add('active');

            // Amosar o selector superior en Equipos, Clasificación e Calendario
            const leagueSelector = document.getElementById('leagueSelectorContainer');
            if (viewName === 'equipos' || viewName === 'clasificacion' || viewName === 'calendario') {
                leagueSelector.style.display = 'flex';
                refreshLeagueView();
            } else {
                leagueSelector.style.display = 'none';
            }
        }

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

    

