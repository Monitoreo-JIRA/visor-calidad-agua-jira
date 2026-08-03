// ==========================================
// CAMBIO ENTRE MÓDULOS
// ==========================================

const botonBacteriologico =
    document.getElementById(
        'boton-bacteriologico'
    );

const botonFisicoquimicos =
    document.getElementById(
        'boton-fisicoquimicos'
    );

const contenidoBacteriologico =
    document.getElementById(
        'contenido-bacteriologico'
    );

const contenidoFisicoquimico =
    document.getElementById(
        'contenido-fisicoquimico'
    );


// Módulo que está activo actualmente
let moduloActivo = 'bacteriologico';


function activarModuloBacteriologico() {
    moduloActivo = 'bacteriologico';

    botonBacteriologico.classList.add(
        'activo'
    );

    botonFisicoquimicos.classList.remove(
        'activo'
    );

    contenidoBacteriologico.classList.remove(
        'oculto'
    );

    contenidoFisicoquimico.classList.add(
        'oculto'
    );

    console.log(
        'Módulo activo: monitoreo bacteriológico'
    );
}


function activarModuloFisicoquimico() {
    moduloActivo = 'fisicoquimico';

    botonFisicoquimicos.classList.add(
        'activo'
    );

    botonBacteriologico.classList.remove(
        'activo'
    );

    contenidoFisicoquimico.classList.remove(
        'oculto'
    );

    contenidoBacteriologico.classList.add(
        'oculto'
    );

    console.log(
        'Módulo activo: parámetros fisicoquímicos'
    );
}


botonBacteriologico.addEventListener(
    'click',
    activarModuloBacteriologico
);


botonFisicoquimicos.addEventListener(
    'click',
    activarModuloFisicoquimico
);