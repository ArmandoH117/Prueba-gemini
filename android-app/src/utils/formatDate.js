export function getFormatoFecha(fechaISO) {
    const date = new Date(fechaISO);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (diffDays === 0) return `${hours}:${minutes}`;
    if (diffDays === 1) return `Ayer · ${hours}:${minutes}`;

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} · ${hours}:${minutes}`;
}
