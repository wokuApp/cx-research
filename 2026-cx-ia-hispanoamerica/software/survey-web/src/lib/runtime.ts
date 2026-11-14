export const IS_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';
export const STORAGE_SCOPE = IS_MOCK ? 'preview' : 'live';
