"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStrongPassword = isStrongPassword;
function isStrongPassword(pw) {
    // Al menos 1 mayúscula, 1 minúscula, 1 número, 1 símbolo, longitud >=10
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    return regex.test(pw);
}
