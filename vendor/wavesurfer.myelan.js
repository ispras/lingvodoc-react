'use strict';

WaveSurfer.ELAN = {
  lineStyle: `
    height: 2em;
    box-shadow: inset 0 -5px 5px -5px #333;
  `,
  blockStyle: `
    color: #111;
    margin: 0.5em 0;
    padding: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  `,
  gradientSubsteps: [10, 20, 30, 40, 50, 60, 70, 80, 90].reduce((ac, i) => ac + `
    #fff ${i}%,
    #ccc ${i}%,
    #ccc ${i+1}%,
    #fff ${i+2}%,
  `, ''),

  init(params) {
    this.data = null;
    this.params = params;
    this.color = params.color || '#eee';
    this.wavesurfer = params.wavesurfer;
    this.container = 'string' == typeof params.container ?
      document.querySelector(params.container) : params.container;

    if (!this.container) {
      throw Error('No container for ELAN');
    }

    // this.appendStyle();
    if (params.xml) {
      this.loadString(params.xml);
    }

    if (params.url) {
      this.load(params.url);
    }
  },

  appendStyle() {
    if (document.getElementById('elanStyle')) return;

    const css = `
      .elan .tiers {

      }

      .elan .tiers .tier {

      }

      .elan .tiers .tier .ann {

      }

      .elan .tier-ids {

      }

      .elan .tier-ids .tier {

      }

      .elan .cursor {

      }
    `;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'elanStyle';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.body.appendChild(style);
  },

  RAF(func) {
    window.requestAnimationFrame(func.bind(this));
  },

  destroy () {
    window.cancelAnimationFrame(this.animation);
    this.unAll();
  },

  tierId(content, pad) {
    const node = document.createElement('div');
    node.style.cssText = `
      margin-left: ${pad}em;
      margin-right: 5px;
      ${WaveSurfer.ELAN.lineStyle}
    `;

    const inner = document.createElement('div');
    inner.textContent = content;
    inner.style.cssText = WaveSurfer.ELAN.blockStyle;
    node.appendChild(inner);
    return node;
  },

  annotations() {
    const node = document.createElement('div');
    node.style.cssText = `
      position: relative;
      display: inline-block;
      width: ${this.drawerWidth}px;
      ${WaveSurfer.ELAN.lineStyle}
      ${this.bgGradient()}
    `;
    return node;
  },

  bgGradient() {
    const substeps = this.pxPerSec > 50 ? WaveSurfer.ELAN.gradientSubsteps : '';

    return `
      background: linear-gradient(
        90deg,
        #444,
        #444 1%,
        #fff 2%,
        ${substeps}
        #fff 100%
      );
      background-size: ${this.pxPerSec + 1}px;
    `;
  },

  annotation(ann) {
    const isRef = ann.type === 'REF_ANNOTATION';
    const { start, end } = isRef ? ann.reference : ann;
    const node = document.createElement('div');
    node.textContent = ann.value;
    node.title = `[${start} - ${end}] ${ann.value}`;
    node.dataset.start = start;
    node.dataset.end = end;

    node.style.cssText = `
      background-color: ${isRef ? 'rgb(151, 216, 255)' : 'rgb(191, 255, 138)'};
      position: absolute;
      text-align: center;
      cursor: pointer;
      left: ${start * this.pxPerSec}px;
      width: ${(end - start) * this.pxPerSec}px;
      ${WaveSurfer.ELAN.blockStyle}
    `;
    return node;
  },

  render() {
    const h = document.createElement.bind(document);
    const my = this;
    const container = this.container;

    this.tiersNode = h('div');
    this.tierIdsNode = h('div');
    this.cursor = h('div');

    container.innerHTML = '';
    container.style.position = 'relative';

    const tiersStyle = `
      overflow-x: ${this.wavesurfer ? 'hidden' : 'auto'};
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
    `

    this.tiersNode.style.cssText = tiersStyle;

    this.tierIdsNode.style.cssText = `
      position: absolute;
      top: 0;
      ${tiersStyle}
    `;

    function renderInner (tiers, pad = 0) {
      tiers.forEach(function (tier) {
        const id = my.tierId(tier.id, pad);
        my.tierIdsNode.appendChild(id);

        const annots = my.annotations();
        tier.annotations.forEach(function (ann) {
          const annNode = my.annotation(ann);
          annots.appendChild(annNode);
        });
        my.tiersNode.appendChild(annots);

        if (tier.children) {
          renderInner(tier.children, pad + 1);
        }
      });
    }
    renderInner(this.data.tiersTree);
    container.appendChild(this.tierIdsNode);
    container.appendChild(this.tiersNode);

    this.tierIdsNode.style.left = `-${this.tierIdsNode.offsetWidth}px`;

    this.tiersNode.scrollLeft = this.scrollLeft;

    if (this.wavesurfer) {
      this.tiersNode.appendChild(this.cursor);

      this.cursor.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        opacity: 0.8;
        background-color: #444;
        height: 100%;
      `;

      this.animation = this.RAF(this.cursorMove);
    }
  },

  cursorMove() {
    this.tiersNode.scrollLeft = this.wavesurfer.drawer.getScrollX();

    const progress = this.wavesurfer.getCurrentTime();
    const offset = progress * this.pxPerSec - this.tiersNode.scrollLeft;
    this.cursor.style.transform = `translateX(${offset}px)`;
    this.cursor.style.display = offset < 0 || offset > this.tiersNode.offsetWidth ? 'none' : '';

    this.RAF(this.cursorMove);
  },

  load(url) {
    this.fetchXML(url, this.loadXML.bind(this));
  },

  loadString(str) {
    let xmlDoc;
    if (window.DOMParser) {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(str, 'text/xml');
    } else {
      xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = false;
      xmlDoc.loadXML(str);
    }
    this.loadXML(xmlDoc);
  },

  loadXML(xml) {
    this.data = this.parseElan(xml);
    this.drawerSetup()
    this.render();
    this.bindClick();
    this.fireEvent('ready', this.data);
  },

  fetchXML(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'document';
    xhr.send();
    xhr.addEventListener('load', function (e) {
      callback && callback(e.target.responseXML);
    });
  },

  drawerSetup() {
    if (this.wavesurfer) {
      this.duration = this.wavesurfer.getDuration();
      this.drawerWidth = this.wavesurfer.drawer.width;
      this.pxPerSec = this.drawerWidth / this.duration;
    } else {
      this.pxPerSec = 100;
      this.duration = this.data.maxTimeslot;
      this.drawerWidth = this.pxPerSec * this.duration;
    }
  },

  setPxPerSec(pxPerSec) {
    if (!this.wavesurfer) {
      this.scrollLeft = this.tiersNode && this.pxPerSec ? pxPerSec * this.tiersNode.scrollLeft / this.pxPerSec : 0;

      this.pxPerSec = pxPerSec;
      this.drawerWidth = this.pxPerSec * this.duration;
      this.render();
    }
  },

  parseElan(xml) {
    var _forEach = Array.prototype.forEach;
    var _map = Array.prototype.map;

    var data = {
      timeOrder: {},
      tiers: [],
      annotations: {},
      alignableAnnotations: [],
      maxTimeslot: 0
    };

    var header = xml.querySelector('HEADER');
    var inMilliseconds = header.getAttribute('TIME_UNITS') == 'milliseconds';

    var timeSlots = xml.querySelectorAll('TIME_ORDER TIME_SLOT');
    var timeOrder = data.timeOrder;
    _forEach.call(timeSlots, function (slot) {
      var value = parseFloat(slot.getAttribute('TIME_VALUE'));
      // If in milliseconds, convert to seconds with rounding
      if (inMilliseconds) {
        value = Math.round(value * 1e2) / 1e5;
      }
      timeOrder[slot.getAttribute('TIME_SLOT_ID')] = value;
      if (data.maxTimeslot < value) data.maxTimeslot = value;
    });

    data.tiers = _map.call(xml.querySelectorAll('TIER'), function (tier) {
      return {
        id: tier.getAttribute('TIER_ID'),
        parent: tier.getAttribute('PARENT_REF'),
        linguisticTypeRef: tier.getAttribute('LINGUISTIC_TYPE_REF'),
        defaultLocale: tier.getAttribute('DEFAULT_LOCALE'),
        annotations: _map.call(
          tier.querySelectorAll('REF_ANNOTATION, ALIGNABLE_ANNOTATION'),
          function (node) {
            var annot = {
              type: node.nodeName,
              id: node.getAttribute('ANNOTATION_ID'),
              ref: node.getAttribute('ANNOTATION_REF'),
              value: node.querySelector('ANNOTATION_VALUE')
              .textContent.trim().replace('\u00ad', ' ')
            };

            if ('ALIGNABLE_ANNOTATION' == annot.type) {
              // Add start & end to alignable annotation
              annot.start = timeOrder[node.getAttribute('TIME_SLOT_REF1')];
              annot.end = timeOrder[node.getAttribute('TIME_SLOT_REF2')];

              // Add to the list of alignable annotations
              data.alignableAnnotations.push(annot);
            }

          // Additionally, put into the flat map of all annotations
          data.annotations[annot.id] = annot;

          return annot;
        })
      };
    });

    // Create JavaScript references between annotations
    data.tiers.forEach(function (tier) {
      tier.annotations.forEach(function (annot) {
        if (null != annot.ref) {
          annot.reference = data.annotations[annot.ref];
        }
      });
    });

    // Sort alignable annotations by start & end
    data.alignableAnnotations.sort(function (a, b) {
      var d = a.start - b.start;
      if (d == 0) {
        d = b.end - a.end;
      }
      return d;
    });

    data.length = data.alignableAnnotations.length;

    data.tiersTree = this.tiersTree(data.tiers)

    return data;
  },

  tiersTree(tiers, tier = { id: null }) {
    const nextLayer = tiers.filter(t => t.parent === tier.id)
    delete tier.parent;
    if (nextLayer.length > 0) {
      tier.children = nextLayer;
      nextLayer.forEach(t => this.tiersTree(tiers, t));
    }
    return nextLayer;
  },

  bindClick() {
    const my = this;
    this.container.addEventListener('click', function (e) {
      const { start, end } = e.target.dataset;
      if (start && end) {
        my.fireEvent('select', JSON.parse(start), JSON.parse(end));
      }
    });
  }
};

WaveSurfer.util.extend(WaveSurfer.ELAN, WaveSurfer.Observer);
