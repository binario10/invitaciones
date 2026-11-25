<?php

function getApatzinganDemoSeeds(): array
{
    return [
        'demo-boda-apatzingan' => [
            'slug'      => 'demo-boda-apatzingan',
            'eventType' => 'wedding',
            'pageTitle' => 'Sofía & Alejandro | Nuestra Boda en Apatzingán',
            'theme'     => [
                '--bg-primary'     => '#faf8f5',
                '--bg-secondary'   => '#f2ede4',
                '--text-primary'   => '#2c2825',
                '--text-secondary' => '#6e6862',
                '--accent-primary' => '#8c7a6b',
                '--accent-dark'    => '#6e5e51',
                '--border-light'   => '#e5dfd5',
            ],
            'welcome'   => [
                'initials'   => 'S & A',
                'message'    => 'Con la bendición de Dios y nuestros padres, te invitamos a celebrar nuestra boda',
                'buttonText' => 'Abrir Invitación',
            ],
            'hero'      => [
                'tag'           => '¡Nos Casamos!',
                'primaryName'   => 'Sofía',
                'connector'     => '&',
                'secondaryName' => 'Alejandro',
                'dateISO'       => '2026-12-19T17:00:00',
                'dateDisplay'   => '19 . DICIEMBRE . 2026',
                'heroImage'     => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
                'musicEnabled'  => false,
                'musicUrl'      => '',
            ],
            'quote'     => [
                'enabled' => true,
                'text'    => '“El amor todo lo puede, todo lo cree, todo lo espera y todo lo soporta.”',
                'author'  => '1 Corintios 13:7',
            ],
            'familySection' => [
                'enabled'  => true,
                'subtitle' => 'Con la bendición de nuestras familias',
                'groups'   => [
                    [
                        'id'      => 'padres_novia',
                        'enabled' => true,
                        'role'    => 'Padres de la Novia',
                        'members' => [
                            'Sr. Roberto Mendoza Ochoa',
                            'Sra. María Elena Carrillo de Mendoza',
                        ],
                    ],
                    [
                        'id'      => 'padres_novio',
                        'enabled' => true,
                        'role'    => 'Padres del Novio',
                        'members' => [
                            'Sr. Carlos Alberto Vargas Pérez',
                            'Sra. Patricia Gómez de Vargas',
                        ],
                    ],
                    [
                        'id'      => 'padrinos_velacion',
                        'enabled' => true,
                        'role'    => 'Padrinos de Velación',
                        'members' => [
                            'Ing. Fernando Solorio Valencia',
                            'Lic. Gabriela Navarro de Solorio',
                        ],
                    ],
                ],
            ],
            'events' => [
                [
                    'id'      => 'ceremonia_boda',
                    'enabled' => true,
                    'icon'    => 'church',
                    'type'    => 'Ceremonia Religiosa',
                    'time'    => '17:00 HRS',
                    'venue'   => 'Catedral de Nuestra Señora de la Asunción',
                    'address' => 'Av. Constitución de 1814 Sur #1, Centro, 60600 Apatzingán, Mich.',
                    'mapUrl'  => 'https://maps.google.com/?q=Catedral+de+Apatzingan+Michoacan',
                ],
                [
                    'id'      => 'recepcion_boda',
                    'enabled' => true,
                    'icon'    => 'wine',
                    'type'    => 'Recepción y Banquete',
                    'time'    => '19:30 HRS',
                    'venue'   => 'Salón & Jardín Quinta Real Apatzingán',
                    'address' => 'Carretera Apatzingán - Cuatro Caminos Km 2.5, Apatzingán, Mich.',
                    'mapUrl'  => 'https://maps.google.com/?q=Apatzingan+Michoacan',
                ],
            ],
            'dressCode' => [
                'enabled'     => true,
                'title'       => 'Formal / Etiqueta Rigurosa',
                'description' => 'Damas vestido largo (reservamos el color blanco y marfil para la novia). Caballeros traje formal.',
            ],
            'gifts' => [
                'enabled'  => true,
                'subtitle' => 'Mesa de Regalos',
                'message'  => 'Tu presencia en nuestro gran día es el mejor regalo; si deseas tener un detalle con nosotros, ponemos a tu disposición:',
                'bank'     => [
                    'enabled'  => true,
                    'bankName' => 'BBVA México',
                    'holder'   => 'Sofía Mendoza Carrillo',
                    'clabe'    => '012470015894321098',
                ],
                'storeRegistry' => [
                    'enabled'     => true,
                    'storeName'   => 'Liverpool',
                    'eventNumber' => '51489204',
                    'url'         => 'https://mesaderegalos.liverpool.com.mx',
                ],
            ],
            'gallery' => [
                'enabled'  => true,
                'subtitle' => 'Nuestra Historia en Imágenes',
                'title'    => 'Sesión Pre-Boda',
                'photos'   => [
                    [
                        'id'   => 'boda_gal_1',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Sofía y Alejandro sesión compromiso',
                    ],
                    [
                        'id'   => 'boda_gal_2',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Atardecer juntos',
                    ],
                    [
                        'id'   => 'boda_gal_3',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Anillos de compromiso',
                    ],
                    [
                        'id'   => 'boda_gal_4',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Celebración de amor',
                    ],
                ],
            ],
            'album' => [
                'enabled'     => true,
                'pageHeading' => 'Álbum de Boda • Sofía & Alejandro',
                'avatarImage' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=85',
            ],
            'rsvp' => [
                'whatsappPhone' => '5214531234567',
            ],
            'footer' => [
                'monogram' => 'S & A',
            ],
            'sectionOrder' => [
                'countdown',
                'familyQuote',
                'locations',
                'dressCodeGifts',
                'gallery',
                'album',
                'rsvp',
            ],
        ],

        'demo-xv-apatzingan' => [
            'slug'      => 'demo-xv-apatzingan',
            'eventType' => 'xv',
            'pageTitle' => 'Valeria Guadalupe | Mis XV Años en Apatzingán',
            'theme'     => [
                '--bg-primary'     => '#fdf9f8',
                '--bg-secondary'   => '#f6ebe9',
                '--text-primary'   => '#332629',
                '--text-secondary' => '#786266',
                '--accent-primary' => '#b77b82',
                '--accent-dark'    => '#945b62',
                '--border-light'   => '#ebd9d7',
            ],
            'welcome'   => [
                'initials'   => 'XV • V',
                'message'    => 'Hay momentos en la vida que se guardan para siempre en el corazón. Acompáñame a celebrar mis XV Años',
                'buttonText' => 'Abrir Invitación',
            ],
            'hero'      => [
                'tag'           => 'Mis XV Años',
                'primaryName'   => 'Valeria Guadalupe',
                'connector'     => '',
                'secondaryName' => '',
                'dateISO'       => '2026-12-26T18:00:00',
                'dateDisplay'   => '26 . DICIEMBRE . 2026',
                'heroImage'     => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=85',
                'musicEnabled'  => false,
                'musicUrl'      => '',
            ],
            'quote'     => [
                'enabled' => true,
                'text'    => '“Hoy dejo atrás mi niñez para comenzar a escribir los sueños más hermosos de mi juventud.”',
                'author'  => 'Valeria Guadalupe Ramírez Torres',
            ],
            'familySection' => [
                'enabled'  => true,
                'subtitle' => 'Con el amor y apoyo incondicional de',
                'groups'   => [
                    [
                        'id'      => 'papas_xv',
                        'enabled' => true,
                        'role'    => 'Mis Padres',
                        'members' => [
                            'Sr. José Luis Ramírez Chávez',
                            'Sra. Claudia Torres de Ramírez',
                        ],
                    ],
                    [
                        'id'      => 'padrinos_xv',
                        'enabled' => true,
                        'role'    => 'Mis Padrinos de Honor',
                        'members' => [
                            'Arq. Héctor Manuel Zepeda Aguilar',
                            'Lic. Mariana Salgado de Zepeda',
                        ],
                    ],
                ],
            ],
            'events' => [
                [
                    'id'      => 'misa_xv',
                    'enabled' => true,
                    'icon'    => 'church',
                    'type'    => 'Misa de Acción de Gracias',
                    'time'    => '18:00 HRS',
                    'venue'   => 'Parroquia del Sagrado Corazón de Jesús',
                    'address' => 'Col. Centro, 60600 Apatzingán de la Constitución, Mich.',
                    'mapUrl'  => 'https://maps.google.com/?q=Apatzingan+Michoacan+Centro',
                ],
                [
                    'id'      => 'fiesta_xv',
                    'enabled' => true,
                    'icon'    => 'sparkles',
                    'type'    => 'Recepción, Vals y Cena',
                    'time'    => '20:00 HRS',
                    'venue'   => 'Salón de Eventos La Hacienda Apatzingán',
                    'address' => 'Av. Tepalcatepec #420, Col. Lázaro Cárdenas, Apatzingán, Mich.',
                    'mapUrl'  => 'https://maps.google.com/?q=Apatzingan+Michoacan',
                ],
            ],
            'dressCode' => [
                'enabled'     => true,
                'title'       => 'Formal / Gala',
                'description' => 'Te sugerimos vestir elegante. Reservamos el tono palo de rosa y champagne para la quinceañera.',
            ],
            'gifts' => [
                'enabled'  => true,
                'subtitle' => 'Sugerencia de Regalo',
                'message'  => 'Lo más importante es compartir esta noche mágica contigo. Si deseas obsequiarme algo, agradeceré lluvia de sobres o transferencia:',
                'bank'     => [
                    'enabled'  => true,
                    'bankName' => 'Banamex',
                    'holder'   => 'Claudia Torres García',
                    'clabe'    => '002470701489234561',
                ],
                'storeRegistry' => [
                    'enabled'     => false,
                    'storeName'   => '',
                    'eventNumber' => '',
                    'url'         => '',
                ],
            ],
            'gallery' => [
                'enabled'  => true,
                'subtitle' => 'Recuerdos de mi Sesión',
                'title'    => 'Galería XV Años',
                'photos'   => [
                    [
                        'id'   => 'xv_gal_1',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Sesión floral XV años',
                    ],
                    [
                        'id'   => 'xv_gal_2',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Detalles de celebración',
                    ],
                    [
                        'id'   => 'xv_gal_3',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Noche de fiesta y luces',
                    ],
                ],
            ],
            'album' => [
                'enabled'     => true,
                'pageHeading' => 'Álbum XV Años • Valeria Guadalupe',
                'avatarImage' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=85',
            ],
            'rsvp' => [
                'whatsappPhone' => '5214531234567',
            ],
            'footer' => [
                'monogram' => 'XV • V',
            ],
            'sectionOrder' => [
                'countdown',
                'familyQuote',
                'locations',
                'dressCodeGifts',
                'gallery',
                'album',
                'rsvp',
            ],
        ],

        'demo-bautizo-apatzingan' => [
            'slug'      => 'demo-bautizo-apatzingan',
            'eventType' => 'baptism',
            'pageTitle' => 'Bautizo & Primer Año de Mateo Sebastián | Apatzingán',
            'theme'     => [
                '--bg-primary'     => '#f7f9f7',
                '--bg-secondary'   => '#ebf0ec',
                '--text-primary'   => '#243029',
                '--text-secondary' => '#5c6b62',
                '--accent-primary' => '#6b8c78',
                '--accent-dark'    => '#4f6b5a',
                '--border-light'   => '#d7e2db',
            ],
            'welcome'   => [
                'initials'   => 'M • S',
                'message'    => 'Señor, hoy me presentan ante Ti para recibir la luz de tu gracia. Acompáñanos a celebrar el Bautizo de Mateo Sebastián',
                'buttonText' => 'Abrir Invitación',
            ],
            'hero'      => [
                'tag'           => 'Mi Bautizo y Primer Año',
                'primaryName'   => 'Mateo Sebastián',
                'connector'     => '',
                'secondaryName' => '',
                'dateISO'       => '2027-01-16T12:00:00',
                'dateDisplay'   => '16 . ENERO . 2027',
                'heroImage'     => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85',
                'musicEnabled'  => false,
                'musicUrl'      => '',
            ],
            'quote'     => [
                'enabled' => true,
                'text'    => '“Que la luz de Cristo ilumine siempre tus pasos y llene tu vida de amor, salud y alegría.”',
                'author'  => 'Bendición de Bautismo',
            ],
            'familySection' => [
                'enabled'  => true,
                'subtitle' => 'Con inmensa alegría te invitan',
                'groups'   => [
                    [
                        'id'      => 'papas_bautizo',
                        'enabled' => true,
                        'role'    => 'Sus Papás',
                        'members' => [
                            'Ing. Diego Alejandro Ríos Medina',
                            'Lic. Fernanda Ortega de Ríos',
                        ],
                    ],
                    [
                        'id'      => 'padrinos_bautizo',
                        'enabled' => true,
                        'role'    => 'Sus Padrinos',
                        'members' => [
                            'Dr. Andrés Felipe Morales Cuevas',
                            'Dra. Karla Beatriz Sánchez de Morales',
                        ],
                    ],
                ],
            ],
            'events' => [
                [
                    'id'      => 'ceremonia_bautizo',
                    'enabled' => true,
                    'icon'    => 'church',
                    'type'    => 'Ceremonia Bautismal',
                    'time'    => '12:00 HRS',
                    'venue'   => 'Parroquia de Nuestra Señora de Guadalupe',
                    'address' => 'Col. Guadalupe, 60640 Apatzingán de la Constitución, Mich.',
                    'mapUrl'  => 'https://maps.google.com/?q=Parroquia+de+Guadalupe+Apatzingan+Michoacan',
                ],
                [
                    'id'      => 'comida_bautizo',
                    'enabled' => true,
                    'icon'    => 'utensils',
                    'type'    => 'Comida Familiar y Convivencia',
                    'time'    => '14:30 HRS',
                    'venue'   => 'Quinta Campestre Las Palmas',
                    'address' => 'Camino a Chandio Km 1.8, Apatzingán, Mich.',
                    'mapUrl'  => 'https://maps.google.com/?q=Apatzingan+Michoacan',
                ],
            ],
            'dressCode' => [
                'enabled'     => true,
                'title'       => 'Semi-Formal / Guayabera o Vestido Fresco',
                'description' => 'Evento de día en jardín campestre; sugerimos ropa fresca y calzado cómodo.',
            ],
            'gifts' => [
                'enabled'  => true,
                'subtitle' => 'Detalle de Cariño',
                'message'  => 'Tu compañía y tus buenos deseos son lo más valioso para nuestra familia.',
                'bank'     => [
                    'enabled'  => false,
                    'bankName' => '',
                    'holder'   => '',
                    'clabe'    => '',
                ],
                'storeRegistry' => [
                    'enabled'     => false,
                    'storeName'   => '',
                    'eventNumber' => '',
                    'url'         => '',
                ],
            ],
            'gallery' => [
                'enabled'  => true,
                'subtitle' => 'Primeros Recuerdos',
                'title'    => 'Momentos en Familia',
                'photos'   => [
                    [
                        'id'   => 'bau_gal_1',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Decoración campestre bautizo',
                    ],
                    [
                        'id'   => 'bau_gal_2',
                        'type' => 'image',
                        'url'  => 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85',
                        'alt'  => 'Primer año Mateo Sebastián',
                    ],
                ],
            ],
            'album' => [
                'enabled'     => true,
                'pageHeading' => 'Álbum Bautizo • Mateo Sebastián',
                'avatarImage' => 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=85',
            ],
            'rsvp' => [
                'whatsappPhone' => '5214531234567',
            ],
            'footer' => [
                'monogram' => 'M • S',
            ],
            'sectionOrder' => [
                'countdown',
                'familyQuote',
                'locations',
                'dressCodeGifts',
                'gallery',
                'album',
                'rsvp',
            ],
        ],
    ];
}

function ensureApatzinganDemoSeeded(string $slug): void
{
    $seeds = getApatzinganDemoSeeds();
    if (!isset($seeds[$slug])) {
        return;
    }

    $baseDir = getEventosBaseDir();
    $eventDir = $baseDir . DIRECTORY_SEPARATOR . $slug;
    $configFile = $eventDir . DIRECTORY_SEPARATOR . 'config.json';

    if (!is_file($configFile)) {
        if (!is_dir($eventDir . DIRECTORY_SEPARATOR . 'media')) {
            mkdir($eventDir . DIRECTORY_SEPARATOR . 'media', 0755, true);
        }
        $json = json_encode($seeds[$slug], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        file_put_contents($configFile, $json);
    }
}

function ensureAllApatzinganDemosSeeded(): void
{
    foreach (array_keys(getApatzinganDemoSeeds()) as $demoSlug) {
        ensureApatzinganDemoSeeded($demoSlug);
    }
}
