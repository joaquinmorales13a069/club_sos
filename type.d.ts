// interface for creating a new user
export interface CreateUserProps {
    email: string;
    password: string;
    name: string;
    phone: string;
}

// interface for user login
export interface LoginUserProps {
    email: string;
    password: string;
}

// Beneficios types
export type EstadoBeneficio = "activa" | "expirada";
export type TipoBeneficio = "descuento" | "promocion" | "anuncio";

// interface for beneficio data
export interface BeneficioData {
    empresa_id: string[];
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado_beneficio: EstadoBeneficio;
    creado_por: string;
    tipo_beneficio: TipoBeneficio | null;
    beneficio_image_url?: string | null;
}

// ─── Documentos Médicos Types ───────────────────────────────

export type TipoDocumento =
    | "laboratorio"
    | "radiologia"
    | "consulta_medica"
    | "especialidades"
    | "otro";

export type TipoArchivo = "pdf" | "imagen";

export type EstadoArchivo = "activo" | "eliminado";

export interface DocumentoMedico {
    $id: string;
    miembro_id: string;
    storage_archivo_id: string;
    nombre_documento: string;
    tipo_documento: TipoDocumento;
    tipo_archivo: TipoArchivo;
    fecha_documento: string;
    estado_archivo: EstadoArchivo;
    subido_por: string;
    $createdAt: string;
    $updatedAt: string;
}

// ─── Citas Types ─────────────────────────────────────────────

export type EstadoSync = "pendiente" | "sincronizado" | "fallido";

export interface Cita {
    $id: string;
    miembro_id: string;
    empresa_id: string;
    fecha_hora_cita: string;
    motivo_cita: string | null;
    ea_service_id: string;
    ea_provider_id: string;
    ea_customer_id: string;
    estado_sync: EstadoSync;
    ea_appointment_id: string | null;
    para_titular: boolean;
    paciente_nombre: string;
    paciente_telefono: string | null;
    paciente_correo: string | null;
    paciente_cedula: string | null;
    $createdAt: string;
    $updatedAt: string;
}

export interface Servicio {
    $id: string;
    ea_id: number;
    nombre: string;
    duracion: number;
    precio: number;
    moneda: string;
    descripcion: string | null;
    ubicacion: string | null;
    ea_category_id: number;
}

export interface Doctor {
    $id: string;
    ea_id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    ea_servicios: string[];
    activo: boolean;
}

// ─── Perfil Screen Types ────────────────────────────────────

// Accordion types
export type AccordionKey =
    | "datos"
    | "notificaciones"
    | "parientes"
    | "cerrar_sesion";

export interface AccordionSection {
    key: AccordionKey;
    title: string;
    subtitle: string;
    icon: any; // MaterialIcons.glyphMap key
    iconBg: string;
    iconBgDark: string;
    iconColor: string;
}

// Component props
export interface AccordionCardProps {
    section: AccordionSection;
    isExpanded: boolean;
    onToggle: () => void;
    isDark: boolean;
    children: React.ReactNode;
}

export interface ProfileFieldProps {
    label: string;
    icon: any; // MaterialIcons.glyphMap key
    isDark: boolean;
    badge?: string;
    children: React.ReactNode;
}

export interface ReadOnlyRowProps {
    label: string;
    value: string;
    isDark: boolean;
}

export interface DatosPersonalesProps {
    isDark: boolean;
    nombre: string;
    setNombre: (v: string) => void;
    documento: string;
    setDocumento: (v: string) => void;
    correo: string;
    setCorreo: (v: string) => void;
    telefono: string;
    sexo: string;
    fechaNacimiento: string;
    onGuardar?: () => void;
}

export interface ToggleRowProps {
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    isDark: boolean;
    isLast?: boolean;
}

export interface NotificacionesProps {
    isDark: boolean;
    notifCitas: boolean;
    setNotifCitas: (v: boolean) => void;
    notifBeneficios: boolean;
    setNotifBeneficios: (v: boolean) => void;
    notifGeneral: boolean;
    setNotifGeneral: (v: boolean) => void;
}

export interface ParientesContentProps {
    isDark: boolean;
    parientes: any[];
    loadingParientes: boolean;
    onToggleActivo: (parienteId: string, currentActivo: boolean) => void;
    togglingId: string | null;
}

export interface CerrarSesionContentProps {
    isDark: boolean;
    onPress?: () => void;
}
