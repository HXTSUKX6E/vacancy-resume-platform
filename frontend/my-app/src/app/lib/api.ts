// Базовый адрес API задаётся через переменную окружения (12 факторов, III).
// По умолчанию пусто: запросы идут на тот же origin, где nginx проксирует /api на бэкенд.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
