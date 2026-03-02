// ======================================
// VARIABLES GLOBALES
// ======================================
let votanteActual = null;
let candidatos = {
    personeros: [],
    contralores: []
};

// ======================================
// CARGAR CANDIDATOS Y DATOS AL INICIAR
// ======================================
window.addEventListener('load', async function() {
    // Verificar sesión de administrador
    const autenticado = sessionStorage.getItem('autenticado');
    const configAccessDiv = document.querySelector('.config-access');
    
    if (autenticado && autenticado === 'true') {
        // Usuario es administrador - mostrar panel de configuración
        document.getElementById('votingArea').classList.add('hidden');
        document.getElementById('preliminaresArea').classList.add('hidden');
        document.getElementById('configArea').classList.remove('hidden');
        document.getElementById('modalKey').classList.add('hidden');
        
        // Esconder botones de configuración (ya está en panel)
        if (configAccessDiv) {
            configAccessDiv.style.display = 'none';
        }
        
        // Cargar datos del panel administrativo
        try {
            await cargarCandidatos();
            await cargarVotantes();
            await cargarCandidatosAdmin();
            await cargarResultados();
            console.log('Panel administrativo cargado correctamente');
        } catch (error) {
            console.error('Error al cargar datos administrativos:', error);
        }
    } else {
        // Usuario regular - mostrar interfaz de votación
        document.getElementById('configArea').classList.add('hidden');
        document.getElementById('preliminaresArea').classList.add('hidden');
        document.getElementById('votingArea').classList.remove('hidden');
        document.getElementById('modalKey').classList.add('hidden');
        
        // Mostrar botones de configuración
        if (configAccessDiv) {
            configAccessDiv.style.display = 'flex';
        }
        
        // Cargar solo candidatos para votación
        try {
            await cargarCandidatos();
            console.log('Interfaz de votación cargada correctamente');
        } catch (error) {
            console.error('Error al cargar candidatos:', error);
        }
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
// CARGAR VOTANTES PARA ADMIN
// ======================================
async function cargarVotantes() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/get_votantes.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            mostrarListaVotantes(data.votantes);
        }
    } catch (error) {
        console.error('Error al cargar votantes:', error);
    }
}

// ======================================
// CARGAR TODOS LOS VOTANTES DEL API
// ======================================
async function cargarTodosVotantes() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/get_votantes.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success && data.votantes) {
            mostrarListaVotantes(data.votantes);
        } else {
            const listaDiv = document.getElementById('listaVotantesDiv');
            listaDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-style: italic;">No hay votantes registrados</p>';
        }
    } catch (error) {
        console.error('Error al cargar votantes:', error);
        const listaDiv = document.getElementById('listaVotantesDiv');
        listaDiv.innerHTML = '<p style="text-align: center; color: #dc3545;">Error al cargar votantes</p>';
    }
}

// ======================================
// MOSTRAR LISTA DE VOTANTES
// ======================================
function mostrarListaVotantes(votantes) {
    const listaDiv = document.getElementById('listaVotantesDiv');
    listaDiv.innerHTML = '';

    if (!votantes || votantes.length === 0) {
        listaDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-style: italic;">No hay votantes registrados</p>';
        return;
    }

    votantes.forEach(votante => {
        const item = document.createElement('div');
        item.className = 'votante-item';
        
        // Determinar estado del voto
        const estadoVoto = votante.voto_realizado ? '✓ Votó' : 'Pendiente';
        const colorEstado = votante.voto_realizado ? '#28a745' : '#ffc107';
        
        item.innerHTML = `
            <div class="votante-info">
                <strong>${votante.nombre}</strong>
                <small>Código: ${votante.id_votante}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 12px; color: ${colorEstado}; font-weight: 600;">${estadoVoto}</span>
                <button class="btn-eliminar" onclick="eliminarVotanteAdmin('${votante.id_votante}')">Eliminar</button>
            </div>
        `;
        listaDiv.appendChild(item);
    });
}

// ======================================
// AGREGAR VOTANTE INDIVIDUAL
// ======================================
async function agregarVotanteIndividual() {
    const nombre = document.getElementById('nuevoNombreVotante').value.trim();
    const codigo = document.getElementById('nuevoCódigoVotante').value.trim();

    if (!nombre || !codigo) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/add_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo: codigo,
                nombre: nombre
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votante agregado correctamente');
            document.getElementById('nuevoNombreVotante').value = '';
            document.getElementById('nuevoCódigoVotante').value = '';
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.message || data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar votante');
    }
}

// ======================================
// CARGAR VOTANTES DESDE EXCEL
// ======================================
async function cargarVotantesExcel(input) {
    const file = input.files[0];
    if (!file) return;

    const statusDiv = document.getElementById('statusCarga');
    statusDiv.textContent = '⏳ Procesando archivo...';

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let cargados = 0;
        let errores = 0;

        for (const row of jsonData) {
            try {
                const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/add_votante.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        codigo: row.codigo || row.Código || row.code || row.Code || row.id || row.Id,
                        nombre: row.nombre || row.Nombre || row.name || row.Name
                    })
                });

                const result = await response.json();
                if (result.success) {
                    cargados++;
                } else {
                    errores++;
                }
            } catch (error) {
                errores++;
            }
        }

        statusDiv.className = cargados > 0 ? 'success' : 'error';
        statusDiv.textContent = `✓ Cargados: ${cargados} | ✗ Errores: ${errores}`;
        await cargarVotantes();
        input.value = '';
    } catch (error) {
        statusDiv.className = 'error';
        statusDiv.textContent = '✗ Error al procesar archivo';
        console.error('Error:', error);
    }
}

// ======================================
// ELIMINAR VOTANTE
// ======================================
async function eliminarVotante(idVotante) {
    if (!confirm('¿Eliminar este votante?')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/delete_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_votante: idVotante })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votante eliminado');
            await cargarVotantes();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar votante');
    }
}

// ======================================
// ELIMINAR VOTANTE (DESDE ADMIN)
// ======================================
async function eliminarVotanteAdmin(idVotante) {
    if (!confirm('¿Está seguro de eliminar este votante? Se eliminarán todos sus registros.')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/delete_votante.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_votante: idVotante })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votante eliminado correctamente');
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.error || data.message));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar votante');
    }
}

// ======================================
// CARGAR CANDIDATOS PARA ADMIN
// ======================================
async function cargarCandidatosAdmin() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/obtener_candidatos.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            mostrarListaCandidatos('personeros', data.personeros);
            mostrarListaCandidatos('contralores', data.contralores);
        }
    } catch (error) {
        console.error('Error al cargar candidatos:', error);
    }
}

// ======================================
// MOSTRAR LISTA DE CANDIDATOS
// ======================================
function mostrarListaCandidatos(tipo, candidatos) {
    const elementId = tipo === 'personeros' ? 'listaPersoneros' : 'listaContralores';
    const containerDiv = document.getElementById(elementId);
    containerDiv.innerHTML = '';

    if (candidatos.length === 0) {
        containerDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px; font-style: italic;">No hay candidatos registrados</p>';
        return;
    }

    candidatos.forEach(candidato => {
        const item = document.createElement('div');
        item.className = 'candidato-item';
        
        // Crear elemento de foto
        const fotoDiv = document.createElement('div');
        fotoDiv.style.display = 'flex';
        fotoDiv.style.alignItems = 'center';
        fotoDiv.style.flex = '1';
        
        if (candidato.foto) {
            const fotoImg = document.createElement('img');
            fotoImg.src = candidato.foto;
            fotoImg.alt = candidato.nombre;
            fotoImg.className = 'candidato-foto';
            fotoDiv.appendChild(fotoImg);
        } else {
            const fotoPlaceholder = document.createElement('div');
            fotoPlaceholder.className = 'candidato-foto sin-foto';
            fotoPlaceholder.innerHTML = '<i class="fas fa-user"></i>';
            fotoDiv.appendChild(fotoPlaceholder);
        }
        
        // Crear elemento de información
        const infoDiv = document.createElement('div');
        infoDiv.className = 'candidato-info';
        infoDiv.innerHTML = `
            <strong>${candidato.nombre}</strong>
            <small>Número: ${candidato.numero}</small>
        `;
        fotoDiv.appendChild(infoDiv);
        
        // Crear botón eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = () => eliminarCandidato(candidato.id_candidato, tipo);
        
        item.appendChild(fotoDiv);
        item.appendChild(btnEliminar);
        containerDiv.appendChild(item);
    });
}

// ======================================
// AGREGAR CANDIDATO PERSONERO
// ======================================
async function agregarCandidatoPersonero() {
    await agregarCandidato('Personero');
    document.getElementById('nombrePersonero').value = '';
    document.getElementById('numeroPersonero').value = '';
}

// ======================================
// AGREGAR CANDIDATO CONTRALOR
// ======================================
async function agregarCandidatoContralor() {
    await agregarCandidato('Contralor');
    document.getElementById('nombreContralor').value = '';
    document.getElementById('numeroContralor').value = '';
}

// ======================================
// AGREGAR CANDIDATO GENERAL
// ======================================
async function agregarCandidato(cargo) {
    const nombre = cargo === 'Personero' 
        ? document.getElementById('nombrePersonero').value.trim()
        : document.getElementById('nombreContralor').value.trim();
    const numero = cargo === 'Personero'
        ? document.getElementById('numeroPersonero').value.trim()
        : document.getElementById('numeroContralor').value.trim();
    const fotoInput = cargo === 'Personero'
        ? document.getElementById('fotoPersonero')
        : document.getElementById('fotoContralor');

    if (!nombre || !numero) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        // Crear FormData para enviar archivos
        const formData = new FormData();
        formData.append('cargo', cargo);
        formData.append('nombre', nombre);
        formData.append('numero', numero);
        
        // Agregar imagen si existe
        if (fotoInput.files.length > 0) {
            formData.append('foto', fotoInput.files[0]);
        }

        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/add_candidato.php', {
            method: 'POST',
            body: formData
            // No establecer Content-Type, el navegador lo hace automáticamente
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Candidato agregado correctamente');
            // Limpiar campos
            document.getElementById('nombrePersonero').value = '';
            document.getElementById('numeroPersonero').value = '';
            document.getElementById('fotoPersonero').value = '';
            document.getElementById('nombreContralor').value = '';
            document.getElementById('numeroContralor').value = '';
            document.getElementById('fotoContralor').value = '';
            await cargarCandidatosAdmin();
        } else {
            alert('Error: ' + data.error || data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar candidato');
    }
}

// ======================================
// ELIMINAR CANDIDATO
// ======================================
async function eliminarCandidato(idCandidato, tipo) {
    if (!confirm('¿Está seguro de eliminar este candidato? Se eliminarán todos sus registros.')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/delete_candidato.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_candidato: idCandidato })
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Candidato eliminado correctamente');
            await cargarCandidatosAdmin();
        } else {
            alert('Error: ' + (data.error || data.message || 'No se pudo eliminar el candidato'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar candidato');
    }
}

// ======================================
// ACTUALIZAR FECHA DE VOTACIÓN
// ======================================
async function actualizarFechaVotacion() {
    const fecha = document.getElementById('fechaVotacionInput').value;

    if (!fecha) {
        alert('Por favor selecciona una fecha');
        return;
    }

    try {
        localStorage.setItem('fechaVotacion', new Date(fecha).toISOString());
        alert('✓ Fecha actualizada correctamente');
    } catch (error) {
        alert('Error al actualizar fecha');
    }
}

// ======================================
// CARGAR Y MOSTRAR RESULTADOS
// ======================================
async function cargarResultados() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/obtener_consolidado.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            mostrarResultadosAdmin(data);
        }
    } catch (error) {
        console.error('Error al cargar resultados:', error);
    }
}

// ======================================
// MOSTRAR RESULTADOS EN ADMIN
// ======================================
function mostrarResultadosAdmin(data) {
    const resumenDiv = document.getElementById('resumenResultados');
    let html = '';

    // Personeros
    html += '<div class="resultado-cargo-admin">';
    html += '<h4>🎓 Resultados Personero Estudiantil</h4>';
    data.personeros.forEach(p => {
        html += `
            <div class="resultado-item-admin">
                <span>${p.nombre} (#${p.numero})</span>
                <span class="votos-count">${p.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_personero > 0) {
        html += `
            <div class="resultado-item-admin">
                <span>Voto en Blanco</span>
                <span class="votos-count">${data.votos_blanco_personero} votos</span>
            </div>
        `;
    }
    html += '</div>';

    // Contralores
    html += '<div class="resultado-cargo-admin">';
    html += '<h4>⚖️ Resultados Contralor Estudiantil</h4>';
    data.contralores.forEach(c => {
        html += `
            <div class="resultado-item-admin">
                <span>${c.nombre} (#${c.numero})</span>
                <span class="votos-count">${c.total_votos} votos</span>
            </div>
        `;
    });
    if (data.votos_blanco_contralor > 0) {
        html += `
            <div class="resultado-item-admin">
                <span>Voto en Blanco</span>
                <span class="votos-count">${data.votos_blanco_contralor} votos</span>
            </div>
        `;
    }
    html += '</div>';

    // Resumen General
    html += '<div class="resultado-cargo-admin">';
    html += '<h4>📊 Resumen General</h4>';
    html += `
        <div class="resultado-item-admin">
            <span>Total de votantes registrados</span>
            <span class="votos-count">${data.total_registrados}</span>
        </div>
        <div class="resultado-item-admin">
            <span>Total que votaron</span>
            <span class="votos-count">${data.total_votaron}</span>
        </div>
        <div class="resultado-item-admin">
            <span>Participación</span>
            <span class="votos-count">${data.total_registrados > 0 ? Math.round((data.total_votaron / data.total_registrados) * 100) : 0}%</span>
        </div>
    `;
    html += '</div>';

    resumenDiv.innerHTML = html;
}

// ======================================
// EXPORTAR RESULTADOS A EXCEL
// ======================================
async function exportarResultadosExcel() {
    try {
        const apiUrl = window.location.origin + '/sistema_votacion/Votaciones/api/obtener_consolidado.php';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            const datosExcel = [];

            // Personeros
            datosExcel.push(['PERSONERO ESTUDIANTIL']);
            data.personeros.forEach(p => {
                datosExcel.push([p.nombre, p.numero, p.total_votos]);
            });
            datosExcel.push(['Voto en Blanco', '', data.votos_blanco_personero]);
            datosExcel.push([]);

            // Contralores
            datosExcel.push(['CONTRALOR ESTUDIANTIL']);
            data.contralores.forEach(c => {
                datosExcel.push([c.nombre, c.numero, c.total_votos]);
            });
            datosExcel.push(['Voto en Blanco', '', data.votos_blanco_contralor]);
            datosExcel.push([]);

            // Resumen
            datosExcel.push(['RESUMEN GENERAL']);
            datosExcel.push(['Total registrados', data.total_registrados]);
            datosExcel.push(['Total votaron', data.total_votaron]);
            datosExcel.push(['Participación', Math.round((data.total_votaron / data.total_registrados) * 100) + '%']);

            const ws = XLSX.utils.aoa_to_sheet(datosExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
            XLSX.writeFile(wb, 'Resultados_Votacion.xlsx');
        }
    } catch (error) {
        alert('Error al exportar resultados');
        console.error('Error:', error);
    }
}

// ======================================
// REINICIAR VOTACIÓN
// ======================================
async function reiniciarVotacionSistema() {
    if (!confirm('⚠️ ¿Estás seguro? Esto eliminará todos los votos registrados.')) return;

    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/reiniciar_votacion.php', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            alert('✓ Votación reiniciada correctamente');
            await cargarResultados();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error al reiniciar votación');
        console.error('Error:', error);
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
    document.getElementById('usuarioInput').value = '';
    document.getElementById('passwordInput').value = '';
}

async function verificarKey() {
    const usuario = document.getElementById('usuarioInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!usuario || !password) {
        alert('Por favor ingrese usuario y contraseña');
        return;
    }
    
    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/validar_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('modalKey').classList.add('hidden');
            document.getElementById('usuarioInput').value = '';
            document.getElementById('passwordInput').value = '';
            document.getElementById('votingArea').classList.add('hidden');
            document.getElementById('configArea').classList.remove('hidden');
            // Cargar automáticamente la lista de votantes al entrar
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.error || 'Credenciales inválidas'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al validar credenciales');
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
    
    // Cargar datos específicos según la pestaña
    if (tabName === 'votantes') {
        cargarTodosVotantes();
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
    document.getElementById('usuarioInput').value = '';
    document.getElementById('passwordInput').value = '';
}

async function verificarKey() {
    const usuario = document.getElementById('usuarioInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!usuario || !password) {
        alert('Por favor ingrese usuario y contraseña');
        return;
    }
    
    try {
        const response = await fetch(window.location.origin + '/sistema_votacion/Votaciones/api/validar_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('modalKey').classList.add('hidden');
            document.getElementById('usuarioInput').value = '';
            document.getElementById('passwordInput').value = '';
            document.getElementById('votingArea').classList.add('hidden');
            document.getElementById('configArea').classList.remove('hidden');
            // Cargar automáticamente la lista de votantes al entrar
            await cargarTodosVotantes();
        } else {
            alert('Error: ' + (data.error || 'Credenciales inválidas'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al validar credenciales');
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
    
    // Cargar votantes automáticamente cuando se hace clic en la pestaña "Votantes"
    if (tabName === 'votantes') {
        cargarTodosVotantes();
    }
}
