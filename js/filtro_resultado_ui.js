
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('filtro-resultado');
    const boton = document.getElementById('boton-filtro-resultado');
    const opciones = document.getElementById('opciones-filtro-resultado');
    const texto = document.getElementById('texto-filtro-resultado');
    const circulo = boton?.querySelector('.circulo-resultado');

    if (!select || !boton || !opciones || !texto || !circulo) return;

    function cerrar() {
        opciones.hidden = true;
        boton.setAttribute('aria-expanded', 'false');
    }

    
function sincronizar() {
    const sinFiltro = select.value === 'todos';

    boton.disabled = select.disabled;

    texto.textContent = sinFiltro
        ? 'Filtrar por resultado...'
        : select.selectedOptions[0]?.textContent || '';

    circulo.className = 'circulo-resultado ' + select.value;
    circulo.hidden = sinFiltro;

    opciones.querySelectorAll('[data-resultado]').forEach(opcion => {
        const esQuitar = opcion.dataset.resultado === 'todos';

        if (esQuitar) {
            opcion.hidden = sinFiltro;
        } else {
            opcion.classList.toggle(
                'seleccionado',
                opcion.dataset.resultado === select.value
            );
        }
    });

    if (select.disabled) cerrar();
}

    boton.addEventListener('click', () => {
        if (boton.disabled) return;

        opciones.hidden = !opciones.hidden;
        boton.setAttribute('aria-expanded', String(!opciones.hidden));
    });

    opciones.querySelectorAll('[data-resultado]').forEach(opcion => {
        opcion.addEventListener('click', () => {
            select.value = opcion.dataset.resultado;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            sincronizar();
            cerrar();
        });
    });

    select.addEventListener('change', sincronizar);

    new MutationObserver(sincronizar).observe(select, {
        attributes: true,
        attributeFilter: ['disabled']
    });

    document.addEventListener('click', evento => {
        if (!evento.target.closest('#selector-resultado')) cerrar();
    });

    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') cerrar();
    });

    sincronizar();
});
