// search-palette.js — Command Palette global (Cmd+K / Ctrl+K)
'use strict';

window.searchPalette = function () {
  return {
    open: false,
    query: '',
    selectedIdx: 0,
    keyboardNav: false,

    get modulos() {
      var result = [];
      var mods = APP_CONFIG.modulos;
      for (var key in mods) {
        if (mods.hasOwnProperty(key) && mods[key].activo) {
          result.push({
            id: key,
            title: mods[key].titulo,
            icon: mods[key].icono,
            subtitle: '',
            type: 'module'
          });
        }
      }
      return result;
    },

    get hasResults() {
      return this.filtered.length > 0;
    },

    get filtered() {
      var self = this;
      if (!this.query || this.query.length < 2) {
        return this.modulos;
      }
      var q = this.query.toLowerCase();
      return this.modulos.filter(function (m) {
        return m.title.toLowerCase().indexOf(q) !== -1;
      });
    },

    openPalette: function () {
      this.open = true;
      this.query = '';
      this.selectedIdx = 0;
      var self = this;
      setTimeout(function () {
        var input = document.querySelector('.sp-search-input');
        if (input) input.focus();
      }, 100);
    },

    closePalette: function () {
      this.open = false;
      this.query = '';
    },

    selectItem: function (item) {
      if (item.type === 'module') {
        window.appRouter.navigate(item.id);
      }
      this.closePalette();
    },

    onKeydown: function (e) {
      if (!this.open) return;
      if (e.key === 'Escape') {
        this.closePalette();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.keyboardNav = true;
        var max = this.filtered.length;
        if (this.filtered.length > 0) {
          this.selectedIdx = (this.selectedIdx + 1) % max;
        }
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.keyboardNav = true;
        var max2 = this.filtered.length;
        if (max2 > 0) {
          this.selectedIdx = (this.selectedIdx - 1 + max2) % max2;
        }
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        var items = this.filtered;
        if (items.length > 0 && items[this.selectedIdx]) {
          this.selectItem(items[this.selectedIdx]);
        }
      }
    }
  };
};
