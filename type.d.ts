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
