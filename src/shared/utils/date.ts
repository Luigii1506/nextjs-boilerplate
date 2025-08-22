// 🕒 DATE UTILITIES
// ================
// Utilidades para formatear y manipular fechas

/**
 * Formatea una fecha al formato español corto
 * Formato: DD/MM/YY HH:MM
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Formatea una fecha al formato español largo
 * Formato: DD de MMMM de YYYY a las HH:MM
 */
export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Obtiene fecha relativa (hace 5 minutos, hace 1 hora, etc.)
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "hace menos de 1 minuto";
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  }

  const days = Math.floor(diffInSeconds / 86400);
  return `hace ${days} día${days !== 1 ? "s" : ""}`;
}
