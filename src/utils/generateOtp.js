const { authenticator } = require('otplib');
const crypto = require('crypto');

const key = process.env.OTP_SECRET ;

const generateHash = (phone) => {
    const otp = authenticator.generate(key);
    const ttl = 1000 * 60 * 5; 
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', key).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;
    return { otp, hash: fullHash };
};

const otpVerify = (otp, hash, phone) => {
    try {
        const [hashValue, expires] = hash.split('.');

    if (Date.now() > parseInt(expires)) {
        return { success: false, message: 'OTP expired' };
    }

    const data = `${phone}.${otp}.${expires}`;
    const newExpectedHash = crypto.createHmac('sha256', key).update(data).digest('hex');

    if (newExpectedHash === hashValue) {
        return { success: true };
    }

    return { success: false, message: 'Invalid OTP' };
    } catch (error) {
        console.error(`Error sending otp`, error);
    }
};

module.exports = { generateHash, otpVerify };
