import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

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
 * Search for a company by its unique codigo_empresa.
 * Queries the `empresas` collection filtering by exact match.
 *
 * @param codigoEmpresa - The normalised (trimmed + uppercased) company code
 * @returns The first matching document, or null if none found
 */
export const findEmpresaByCodigo = async (codigoEmpresa: string) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId!,
            appwriteConfig.empresasId!,
            [Query.equal("codigo_empresa", codigoEmpresa)]
        );

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

