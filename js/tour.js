// ==========================================
// RECORRIDO INTERACTIVO DEL VISOR
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        // Comprobar que Driver.js cargó.
        if (
            !window.driver ||
            !window.driver.js
        ) {
            console.error(
                'Driver.js no pudo cargarse.'
            );

            return;
        }

        const crearDriver =
            window.driver.js.driver;

        const panelLateral =
            document.getElementById(
                'panel-lateral'
            );

        const accesoBacteriologico =
            document.getElementById(
                'acceso-bacteriologico'
            );

        const recorridoVisor =
            crearDriver({

                animate: true,
                duration: 350,

                overlayColor: '#172a33',
                overlayOpacity: 0.68,

                smoothScroll: true,
                allowClose: true,

                showProgress: true,

                showButtons: [
                    'next',
                    'previous',
                    'close'
                ],

                nextBtnText:
                    'Siguiente',

                prevBtnText:
                    'Anterior',

                doneBtnText:
                    'Comenzar',

                progressText:
                    'Paso {{current}} de {{total}}',

                popoverClass:
                    'tour-jira',

                steps: [

                    // --------------------------------
                    // PASO 1: INTRODUCCIÓN
                    // --------------------------------

                    {
                        popover: {
                            title:
                                '¿Cómo utilizar el visor?',

                            description: `
                                <div class="tour-intro-modulos">

                                    <p class="tour-introduccion">
                                        Consulta información histórica
                                        de calidad del agua mediante
                                        dos módulos:
                                    </p>

                                    <div class="tour-modulo">

                                        <span class="tour-icono-gota">
                                            <svg
                                                viewBox="0 0 32 32"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="
                                                        M16 3
                                                        C16 3 7 14 7 20
                                                        A9 9 0 0 0 25 20
                                                        C25 14 16 3 16 3Z
                                                    "
                                                ></path>

                                                <circle
                                                    cx="13"
                                                    cy="18"
                                                    r="1.6"
                                                ></circle>

                                                <circle
                                                    cx="19"
                                                    cy="21"
                                                    r="1.5"
                                                ></circle>

                                                <circle
                                                    cx="17"
                                                    cy="16"
                                                    r="1.2"
                                                ></circle>
                                            </svg>
                                        </span>

                                        <span class="tour-modulo-texto">

                                            <strong>
                                                Monitoreo bacteriológico
                                            </strong>

                                            <small>
                                                Consulta <em>E. coli</em>,
                                                aptitud recreativa y
                                                nivel de atención.
                                            </small>

                                        </span>

                                    </div>


                                    <div class="tour-modulo">

                                        <span class="tour-icono-gota">
                                            <svg
                                                viewBox="0 0 32 32"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="
                                                        M16 3
                                                        C16 3 8 13 8 19
                                                        A8 8 0 0 0 24 19
                                                        C24 13 16 3 16 3Z
                                                    "
                                                ></path>

                                                <path
                                                    d="
                                                        M11 21
                                                        C13 19 15 23 17 21
                                                        C19 19 21 23 23 21
                                                    "
                                                ></path>
                                            </svg>
                                        </span>

                                        <span class="tour-modulo-texto">

                                            <strong>
                                                Parámetros fisicoquímicos
                                            </strong>

                                            <small>
                                                Consulta pH, oxígeno
                                                disuelto, temperatura,
                                                conductividad y otros
                                                parámetros.
                                            </small>

                                        </span>

                                    </div>

                                </div>
                            `,

                            side: 'over',
                            align: 'center'
                        }
                    },


                    // --------------------------------
                    // PASO 2: BARRA LATERAL
                    // --------------------------------

                    {
                        element:
                            '.barra-panel-contraido',

                        popover: {
                            title:
                                'Selecciona un módulo',

                            description:
                                'Utiliza las gotas para abrir el monitoreo bacteriológico o los parámetros fisicoquímicos.',

                            side: 'right',
                            align: 'start'
                        },

                        onNextClick:
                            function () {

                                if (
                                    accesoBacteriologico
                                ) {
                                    accesoBacteriologico
                                        .click();
                                }

                                setTimeout(
                                    function () {
                                        recorridoVisor
                                            .moveNext();
                                    },
                                    350
                                );
                            }
                    },


                    // --------------------------------
                    // PASO 3: BUSCADOR
                    // --------------------------------

                    {
                        element:
                            '.buscador-sitios',

                        popover: {
                            title:
                                'Busca un sitio',

                            description:
                                'Escribe el nombre de un sitio. El mapa se acercará automáticamente y abrirá su información.',

                            side: 'right',
                            align: 'start'
                        }
                    },


                    // --------------------------------
                    // PASO 4: FILTROS
                    // --------------------------------

                    {
                        element:
                            '.tarjeta-filtros',

                        popover: {
                            title:
                                'Selecciona el periodo',

                            description:
                                'Elige el año y el mes que deseas consultar y después presiona Consultar.',

                            side: 'right',
                            align: 'start'
                        }
                    },


                    // --------------------------------
                    // PASO 5: MAPA
                    // --------------------------------

                    {
                        element:
                            '#map',

                        popover: {
                            title:
                                'Explora el mapa',

                            description:
                                'También puedes seleccionar directamente cualquier sitio haciendo clic sobre su punto.',

                            side: 'left',
                            align: 'center'
                        }
                    },


                    // --------------------------------
                    // PASO 6: CONTROLES
                    // --------------------------------

                    {
                        element:
                            '.controles-flotantes-mapa',

                        popover: {
                            title:
                                'Capas y simbología',

                            description:
                                'Usa estos botones para activar o desactivar capas, consultar la simbología bacteriológica y acceder al glosario de párametros y unidades.',

                            side: 'left',
                            align: 'start'
                        }
                    },


                    // --------------------------------
                    // PASO 7: FINAL
                    // --------------------------------

                    {
                        popover: {
                            title:
                                '¡Todo listo!',

                            description:
                                'Ya puedes comenzar a explorar la información histórica de calidad del agua en el territorio de la JIRA.',

                            side: 'over',
                            align: 'center'
                        }
                    }

                ],


                // Al terminar.
                onDoneClick:
                    function () {

                        recorridoVisor.destroy();

                        if (
                            typeof map !==
                                'undefined' &&
                            map
                        ) {
                            setTimeout(
                                function () {
                                    map.invalidateSize();
                                },
                                250
                            );
                        }
                    },


                // Al cerrar el recorrido.
                onDestroyed:
                    function () {

                        if (
                            typeof map !==
                                'undefined' &&
                            map
                        ) {
                            setTimeout(
                                function () {
                                    map.invalidateSize();
                                },
                                250
                            );
                        }
                    }

            });


        // Iniciar automáticamente.
        setTimeout(
            function () {
                recorridoVisor.drive();
            },
            900
        );


        // Dejar disponible para un futuro
        // botón de ayuda.
        window.iniciarTourVisor =
            function () {

                if (panelLateral) {
                    panelLateral.classList.add(
                        'contraido'
                    );

                    document.body.classList.remove(
                        'panel-abierto'
                    );
                }

                setTimeout(
                    function () {
                        recorridoVisor.drive();
                    },
                    300
                );
            };


        console.log(
            'Recorrido interactivo cargado.'
        );

    }
);
