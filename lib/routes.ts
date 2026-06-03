export const API_ROUTES = {
    auth: {
        login: "/api/auth/login",
        register: "/api/auth/register",
        me: "/api/auth/me",
        roles: "/api/auth/roles",
        changePassword: "/api/auth/change-password",
        logout: "/api/auth/logout",
    },
    admin: {
        users: "/api/admin/users",
        roles: "/api/admin/roles",
        userActivation: (userId: string) => `/api/admin/users/${userId}/activation`,
    },
    settings: {
        index: "/api/settings",
    },
} as const;
