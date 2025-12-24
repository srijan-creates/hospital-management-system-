const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET_KEY

function generateJWT(payload, expiresIn="7d") {
    return jwt.sign(payload, JWT_KEY, {expiresIn});
} 

async function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_KEY);
    } catch (error) {
        return false;
    }
}


async function decodeJWT(token) {
    try {
        return jwt.decode(token, JWT_KEY);
    } catch (error) {
        return false
    }
}
module.exports = {generateJWT, verifyJWT, decodeJWT}