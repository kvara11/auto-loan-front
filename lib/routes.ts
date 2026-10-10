export const API_ROUTES = {
    auth: {
        login: "/api/auth/login",
        me: "/api/auth/me",
        roles: "/api/auth/roles",
        changePassword: "/api/auth/change-password",
        logout: "/api/auth/logout",
    },
    admin: {
        users: "/api/admin/users",
        user: (userId: string) => `/api/admin/users/${userId}`,
        roles: "/api/admin/roles",
        userActivation: (userId: string) => `/api/admin/users/${userId}/activation`,
        branches: "/api/admin/branches",
        branch: (branchId: string) => `/api/admin/branches/${branchId}`,
    },
    settings: {
        index: "/api/settings",
    },
} as const;
