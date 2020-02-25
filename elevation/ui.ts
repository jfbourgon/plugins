import storage from './simple-storage';

import { TOOLBAR_TEMPLATE } from './templates';
import InfoPanel from './InfoPanel';
import InfoTipPanel from './InfoTipPanel';

const GRAPHICS_LAYER_ID = 'graphicsRvElevation';

const INFO_PANEL_ID = 'elevationInfoPanel';
const INFO_TIP_PANEL_ID = 'elevationInfoTipPanel';

const DEFAULT_DRAW_FILL_SYMBOL_COLOR = 'rgba(217,205,229, 0.5)';
const DEFAULT_DRAW_LINE_SYMBOL_COLOR = '#6A50A3';

export class UI {

  public translations: any;

  private mapApi: any;
  private config: any;

  private esriBundle: any;

  private identifyMode: any;

  private symbols: any;

  private esriDrawToolbar: any;
  private esriEditToolbar: any;
  private $toolbar: any;
  private controls: any;

  private selectedTool: any;
  private isEditing: any;

  private infoPanel: any;

  private activeGraphic: any;

  private initialDrawToolsStrings: any;
  private drawEndHandler: any;
  private editEndHandler: any;
  private unloadMapHandler: any;

  constructor (mapApi: any, config: any) {

    this.mapApi = mapApi;
    this.config = config;

    this.activeGraphic = null;
    this.selectedTool = null;
    this.identifyMode = null;

    let esriBundlePromise = (<any>RAMP).GAPI.esriLoadApiClasses([
      ['esri/toolbars/draw', 'drawToolbar'],
      ['esri/toolbars/edit', 'editToolbar'],
      ['esri/graphic', 'Graphic'],
      ['esri/Color', 'Color'],
      ['esri/symbols/SimpleMarkerSymbol', 'SimpleMarkerSymbol'],
      ['esri/symbols/SimpleLineSymbol', 'SimpleLineSymbol'],
      ['esri/symbols/SimpleFillSymbol', 'SimpleFillSymbol'],
      ['dojo/i18n!esri/nls/jsapi', 'i18n'],
      ['esri/geometry/Point', 'Point'],
      ['esri/geometry/Polygon', 'Polygon'],
      ['esri/SpatialReference', 'SpatialReference'],
      ['esri/geometry/geometryEngine', 'geometryEngine']
    ]);

    let that = this;

    esriBundlePromise.then(esriBundle => {

      that.initToolbars(esriBundle, mapApi, config);
      this.esriBundle = esriBundle;

    });

    // this.esriDrawToolbar = drawToolbar

    this.mapApi.layersObj.addLayer(GRAPHICS_LAYER_ID);

  }

  initToolbars(esriBundle, mapApi, config) {

    // Store draw tooltip strings in order to restore them on teardown
    this.initialDrawToolsStrings = esriBundle.i18n.toolbars.draw;

    $('.rv-mapnav-elevation-content').remove();

    this.esriDrawToolbar = new esriBundle.drawToolbar(mapApi.esriMap);
    this.esriEditToolbar = new esriBundle.editToolbar(mapApi.esriMap);

    let drawLineSymbol = new esriBundle.SimpleLineSymbol(esriBundle.SimpleLineSymbol.STYLE_SHORTDASH, new esriBundle.Color.fromHex(DEFAULT_DRAW_LINE_SYMBOL_COLOR), 2);
    let drawFillSymbol = new esriBundle.SimpleFillSymbol(esriBundle.SimpleFillSymbol.STYLE_SOLID, drawLineSymbol, new esriBundle.Color.fromString(DEFAULT_DRAW_FILL_SYMBOL_COLOR));

    this.symbols = {
      point: new esriBundle.SimpleMarkerSymbol(),
      line: drawLineSymbol,
      polygon: drawFillSymbol
    };

    let that = this;
    let setActiveTool = this.setActiveTool.bind(this);
    let getActiveGraphic = this.getActiveGraphic.bind(this);

    mapApi.agControllerRegister('ElevationToolbarCtrl', function () {

        this.controls = {
          profile: {
              name: 'profile',
              label: 'plugins.elevation.toolbar.profile.label',
              icon: 'M3.5,18.5L9.5,12.5L13.5,16.5L22,6.92L20.59,5.5L13.5,13.5L9.5,9.5L2,17L3.5,18.5Z',
              tooltip: 'plugins.elevation.toolbar.profile.tooltip',
              active: false,
              visible: () => true,
              disabled: () => that.isEditing,
              viewbox: '0 0 24 24',
              createIcon: () => { (<any>that).createIcon(this.controls.profile) },
              selected: () => this.controls.profile.active,
              action: () => {
                  setActiveTool('profile')
              }
          },
          statistics: {
              name: 'statistics',
              label: 'plugins.elevation.toolbar.statistics.label',
              icon: 'M3,21V17.29L10.78,12.8L14.55,15L21,11.25V21H3M21,8.94L14.55,12.67L10.78,10.5L3,15V12.79L10.78,8.3L14.55,10.5L21,6.75V8.94Z',
              tooltip: 'plugins.elevation.toolbar.statistics.tooltip',
              active: false,
              visible: () => true,
              disabled: () =>  that.isEditing,
              viewbox: '0 2 24 24',
              createIcon: () => { (<any>that).createIcon(this.controls.statistics) },
              selected: () => this.controls.statistics.active,
              action: () => {
                  setActiveTool('statistics')
              }
          }
        }

        that.controls = this.controls;

      });

      const handleMapUnload = function(e) {
        that.editEndHandler.remove();
        that.drawEndHandler.remove();
        that.unloadMapHandler.remove();
      }

      that.editEndHandler = this.esriEditToolbar.on('vertex-move-stop', this.handleEditEnd.bind(this));
      that.drawEndHandler = this.esriDrawToolbar.on('draw-complete', this.handleDrawEnd.bind(this));
      that.unloadMapHandler = this.mapApi.esriMap.on('unload', handleMapUnload);

  }

  // clearActiveTool() {

  //   let { controls, esriBundle, mapApi } = this;

  //   Object.keys(controls).forEach(k => controls[k].active = false);

  //   esriBundle.i18n.toolbars.draw = this.initialDrawToolsStrings;

  //   this.esriDrawToolbar.deactivate();
  //   this.esriEditToolbar.deactivate();

  //   mapApi.layersObj._identifyMode = this.identifyMode;

  // }

  getActiveGraphic() {
    return this.activeGraphic;
  }

  deactivateEditingMode() {

    let { selectedTool } = this;

    this.esriEditToolbar.deactivate();
    this.activateDrawingMode(selectedTool);

    this.isEditing = false;

  }

  activateEditingMode() {

    const mapApi = this.mapApi;
    const esriBundle = this.esriBundle;

    const vertexSymbol = new esriBundle.SimpleMarkerSymbol(
      esriBundle.SimpleMarkerSymbol.STYLE_CIRCLE,
      8,
      new esriBundle.SimpleLineSymbol(
        esriBundle.SimpleLineSymbol.STYLE_SOLID,
        new esriBundle.Color.fromHex(DEFAULT_DRAW_LINE_SYMBOL_COLOR),
        1
      ),
      new esriBundle.Color.fromHex(DEFAULT_DRAW_LINE_SYMBOL_COLOR)
    );

    let editOptions = {
      vertexSymbol: vertexSymbol
    };

    this.esriDrawToolbar.deactivate();
    this.esriEditToolbar.activate(esriBundle.editToolbar.EDIT_VERTICES, this.activeGraphic, editOptions);

    this.isEditing = true;

  }

  activateDrawingMode(name) {

    const mapApi = this.mapApi;
    const esriBundle = this.esriBundle;

    // const controls = this.controls;

    let drawOptions = {
      drawTime: 0,
      showTooltips: true,
      tolerance: 0,
      tooltipOffset: 20
    }

    this.clearGraphics();
    this.esriEditToolbar.deactivate();

    esriBundle.i18n.toolbars.draw = UI.prototype.translations[this.config.language].drawTools[name];

    let esriToolNameToActivate = name === 'profile' ? 'polyline' : 'polygon';

    // activate the right tool from the ESRI draw toolbar
    this.esriDrawToolbar.activate(esriBundle.drawToolbar[esriToolNameToActivate.toUpperCase()], drawOptions);

    this.esriDrawToolbar.setLineSymbol(this.symbols.line);
    this.esriDrawToolbar.setFillSymbol(this.symbols.polygon);

    if (this.identifyMode === null) {
      this.identifyMode = mapApi.layersObj._identifyMode;
    }

    mapApi.layersObj._identifyMode = [];

  }

  setActiveTool(name) {

    const mapApi = this.mapApi;
    const esriBundle = this.esriBundle;

    const controls = this.controls;

    const enabling = name !== this.selectedTool && name !== null;

    Object.keys(controls).forEach(k => controls[k].active = false);

    if (enabling) {

      this.activateDrawingMode(name);

      controls[name] && (controls[name].active = true);
      this.selectedTool = name;

      // this.clearGraphics();
      // this.esriEditToolbar.deactivate();

      // esriBundle.i18n.toolbars.draw = UI.prototype.translations[this.config.language].drawTools[name];

      // let esriToolNameToActivate = name === 'profile' ? 'polyline' : 'polygon';

      // // activate the right tool from the ESRI draw toolbar
      // this.esriDrawToolbar.activate(esriBundle.drawToolbar[esriToolNameToActivate.toUpperCase()], drawOptions);

      // this.esriDrawToolbar.setLineSymbol(this.symbols.line);
      // this.esriDrawToolbar.setFillSymbol(this.symbols.polygon);

      // controls[name] && (controls[name].active = true);

      // if (!this.identifyMode) {
      //   this.identifyMode = mapApi.layersObj._identifyMode;
      // }

      // mapApi.layersObj._identifyMode = [];

      // this.selectedTool = name;

    } else {

      this.selectedTool = null;
      this.esriDrawToolbar.deactivate();

      esriBundle.i18n.toolbars.draw = this.initialDrawToolsStrings;

      mapApi.layersObj._identifyMode = this.identifyMode;

    }

  }

  createIcon(control: any, icon?: string) {

    // use timeout because if not, the value to create id is not finish compiled yet.
    const btnIcon = typeof icon !== 'undefined' ? control[icon] : control.icon;
    setTimeout(() => { document.getElementById(`path${control.name}`).setAttribute('d', btnIcon); }, 0);

  }

  get graphicsLayer(): any {
    return this.mapApi.esriMap._layers[GRAPHICS_LAYER_ID];
  }

  onHideInfoPanel(e) {

    const { panel, code } = e;

    panel.element.addClass('hidden');
    $('.dialog-container').removeClass('rv-elevation-dialog-container');

    this.clearGraphics();
    this.deactivateEditingMode();

    panel.destroy();
    // this.clearActiveTool();

    // this.setActiveTool('edit');

  }

  showInfoPanel(geometry, zoomLevel) {

    let infoPanel = new InfoPanel(this.mapApi, this.esriBundle, this.selectedTool, null);

    infoPanel.show(geometry, zoomLevel);
    infoPanel.panel.closing.subscribe(this.onHideInfoPanel.bind(this));

    this.infoPanel = infoPanel;

    this.activateEditingMode();

  }

  handleDrawEnd(e) {

    const { geometry, target: { map } } = e;

    this.addToMap(geometry);
    this.showInfoPanel(geometry, map.getZoom());

  }

  handleEditEnd(e) {

    let { graphic: { geometry }, target: { map }, ...rest } = e;
    this.infoPanel.updateGeometry(geometry, map.getZoom());

  }

  addToMap(geometry) {

    const symbols = this.symbols;

    switch (geometry.type) {
      case 'polyline':
        this.addGraphic(geometry, symbols.line);
        break;
      case 'polygon':
        this.addGraphic(geometry, symbols.polygon);
        break;
    }

  }

  addGraphic(geometry: any, symbol: any) {

    const { Graphic } = this.esriBundle;

    let graphic = new Graphic(geometry, symbol);

    this.clearGraphics();

    this.activeGraphic = graphic;
    this.graphicsLayer.add(graphic);

  }

  clearGraphics() {
    this.activeGraphic = null;
    this.graphicsLayer.clear();
  }

  show() {

    this.identifyMode = this.mapApi.layersObj._identifyMode;

    if (!this.$toolbar) {
        let template = $(TOOLBAR_TEMPLATE);
        this.mapApi.$compile(template);
        $('rv-mapnav .rv-mapnav-content').prepend(template);
        this.$toolbar = template;
    }

    this.$toolbar.removeClass('hidden');

    let skipInfoTipDialog = storage('skipInfoTipDialog') || false;

    if (!skipInfoTipDialog) {

      let infoTipPanel = new InfoTipPanel(this.mapApi);
      infoTipPanel.show();

      // const infoTipPanel = this.mapApi.panels.create(INFO_TIP_PANEL_ID, 1); // 1 is for creating a modal dialog

      // // infoTipPanel.header.title = 'Tooltip';

      // // const close = infoTipPanel.header.closeButton;

      // // close.removeClass('primary');
      // // close.addClass('black md-ink-ripple');

      // infoTipPanel.element.addClass('ag-theme-material mobile-fullscreen tablet-fullscreen rv-elevation-dialog-hidden');

      // infoTipPanel.element.css({
      //   top: '50%',
      //   left: '50%',
      //   width: '480px',
      //   height: '360px',
      //   marginLeft: '-240px',
      //   marginTop: '-180px'
      // });

      // const that = this;

      // infoTipPanel.closing.subscribe(e => {

      //   const { panel, code } = e;

      //   panel.element.addClass('hidden');
      //   $('.dialog-container').removeClass('rv-elevation-dialog-container');

      //   // storage('skipInfoTipDialog', 'true')

      //   panel.destroy();

      // });

      // infoTipPanel.open();

    }

  }

  hide() {

    let infoPanel = this.infoPanel;

    if (infoPanel) {
      infoPanel.panel.destroy();
    }

    this.esriDrawToolbar.deactivate();
    this.esriEditToolbar.deactivate();

    this.selectedTool = null;

    if (this.$toolbar) {
        this.$toolbar.addClass('hidden');
        this.$toolbar.remove();
    }

    this.$toolbar = null;

    this.graphicsLayer.clear();

    this.mapApi.layersObj._identifyMode = this.identifyMode;

  }

  destroy() {

    this.hide();

    this.mapApi.layersObj.removeLayer(GRAPHICS_LAYER_ID);

  }

}

UI.prototype.translations = {
  'en-CA': {
      drawTools: {
        profile: {
          // addPoint: 'Click to add a point',
          complete: 'Double-click to complete the profile',
          // finish: 'Double-click to finish',
          // freehand: 'Press down to start and let go to finish',
          resume: 'Click to add point to the profile',
          start: 'Click to start drawing the profile'
        },
        statistics: {
          // addPoint: 'Cliquer pour ajouter un point',
          complete: 'Double-click to calculate statistics',
          // finish: 'Double-cliquer pour finir',
          // freehand: 'Appuyer pour commencer et laissez aller pour finir',
          resume: 'Click to add point',
          start: 'Click to start the zone'
        }
      }
    },
    'fr-CA': {
      drawTools: {
        profile: {
          // addPoint: 'Cliquer pour ajouter un point',
          complete: 'Double-cliquer pour générer le profil',
          // finish: 'Double-cliquer pour finir',
          // freehand: 'Appuyer pour commencer et laissez aller pour finir',
          resume: 'Cliquer pour ajouter un point au profil',
          start: 'Cliquer pour débuter le tracé du profil'
        },
        statistics: {
          // addPoint: 'Cliquer pour ajouter un point',
          complete: 'Double-cliquer pour calculer les statistiques',
          // finish: 'Double-cliquer pour finir',
          // freehand: 'Appuyer pour commencer et laissez aller pour finir',
          resume: 'Cliquer pour ajouter un point',
          start: 'Cliquer pour débuter la zone'
        }
      }
    }
  };