import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      // Navegación
      "nav.home": "Inicio",
      "nav.tours": "Tours",
      "nav.accommodations": "Alojamientos",
      "nav.about": "Sobre Nosotros",
      "nav.contact": "Contacto",
      "nav.admin": "Administración",

      // Hero Section
      "hero.title": "Paraiso Ayahuasca",
      "hero.subtitle": "Casa en la Selva para descansar",
      "hero.cta": "Explorar Tours",
      "hero.cta.secondary": "Ver Habitaciones",

      // Tours
      "tours.title": "Transporte Fluvial Rio Amazonas",
      "tours.subtitle": "Descubre destinos inolvidables en el Amazonas Colombiano",
      "tours.filter.all": "Todos",
      "tours.filter.nature": "Naturaleza",
      "tours.filter.adventure": "Aventura",
      "tours.filter.cultural": "Cultural",
      "tours.duration": "Duración",
      "tours.location": "Ubicación",
      "tours.price": "Precio",
      "tours.book": "Reservar",
      "tours.details": "Ver Detalles",

      // Alojamientos
      "accommodations.title": "Alojamientos",
      "accommodations.subtitle": "Descansa en el corazón de la selva amazónica",
      "accommodations.price": "Precio por Noche",
      "accommodations.guests": "Huéspedes",
      "accommodations.amenities": "Comodidades",
      "accommodations.book": "Reservar Ahora",

      // Formularios
      "form.name": "Nombre",
      "form.email": "Correo Electrónico",
      "form.phone": "Teléfono",
      "form.guests": "Número de Huéspedes",
      "form.checkin": "Fecha de Llegada",
      "form.checkout": "Fecha de Salida",
      "form.message": "Mensaje",
      "form.submit": "Enviar",
      "form.booking": "Reservar",

      // Footer
      "footer.about": "Sobre Paraíso Ayahuasca",
      "footer.contact": "Contacto",
      "footer.address": "Dirección",
      "footer.phone": "Teléfono",
      "footer.email": "Correo",
      "footer.follow": "Síguenos",

      // Admin
      "admin.title": "Panel de Administración",
      "admin.tours": "Gestión de Tours",
      "admin.accommodations": "Gestión de Alojamientos",
      "admin.bookings": "Reservas",
      "admin.analytics": "Analíticas",
      "admin.add": "Agregar",
      "admin.edit": "Editar",
      "admin.delete": "Eliminar",
      "admin.save": "Guardar",
      "admin.cancel": "Cancelar",

      // Errores
      "error.loading": "Cargando...",
      "error.notFound": "No encontrado",
      "error.network": "Error de conexión",

      // Idiomas
      "lang.es": "Español",
      "lang.en": "English",
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.tours": "Tours",
      "nav.accommodations": "Accommodations",
      "nav.about": "About Us",
      "nav.contact": "Contact",
      "nav.admin": "Admin",

      // Hero Section
      "hero.title": "Discover the Magic of the Amazon",
      "hero.subtitle": "Authentic experiences in the heart of the Colombian jungle",
      "hero.cta": "Explore Tours",
      "hero.cta.secondary": "View Accommodations",

      // Tours
      "tours.title": "Our Tours",
      "tours.subtitle": "Discover unforgettable experiences in the Colombian Amazon",
      "tours.filter.all": "All",
      "tours.filter.nature": "Nature",
      "tours.filter.adventure": "Adventure",
      "tours.filter.cultural": "Cultural",
      "tours.duration": "Duration",
      "tours.location": "Location",
      "tours.price": "Price",
      "tours.book": "Book",
      "tours.details": "View Details",

      // Accommodations
      "accommodations.title": "Accommodations",
      "accommodations.subtitle": "Rest in the heart of the Amazon rainforest",
      "accommodations.price": "Price per Night",
      "accommodations.guests": "Guests",
      "accommodations.amenities": "Amenities",
      "accommodations.book": "Book Now",

      // Forms
      "form.name": "Name",
      "form.email": "Email",
      "form.phone": "Phone",
      "form.guests": "Number of Guests",
      "form.checkin": "Check-in Date",
      "form.checkout": "Check-out Date",
      "form.message": "Message",
      "form.submit": "Submit",
      "form.booking": "Book",

      // Footer
      "footer.about": "About Paraíso Ayahuasca",
      "footer.contact": "Contact",
      "footer.address": "Address",
      "footer.phone": "Phone",
      "footer.email": "Email",
      "footer.follow": "Follow Us",

      // Admin
      "admin.title": "Admin Dashboard",
      "admin.tours": "Tour Management",
      "admin.accommodations": "Accommodation Management",
      "admin.bookings": "Bookings",
      "admin.analytics": "Analytics",
      "admin.add": "Add",
      "admin.edit": "Edit",
      "admin.delete": "Delete",
      "admin.save": "Save",
      "admin.cancel": "Cancel",

      // Errors
      "error.loading": "Loading...",
      "error.notFound": "Not found",
      "error.network": "Network error",

      // Languages
      "lang.es": "Español",
      "lang.en": "English",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    lng: 'es', // Español por defecto

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;