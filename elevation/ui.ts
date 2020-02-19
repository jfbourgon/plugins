import { TOOLBAR_TEMPLATE } from './templates';
import InfoPanel from './infopanel';

const INFO_PANEL_ID = 'elevationInfoPanel';
const DEFAULT_DRAW_FILL_SYMBOL_COLOR = 'rgba(217,205,229, 0.5)';
const DEFAULT_DRAW_LINE_SYMBOL_COLOR = '#6A50A3';

export class UI {

  public translations: any;

  private mapApi: any;
  private config: any;
  private elevationService: any;

  private esriBundle: any;

  private mode: any;
  private identifyMode: any;

  private symbols: any;

  private esriDrawToolbar: any;
  private $toolbar: any;
  private controls: any;

  private initialDrawToolsStrings: any;

  constructor (mapApi: any, config: any, elevationService: any) {

    console.info('Elevation Toolbar constructor called...');

    this.mapApi = mapApi;
    this.config = config;
    this.elevationService = elevationService;

    let esriBundlePromise = (<any>RAMP).GAPI.esriLoadApiClasses([
      ['esri/toolbars/draw', 'esriTool'],
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
    let drawToolbar;

    esriBundlePromise.then(esriBundle => {

      drawToolbar = that.initToolbar(esriBundle, mapApi, config);
      this.esriBundle = esriBundle;

    });

    this.esriDrawToolbar = drawToolbar

    this.mapApi.layersObj.addLayer('graphicsRvElevation');

  }

  initToolbar(esriBundle, mapApi, config) {

    this.initialDrawToolsStrings = esriBundle.i18n.toolbars.draw;

    $('.rv-mapnav-elevation-content').remove();

    this.esriDrawToolbar = new esriBundle.esriTool(mapApi.esriMap);

    let drawLineSymbol = new esriBundle.SimpleLineSymbol(esriBundle.SimpleLineSymbol.STYLE_SHORTDASH, new esriBundle.Color.fromHex(DEFAULT_DRAW_LINE_SYMBOL_COLOR), 2);
    let drawFillSymbol = new esriBundle.SimpleFillSymbol(esriBundle.SimpleFillSymbol.STYLE_SOLID, drawLineSymbol, new esriBundle.Color.fromString(DEFAULT_DRAW_FILL_SYMBOL_COLOR));

    // set symbols
    this.symbols = {
      point: new esriBundle.SimpleMarkerSymbol(),
      line: drawLineSymbol,
      polygon: drawFillSymbol
    };

    let that = this;
    let setActiveTool = this.setActiveTool.bind(this);

    mapApi.agControllerRegister('ElevationToolbarCtrl', function () {

        this.controls = {
          profile: {
              name: 'profile',
              label: 'plugins.elevation.toolbar.profile.label',
              icon: 'M3.5,18.5L9.5,12.5L13.5,16.5L22,6.92L20.59,5.5L13.5,13.5L9.5,9.5L2,17L3.5,18.5Z',
              tooltip: 'plugins.elevation.toolbar.profile.tooltip',
              active: false,
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

      const addToMap = this.addToMap.bind(this);
      this.esriDrawToolbar.on('draw-complete', e => { that.handleDrawEnd(e); });

  }

  setActiveTool(name) {

    const mapApi = this.mapApi;
    const esriBundle = this.esriBundle;

    const controls = this.controls;

    let drawOptions = {
      drawTime: 0,
      showTooltips: true,
      tolerance: 0,
      tooltipOffset: 20
    }

    this.clearGraphics();

    const enable = !controls[name].active;

    Object.keys(controls).forEach(k => controls[k].active = false);

    if (enable) {

      this.mode = name;

      esriBundle.i18n.toolbars.draw = UI.prototype.translations[this.config.language].drawTools[name];

      let esriToolNameToActivate = name === 'profile' ? 'polyline' : 'polygon';

      // activate the right tool from the ESRI draw toolbar
      this.esriDrawToolbar.activate(esriBundle.esriTool[esriToolNameToActivate.toUpperCase()], drawOptions);

      this.esriDrawToolbar.setLineSymbol(this.symbols.line);
      this.esriDrawToolbar.setFillSymbol(this.symbols.polygon);

      this.identifyMode = mapApi.layersObj._identifyMode;
      mapApi.layersObj._identifyMode = [];

    } else {

      this.mode = null;

      esriBundle.i18n.toolbars.draw = this.initialDrawToolsStrings;

      this.esriDrawToolbar.deactivate();
      mapApi.layersObj._identifyMode = this.identifyMode;

    }

    controls[name].active = enable;

  }

  createIcon(control: any, icon?: string) {
    // use timeout because if not, the value to create id is not finish compiled yet.
    const btnIcon = typeof icon !== 'undefined' ? control[icon] : control.icon;
    setTimeout(() => { document.getElementById(`path${control.name}`).setAttribute('d', btnIcon); }, 0);
  }

  get graphicsLayer(): any {
    return this.mapApi.esriMap._layers.graphicsRvElevation;
  }

  onHideInfoPanel(e) {

    const { panel, code } = e;

    panel.element.addClass('hidden');
    $('.dialog-container').removeClass('rv-elevation-dialog-container');

    panel.destroy();
    this.clearGraphics();

  }

  showInfoPanel(geometry) {

    let infoPanel = new InfoPanel(this.mapApi, this.esriBundle, this.mode, null);

    infoPanel.show(geometry);
    infoPanel.panel.closing.subscribe(this.onHideInfoPanel.bind(this));

  }

  handleDrawEnd(e) {

    const { geometry } = e;
    this.addToMap(geometry);

    this.showInfoPanel(geometry);

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
    this.graphicsLayer.add(graphic);

  }

  clearGraphics() {
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

  }

  hide() {

    let infoPanel = this.mapApi.panels.getById(INFO_PANEL_ID);

    if (infoPanel) {
      infoPanel.hide();
      infoPanel.destroy();
    }

    this.esriDrawToolbar.deactivate();

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
    this.mapApi.layersObj.removeLayer('graphicsRvElevation');
    this.mapApi.layersObj._identifyMode = this.identifyMode;

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