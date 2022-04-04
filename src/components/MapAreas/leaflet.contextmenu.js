/* eslint-disable */

/*
	Leaflet.contextmenu, a context menu for Leaflet.
	(c) 2015, Adam Ratcliffe, GeoSmart Maps Limited
	@preserve
*/

function initializeContextMenu(L) {
  if (L.Mixin.ContextMenu) {
    return;
  }

  L.Map.mergeOptions({
    contextmenuItems: []
  });

  L.Map.ContextMenu = L.Handler.extend({
    _touchstart: L.Browser.msPointer ? "MSPointerDown" : L.Browser.pointer ? "pointerdown" : "touchstart",

    statics: {
      BASE_CLS: "leaflet-contextmenu"
    },

    initialize: function (map) {
      L.Handler.prototype.initialize.call(this, map);

      this._items = [];
      this._visible = false;

      var container = (this._container = L.DomUtil.create("div", L.Map.ContextMenu.BASE_CLS, map._container));
      container.style.zIndex = 10000;
      container.style.position = "absolute";

      if (map.options.contextmenuWidth) {
        container.style.width = map.options.contextmenuWidth + "px";
      }

      this._createItems();

      L.DomEvent.on(container, "click", L.DomEvent.stop)
        .on(container, "mousedown", L.DomEvent.stop)
        .on(container, "dblclick", L.DomEvent.stop)
        .on(container, "contextmenu", L.DomEvent.stop);
    },

    addHooks: function () {
      var container = this._map.getContainer();

      L.DomEvent.on(container, "mouseleave", this._hide, this).on(document, "keydown", this._onKeyDown, this);

      if (L.Browser.touch) {
        L.DomEvent.on(document, this._touchstart, this._hide, this);
      }

      this._map.on(
        {
          contextmenu: this._show,
          mousedown: this._hide,
          movestart: this._hide,
          zoomstart: this._hide
        },
        this
      );
    },

    removeHooks: function () {
      var container = this._map.getContainer();

      L.DomEvent.off(container, "mouseleave", this._hide, this).off(document, "keydown", this._onKeyDown, this);

      if (L.Browser.touch) {
        L.DomEvent.off(document, this._touchstart, this._hide, this);
      }

      this._map.off(
        {
          contextmenu: this._show,
          mousedown: this._hide,
          movestart: this._hide,
          zoomstart: this._hide
        },
        this
      );
    },

    showAt: function (point, data) {
      if (point instanceof L.LatLng) {
        point = this._map.latLngToContainerPoint(point);
      }
      this._showAtPoint(point, data);
    },

    hide: function () {
      this._hide();
    },

    addItem: function (options) {
      return this.insertItem(options);
    },

    insertItem: function (options, index, parentEl, isItemEmptyParent) {
      index = index !== undefined ? index : this._items.length;
      const nestedMenuClassName = L.Map.ContextMenu.BASE_CLS + "__nested-menu";

      let parent;

      if (parentEl) {
        parent = parentEl.querySelector("." + nestedMenuClassName);

        if (!parent) {
          parent = this._insertElementAt("div", nestedMenuClassName, parentEl);
        }
      } else {
        parent = this._container;
      }

      var item = this._createItem(parent, options, index, isItemEmptyParent);

      this._items.push(item);

      this._sizeChanged = true;

      this._map.fire("contextmenu.additem", {
        contextmenu: this,
        el: item.el,
        index: index
      });

      return item.el;
    },

    removeItem: function (item) {
      if (item) {
        this._removeItem(L.Util.stamp(item));

        this._sizeChanged = true;

        this._map.fire("contextmenu.removeitem", {
          contextmenu: this,
          el: item
        });

        return item;
      }

      return null;
    },

    removeAllItems: function () {
      var items = this._items.map(item => item.el),
        item;

      while (items.length) {
        item = items[0];
        this._removeItem(L.Util.stamp(item));
      }
      return items;
    },

    hideAllItems: function () {
      var item, i, l;

      for (i = 0, l = this._items.length; i < l; i++) {
        item = this._items[i];
        item.el.style.display = "none";
      }
    },

    showAllItems: function () {
      var item, i, l;

      for (i = 0, l = this._items.length; i < l; i++) {
        item = this._items[i];
        item.el.style.display = "";
      }
    },

    setDisabled: function (item, disabled) {
      var container = this._container,
        itemCls = L.Map.ContextMenu.BASE_CLS + "-item";

      if (!isNaN(item)) {
        item = container.children[item];
      }

      if (item && L.DomUtil.hasClass(item, itemCls)) {
        if (disabled) {
          L.DomUtil.addClass(item, itemCls + "-disabled");
          this._map.fire("contextmenu.disableitem", {
            contextmenu: this,
            el: item
          });
        } else {
          L.DomUtil.removeClass(item, itemCls + "-disabled");
          this._map.fire("contextmenu.enableitem", {
            contextmenu: this,
            el: item
          });
        }
      }
    },

    isVisible: function () {
      return this._visible;
    },

    _createItems: function (container = this._container, options = this._map.options) {
      const optionItems = options.contextmenuItems;

      optionItems.forEach(item => {
        const createdItem = this._createItem(container, item);
        this._items.push(createdItem);

        if (item.contextmenuItems) {
          const nestedMenuClassName = L.Map.ContextMenu.BASE_CLS + "__nested-menu";
          const itemsContainerEl = this._insertElementAt("div", nestedMenuClassName, createdItem.el);
          this._createItems(itemsContainerEl, item);
        }
      });
    },

    _createItem: function (container, options, index, isItemEmptyParent) {
      if (options.separator || options === "-") {
        return this._createSeparator(container, index);
      }

      var isParent = !!options.contextmenuItems,
        parentClassName = isParent ? L.Map.ContextMenu.BASE_CLS + "-item_parent" : "";

      if (isItemEmptyParent) {
        parentClassName =
          parentClassName +
          " " +
          L.Map.ContextMenu.BASE_CLS +
          "-item_parent-empty " +
          L.Map.ContextMenu.BASE_CLS +
          "-item-disabled";
      }

      var itemCls = L.Map.ContextMenu.BASE_CLS + "-item " + parentClassName,
        cls = options.disabled ? itemCls + " " + itemCls + "-disabled" : itemCls,
        el = this._insertElementAt("a", cls, container, index),
        icon = this._getIcon(options),
        iconCls = this._getIconCls(options),
        html = "",
        callback = null,
        parentEl = container;

      if (icon) {
        html = '<img class="' + L.Map.ContextMenu.BASE_CLS + '-icon" src="' + icon + '"/>';
      } else if (iconCls) {
        html = '<span class="' + L.Map.ContextMenu.BASE_CLS + "-icon " + iconCls + '"></span>';
      }

      el.innerHTML = html + options.text;
      el.href = "#";

      L.DomEvent.on(el, "mouseover", this._onItemMouseOver, this)
        .on(el, "mouseout", this._onItemMouseOut, this)
        .on(el, "mousedown", L.DomEvent.stopPropagation);

      if (options.callback) {
        callback = this._createEventHandler(el, options.callback, options.context, options.hideOnSelect);

        L.DomEvent.on(el, "click", callback);
      }

      if (L.Browser.touch) {
        L.DomEvent.on(el, this._touchstart, L.DomEvent.stopPropagation);
      }

      // Devices without a mouse fire "mouseover" on tap, but never “mouseout"
      if (!L.Browser.pointer) {
        L.DomEvent.on(el, "click", this._onItemMouseOut, this);
      }

      return {
        id: L.Util.stamp(el),
        el: el,
        callback,
        parentEl
      };
    },

    _removeItem: function (id) {
      var item, el, i, l, callback;

      for (i = 0, l = this._items.length; i < l; i++) {
        item = this._items[i];

        if (item.id === id) {
          el = item.el;
          callback = item.callback;

          L.DomEvent.off(el, "mouseover", this._onItemMouseOver, this)
            .off(el, "mouseover", this._onItemMouseOut, this)
            .off(el, "mousedown", L.DomEvent.stopPropagation);

          if (L.Browser.touch) {
            L.DomEvent.off(el, this._touchstart, L.DomEvent.stopPropagation);
          }

          if (!L.Browser.pointer) {
            L.DomEvent.on(el, "click", this._onItemMouseOut, this);
          }

          if (callback) {
            L.DomEvent.off(el, "click", callback);
          }

          if (item.parentEl) {
            item.parentEl.removeChild(el);
          } else {
            this._container.removeChild(el);
          }

          this._items.splice(i, 1);

          return item;
        }
      }
      return null;
    },

    _createSeparator: function (container, index) {
      var el = this._insertElementAt("div", L.Map.ContextMenu.BASE_CLS + "-separator", container, index);

      return {
        id: L.Util.stamp(el),
        el: el
      };
    },

    _createEventHandler: function (el, func, context, hideOnSelect) {
      var me = this,
        map = this._map,
        disabledCls = L.Map.ContextMenu.BASE_CLS + "-item-disabled",
        _hideOnSelect = hideOnSelect !== undefined ? hideOnSelect : true;

      return function () {
        if (L.DomUtil.hasClass(el, disabledCls)) {
          return;
        }

        if (_hideOnSelect) {
          me._hide();
        }

        if (func) {
          func.call(context || map, me._showLocation);
        }

        me._map.fire("contextmenu.select", {
          contextmenu: me,
          el: el
        });
      };
    },

    _insertElementAt: function (tagName, className, container, index) {
      var refEl,
        el = document.createElement(tagName);

      el.className = className;

      if (index !== undefined) {
        refEl = container.children[index];
      }

      if (refEl) {
        container.insertBefore(el, refEl);
      } else {
        container.appendChild(el);
      }

      return el;
    },

    _show: function (e) {
      this._showAtPoint(e.containerPoint, e);
    },

    _showAtPoint: function (pt, data) {
      if (this._items.length) {
        var map = this._map,
          layerPoint = map.containerPointToLayerPoint(pt),
          latlng = map.layerPointToLatLng(layerPoint),
          event = L.extend(data || {}, { contextmenu: this });

        this._showLocation = {
          latlng: latlng,
          layerPoint: layerPoint,
          containerPoint: pt
        };

        if (data && data.relatedTarget) {
          this._showLocation.relatedTarget = data.relatedTarget;
        }

        this._setPosition(pt);

        if (!this._visible) {
          this._container.style.display = "block";
          this._visible = true;
        }

        this._map.fire("contextmenu.show", event);
      }
    },

    _hide: function () {
      if (this._visible) {
        this._visible = false;
        this._container.style.display = "none";
        this._map.fire("contextmenu.hide", { contextmenu: this });
      }
    },

    _getIcon: function (options) {
      return (L.Browser.retina && options.retinaIcon) || options.icon;
    },

    _getIconCls: function (options) {
      return (L.Browser.retina && options.retinaIconCls) || options.iconCls;
    },

    _setPosition: function (pt) {
      var mapSize = this._map.getSize(),
        container = this._container,
        containerSize = this._getElementSize(container),
        anchor;

      if (this._map.options.contextmenuAnchor) {
        anchor = L.point(this._map.options.contextmenuAnchor);
        pt = pt.add(anchor);
      }

      container._leaflet_pos = pt;

      // 120 - width of nested menu, defined in leaflet.contextmenu.scss
      if (pt.x + containerSize.x + 120 > mapSize.x) {
        container.classList.remove(L.Map.ContextMenu.BASE_CLS + "_to-right");
        container.classList.add(L.Map.ContextMenu.BASE_CLS + "_to-left");
        container.style.left = "auto";
        container.style.right = Math.min(Math.max(mapSize.x - pt.x, 0), mapSize.x - containerSize.x - 1) + "px";
      } else {
        container.classList.remove(L.Map.ContextMenu.BASE_CLS + "_to-left");
        container.classList.add(L.Map.ContextMenu.BASE_CLS + "_to-right");
        container.style.left = Math.max(pt.x, 0) + "px";
        container.style.right = "auto";
      }

      if (pt.y + containerSize.y > mapSize.y) {
        container.style.top = "auto";
        container.style.bottom = Math.min(Math.max(mapSize.y - pt.y, 0), mapSize.y - containerSize.y - 1) + "px";
      } else {
        container.style.top = Math.max(pt.y, 0) + "px";
        container.style.bottom = "auto";
      }
    },

    _getElementSize: function (el) {
      var size = this._size,
        initialDisplay = el.style.display;

      if (!size || this._sizeChanged) {
        size = {};

        el.style.left = "-999999px";
        el.style.right = "auto";
        el.style.display = "block";

        size.x = el.offsetWidth;
        size.y = el.offsetHeight;

        el.style.left = "auto";
        el.style.display = initialDisplay;

        this._sizeChanged = false;
      }

      return size;
    },

    _onKeyDown: function (e) {
      var key = e.keyCode;

      // If ESC pressed and context menu is visible hide it
      if (key === 27) {
        this._hide();
      }
    },

    _onItemMouseOver: function (e) {
      L.DomUtil.addClass(e.target || e.srcElement, "over");
    },

    _onItemMouseOut: function (e) {
      L.DomUtil.removeClass(e.target || e.srcElement, "over");
    }
  });

  L.Map.addInitHook("addHandler", "contextmenu", L.Map.ContextMenu);
  L.Mixin.ContextMenu = {
    bindContextMenu: function (options) {
      L.setOptions(this, options);
      this._initContextMenu();

      return this;
    },

    unbindContextMenu: function () {
      this.off("contextmenu", this._showContextMenu, this);

      return this;
    },

    addContextMenuItem: function (item) {
      this.options.contextmenuItems.push(item);
    },

    removeContextMenuItemWithIndex: function (index) {
      var items = [];
      for (var i = 0; i < this.options.contextmenuItems.length; i++) {
        if (this.options.contextmenuItems[i].index == index) {
          items.push(i);
        }
      }
      var elem = items.pop();
      while (elem !== undefined) {
        this.options.contextmenuItems.splice(elem, 1);
        elem = items.pop();
      }
    },

    replaceContextMenuItem: function (item) {
      this.removeContextMenuItemWithIndex(item.index);
      this.addContextMenuItem(item);
    },

    _initContextMenu: function () {
      this._items = [];

      this.on("contextmenu", this._showContextMenu, this);
    },

    _showItemsDeep: function (optionItems, parentItem) {
      if (!optionItems) {
        return;
      }

      optionItems.forEach(item => {
        const isEmptyParent = !!item.contextmenuItems && item.contextmenuItems.length === 0;
        const createdItem = this._map.contextmenu.insertItem(item, item.index, parentItem, isEmptyParent);
        this._items.push(createdItem);

        if (item.contextmenuItems) {
          this._showItemsDeep(item.contextmenuItems, createdItem);
        }
      });
    },

    _showContextMenu: function (e) {
      // var itemOptions,
      //   data, pt, i, l;

      var data, pt;

      if (this._map.contextmenu) {
        data = L.extend({ relatedTarget: this }, e);

        pt = this._map.mouseEventToContainerPoint(e.originalEvent);

        if (!this.options.contextmenuInheritItems) {
          this._map.contextmenu.hideAllItems();
        }

        this._showItemsDeep(this.options.contextmenuItems);

        this._map.once("contextmenu.hide", this._hideContextMenu, this);

        this._map.contextmenu.showAt(pt, data);
      }
    },

    _hideContextMenu: function () {
      var i, l;

      for (i = 0, l = this._items.length; i < l; i++) {
        this._map.contextmenu.removeItem(this._items[i]);
      }
      this._items.length = 0;

      if (!this.options.contextmenuInheritItems) {
        this._map.contextmenu.showAllItems();
      }
    }
  };

  var classes = [L.Marker, L.Path],
    defaultOptions = {
      contextmenu: false,
      contextmenuItems: [],
      contextmenuInheritItems: true
    },
    cls,
    i,
    l;

  for (i = 0, l = classes.length; i < l; i++) {
    cls = classes[i];

    // L.Class should probably provide an empty options hash, as it does not test
    // for it here and add if needed
    if (!cls.prototype.options) {
      cls.prototype.options = defaultOptions;
    } else {
      cls.mergeOptions(defaultOptions);
    }

    cls.addInitHook(function () {
      if (this.options.contextmenu) {
        this._initContextMenu();
      }
    });

    cls.include(L.Mixin.ContextMenu);
  }

  return L.Map.ContextMenu;
}

export default initializeContextMenu;
