import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables");
}

export function encryptData(data) {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      ENCRYPTION_KEY,
    ).toString();
    return encrypted;
  } catch (error) {
    throw new Error("Failed to encrypt data: " + error.message);
  }
}

export function decryptData(encryptedData) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Failed to decrypt data: " + error.message);
  }
}
