<?php
require_once __DIR__ . '/config.php';
handleCors('GET, POST, OPTIONS');

function getDefaultLandingConfig(): array
{
    return [
        'brandName'       => 'Uber Reyes | Invitaciones Digitales',
        'whatsappPhone'   => '5214531234567',
        'whatsappMessage' => '¡Hola! Vi su página y quiero apartar mi Invitación Digital con el precio especial de oferta.',
        'hero'            => [
            'eyebrow'          => 'Invitaciones Digitales Interactivas • Entrega Express 24 hrs',
            'title'            => 'Haz que tu evento sea inolvidable desde el primer clic',
            'subtitle'         => 'Sorprende a tus invitados con un sobre animado con sello de lacre dorado, música personalizada, ubicación GPS, confirmación directa a tu WhatsApp y un Álbum QR en vivo. Sin gastos de impresión y con envíos ilimitados.',
            'primaryCtaText'   => 'Pedir mi Invitación por WhatsApp',
            'secondaryCtaText' => 'Ver Demo Interactivo',
            'demoUrl'          => '/demo-boda-apatzingan',
            'heroImage'        => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
        ],
        'highlights'      => [
            ['title' => 'Entrega en 24 Horas', 'desc' => 'Tu invitación lista y publicada en tiempo récord.'],
            ['title' => 'Envíos Ilimitados', 'desc' => 'Compártela por WhatsApp con todos tus invitados sin costo extra.'],
            ['title' => 'Álbum QR en Vivo', 'desc' => 'Tus invitados suben fotos y videos de la fiesta a un solo lugar.'],
            ['title' => '100% Personalizada', 'desc' => 'Colores, música, tipografía y secciones a tu medida.'],
        ],
        'demosSection'    => [
            'subtitle' => 'Pruébalas en tu celular',
            'title'    => 'Diseños que enamoran a tus invitados',
            'items'    => [
                [
                    'id'       => 'demo_boda',
                    'category' => 'Boda en Apatzingán',
                    'title'    => 'Sofía & Alejandro',
                    'desc'     => 'Catedral de la Asunción y Quinta Real Apatzingán. Sobre con sello dorado, itinerario GPS, mesa de regalos y álbum QR.',
                    'image'    => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
                    'url'      => '/demo-boda-apatzingan',
                ],
                [
                    'id'       => 'demo_xv',
                    'category' => 'XV Años en Apatzingán',
                    'title'    => 'Valeria Guadalupe',
                    'desc'     => 'Parroquia del Sagrado Corazón y Salón La Hacienda. Paleta rose gold, galería carrusel y pase directo.',
                    'image'    => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
                    'url'      => '/demo-xv-apatzingan',
                ],
                [
                    'id'       => 'demo_social',
                    'category' => 'Bautizo & Primer Año',
                    'title'    => 'Mateo Sebastián',
                    'desc'     => 'Parroquia de Guadalupe y Quinta Las Palmas. Paleta verde salvia campestre con confirmación directa por WhatsApp.',
                    'image'    => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
                    'url'      => '/demo-bautizo-apatzingan',
                ],
            ],
        ],
        'featuresSection' => [
            'subtitle' => 'Todo incluido en un solo enlace',
            'title'    => 'Mucho más que una simple imagen',
            'items'    => [
                [
                    'title' => 'Sobre Animado con Sello de Lacre',
                    'desc'  => 'Al abrir el enlace, tus invitados ven un elegante sobre con tus iniciales que se abre con un toque.',
                ],
                [
                    'title' => 'Música de Fondo Personalizada',
                    'desc'  => 'Ambienta cada segundo de lectura con la canción especial de tu boda, XV años o evento.',
                ],
                [
                    'title' => 'Confirmación RSVP a tu WhatsApp',
                    'desc'  => 'Olvídate de perseguir confirmaciones: tus invitados confirman asistencia y número de pases directo a tu chat.',
                ],
                [
                    'title' => 'Ubicaciones con GPS en un Clic',
                    'desc'  => 'Botones directos a Google Maps para ceremonia y recepción para que nadie se pierda.',
                ],
                [
                    'title' => 'Álbum Colaborativo con Código QR',
                    'desc'  => 'Recibe todas las fotos y videos que tomen tus invitados durante la fiesta en calidad original y descárgalos en un clic.',
                ],
                [
                    'title' => 'Mesa de Regalos y Datos Bancarios',
                    'desc'  => 'Comparte tu número de evento Liverpool/Amazon o CLABE interbancaria con botón de copiado rápido.',
                ],
            ],
        ],
        'pricing'         => [
            'subtitle'        => 'Inversión Única • Sin Mensualidades',
            'title'           => 'Aprovecha nuestro Precio Especial de Lanzamiento',
            'offerBadge'      => '50% DE DESCUENTO • OFERTA POR TIEMPO LIMITADO',
            'packageName'     => 'Paquete Invitación Digital Completa + Álbum QR',
            'currency'        => 'MXN',
            'showBasePrice'   => true,
            'basePrice'       => 1000,
            'offerPrice'      => 500,
            'urgencyNote'     => 'Aparta tu fecha hoy con este precio promocional antes de que regrese a su tarifa regular.',
            'ctaText'         => '¡Quiero mi Invitación por $500!',
            'includedItems'   => [
                'Enlace personalizado con el nombre de tu evento (ej. invite.uberreyes.com/tu-evento)',
                'Sobre interactivo animado con sello de lacre dorado e iniciales',
                'Música de fondo personalizada en formato MP3',
                'Cuenta regresiva en tiempo real hasta el día del evento',
                'Galería / Carrusel de fotos y videos en alta definición',
                'Secciones de Padres, Padrinos, Itinerario GPS y Código de Vestimenta',
                'Mesa de regalos con copia rápida de CLABE bancaria o tienda',
                'Formulario de confirmación de asistencia directo a tu WhatsApp',
                'Álbum Colaborativo QR para recopilar fotos y videos de tus invitados',
                'Soporte personalizado y ajustes incluidos previo a tu evento',
            ],
        ],
        'faqs'            => [
            [
                'q' => '¿En cuánto tiempo queda lista mi invitación?',
                'a' => 'Una vez que nos envías tus datos, fotos y canción, entregamos tu invitación lista y funcionando en menos de 24 horas.',
            ],
            [
                'q' => '¿A cuántas personas se la puedo enviar?',
                'a' => 'A todos los invitados que quieras. El enlace es ilimitado y puedes enviarlo por WhatsApp, Messenger, Instagram o correo sin costo adicional.',
            ],
            [
                'q' => '¿Qué pasa si necesito cambiar un horario o dirección después?',
                'a' => 'Al ser 100% digital, podemos actualizar cualquier dato al instante y todos tus invitados verán la información corregida en el mismo enlace.',
            ],
            [
                'q' => '¿Cómo funciona el Álbum QR para los invitados?',
                'a' => 'Te entregamos un enlace y código QR exclusivo de tu evento. Tus invitados escanean, suben sus fotos y videos desde su celular sin instalar ninguna app, y tú puedes descargar todo en un solo archivo ZIP.',
            ],
        ],
        'finalCta'        => [
            'eyebrow' => '¿Listo para sorprender a tus invitados?',
            'title'   => 'Asegura hoy tu invitación con precio de oferta',
            'desc'    => 'Escríbenos por WhatsApp, cuéntanos la fecha de tu evento y en 24 horas tendrás tu invitación lista para compartir.',
            'ctaText' => 'Contactar por WhatsApp Ahora',
        ],
    ];
}

$baseDir = getEventosBaseDir();
$filePath = $baseDir . DIRECTORY_SEPARATOR . '_landing_config.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $defaults = getDefaultLandingConfig();
    if (is_file($filePath)) {
        $saved = json_decode((string)file_get_contents($filePath), true);
        if (is_array($saved)) {
            $merged = array_replace_recursive($defaults, $saved);
            foreach (['highlights', 'faqs'] as $listKey) {
                if (isset($saved[$listKey]) && is_array($saved[$listKey])) {
                    $merged[$listKey] = $saved[$listKey];
                }
            }
            if (isset($saved['demosSection']['items']) && is_array($saved['demosSection']['items'])) {
                $merged['demosSection']['items'] = $saved['demosSection']['items'];
            }
            if (isset($saved['featuresSection']['items']) && is_array($saved['featuresSection']['items'])) {
                $merged['featuresSection']['items'] = $saved['featuresSection']['items'];
            }
            if (isset($saved['pricing']['includedItems']) && is_array($saved['pricing']['includedItems'])) {
                $merged['pricing']['includedItems'] = $saved['pricing']['includedItems'];
            }
            sendJson(['success' => true, 'landing' => $merged]);
        }
    }
    sendJson(['success' => true, 'landing' => $defaults]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdminAuth();
    $raw = file_get_contents('php://input');
    $payload = json_decode((string)$raw, true);

    if (!is_array($payload)) {
        sendJson(['success' => false, 'message' => 'JSON inválido'], 400);
    }

    if (!is_dir($baseDir)) {
        mkdir($baseDir, 0755, true);
    }

    $encoded = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (file_put_contents($filePath, $encoded) !== false) {
        sendJson(['success' => true, 'landing' => $payload]);
    }

    sendJson(['success' => false, 'message' => 'No se pudo guardar la configuración de la landing'], 500);
}

sendJson(['success' => false, 'message' => 'Método no permitido'], 405);
