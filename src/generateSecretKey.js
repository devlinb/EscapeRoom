import crypto from 'crypto';

export function generateSecretKey(passphrase) {
    const salt = process.env.SALT;
    const hash = crypto.createHash('sha256');
    hash.update(passphrase + salt);
    return hash.digest('hex');
}
