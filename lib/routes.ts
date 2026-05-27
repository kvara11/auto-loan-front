export const API_ROUTES = {
    auth: {
        login: "/api/auth/login",
        register: "/api/auth/register",
        me: "/api/auth/me",
        roles: "/api/auth/roles",
        logout: "/api/auth/logout",
    },
} as const;
