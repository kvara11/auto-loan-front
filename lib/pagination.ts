// The `meta` of a paginated backend list (GET …?page=&per_page=).
export type PageMeta = { current_page: number; per_page: number; total: number; last_page: number }
