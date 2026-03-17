/**
 * Cliente para la API de Easy! Appointments.
 * URL base: EXPO_PUBLIC_EA_API_URL
 * Auth:     Authorization: Bearer {EXPO_PUBLIC_EA_API_KEY}
 */

const EA_BASE_URL = process.env.EXPO_PUBLIC_EA_API_URL;
const EA_API_KEY = process.env.EXPO_PUBLIC_EA_API_KEY;

const eaHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${EA_API_KEY}`,
};

/**
 * Obtiene los horarios disponibles para un proveedor + servicio en una fecha dada.
 *
 * @param eaProviderId - ea_id del doctor (número)
 * @param eaServiceId  - ea_id del servicio (número)
 * @param fecha        - Fecha en formato YYYY-MM-DD
 * @returns Array de strings con horarios disponibles, ej. ["09:00", "09:30", ...]
 */
export const getDisponibilidad = async (
    eaProviderId: number,
    eaServiceId: number,
    fecha: string,
): Promise<string[]> => {
    const url = `${EA_BASE_URL}/availabilities?providerId=${eaProviderId}&serviceId=${eaServiceId}&date=${fecha}`;

    const response = await fetch(url, { headers: eaHeaders });

    if (!response.ok) {
        throw new Error(
            `Error al consultar disponibilidad (HTTP ${response.status})`,
        );
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        return [];
    }

    return data as string[];
};
