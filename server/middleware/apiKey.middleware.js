const validateApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    
    // Get API key from environment variable
    const validApiKey = process.env.API_KEY;
    
    if (!validApiKey) {
        console.error('API_KEY not set in environment variables');
        return res.status(500).json({
            error: 'Server Configuration Error',
            message: 'API authentication not properly configured'
        });
    }

    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API key is missing'
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key'
        });
    }

    next();
};

export default validateApiKey;
