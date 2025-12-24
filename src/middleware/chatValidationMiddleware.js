function validateMessage(message) {
    if (!message || typeof message !== 'string') {
        return {
            valid: false,
            error: 'Message must be a non-empty string'
        };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
        return {
            valid: false,
            error: 'Message cannot be empty or contain only whitespace'
        };
    }

    if (trimmed.length > 1000) {
        return {
            valid: false,
            error: 'Message is too long (maximum 1000 characters)'
        };
    }

    if (trimmed.length < 1) {
        return {
            valid: false,
            error: 'Message is too short (minimum 1 character)'
        };
    }

    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, 
        /<iframe/i
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmed)) {
            return {
                valid: false,
                error: 'Message contains potentially harmful content'
            };
        }
    }

    return {
        valid: true,
        message: trimmed
    };
}

function validateSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
        return {
            valid: false,
            error: 'Session ID must be a non-empty string'
        };
    }

    const trimmed = sessionId.trim();

    if (trimmed.length === 0) {
        return {
            valid: false,
            error: 'Session ID cannot be empty'
        };
    }

    if (trimmed.length > 100) {
        return {
            valid: false,
            error: 'Session ID is too long (maximum 100 characters)'
        };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return {
            valid: false,
            error: 'Session ID contains invalid characters (only alphanumeric, hyphens, and underscores allowed)'
        };
    }

    return {
        valid: true,
        sessionId: trimmed
    };
}

function validateUserInfo(userInfo) {
    const errors = [];

    if (userInfo.name) {
        if (typeof userInfo.name !== 'string') {
            errors.push('Name must be a string');
        } else if (userInfo.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        } else if (userInfo.name.trim().length > 100) {
            errors.push('Name is too long (maximum 100 characters)');
        }
    }

    if (userInfo.email) {
        if (typeof userInfo.email !== 'string') {
            errors.push('Email must be a string');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userInfo.email.trim())) {
                errors.push('Invalid email format');
            }
        }
    }

    if (userInfo.phone) {
        if (typeof userInfo.phone !== 'string') {
            errors.push('Phone must be a string');
        } else {
            const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;
            if (!phoneRegex.test(userInfo.phone.trim())) {
                errors.push('Invalid phone number format');
            }
        }
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors
        };
    }

    return {
        valid: true,
        userInfo: {
            name: userInfo.name?.trim(),
            email: userInfo.email?.trim().toLowerCase(),
            phone: userInfo.phone?.trim()
        }
    };
}

function validateSendMessage(req, res, next) {
    try {
        const { sessionId, message } = req.body;

        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.valid) {
            return res.status(400).json({
                success: false,
                error: sessionValidation.error
            });
        }

        const messageValidation = validateMessage(message);
        if (!messageValidation.valid) {
            return res.status(400).json({
                success: false,
                error: messageValidation.error
            });
        }

        req.validatedData = {
            sessionId: sessionValidation.sessionId,
            message: messageValidation.message
        };

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Validation error',
            message: error.message
        });
    }
}

function validateGetHistory(req, res, next) {
    try {
        const { sessionId, page, limit } = req.query;

        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.valid) {
            return res.status(400).json({
                success: false,
                error: sessionValidation.error
            });
        }

        let validatedPage = 1;
        let validatedLimit = 50;

        if (page) {
            validatedPage = parseInt(page, 10);
            if (isNaN(validatedPage) || validatedPage < 1) {
                return res.status(400).json({
                    success: false,
                    error: 'Page must be a positive integer'
                });
            }
        }

        if (limit) {
            validatedLimit = parseInt(limit, 10);
            if (isNaN(validatedLimit) || validatedLimit < 1 || validatedLimit > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'Limit must be between 1 and 100'
                });
            }
        }

        req.validatedData = {
            sessionId: sessionValidation.sessionId,
            page: validatedPage,
            limit: validatedLimit
        };

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Validation error',
            message: error.message
        });
    }
}

function validateSessionInfo(req, res, next) {
    try {
        const { sessionId, name, email, phone } = req.body;

        const sessionValidation = validateSessionId(sessionId);
        if (!sessionValidation.valid) {
            return res.status(400).json({
                success: false,
                error: sessionValidation.error
            });
        }

        if (!name && !email && !phone) {
            return res.status(400).json({
                success: false,
                error: 'At least one field (name, email, or phone) must be provided'
            });
        }

        const userInfoValidation = validateUserInfo({ name, email, phone });
        if (!userInfoValidation.valid) {
            return res.status(400).json({
                success: false,
                errors: userInfoValidation.errors
            });
        }

        req.validatedData = {
            sessionId: sessionValidation.sessionId,
            userInfo: userInfoValidation.userInfo
        };

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Validation error',
            message: error.message
        });
    }
}

function sanitizeString(str) {
    if (typeof str !== 'string') return str;

    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

module.exports = {
    validateMessage,
    validateSessionId,
    validateUserInfo,
    validateSendMessage,
    validateGetHistory,
    validateSessionInfo,
    sanitizeString
};
