// crypto.js — Cifrado AES + UUID v4 para AHA Rx
'use strict';

window.cryptoHelpers = {
  _getKey: function () {
    var key = localStorage.getItem(APP_CONFIG.cifrado.storageKey);
    if (!key) {
      key = uuid();
      localStorage.setItem(APP_CONFIG.cifrado.storageKey, key);
    }
    return key;
  },

  encrypt: function (texto) {
    if (!texto) return '';
    return CryptoJS.AES.encrypt(texto, this._getKey()).toString();
  },

  decrypt: function (textoCifrado) {
    if (!textoCifrado) return '';
    if (typeof textoCifrado !== 'string') return String(textoCifrado);
    if (!textoCifrado.startsWith('U2FsdGVkX1')) return textoCifrado;
    var bytes = CryptoJS.AES.decrypt(textoCifrado, this._getKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  },

  hash: function (texto) {
    return CryptoJS.SHA256(texto).toString();
  }
};

// Generador UUID v4 (compatible con file://)
window.uuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};
