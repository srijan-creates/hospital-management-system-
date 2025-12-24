const requestCounts = new Map();

function rateLimit(options = {}) {
    const {
        windowMs = 60 * 1000, 
        maxRequests = 10,
        message = 'Too many requests, please try again later.',
        keyGenerator = (req) => {
            return req.user?._id?.toString() || req.ip || req.connection.remoteAddress;
        }
    } = options;

    return (req, res, next) => {
        try {
            const key = keyGenerator(req);
            const now = Date.now();

            if (!requestCounts.has(key)) {
                requestCounts.set(key, {
                    count: 0,
                    resetTime: now + windowMs
                });
            }

            const requestData = requestCounts.get(key);

            if (now > requestData.resetTime) {
                requestData.count = 0;
                requestData.resetTime = now + windowMs;
            }

            requestData.count++;

            if (requestData.count > maxRequests) {
                const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);

                res.setHeader('Retry-After', retryAfter);
                res.setHeader('X-RateLimit-Limit', maxRequests);
                res.setHeader('X-RateLimit-Remaining', 0);
                res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());

                return res.status(429).json({
                    success: false,
                    message,
                    retryAfter: `${retryAfter} seconds`
                });
            }

            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', maxRequests - requestData.count);
            res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());

            next();

        } catch (error) {
            console.error('Rate limit error:', error);
            next();
        }
    };
}

setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now > data.resetTime + 60000) { 
            requestCounts.delete(key);
        }
    }
}, 5 * 60 * 1000);

const rateLimiters = {
    chatMessage: rateLimit({
        windowMs: 60 * 1000,
        maxRequests: 10,
        message: 'Too many messages sent. Please slow down and try again in a moment.'
    }),

    chatHistory: rateLimit({
        windowMs: 60 * 1000,
        maxRequests: 30,
        message: 'Too many requests. Please try again later.'
    }),

    sessionUpdate: rateLimit({
        windowMs: 60 * 1000,
        maxRequests: 5,
        message: 'Too many session updates. Please try again later.'
    }),

    general: rateLimit({
        windowMs: 60 * 1000,
        maxRequests: 100,
        message: 'Too many requests. Please try again later.'
    })
};

module.exports = {
    rateLimit,
    rateLimiters
};
