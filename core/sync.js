// sync.js — Export/Import de datos offline-first (.ateje-backup)
'use strict';

window.SyncEngine = {
  _password: '',
  _excludeTables: ['_ia_chats', '_ia_messages'],

  setPassword: function (pwd) {
    this._password = pwd || '';
  },

  exportar: function (password) {
    var pwd = password || this._password;
    var self = this;
    UI.toast('Preparando respaldo...', 'info');

    var recolectar = function () {
      var payload = {
        version: 2,
        app: APP_CONFIG.app.nombre || 'app',
        exportedAt: new Date().toISOString(),
        tables: {},
        files: null,
        blobs: null
      };
      var tables = db.tables.filter(function (t) {
        return self._excludeTables.indexOf(t.name) === -1;
      });

      var promises = tables.map(function (table) {
        return table.toArray().then(function (records) {
          if (records.length) payload.tables[table.name] = records;
        });
      });

      return Promise.all(promises).then(function () {
        return payload;
      });
    };

    recolectar().then(function (payload) {
      var json = JSON.stringify(payload);
      var compressed = pako.deflate(json, { level: 9 });
      var blob;

      if (pwd) {
        var encrypted = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(compressed),
          pwd
        ).toString();
        blob = new Blob([encrypted], { type: 'application/octet-stream' });
      } else {
        blob = new Blob([compressed], { type: 'application/octet-stream' });
      }

      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = APP_CONFIG.app.id + '-' + new Date().toISOString().slice(0, 10) + '.ateje-backup';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      UI.toast('Respaldo exportado (' + (blob.size / 1024).toFixed(1) + ' KB)', 'success');
    }).catch(function (err) {
      UI.toast('Error al exportar: ' + err.message, 'error');
    });
  },

  importar: function (file, password) {
    var pwd = password || this._password;
    var self = this;

    UI.toast('Leyendo respaldo...', 'info');

    var leerArchivo = function (file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) { resolve(new Uint8Array(e.target.result)); };
        reader.onerror = function () { reject(new Error('Error al leer archivo')); };
        reader.readAsArrayBuffer(file);
      });
    };

    leerArchivo(file).then(function (data) {
      var decrypted;
      if (pwd) {
        var str = new TextDecoder().decode(data);
        var bytes = CryptoJS.AES.decrypt(str, pwd);
        var raw = bytes.toString(CryptoJS.enc.Latin1);
        var buf = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
        decrypted = buf;
      } else {
        decrypted = data;
      }

      var decompressed = pako.inflate(decrypted, { to: 'string' });
      var payload = JSON.parse(decompressed);

      var restaurar = function () {
        var promises = [];
        for (var tableName in payload.tables) {
          if (payload.tables.hasOwnProperty(tableName)) {
            var records = payload.tables[tableName];
            if (db[tableName]) {
              promises.push(db[tableName].bulkPut(records));
            }
          }
        }
        return Promise.all(promises);
      };

      return restaurar().then(function () {
        UI.toast('Respaldo restaurado correctamente', 'success');
        if (typeof appRouter !== 'undefined' && appRouter.currentModule) {
          var mod = window.MODULES[appRouter.currentModule];
          if (mod && mod.cargarDatos) mod.cargarDatos();
        }
      });
    }).catch(function (err) {
      UI.toast('Error al importar: ' + err.message, 'error');
    });
  }
};
