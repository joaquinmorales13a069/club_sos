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
