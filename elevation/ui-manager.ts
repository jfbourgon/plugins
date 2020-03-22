import storage from './simple-storage';

import ResultPanel from './result-panel';
import InfoTipPanel from './infotip-panel';

import { DRAWING_LAYER_ID, RESULTS_LAYER_ID } from './constants';
import { DEFAULT_DRAW_FILL_SYMBOL_COLOR, DEFAULT_DRAW_LINE_SYMBOL_COLOR } from './constants';

import { TOOLBAR_TEMPLATE } from './templates/toolbar';

export class UIManager {

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

  private resultPanel: any;

  private activeGraphic: any;

  private initialDrawToolsStrings: any;
  private drawEndHandler: any;
  private editEndHandler: any;
  private moveEndHandler: any;
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

    this.mapApi.layersObj.addLayer(RESULTS_LAYER_ID);
    this.mapApi.layersObj.addLayer(DRAWING_LAYER_ID);

  }

  initToolbars(esriBundle, mapApi, config) {

    // Store draw tooltip strings in order to restore them on teardown
    this.initialDrawToolsStrings = esriBundle.i18n.toolbars.draw;

    $('.rv-mapnav-elevation-content').remove();

    this.esriDrawToolbar = new esriBundle.drawToolbar(mapApi.esriMap);
    this.esriEditToolbar = new esriBundle.editToolbar(mapApi.esriMap);

    let outlineColor = new esriBundle.Color.fromHex(DEFAULT_DRAW_LINE_SYMBOL_COLOR);
    let fillColor = new esriBundle.Color.fromString(DEFAULT_DRAW_FILL_SYMBOL_COLOR);
    let markerOutlineSymbol = new esriBundle.SimpleLineSymbol(esriBundle.SimpleLineSymbol.STYLE_SOLID, outlineColor, 1);

    let drawPointSymbol = new esriBundle.SimpleMarkerSymbol(esriBundle.SimpleMarkerSymbol.STYLE_CIRCLE, 10, markerOutlineSymbol, outlineColor)
    let drawLineSymbol = new esriBundle.SimpleLineSymbol(esriBundle.SimpleLineSymbol.STYLE_SHORTDASH, outlineColor, 2);
    let drawFillSymbol = new esriBundle.SimpleFillSymbol(esriBundle.SimpleFillSymbol.STYLE_SOLID, drawLineSymbol, fillColor);

    this.symbols = {
      point: drawPointSymbol,
      line: drawLineSymbol,
      polygon: drawFillSymbol
    };

    let that = this;
    let setActiveTool = this.setActiveTool.bind(this);
    let getActiveGraphic = this.getActiveGraphic.bind(this);

    mapApi.agControllerRegister('ElevationToolbarCtrl', function () {

        this.controls = {
          viewshed: {
              name: 'viewshed',
              label: 'plugins.elevation.toolbar.viewshed.label',
              icon: 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z',
              tooltip: 'plugins.elevation.toolbar.viewshed.tooltip',
              active: false,
              visible: () => true,
              disabled: () => that.isEditing,
              viewbox: '0 0 24 24',
              createIcon: () => { (<any>that).createIcon(this.controls.viewshed) },
              selected: () => this.controls.viewshed.active,
              action: () => {
                  setActiveTool('viewshed')
              }
          },
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
        that.moveEndHandler.remove();
        that.drawEndHandler.remove();
        that.unloadMapHandler.remove();
      }

      that.editEndHandler = this.esriEditToolbar.on('vertex-move-stop', this.handleEditEnd.bind(this));
      that.moveEndHandler = this.esriEditToolbar.on('graphic-move-stop', this.handleEditEnd.bind(this));
      that.drawEndHandler = this.esriDrawToolbar.on('draw-complete', this.handleDrawEnd.bind(this));

      that.unloadMapHandler = this.mapApi.esriMap.on('unload', handleMapUnload);

  }

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

    let editToolToActivate = this.selectedTool === 'viewshed' ? esriBundle.editToolbar.MOVE : esriBundle.editToolbar.EDIT_VERTICES;
    this.esriEditToolbar.activate(editToolToActivate, this.activeGraphic, editOptions);

    this.isEditing = true;

  }

  activateDrawingMode(name) {

    const mapApi = this.mapApi;
    const esriBundle = this.esriBundle;

    let drawOptions = {
      drawTime: 0,
      showTooltips: true,
      tolerance: 0,
      tooltipOffset: 20
    }

    this.clearGraphics();
    this.esriEditToolbar.deactivate();

    esriBundle.i18n.toolbars.draw = UIManager.prototype.translations[this.config.language].drawTools[name];

    let esriToolNameToActivate = name === 'viewshed' ? 'point' : ( name === 'profile' ? 'polyline' : 'polygon' );

    // activate the right tool from the ESRI draw toolbar
    this.esriDrawToolbar.activate(esriBundle.drawToolbar[esriToolNameToActivate.toUpperCase()], drawOptions);

    this.esriDrawToolbar.setLineSymbol(this.symbols.line);
    this.esriDrawToolbar.setFillSymbol(this.symbols.polygon);
    this.esriDrawToolbar.setMarkerSymbol(this.symbols.point);

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

  get drawingLayer(): any {
    return this.mapApi.esriMap._layers[DRAWING_LAYER_ID];
  }

  get resultsLayer(): any {
    return this.mapApi.esriMap._layers[RESULTS_LAYER_ID];
  }

  onHideResultPanel(e) {

    const { panel, code } = e;

    panel.element.addClass('hidden');
    $('.dialog-container').removeClass('rv-elevation-dialog-container');

    this.clearGraphics();
    this.deactivateEditingMode();

    panel.destroy();

  }

  showResultPanel(geometry, zoomLevel) {

    let resultPanel = new ResultPanel(this.mapApi, this.esriBundle, this.selectedTool, { services: this.config.services[this.selectedTool] });

    resultPanel.show(geometry, zoomLevel);
    resultPanel.panel.closing.subscribe(this.onHideResultPanel.bind(this));

    this.resultPanel = resultPanel;

    this.activateEditingMode();

  }

  handleDrawEnd(e) {

    const { geometry, target: { map } } = e;

    this.addToMap(geometry);
    this.showResultPanel(geometry, map.getZoom());

  }

  handleEditEnd(e) {

    let { graphic: { geometry }, target: { map }, ...rest } = e;
    this.resultPanel.updateGeometry(geometry /*, map.getZoom() */);

  }

  addToMap(geometry) {

    const symbols = this.symbols;

    switch (geometry.type) {
      case 'point':
        this.addGraphic(geometry, symbols.point);
        break;
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
    this.drawingLayer.add(graphic);

  }

  clearGraphics() {
    this.activeGraphic = null;
    this.drawingLayer.clear();
    this.resultsLayer.clear();
  }

  showUI() {

    // Store current identity mode in order to restore on teardown
    this.identifyMode = this.mapApi.layersObj._identifyMode;

    if (!this.$toolbar) {
        let template = $(TOOLBAR_TEMPLATE);
        this.mapApi.$compile(template);
        $('rv-mapnav .rv-mapnav-content').prepend(template);
        this.$toolbar = template;
    }

    this.$toolbar.removeClass('hidden');

    // Determine if we need to show infotip dialog
    let skipInfoTipDialog = storage('skipInfoTipDialog') || false;

    if (!skipInfoTipDialog) {

      let infoTipPanel = new InfoTipPanel(this.mapApi);
      infoTipPanel.show();

    }

  }

  hideUI() {

    let resultPanel = this.resultPanel;

    if (resultPanel) {
      resultPanel.panel.destroy();
    }

    this.esriDrawToolbar.deactivate();
    this.esriEditToolbar.deactivate();

    this.selectedTool = null;

    if (this.$toolbar) {
        this.$toolbar.addClass('hidden');
        this.$toolbar.remove();
    }

    this.$toolbar = null;

    this.drawingLayer.clear();
    this.resultsLayer.clear();

    this.mapApi.layersObj._identifyMode = this.identifyMode;

  }

  destroyUI() {

    this.hideUI();
    this.mapApi.layersObj.removeLayer(DRAWING_LAYER_ID);

  }

}

UIManager.prototype.translations = {
  'en-CA': {
      drawTools: {
        viewshed: {
          addPoint: 'Cliquer pour placer le point de vue',
        },
        profile: {
          complete: 'Double-click to complete the profile',
          resume: 'Click to add point to the profile',
          start: 'Click to start drawing the profile'
        },
        statistics: {
          complete: 'Double-click to calculate statistics',
          resume: 'Click to add point',
          start: 'Click to start the zone'
        }
      }
    },
    'fr-CA': {
      drawTools: {
        viewshed: {
          addPoint: 'Cliquer pour placer le point de vue',
        },
        profile: {
          complete: 'Double-cliquer pour générer le profil',
          resume: 'Cliquer pour ajouter un point au profil',
          start: 'Cliquer pour débuter le tracé du profil'
        },
        statistics: {
          complete: 'Double-cliquer pour calculer les statistiques',
          resume: 'Cliquer pour ajouter un point',
          start: 'Cliquer pour débuter la zone'
        }
      }
    }
  };