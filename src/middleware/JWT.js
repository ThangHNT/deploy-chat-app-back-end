require('dotenv').config();
const jwt = require('jsonwebtoken');

const createJWT = (data) => {
    let key = process.env.SECRET_KEY_JWT;
    let token = null;
    try {
        token = jwt.sign(data, key);
    } catch (err) {
        console.log(err);
    }
    return token;
};

const verifyToken = (token) => {
    let key = process.env.SECRET_KEY_JWT;
    let data = null;
    try {
        let decoded = jwt.verify(token, key);
        data = decoded;
    } catch (err) {
        console.log(err);
    }
    return data;
};

module.exports = {
    createJWT,
    verifyToken,
};
