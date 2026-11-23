// Plantillas base para inicializar nuevas invitaciones desde el Panel /admin
export const eventTemplates = {
  wedding: {
    slug: '',
    eventType: 'wedding',
    pageTitle: 'Nuestra Boda',
    theme: {
      '--bg-primary': '#faf8f5',
      '--bg-secondary': '#f2ede4',
      '--accent-primary': '#8c7a6b',
      '--accent-dark': '#6e5e51',
    },
    welcome: {
      initials: 'N & B',
      message: 'Estás invitado a celebrar nuestra boda',
      buttonText: 'Abrir Invitación',
    },
    hero: {
      tag: '¡Nos Casamos!',
      primaryName: 'Novia',
      connector: '&',
      secondaryName: 'Novio',
      dateISO: '2026-12-19T17:00:00',
      dateDisplay: '19 . DICIEMBRE . 2026',
      heroImage:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
      musicEnabled: true,
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    quote: {
      enabled: true,
      text: '“Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos.”',
      author: 'Julio Cortázar',
    },
    familySection: {
      enabled: true,
      subtitle: 'Con la bendición de nuestros padres',
      groups: [
        {
          id: 'grp_bride_parents',
          enabled: true,
          role: 'Padres de la Novia',
          members: ['Sr. Padre de Novia', 'Sra. Madre de Novia'],
        },
        {
          id: 'grp_groom_parents',
          enabled: true,
          role: 'Padres del Novio',
          members: ['Sr. Padre de Novio', 'Sra. Madre de Novio'],
        },
      ],
    },
    events: [
      {
        id: 'ceremony',
        enabled: true,
        icon: 'church',
        type: 'Ceremonia Religiosa',
        time: '17:00 HRS',
        venue: 'Parroquia Principal',
        address: 'Calle Centro #100',
        mapUrl: 'https://maps.google.com',
      },
      {
        id: 'reception',
        enabled: true,
        icon: 'wine',
        type: 'Recepción',
        time: '19:30 HRS',
        venue: 'Hacienda / Salón',
        address: 'Av. Principal Km 4',
        mapUrl: 'https://maps.google.com',
      },
    ],
    dressCode: {
      enabled: true,
      title: 'Formal / Etiqueta',
      description:
        'Mujeres: Vestido largo. Hombres: Traje formal. Agradecemos reservar el color blanco para la novia.',
    },
    gifts: {
      enabled: true,
      subtitle: 'Lluvia de Sobres & Tienda',
      message:
        'Su presencia es nuestro mejor regalo, pero si desean tener un detalle con nosotros, ponemos a su disposición:',
      bank: {
        enabled: true,
        bankName: 'BBVA Bancomer',
        holder: 'Titular de la Cuenta',
        clabe: '012 320 01584920384 9',
      },
      storeRegistry: {
        enabled: true,
        storeName: 'Liverpool',
        eventNumber: '51489203',
        url: 'https://mesaderegalos.liverpool.com.mx/',
      },
    },
    gallery: {
      enabled: true,
      subtitle: 'Nuestros Momentos',
      title: 'Galería',
      photos: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
          alt: 'Foto 1',
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
          alt: 'Foto 2',
        },
      ],
    },
    album: {
      enabled: true,
      sectionSubtitle: 'Recuerdos Compartidos',
      sectionTitle: 'Álbum de Invitados',
      sectionDescription:
        'Escanea el código QR o da clic en el botón para compartir tus fotografías y videos del evento.',
      buttonText: 'Subir y Ver Fotos',
      avatarImage:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      pageHeading: 'Novia y Novio',
      pageSubtitle:
        'Cada fotografía guarda una emoción. Comparte tu recuerdo y sé parte de este gran momento.',
    },
    rsvp: {
      deadlineText: 'Por favor confírmanos tu asistencia antes del evento.',
      whatsappPhone: '5215555555555',
      whatsappIntro: '¡Hola! Confirmo mi asistencia a su boda.',
    },
    footer: {
      monogram: 'N & B',
      closingText: '¡Te esperamos!',
    },
  },

  xv: {
    slug: '',
    eventType: 'xv',
    pageTitle: 'Mis XV Años',
    theme: {
      '--bg-primary': '#fdf8fa',
      '--bg-secondary': '#f6eaef',
      '--accent-primary': '#b57b8c',
      '--accent-dark': '#915b6b',
    },
    welcome: {
      initials: 'XV',
      message: 'Estás invitado a celebrar mis XV Años',
      buttonText: 'Abrir Invitación',
    },
    hero: {
      tag: 'Mis XV Años',
      primaryName: 'Quinceañera',
      connector: '',
      secondaryName: '',
      dateISO: '2026-11-28T18:00:00',
      dateDisplay: '28 . NOVIEMBRE . 2026',
      heroImage:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      musicEnabled: true,
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    quote: {
      enabled: true,
      text: '“Hay momentos en la vida que son especiales por sí solos, compartirlos con las personas que quieres los convierte en inolvidables.”',
      author: '',
    },
    familySection: {
      enabled: true,
      subtitle: 'Con la bendición de Dios y el amor de',
      groups: [
        {
          id: 'grp_parents',
          enabled: true,
          role: 'Mis Padres',
          members: ['Nombre del Papá', 'Nombre de la Mamá'],
        },
        {
          id: 'grp_godparents',
          enabled: true,
          role: 'Mis Padrinos',
          members: ['Nombre del Padrino', 'Nombre de la Madrina'],
        },
      ],
    },
    events: [
      {
        id: 'ceremony',
        enabled: true,
        icon: 'church',
        type: 'Misa de Acción de Gracias',
        time: '18:00 HRS',
        venue: 'Templo Principal',
        address: 'Calle Centro #110',
        mapUrl: 'https://maps.google.com',
      },
      {
        id: 'reception',
        enabled: true,
        icon: 'sparkles',
        type: 'Recepción & Vals',
        time: '20:00 HRS',
        venue: 'Salón de Eventos',
        address: 'Blvd. Principal #890',
        mapUrl: 'https://maps.google.com',
      },
    ],
    dressCode: {
      enabled: true,
      title: 'Formal / Gala',
      description:
        'Mujeres: Vestido de noche. Hombres: Traje formal. Te pedimos evitar el tono del vestido de la quinceañera.',
    },
    gifts: {
      enabled: true,
      subtitle: 'Lluvia de Sobres & Mesa de Regalos',
      message:
        'Tu compañía es mi mayor alegría, pero si deseas obsequiarme algo especial, puedes hacerlo mediante:',
      bank: {
        enabled: true,
        bankName: 'BBVA Bancomer',
        holder: 'Titular',
        clabe: '012 320 01584920384 9',
      },
      storeRegistry: {
        enabled: true,
        storeName: 'Liverpool',
        eventNumber: '51904821',
        url: 'https://mesaderegalos.liverpool.com.mx/',
      },
    },
    gallery: {
      enabled: true,
      subtitle: 'Sesión Fotográfica',
      title: 'Mis Mejores Recuerdos',
      photos: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
          alt: 'Sesión XV',
        },
      ],
    },
    album: {
      enabled: true,
      sectionSubtitle: 'Álbum en Vivo',
      sectionTitle: 'Comparte tus Fotos',
      sectionDescription:
        'Escanea el código QR o entra al álbum para subir las selfies y videos que tomes durante la fiesta.',
      buttonText: 'Subir y Ver Fotos',
      avatarImage:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
      pageHeading: 'Mis XV Años',
      pageSubtitle:
        'Cada fotografía guarda una emoción. Comparte tu recuerdo y sé parte de esta noche mágica.',
    },
    rsvp: {
      deadlineText: 'Por favor confirma tu asistencia con anticipación.',
      whatsappPhone: '5215555555555',
      whatsappIntro: '¡Hola! Confirmo mi asistencia a los XV Años.',
    },
    footer: {
      monogram: 'XV Años',
      closingText: '¡Será una noche mágica!',
    },
  },

  baptism: {
    slug: '',
    eventType: 'baptism',
    pageTitle: 'Mi Bautizo',
    theme: {
      '--bg-primary': '#f7f9fa',
      '--bg-secondary': '#eaf0f4',
      '--accent-primary': '#6d8ca0',
      '--accent-dark': '#516d80',
    },
    welcome: {
      initials: 'B',
      message: 'Te invito a celebrar el sacramento de mi Bautizo',
      buttonText: 'Abrir Invitación',
    },
    hero: {
      tag: 'Mi Bautizo',
      primaryName: 'Nombre del Bebé',
      connector: '',
      secondaryName: '',
      dateISO: '2026-10-17T12:00:00',
      dateDisplay: '17 . OCTUBRE . 2026',
      heroImage:
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1600&q=80',
      musicEnabled: true,
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    quote: {
      enabled: true,
      text: '“Señor, hoy me presentan ante tu altar para recibir la luz de la fe y caminar siempre guiado por tu amor.”',
      author: 'Bendición de Bautismo',
    },
    familySection: {
      enabled: true,
      subtitle: 'Acompañado de mis amados padres y padrinos',
      groups: [
        {
          id: 'grp_parents',
          enabled: true,
          role: 'Mis Papás',
          members: ['Nombre del Papá', 'Nombre de la Mamá'],
        },
        {
          id: 'grp_godparents',
          enabled: true,
          role: 'Mis Padrinos',
          members: ['Nombre del Padrino', 'Nombre de la Madrina'],
        },
      ],
    },
    events: [
      {
        id: 'ceremony',
        enabled: true,
        icon: 'church',
        type: 'Ceremonia Bautismal',
        time: '12:00 HRS',
        venue: 'Capilla / Parroquia',
        address: 'Plaza Principal s/n',
        mapUrl: 'https://maps.google.com',
      },
      {
        id: 'reception',
        enabled: true,
        icon: 'utensils',
        type: 'Comida Familiar',
        time: '14:00 HRS',
        venue: 'Quinta / Jardín',
        address: 'Av. Principal #320',
        mapUrl: 'https://maps.google.com',
      },
    ],
    dressCode: {
      enabled: true,
      title: 'Semi-Formal / Cóctel de Día',
      description: 'Sugerimos tonos claros, pastel o beige.',
    },
    gifts: {
      enabled: true,
      subtitle: 'Mesa de Regalos / Detalle',
      message:
        'Lo más importante es compartir este día en familia, pero si deseas tener un detalle:',
      bank: {
        enabled: true,
        bankName: 'BBVA Bancomer',
        holder: 'Titular',
        clabe: '012 320 01584920384 9',
      },
      storeRegistry: {
        enabled: false,
        storeName: '',
        eventNumber: '',
        url: '',
      },
    },
    gallery: {
      enabled: true,
      subtitle: 'Primeros Pasos',
      title: 'Galería',
      photos: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
          alt: 'Bautizo',
        },
      ],
    },
    album: {
      enabled: true,
      sectionSubtitle: 'Álbum Familiar',
      sectionTitle: 'Recuerdos del Bautizo',
      sectionDescription:
        'Escanea el código QR o da clic en el botón para compartir tus fotos con nuestra familia.',
      buttonText: 'Subir y Ver Fotos',
      avatarImage:
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
      pageHeading: 'Mi Bautizo',
      pageSubtitle:
        'Cada fotografía guarda una emoción. Comparte tu recuerdo y sé parte de este día tan especial.',
    },
    rsvp: {
      deadlineText: 'Agradecemos confirmar tu asistencia con anticipación.',
      whatsappPhone: '5215555555555',
      whatsappIntro: '¡Hola! Confirmamos nuestra asistencia al Bautizo.',
    },
    footer: {
      monogram: 'Mi Bautizo',
      closingText: '¡Gracias por acompañarnos!',
    },
  },

  custom: {
    slug: '',
    eventType: 'custom',
    pageTitle: 'Invitación Especial',
    theme: {
      '--bg-primary': '#fafafa',
      '--bg-secondary': '#eeeeee',
      '--accent-primary': '#4a5568',
      '--accent-dark': '#2d3748',
    },
    welcome: {
      initials: 'INV',
      message: 'Tienes una invitación especial para nuestro evento',
      buttonText: 'Abrir Invitación',
    },
    hero: {
      tag: 'Celebración Especial',
      primaryName: 'Nombre del Evento',
      connector: '',
      secondaryName: '',
      dateISO: '2026-12-30T20:00:00',
      dateDisplay: '30 . DICIEMBRE . 2026',
      heroImage:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80',
      musicEnabled: true,
      musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    quote: {
      enabled: true,
      text: '“Celebrar juntos cada logro es nuestro mayor privilegio.”',
      author: 'Anfitriones',
    },
    familySection: {
      enabled: false,
      subtitle: '',
      groups: [],
    },
    events: [
      {
        id: 'reception',
        enabled: true,
        icon: 'wine',
        type: 'Recepción',
        time: '20:00 HRS',
        venue: 'Salón de Eventos',
        address: 'Dirección del evento',
        mapUrl: 'https://maps.google.com',
      },
    ],
    dressCode: {
      enabled: true,
      title: 'Formal / Cóctel',
      description: 'Vestimenta formal.',
    },
    gifts: {
      enabled: false,
      subtitle: '',
      message: '',
      bank: { enabled: false },
      storeRegistry: { enabled: false },
    },
    gallery: {
      enabled: false,
      subtitle: '',
      title: '',
      photos: [],
    },
    album: {
      enabled: true,
      sectionSubtitle: 'Galería Colaborativa',
      sectionTitle: 'Comparte tus Momentos',
      sectionDescription:
        'Escanea el código QR o entra al álbum para compartir tus fotografías del evento.',
      buttonText: 'Subir y Ver Fotos',
      avatarImage:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
      pageHeading: 'Álbum del Evento',
      pageSubtitle:
        'Cada fotografía guarda una emoción. Comparte tu recuerdo y sé parte de este gran momento.',
    },
    rsvp: {
      deadlineText: 'Por favor confirma tu asistencia.',
      whatsappPhone: '5215555555555',
      whatsappIntro: '¡Hola! Confirmo mi asistencia al evento.',
    },
    footer: {
      monogram: '2026',
      closingText: '¡Nos dará mucho gusto verte!',
    },
  },
};
