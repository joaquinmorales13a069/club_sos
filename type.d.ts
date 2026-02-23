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
}

export interface CerrarSesionContentProps {
    isDark: boolean;
}
