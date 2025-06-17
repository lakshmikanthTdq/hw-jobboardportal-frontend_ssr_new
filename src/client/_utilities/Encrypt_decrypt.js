import CryptoJS from "crypto-js";

const secretKey = '9f7b3c4f2b7e8a2c1d5e6f7a9b8c7d6e5f4a3b2c1d8e9f0a7b6c5d4e3f2a1b0c';

export function encryptParams(params) {
  const stringParams = new URLSearchParams(params).toString();
  const encrypted = CryptoJS.AES.encrypt(stringParams, secretKey).toString();
  const safeEncrypted = encodeURIComponent(encrypted); // URL safe
  return safeEncrypted;
}

export function decryptParams(encrypted) {
  const decoded = decodeURIComponent(encrypted);
  const bytes = CryptoJS.AES.decrypt(decoded, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}

export function parseParamsString(paramStr) {
  const params = new URLSearchParams(paramStr);
  return {
    customerId: Number(params.get("customerId")),
    countryId: Number(params.get("countryId")),
    jobfeedId: Number(params.get("jobfeedId")) ?? 0,
    segmentId: Number(params.get("segmentId")) ?? 0,
  };
}