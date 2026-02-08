import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
} from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: "com.sosmedical.clubsos",
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    miembrosId: process.env.EXPO_PUBLIC_APPWRITE_MIEMBROS_ID,
    empresasId: process.env.EXPO_PUBLIC_APPWRITE_EMPRESAS_ID,
};

export const client = new Client();

// Initialialize Appwrite client
client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform!);

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

/**
 * Delete any active session so a new one can be created.
 * Silently ignores errors (e.g. when no session exists).
 */
const deleteExistingSession = async () => {
    try {
        await account.deleteSession("current");
    } catch {
        // No active session – nothing to delete
    }
};

/**
 * Send OTP via SMS to the specified phone number
 * @param phoneE164 - Phone number in E.164 format (e.g., +50588888888)
 * @returns Promise with the token/userId for OTP verification
 */
export const sendPhoneOtp = async (phoneE164: string) => {
    try {
        // Clear any lingering session before starting a new auth flow
        await deleteExistingSession();

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
        // Clear any stale session that might block creating the new one
        await deleteExistingSession();

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
export const loadMiembroDraft = async (): Promise<Record<string, unknown> | null> => {
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
