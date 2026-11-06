
// CONTADOR PÚBLICO DE VISITAS - JIRA

const claveContador = 'jira_visor_historico_calidad_agua_2026';

const urlContador =
    'https://countapi.mileshilliard.com/api/v1/hit/' +
    claveContador;

const numeroVisitas = document.getElementById('numero-visitas');

if (numeroVisitas) {
    fetch(urlContador, { cache: 'no-store' })
        .then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error('No se pudo consultar el contador');
            }

            return respuesta.json();
        })
        .then(function (datos) {
            if (!Number.isFinite(datos.value)) {
                throw new Error('Respuesta no válida');
            }

            numeroVisitas.textContent =
                datos.value.toLocaleString('es-MX');
        })
        .catch(function (error) {
            console.error('Error en contador de visitas:', error);
            numeroVisitas.textContent = '—';
        });
}
