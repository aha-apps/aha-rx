// file-store.js — Gesti\u00f3n de archivos local (Lite: blob en IndexedDB)
'use strict';

window.FileStore = {
  APP_DATA_DIR: APP_CONFIG.data.dir || 'data/',

  save: function (tipo, nombre, blob) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var path = tipo + '/' + uuid() + '-' + nombre;
        var entry = {
          path: path,
          tipo: tipo,
          nombre: nombre,
          mime: blob.type,
          size: blob.size,
          hash: '',
          refCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        db._files.put(entry).then(function () {
          if (db._file_blobs) {
            return db._file_blobs.put({ path: path, data: e.target.result });
          }
        }).then(function () {
          var url = URL.createObjectURL(blob);
          resolve({ path: path, hash: entry.hash, url: url });
        }).catch(function (err) {
          reject(err);
        });
      };
      reader.onerror = function () { reject(new Error('Error al leer archivo')); };
      reader.readAsArrayBuffer(blob);
    });
  },

  getURL: function (path) {
    if (!path) return Promise.resolve(APP_CONFIG.data.avatars.default);
    var self = this;
    return new Promise(function (resolve) {
      if (db._file_blobs) {
        db._file_blobs.get(path).then(function (entry) {
          if (entry && entry.data) {
            var blob = new Blob([entry.data]);
            var url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            resolve(APP_CONFIG.data.avatars.default);
          }
        }).catch(function () {
          resolve(APP_CONFIG.data.avatars.default);
        });
      } else {
        resolve(APP_CONFIG.data.avatars.default);
      }
    });
  },

  read: function (path) {
    return new Promise(function (resolve, reject) {
      if (db._file_blobs) {
        db._file_blobs.get(path).then(function (entry) {
          if (entry && entry.data) {
            resolve(new Blob([entry.data]));
          } else {
            reject(new Error('Archivo no encontrado'));
          }
        }).catch(function (err) { reject(err); });
      } else {
        reject(new Error('No hay backend de archivos'));
      }
    });
  },

  delete: function (path) {
    return db._files.delete(path).then(function () {
      if (db._file_blobs) {
        return db._file_blobs.delete(path);
      }
    });
  },

  cleanOrphans: function () {
    var self = this;
    return db._files.toArray().then(function (files) {
      var promises = [];
      files.forEach(function (f) {
        if (f.refCount <= 0) {
          promises.push(self.delete(f.path));
        }
      });
      return Promise.all(promises);
    });
  },

  meta: function (path) {
    return db._files.get(path);
  },

  avatarDefault: function () {
    return APP_CONFIG.data.avatars.default;
  }
};
