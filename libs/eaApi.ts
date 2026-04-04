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

// ─── Crear cita en EA ─────────────────────────────────────────────────────────

export interface EACitaPayload {
    eaServiceId: number;
    eaProviderId: number;
    eaCustomerId: number;
    fecha: string;          // YYYY-MM-DD
    hora: string;           // HH:mm
    duracionMinutos: number;
    notes?: string;
}

/**
 * Crea una cita en Easy! Appointments y devuelve el ID asignado.
 *
 * El campo `notes` se usa para registrar los datos del paciente
 * cuando la cita es para un tercero.
 */
export const crearCitaEA = async (payload: EACitaPayload): Promise<number> => {
    const start = `${payload.fecha} ${payload.hora}:00`;

    // Calcular hora de fin: start + duracion en minutos
    const [h, m] = payload.hora.split(":").map(Number);
    const startDate = new Date(2000, 0, 1, h, m);
    startDate.setMinutes(startDate.getMinutes() + payload.duracionMinutos);
    const endH = String(startDate.getHours()).padStart(2, "0");
    const endM = String(startDate.getMinutes()).padStart(2, "0");
    const end = `${payload.fecha} ${endH}:${endM}:00`;

    const body = {
        start,
        end,
        notes: payload.notes ?? "",
        customerId: payload.eaCustomerId,
        providerId: payload.eaProviderId,
        serviceId: payload.eaServiceId,
    };

    const response = await fetch(`${EA_BASE_URL}/appointments`, {
        method: "POST",
        headers: eaHeaders,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let detail = "";
        try { detail = await response.text(); } catch { /* ignore */ }
        throw new Error(
            `Error al crear cita en el sistema (HTTP ${response.status})${detail ? `: ${detail}` : ""}`,
        );
    }

    const data = await response.json() as { id: number };
    return data.id;
};
