import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Account,
    Client,
    Databases,
    Functions,
    ID,
    Query,
} from "react-native-appwrite";
import type { BeneficioData, Cita, Doctor, DocumentoMedico, Servicio } from "../type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: "com.sosmedical.clubsos",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    miembrosId: process.env.EXPO_PUBLIC_APPWRITE_MIEMBROS_ID,
    empresasId: process.env.EXPO_PUBLIC_APPWRITE_EMPRESAS_ID,
    beneficiosId: process.env.EXPO_PUBLIC_APPWRITE_BENEFICIOS_ID,
    documentosMedicosId: process.env.EXPO_PUBLIC_APPWRITE_DOCUMENTOS_MEDICOS_ID,
    getDocumentTokenFnId: process.env.EXPO_PUBLIC_APPWRITE_GET_DOCUMENT_TOKEN_FN,
    citasId: process.env.EXPO_PUBLIC_APPWRITE_CITAS_ID,
    serviciosId: process.env.EXPO_PUBLIC_APPWRITE_SERVICIOS_ID,
    doctoresId: process.env.EXPO_PUBLIC_APPWRITE_DOCTORES_ID,
};

export const client = new Client();

// Initialialize Appwrite client
client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform!);

export const account = new Account(client);
export const databases = new Databases(client);
const functions = new Functions(client);

// Normaliza la respuesta de la función para garantizar que siempre escribimos
// un base64 limpio, sin prefijos data URI y con padding correcto.
const normalizeBase64Payload = (value: string): string => {
    const trimmedValue = value.trim();
    const rawBase64 = trimmedValue.startsWith("data:")
        ? trimmedValue.slice(trimmedValue.indexOf(",") + 1)
        : trimmedValue;

    const sanitizedBase64 = rawBase64
        .replace(/\s+/g, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const remainder = sanitizedBase64.length % 4;
    if (remainder === 0) {
        return sanitizedBase64;
    }

    return sanitizedBase64.padEnd(
        sanitizedBase64.length + (4 - remainder),
        "=",
    );
};

/**
 * Send OTP via SMS to the specified phone number
 * @param phoneE164 - Phone number in E.164 format (e.g., +50588888888)
 * @returns Promise with the token/userId for OTP verification
 */
export const sendPhoneOtp = async (phoneE164: string) => {
    try {
        // Create a phone token for SMS OTP verification
        // This triggers Appwrite to send an SMS with the verification code
        const token = await account.createPhoneToken(ID.unique(), phoneE164);

        if (!token) {
            throw new Error("No se pudo enviar el código de verificación");
        }

        return token;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al enviar el código de verificación");
    }
};

/**
 * Verify OTP code sent via SMS
 * @param userId - The user ID returned from sendPhoneOtp
 * @param otp - The OTP code entered by the user
 * @returns Promise with the session
 */
export const verifyPhoneOtp = async (userId: string, otp: string) => {
    try {
        const session = await account.createSession(userId, otp);

        if (!session) {
            throw new Error("Código inválido");
        }

        return session;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al verificar el código");
    }
};

/**
 * Search for a titular member (parentesco = "titular") inside a given empresa.
 * Queries the `miembros` collection filtering by empresa_id, parentesco,
 * nombre_completo and documento_identidad.
 *
 * @param empresaId          - The empresa document $id
 * @param nombreCompleto     - Full name of the titular to search for
 * @param documentoIdentidad - Identity document of the titular
 * @returns An array of matching documents (caller decides how to handle 0, 1, or >1)
 */
export const findTitular = async (
    empresaId: string,
    nombreCompleto: string,
    documentoIdentidad: string,
) => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.miembrosId!,
            queries: [
                Query.equal("empresa_id", empresaId),
                Query.equal("parentesco", "titular"),
                Query.equal("nombre_completo", nombreCompleto),
                Query.equal("documento_identidad", documentoIdentidad),
            ],
        });

        return response.documents;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al buscar el titular");
    }
};

// ─── Verified Phone (AsyncStorage) ──────────────────────────

const PHONE_KEY = "clubSOS.miembro.telefono";

/**
 * Persist the verified phone number in AsyncStorage.
 * Should be called once during the login/OTP flow so that
 * downstream screens can read it without a backend call.
 *
 * @param phoneE164 - Phone number in E.164 format (e.g., +50588888888)
 */
export const saveVerifiedPhone = async (phoneE164: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(PHONE_KEY, phoneE164);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al guardar el teléfono verificado");
    }
};

/**
 * Retrieve the verified phone number from AsyncStorage.
 * Returns the phone in E.164 format, or an empty string if not stored yet.
 */
export const getVerifiedPhone = async (): Promise<string> => {
    try {
        const phone = await AsyncStorage.getItem(PHONE_KEY);
        return phone ?? "";
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al obtener el teléfono verificado");
    }
};

// ─── Miembro Draft (AsyncStorage) ───────────────────────────

const DRAFT_KEY = "clubSOS.miembro.draft";

/**
 * Load the current miembro draft from AsyncStorage.
 * Returns the parsed object or null if nothing was stored.
 */
export const loadMiembroDraft = async (): Promise<
    Record<string, unknown> | null
> => {
    try {
        const raw = await AsyncStorage.getItem(DRAFT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al cargar el borrador del miembro");
    }
};

/**
 * Merge the provided fields into the existing miembro draft in AsyncStorage.
 * Any pre-existing keys that are not in `fields` are preserved.
 *
 * @param fields - Partial draft object to merge
 */
export const saveMiembroDraft = async (
    fields: Record<string, unknown>,
): Promise<void> => {
    try {
        const existing = await loadMiembroDraft();
        await AsyncStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({ ...existing, ...fields }),
        );
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al guardar el borrador del miembro");
    }
};

/**
 * Create a new miembro document in the `miembros` Appwrite collection.
 * Gathers onboarding context (empresa, parentesco, titular link) from
 * AsyncStorage and merges it with the personal-info draft.
 *
 * @param draft - Personal info fields from the verify-account-info form
 * @returns The created Appwrite document
 */
export const createMiembro = async (
    draft: Record<string, unknown>,
) => {
    try {
        // Read onboarding context persisted by previous screens
        const [empresaId, parentesco, titularMiembroId] = await Promise.all([
            AsyncStorage.getItem("clubSOS.empresa_id"),
            AsyncStorage.getItem("clubSOS.miembro.parentesco"),
            AsyncStorage.getItem("clubSOS.miembro.titular_miembro_id"),
        ]);

        if (!empresaId) {
            throw new Error("No se encontró la empresa vinculada.");
        }

        if (!parentesco) {
            throw new Error("No se encontró el tipo de miembro.");
        }

        // Get the current Appwrite Auth user ID
        const currentUser = await account.get();

        // Build the document payload matching all miembros columns
        const data: Record<string, unknown> = {
            // Required fields
            empresa_id: empresaId,
            parentesco,
            nombre_completo: draft.nombre_completo,
            fecha_nacimiento: draft.fecha_nacimiento,
            sexo: (draft.sexo as string).toLowerCase(),
            telefono: draft.telefono,
            rol: "miembro",
            activo: false,
            auth_user_id: currentUser.$id,

            // Nullable fields
            documento_identidad: draft.documento_identidad ?? null,
            correo: draft.correo ?? null,
            titular_miembro_id: parentesco !== "titular" && titularMiembroId
                ? titularMiembroId
                : null,

            // EA fields — populated later by an Appwrite function
            ea_customer_id: null,
            ea_customer_last_sync: null,
            ea_customer_sync: false,
        };

        const document = await databases.createDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.miembrosId!,
            ID.unique(),
            data,
        );

        // Update the Appwrite Auth user profile with the member's name
        await account.updateName(draft.nombre_completo as string);

        return document;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al crear el miembro");
    }
};

/**
 * Search for a company by its unique codigo_empresa.
 * Queries the `empresas` collection filtering by exact match.
 *
 * @param codigoEmpresa - The normalised (trimmed + uppercased) company code
 * @returns The first matching document, or null if none found
 */
export const findEmpresaByCodigo = async (codigoEmpresa: string) => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.empresasId!,
            queries: [Query.equal("codigo_empresa", codigoEmpresa)],
        });

        if (response.documents.length === 0) {
            return null;
        }

        return response.documents[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al buscar la empresa");
    }
};

/**
 * Get a company document by its unique ID.
 * Returns the empresa document, or null if not found.
 *
 * @param empresaId - The empresa document $id
 * @returns The empresa document or null
 */
export const getEmpresaById = async (empresaId: string) => {
    try {
        const document = await databases.getDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.empresasId!,
            empresaId,
        );

        return document;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al obtener la empresa");
    }
};

/**
 * Look up a miembro document by the current Appwrite Auth user ID.
 * Returns the first matching document, or null if none found.
 *
 * @param authUserId - The Appwrite Auth user $id
 * @returns The miembro document or null
 */
export const findMiembroByAuthUserId = async (authUserId: string) => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.miembrosId!,
            queries: [Query.equal("auth_user_id", authUserId)],
        });

        if (response.documents.length === 0) {
            return null;
        }

        return response.documents[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al buscar el miembro");
    }
};

/**
 * Returns the current Appwrite Auth user if an active session exists,
 * or null if the user is not authenticated.
 */
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null;
    }
};

/**
 * Look up a miembro document by correo (normalised to lowercase).
 * Returns the first matching document, or null if none found.
 *
 * @param correo - Email address to check
 * @returns The miembro document or null
 */
export const findMiembroByCorreo = async (correo: string) => {
    try {
        const normalizedCorreo = correo.trim().toLowerCase();
        if (!normalizedCorreo) {
            return null;
        }

        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.miembrosId!,
            queries: [Query.equal("correo", normalizedCorreo)],
        });

        if (response.documents.length === 0) {
            return null;
        }

        return response.documents[0];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al validar el correo del miembro");
    }
};

// ─── Beneficios ──────────────────────────────────────────────

/**
 * Fetch all beneficios visible for a given empresa.
 * Returns documents where:
 *   - empresa_id is an empty array (visible to all)
 *   - empresa_id contains the specified empresaId
 * Ordered by fecha_inicio descending.
 *
 * @param empresaId - The empresa $id of the current miembro
 */
export const getBeneficiosByEmpresa = async (empresaId: string) => {
    try {
        // Fetch all beneficios ordered by fecha_inicio
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.beneficiosId!,
            queries: [
                Query.orderDesc("fecha_inicio"),
            ],
        });

        // Filter client-side:
        // - Include if empresa_id is empty array (visible to all)
        // - Include if empresa_id contains our empresaId
        const filteredDocuments = response.documents.filter((doc) => {
            const empresaIds = doc.empresa_id as string[];
            return empresaIds.length === 0 || empresaIds.includes(empresaId);
        });

        return filteredDocuments;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al obtener los beneficios");
    }
};

/**
 * Create a new beneficio document.
 * Should only be called by users with rol === "admin".
 *
 * @param data - The beneficio fields to create
 * @returns The created Appwrite document
 */
export const createBeneficio = async (data: BeneficioData) => {
    try {
        const document = await databases.createDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.beneficiosId!,
            ID.unique(),
            data,
        );

        return document;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al crear el beneficio");
    }
};

/**
 * Update an existing beneficio document.
 * Should only be called by users with rol === "admin".
 *
 * @param id   - The $id of the beneficio document to update
 * @param data - Partial beneficio fields to update (creado_por is immutable)
 * @returns The updated Appwrite document
 */
export const updateBeneficio = async (
    id: string,
    data: Partial<Omit<BeneficioData, "creado_por">>,
) => {
    try {
        const document = await databases.updateDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.beneficiosId!,
            id,
            data,
        );

        return document;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al actualizar el beneficio");
    }
};

/**
 * Delete a beneficio document.
 * Should only be called by users with rol === "admin".
 *
 * @param id - The $id of the beneficio document to delete
 */
export const deleteBeneficio = async (id: string) => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.beneficiosId!,
            id,
        );
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al eliminar el beneficio");
    }
};

// ─── Session Management ──────────────────────────────────

/**
 * Delete the current Appwrite session and clear all local storage.
 * This logs out the user completely.
 *
 * @returns Promise<void>
 */
export const deleteSession = async (): Promise<void> => {
    try {
        // Delete the current session from Appwrite
        await account.deleteSession("current");

        // Clear all relevant AsyncStorage keys
        await Promise.all([
            AsyncStorage.removeItem(PHONE_KEY),
            AsyncStorage.removeItem(DRAFT_KEY),
            AsyncStorage.removeItem("clubSOS.empresa_id"),
            AsyncStorage.removeItem("clubSOS.miembro.parentesco"),
            AsyncStorage.removeItem("clubSOS.miembro.titular_miembro_id"),
        ]);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al cerrar la sesión");
    }
};

// ─── Parientes ───────────────────────────────────────────

/**
 * Fetch all parientes linked to a titular member.
 * Queries the `miembros` collection filtering by titular_miembro_id.
 *
 * @param titularId - The $id of the titular miembro document
 * @returns Array of pariente documents
 */
export const getParientesByTitularId = async (titularId: string) => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.miembrosId!,
            queries: [
                Query.equal("titular_miembro_id", titularId),
                Query.orderDesc("$createdAt"),
            ],
        });

        return response.documents;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al obtener los parientes");
    }
};

// ─── Documentos Médicos ──────────────────────────────────────

/**
 * Obtiene los documentos médicos activos de un miembro y los ordena por fecha.
 *
 * @param miembroId - El $id del documento del miembro
 * @returns Lista de documentos médicos activos
 */
export const getDocumentosByMiembro = async (
    miembroId: string,
): Promise<DocumentoMedico[]> => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.documentosMedicosId!,
            queries: [
                Query.equal("miembro_id", miembroId),
                Query.equal("estado_archivo", "activo"),
                Query.orderDesc("fecha_documento"),
            ],
        });

        return response.documents as unknown as DocumentoMedico[];
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al obtener los documentos médicos");
    }
};

/**
 * Ejecuta la función de Appwrite que valida propiedad del archivo y devuelve
 * su contenido codificado en base64.
 *
 * Nota: el nombre del env var conserva la referencia histórica a "token",
 * pero el resultado real que consume la app es el contenido en base64.
 *
 * @param fileId - El $id del archivo en Storage
 * @returns Contenido del archivo en base64 listo para escribir en caché
 */
export const getDocumentoBase64 = async (fileId: string): Promise<string> => {
    try {
        const execution = await functions.createExecution({
            functionId: appwriteConfig.getDocumentTokenFnId!,
            body: JSON.stringify({ fileId }),
            async: false,
        });

        let result: { base64?: string; error?: string };
        try {
            result = JSON.parse(execution.responseBody);
        } catch {
            if (
                execution.responseStatusCode === 200 && execution.responseBody
            ) {
                return normalizeBase64Payload(execution.responseBody);
            }

            throw new Error(
                `Error en la función (HTTP ${execution.responseStatusCode})`,
            );
        }

        if (execution.responseStatusCode !== 200) {
            throw new Error(result.error ?? "No se pudo obtener el documento");
        }

        if (!result.base64) throw new Error("Contenido no disponible");
        return normalizeBase64Payload(result.base64);
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al obtener acceso al documento");
    }
};

// ─── Citas ───────────────────────────────────────────────

export interface NuevaCitaPayload {
    miembro_id: string;
    empresa_id: string;
    fecha_hora_cita: string;     // ISO 8601, ej. "2025-06-10T09:00:00.000+00:00"
    ea_service_id: string;
    ea_provider_id: string;
    ea_customer_id: string;
    para_titular: boolean;
    paciente_nombre: string;
    paciente_telefono: string | null;
    paciente_correo: string | null;
    paciente_cedula: string | null;
    /** ID retornado por EA tras crear la cita exitosamente */
    ea_appointment_id?: string | null;
    /** "sincronizado" si ya se creó en EA, "pendiente" si no */
    estado_sync?: "pendiente" | "sincronizado" | "fallido";
}

/**
 * Crea una nueva cita en Appwrite.
 * Si se provee ea_appointment_id se guarda como "sincronizado",
 * de lo contrario queda como "pendiente".
 */
export const crearCita = async (payload: NuevaCitaPayload): Promise<Cita> => {
    const { ea_appointment_id, estado_sync, ...rest } = payload;
    try {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.citasId!,
            ID.unique(),
            {
                ...rest,
                estado_sync: estado_sync ?? (ea_appointment_id ? "sincronizado" : "pendiente"),
                ea_appointment_id: ea_appointment_id ?? null,
                motivo_cita: null,
            },
        );
        return doc as unknown as Cita;
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al crear la cita");
    }
};

/**
 * Obtiene las citas de un miembro ordenadas por fecha ascendente
 * (la próxima cita aparece primera).
 */
export const getCitasByMiembro = async (miembroId: string): Promise<Cita[]> => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.citasId!,
            queries: [
                Query.equal("miembro_id", miembroId),
                Query.orderAsc("fecha_hora_cita"),
            ],
        });
        return response.documents as unknown as Cita[];
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al obtener las citas");
    }
};

// ─── Servicios ───────────────────────────────────────────

/**
 * Obtiene los servicios filtrados por ubicación (ea_category_id).
 * 1 = Managua, 2 = León.
 */
export const getServiciosByCategoria = async (
    categoriaId: number,
): Promise<Servicio[]> => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.serviciosId!,
            queries: [
                Query.equal("ea_category_id", categoriaId),
                Query.orderAsc("nombre"),
            ],
        });
        return response.documents as unknown as Servicio[];
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al obtener los servicios");
    }
};

/**
 * Obtiene servicios por sus ea_ids (para mostrar nombres en la lista de citas).
 */
export const getServiciosByEaIds = async (
    eaIds: number[],
): Promise<Servicio[]> => {
    try {
        if (eaIds.length === 0) return [];
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.serviciosId!,
            queries: [Query.equal("ea_id", eaIds)],
        });
        return response.documents as unknown as Servicio[];
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al obtener los servicios");
    }
};

// ─── Doctores ────────────────────────────────────────────

/**
 * Obtiene doctores por sus ea_ids (para mostrar nombres en la lista de citas).
 */
export const getDoctoresByEaIds = async (
    eaIds: number[],
): Promise<Doctor[]> => {
    try {
        if (eaIds.length === 0) return [];
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.doctoresId!,
            queries: [Query.equal("ea_id", eaIds)],
        });
        return response.documents as unknown as Doctor[];
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al obtener los doctores");
    }
};

/**
 * Obtiene los doctores activos que ofrecen un servicio específico.
 * Filtra por ea_servicios que contenga el ea_id del servicio (como string).
 *
 * @param eaServiceId - El ea_id del servicio seleccionado
 */
export const getDoctoresByServicioEaId = async (
    eaServiceId: number,
): Promise<Doctor[]> => {
    try {
        const response = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId!,
            collectionId: appwriteConfig.doctoresId!,
            queries: [
                Query.contains("ea_servicios", String(eaServiceId)),
                Query.equal("activo", true),
                Query.orderAsc("apellidos"),
            ],
        });
        return response.documents as unknown as Doctor[];
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error("Error al obtener los doctores");
    }
};

// ─── Perfil ──────────────────────────────────────────────

/**
 * Actualiza los datos de un miembro en la base de datos.
 * @param miembroId - El $id del documento del miembro
 * @param data - Los campos a actualizar
 * @returns El documento actualizado
 */
export const updateMiembro = async (
    miembroId: string,
    data: Record<string, unknown>,
) => {
    try {
        const document = await databases.updateDocument(
            appwriteConfig.databaseId!,
            appwriteConfig.miembrosId!,
            miembroId,
            data,
        );

        return document;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Error al actualizar el miembro");
    }
};
