// CoreViz API Configuration
export const COREVIZ_CONFIG = {
    API_BASE_URL: 'https://lab.coreviz.io',

    API_KEY: '',
    ENTITY_ID: '',

    // API endpoints
    ENDPOINTS: {
        UPLOAD: '/api/upload/multipart',
    },

    // Upload settings
    UPLOAD_SETTINGS: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
        QUALITY: 0.8,
    }
} as const;

// Helper function to check if configuration is valid
export const isConfigurationValid = () => {
    return !!(COREVIZ_CONFIG.API_KEY && COREVIZ_CONFIG.ENTITY_ID);
};