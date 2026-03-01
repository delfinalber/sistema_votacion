// ======================================
// VARIABLES GLOBALES
// ======================================
let votanteActual = null;
let candidatos = {
    personeros: [],
    contralores: []
};

// ======================================
// CARGAR CANDIDATOS AL INICIAR
// ======================================
window.addEventListener('load', async function() {
    // Verificar sesión
    const autenticado = sessionStorage.getItem('autenticado');
    if (!autenticado || autenticado !== 'true') {
        alert('Acceso denegado. Debes autenticarte primero.');
        window.location.href = 'index.html';
        return;
    }

    try {
        await cargarCandidatos();
        console.log('Candidatos cargados correctamente');
    } catch (error) {
        console.error('Error al cargar candidatos:', error);
    }
});

// ======================================
// CARGAR CANDIDATOS DEL API
// ======================================
async function cargarCandidatos() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/obtener_candidatos.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            candidatos = data;
            console.log('Candidatos cargados:', candidatos);
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar candidatos:', error);
    }
}

// ======================================
// VERIFICAR CÓDIGO DE VOTANTE
// ======================================
async function verificarCodigo() {
    const codigo = document.getElementById('codigoVotante').value.trim();

    if (!codigo) {
        alert('Por favor ingresa tu código de votante');
        return;
    }

    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/validar_votante.php';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_votante: codigo })
        });

        const data = await response.json();

        if (data.success) {
            votanteActual = data.votante;
            document.getElementById('nombreVotante').textContent = votanteActual.nombre;
            document.getElementById('votanteInfo').classList.remove('hidden');
            
            // Cargar candidatos en la interfaz
            cargarCandidatosInterfaz();
        } else {
            alert(data.message || 'Votante no encontrado o ya ha votado');
            document.getElementById('codigoVotante').value = '';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al verificar el código');
    }
}

// ======================================
// CARGAR CANDIDATOS EN LA INTERFAZ
// ======================================
function cargarCandidatosInterfaz() {
    // Personeros
    const personeroContainer = document.getElementById('candidatosPersonero');
    personeroContainer.innerHTML = '';
    
    candidatos.personeros.forEach(candidato => {
        const label = document.createElement('label');
        label.className = 'candidato-option';
        label.innerHTML = `
            <input type="radio" name="personero" value="${candidato.id_candidato}" data-nombre="${candidato.nombre}">
            <span>${candidato.numero} - ${candidato.nombre}</span>
        `;
        personeroContainer.appendChild(label);
    });

    // Contralores
    const contralorContainer = document.getElementById('candidatosContralor');
    contralorContainer.innerHTML = '';
    
    candidatos.contralores.forEach(candidato => {
        const label = document.createElement('label');
        label.className = 'candidato-option';
        label.innerHTML = `
            <input type="radio" name="contralor" value="${candidato.id_candidato}" data-nombre="${candidato.nombre}">
            <span>${candidato.numero} - ${candidato.nombre}</span>
        `;
        contralorContainer.appendChild(label);
    });
}

// ======================================
// ENVIAR VOTO
// ======================================
async function enviarVoto() {
    if (!votanteActual) {
        alert('Debes verificar tu código primero');
        return;
    }

    const personeroRadios = document.querySelectorAll('input[name="personero"]:checked');
    const contralorRadios = document.querySelectorAll('input[name="contralor"]:checked');

    if (personeroRadios.length === 0 || contralorRadios.length === 0) {
        alert('Debes seleccionar candidatos para ambos cargos');
        return;
    }

    const idPersonero = personeroRadios[0].value === 'blanco' ? 0 : parseInt(personeroRadios[0].value);
    const idContralor = contralorRadios[0].value === 'blanco' ? 0 : parseInt(contralorRadios[0].value);

    try {
        // Registrar ambos votos en una transacción
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/registrar_votos_completo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_votante: votanteActual.id_votante,
                id_personero: idPersonero,
                id_contralor: idContralor
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message || 'Error al registrar el voto');
            return;
        }

        alert('¡Voto registrado exitosamente!');
        
        // Limpiar interfaz
        document.getElementById('codigoVotante').value = '';
        document.getElementById('votanteInfo').classList.add('hidden');
        document.getElementById('nombreVotante').textContent = '';
        votanteActual = null;

        // Mostrar resultados preliminares
        setTimeout(() => {
            mostrarResultadosPreliminares();
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar voto');
    }
}

// ======================================
// MOSTRAR RESULTADOS PRELIMINARES
// ======================================
async function mostrarResultadosPreliminares() {
    document.getElementById('votingArea').classList.add('hidden');
    document.getElementById('preliminaresArea').classList.remove('hidden');
    await actualizarResultadosPreliminares();
}

// ======================================
// ACTUALIZAR RESULTADOS PRELIMINARES
// ======================================
async function actualizarResultadosPreliminares() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/obtener_consolidado.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            mostrarResultados(data);
        } else {
            alert('Error al obtener resultados: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar resultados');
    }
}

// ======================================
// MOSTRAR RESULTADOS EN LA INTERFAZ
// ======================================
function mostrarResultados(data) {
    // Personeros
    let htmlPersoneros = '<div class="resultado-lista">';
    data.personeros.forEach(personero => {
        htmlPersoneros += `
            <div class="resultado-item">
                <span class="candidato-nombre">${personero.nombre} (#${personero.numero})</span>
                <span class="votos-badge">${personero.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_personero > 0) {
        htmlPersoneros += `
            <div class="resultado-item">
                <span class="candidato-nombre">Voto en Blanco</span>
                <span class="votos-badge">${data.votos_blanco_personero} votos</span>
            </div>
        `;
    }
    htmlPersoneros += '</div>';
    document.getElementById('resultadosPersoneroPreliminares').innerHTML = htmlPersoneros;

    // Contralores
    let htmlContralores = '<div class="resultado-lista">';
    data.contralores.forEach(contralor => {
        htmlContralores += `
            <div class="resultado-item">
                <span class="candidato-nombre">${contralor.nombre} (#${contralor.numero})</span>
                <span class="votos-badge">${contralor.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_contralor > 0) {
        htmlContralores += `
            <div class="resultado-item">
                <span class="candidato-nombre">Voto en Blanco</span>
                <span class="votos-badge">${data.votos_blanco_contralor} votos</span>
            </div>
        `;
    }
    htmlContralores += '</div>';
    document.getElementById('resultadosContralorPreliminares').innerHTML = htmlContralores;

    // Resumen General
    const htmlResumen = `
        <div class="resumen-stats">
            <div class="stat-item">
                <span class="stat-label">Total de Votantes Registrados</span>
                <span class="stat-value">${data.total_registrados}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total que Votaron</span>
                <span class="stat-value">${data.total_votaron}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Participación</span>
                <span class="stat-value">${data.total_registrados > 0 ? Math.round((data.total_votaron / data.total_registrados) * 100) : 0}%</span>
            </div>
        </div>
    `;
    document.getElementById('resumenGeneralPreliminares').innerHTML = htmlResumen;
}

// ======================================
// VOLVER A VOTACIÓN
// ======================================
function volverDesdePreliminares() {
    document.getElementById('preliminaresArea').classList.add('hidden');
    document.getElementById('votingArea').classList.remove('hidden');
}

// ======================================
// VOLVER A VOTACIÓN DESDE CONFIGURACIÓN
// ======================================
function volverVotacion() {
    document.getElementById('configArea').classList.add('hidden');
    document.getElementById('votingArea').classList.remove('hidden');
}

// ======================================
// MOSTRAR MODAL DE CONFIGURACIÓN
// ======================================
function mostrarModalKey() {
    document.getElementById('modalKey').classList.remove('hidden');
}

function cerrarModalKey() {
    document.getElementById('modalKey').classList.add('hidden');
    document.getElementById('keyInput').value = '';
}

function verificarKey() {
    const key = document.getElementById('keyInput').value;
    if (key === 'admin123') {
        document.getElementById('modalKey').classList.add('hidden');
        document.getElementById('votingArea').classList.add('hidden');
        document.getElementById('configArea').classList.remove('hidden');
    } else {
        alert('Clave incorrecta');
    }
}

// ======================================
// GESTIÓN DE TABS EN CONFIGURACIÓN
// ======================================
function mostrarTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    
    const tabBtn = document.querySelectorAll('.tab-btn');
    tabBtn.forEach(btn => btn.classList.remove('active'));
    
    const tab = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tab) {
        tab.classList.remove('hidden');
    }
    
    event.target.classList.add('active');
}
