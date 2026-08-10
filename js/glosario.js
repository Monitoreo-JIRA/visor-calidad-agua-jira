// ==========================================
// GLOSARIO DE PARÁMETROS
// ==========================================

const botonGlosario =
    document.getElementById(
        'boton-glosario'
    );

const modalGlosario =
    document.getElementById(
        'modal-glosario'
    );

const cerrarGlosario =
    document.getElementById(
        'cerrar-glosario'
    );

const pestanasGlosario =
    document.querySelectorAll(
        '.glosario-pestana'
    );

const seccionesGlosario =
    document.querySelectorAll(
        '.glosario-seccion'
    );


// ==========================================
// ABRIR GLOSARIO
// ==========================================

function abrirGlosario() {

    if (!modalGlosario) {
        return;
    }

    modalGlosario.classList.remove(
        'oculto'
    );

    modalGlosario.setAttribute(
        'aria-hidden',
        'false'
    );
}


// ==========================================
// CERRAR GLOSARIO
// ==========================================

function ocultarGlosario() {

    if (!modalGlosario) {
        return;
    }

    modalGlosario.classList.add(
        'oculto'
    );

    modalGlosario.setAttribute(
        'aria-hidden',
        'true'
    );
}


// ==========================================
// CAMBIAR ENTRE PESTAÑAS
// ==========================================

function cambiarSeccionGlosario(
    nombreSeccion
) {

    pestanasGlosario.forEach(
        function (pestana) {

            const activa =
                pestana.dataset.glosario ===
                nombreSeccion;

            pestana.classList.toggle(
                'activo',
                activa
            );

            pestana.setAttribute(
                'aria-selected',
                activa
                    ? 'true'
                    : 'false'
            );
        }
    );


    seccionesGlosario.forEach(
        function (seccion) {

            const visible =
                seccion.id ===
                `glosario-${nombreSeccion}`;

            seccion.classList.toggle(
                'oculto',
                !visible
            );
        }
    );
}


// ==========================================
// EVENTOS
// ==========================================

if (
    botonGlosario &&
    modalGlosario &&
    cerrarGlosario
) {

    // Abrir con el botón "i"

    botonGlosario.addEventListener(
        'click',
        abrirGlosario
    );


    // Cerrar con la X

    cerrarGlosario.addEventListener(
        'click',
        ocultarGlosario
    );


    // Cerrar al hacer clic fuera
    // de la ventana

    modalGlosario.addEventListener(
        'click',
        function (evento) {

            if (
                evento.target ===
                modalGlosario
            ) {
                ocultarGlosario();
            }
        }
    );


    // Cerrar con la tecla Escape

    document.addEventListener(
        'keydown',
        function (evento) {

            if (
                evento.key ===
                    'Escape' &&
                !modalGlosario
                    .classList
                    .contains('oculto')
            ) {
                ocultarGlosario();
            }
        }
    );
}


// ==========================================
// EVENTOS DE LAS PESTAÑAS
// ==========================================

pestanasGlosario.forEach(
    function (pestana) {

        pestana.addEventListener(
            'click',
            function () {

                cambiarSeccionGlosario(
                    this.dataset.glosario
                );
            }
        );
    }
);