import { MultiLineLayer, MultilineTextSymbol } from './multiLine';

/**
 * Creates and manages draw toolbar.
 */
export class DrawToolbar {
    private _mapApi: any;
    private _config: any;

    private _toolbar: any;
    private _bundle: any;
    private _geometryService: any;

    private _activeTool: string = '';
    private _activeColor: number[] = [255,0,0,1];
    private _activeGraphic: object;
    private _identifyMode: object;

    private _mapPoint: object[] = [];
    private _geomLength: number = 0;
    private _extentPoints: object[] = [];

    private _graphicKey: string;

    private _symbols: object;

    private _areaParams: object;
    private _lengthParams: object;
    private _distanceParams: object;

    constructor(mapApi, config) {
        this._mapApi = mapApi;
        this._config = config

        this._identifyMode = this._mapApi.layersObj._identifyMode;

        // add needed dependencies
        let myBundlePromise = (<any>RAMP).GAPI.esriLoadApiClasses([
            ['esri/toolbars/draw', 'esriTool'],
            ['esri/graphic', 'Graphic'],
            ['esri/symbols/TextSymbol', 'TextSymbol'],
            ['esri/symbols/SimpleMarkerSymbol', 'SimpleMarkerSymbol'],
            ['esri/symbols/SimpleLineSymbol', 'SimpleLineSymbol'],
            ['esri/symbols/SimpleFillSymbol', 'SimpleFillSymbol'],
            ['esri/geometry/ScreenPoint', 'ScreenPoint'],
            ['dojo/i18n!esri/nls/jsapi', 'i18n'],
            ['esri/tasks/GeometryService', 'GeomService'],
            ['esri/tasks/DensifyParameters', 'DensifyParams'],
            ['esri/tasks/DistanceParameters', 'DistanceParams'],
            ['esri/tasks/LengthsParameters', 'LengthParams'],
            ['esri/tasks/AreasAndLengthsParameters', 'AreaParams'],
            ['esri/geometry/Point', 'Point'],
            ['esri/geometry/Polygon', 'Polygon']
        ]);

        let that = this;
        myBundlePromise.then(myBundle => {
            this.initToolbar(myBundle, this._config);

            var defaults = {
                'en-CA': {
                    addPoint: 'Click to add a point',
                    complete: 'Double-click to finish',
                    finish: 'Double-click to finish',
                    freehand: 'Press down to start and let go to finish',
                    resume: 'Click to continue drawing',
                    start: 'Click to start drawing'
                },
                'fr-CA': {
                    addPoint: 'Cliquez pour ajouter un point',
                    complete: 'Double-cliquez pour finir',
                    finish: 'Double-cliquez pour finir',
                    freehand: 'Appuyez pour commencer et laissez aller pour finir',
                    resume: 'Cliquez pour continuer à dessiner',
                    start: 'Cliquez pour commencer à dessiner'
                }
            };
            myBundle.i18n.toolbars.draw = defaults[that._config.language];
        });

        // create graphics layer
        this._mapApi.layersObj.addLayer('graphicsRvColl');

        // create geometry service and set event for measures
        this._geometryService = (<any>RAMP).GAPI.esriBundle.GeometryService(config.url);
        this._geometryService.on('distance-complete', (evt) => { this.outputDistance(evt); });
        this._geometryService.on('areas-and-lengths-complete', (evt) => { this.outputAreaAndLength(evt, this._activeGraphic); });
        this._geometryService.on('lengths-complete', (evt) => { this.outputLength(evt, this._activeGraphic); });
        this._geometryService.on('label-points-complete', (evt) => { this.labelPoint(evt, this._activeGraphic); });

        MultiLineLayer.setMultiLine();
        MultilineTextSymbol.setMultiLine();

        return this;
    }

    initToolbar(myBundle, config) {
        this._bundle = myBundle;
        this._toolbar = new this._bundle.esriTool(this._mapApi.esriMap);

        // set symbols
        this._symbols = {
            point: new this._bundle.SimpleMarkerSymbol(),
            line: new this._bundle.SimpleLineSymbol(),
            polygon: new this._bundle.SimpleFillSymbol()
        };

        // set measurement parameters
        this._distanceParams = new this._bundle.DistanceParams();
        (<any>this)._distanceParams.distanceUnit = this._bundle.GeomService.UNIT_KILOMETER;
        (<any>this)._distanceParams.geodesic = true;

        this._lengthParams = new this._bundle.LengthParams();
        (<any>this)._lengthParams.lengthUnit = this._bundle.GeomService.UNIT_KILOMETER;
        (<any>this)._lengthParams.geodesic = true;

        this._areaParams = new this._bundle.AreaParams();
        (<any>this)._areaParams.lengthUnit = this._bundle.GeomService.UNIT_KILOMETER;
        (<any>this)._areaParams.areaUnit = this._bundle.GeomService.UNIT_SQUARE_KILOMETERS;
        (<any>this)._areaParams.calculationType = 'preserveShape';

        // define on draw complete event
        let that = this;
        this._toolbar.on('draw-complete', evt => { this.addToMap(evt, this._symbols); });

        this._mapApi.esriMap.on('pan-end', () => { setTimeout(() => this.createBackground(), 0); });
        this._mapApi.esriMap.on('zoom-end', () => { setTimeout(() => this.createBackground(), 0); });
    }

    get activeTool(): string {
        return this._activeTool;
    }
    set activeTool(value: string) {
        if (value === '') {
            this._toolbar.deactivate();
            this.disableDetails(false);
        } else {
            this._toolbar.activate(this._bundle.esriTool[value.toUpperCase()]);
            this.disableDetails(true);
        }

        this._activeTool = value;
    }

    get activeColor(): number[] {
        return this._activeColor;
    }
    set activeColor(value: number[]) {
        this._activeColor = value;
    }

    get geometryLength(): number {
        return this._geomLength;
    }
    set geometryLength(value: number) {
        this._geomLength = value;
    }

    get mapPoints(): any[] {
        return this._mapPoint;
    }
    set mapPoints(value: any[]) {
        this._mapPoint = value;

        if (value.length === 2) {
            // get length measure
            (<any>this)._distanceParams.geometry1 = value[0];
            (<any>this)._distanceParams.geometry2 = value[1];
            this._geometryService.distance((<any>this)._distanceParams);
        }
    }

    get graphicKey(): string {
        return this._graphicKey;
    }
    set graphicKey(value: string) {
        this._graphicKey = value;
    }

    get graphicsLayer(): any {
        return this._mapApi.esriMap._layers.graphicsRvColl;
    }

    importGraphics(graphics) {
        for (let item of graphics) {
            let graphic = new this._bundle.Graphic(item);

            // color doesn't always transfert properly, overwrite it
            graphic.symbol.color = item.symbol.color
            if (typeof graphic.symbol.outline !== 'undefined') {
                graphic.symbol.outline.color = item.symbol.outline.color;
            }

            // add the key for measure then add to layer
            graphic.key = item.key;
            this.graphicsLayer.add(graphic);
        }

        this.createBackground();
    }

    exportGraphics(): string {
        const graphics = this.graphicsLayer.graphics;

        let output = [];
        for (let graphic of graphics) {
            // do not keep text background, it will regenerated
            if (typeof graphic.geometry !== 'undefined') {
                // keep the key to link to measure
                let json = graphic.toJson();
                json.key = graphic.key;

                // color doesn't always transfert properly, overwrite it
                json.symbol.color = graphic.symbol.color
                if (typeof json.symbol.outline !== 'undefined') {
                    json.symbol.outline.color = [
                        graphic.symbol.outline.color.r,
                        graphic.symbol.outline.color.g,
                        graphic.symbol.outline.color.b,
                        graphic.symbol.outline.color.a
                    ];
                }
                output.push(json);
            }
        }

        return JSON.stringify(output);
    }

    // disable/enable details panel
    disableDetails(value: boolean) {
        this._mapApi.layersObj._identifyMode = value ? [] : this._identifyMode;
    }

    simulateClick(pt, mouse) {
        const mapPoint = this._mapApi.esriMap.toMap(new this._bundle.ScreenPoint({ x: pt[0], y: pt[1] }));
        this._mapApi.esriMap.emit(mouse, { mapPoint: new this._bundle.Point(mapPoint.x, mapPoint.y, this._mapApi.esriMap.spatialReference) });
    }

    setExtentPoints(value: number[], final) {
        if (final && this._extentPoints.length === 1) {
            const pt = this._mapApi.esriMap.toMap(new this._bundle.ScreenPoint({ x: value[0], y: value[1] }));
            const geometry = {
                xmin: (<any>this)._extentPoints[0].x,
                ymin: (<any>this)._extentPoints[0].y,
                xmax: pt.x,
                ymax: pt.y
            }

            this.deleteGraphics(geometry);
            this._extentPoints = [];
        } else {
            this._extentPoints[0] = this._mapApi.esriMap.toMap(new this._bundle.ScreenPoint({ x: value[0], y: value[1] }));
        }
    }

    addToMap(evt, symbols) {
        switch ((<any>evt).geometry.type) {
            case 'point':
                this.addGraphic(evt.geometry, symbols.point);
                break;
            case 'polyline':
                // get length measure
                this._activeGraphic = evt.geometry;
                (<any>this)._lengthParams.polylines = [evt.geometry];
                this._geometryService.lengths((<any>this)._lengthParams);

                this.addGraphic(evt.geometry, symbols.line);
                break;
            case 'polygon':
                // get length and area measure
                this._activeGraphic = evt.geometry;
                (<any>this)._areaParams.polygons = [evt.geometry];
                this._geometryService.areasAndLengths((<any>this)._areaParams)

                this.addGraphic(evt.geometry, symbols.polygon);
                break;
            case 'extent':
                this.deleteGraphics(evt.geometry);
                break;
        }
    }

    addGraphic(geometry: any, symbol: any) {
        symbol.color = this.activeColor;
        this.graphicKey = Math.random().toString(36).substr(2, 9);
        const graphic = new this._bundle.Graphic(geometry, symbol);
        graphic.key = this.graphicKey;
        this.graphicsLayer.add(graphic);

        // reset number of points for the geometry (use for wcag drawing)
        // reset mapPoints  array to remove theoric line length calculation
        this.geometryLength = 0;
        this.mapPoints = [];
    }

    deleteGraphics(geometry: any) {
        // create a polygon from the extent
        const poly = new this._bundle.Polygon({
            'rings': [[[geometry.xmin, geometry.ymin], [geometry.xmin, geometry.ymax], [geometry.xmax, geometry.ymax], [geometry.xmax, geometry.ymin], [geometry.xmin, geometry.ymin]]],
            'spatialReference': this._mapApi.fgpMapObj.spatialReference
        });

        this.geometryLength = 0;
        this.densifyGeom(poly);
    }

    outputDistance(evt) {
        // remove temp graphic
        // use this kind of loop because graphics array is dynamic
        const graphics = this.graphicsLayer.graphics;
        for (let i = 0; i < graphics.length; i++) {
            const graphic = graphics[i];
            if (graphic.key === 'tmp') {
                this.graphicsLayer.remove(graphic);
                i--;
            }
        }

        // add the new distance
        const graphic = new this._bundle.Graphic(this.mapPoints[1], new this._bundle.TextSymbol(`${evt.distance.toFixed(2)} km`));
        graphic.key = 'tmp';
        this.graphicsLayer.add(graphic);

        this.createBackground();
    }

    outputAreaAndLength(evt, graphic) {
        graphic.area = evt.result.areas[0].toFixed(2);
        graphic.length = evt.result.lengths[0].toFixed(2);
        (<any>this)._geometryService.labelPoints([graphic]);
    }

    outputLength(evt, graphic) {
        const pt = graphic.paths[0][graphic.paths[0].length - 1];
        const point = new this._bundle.Point(pt[0], pt[1], this._mapApi.esriMap.spatialReference);
        const newGraphic = new this._bundle.Graphic(point, new this._bundle.TextSymbol(`${evt.result.lengths[0].toFixed(2)} km`));
        newGraphic.key = this.graphicKey;
        this.graphicsLayer.add(newGraphic);

        this.createBackground();
    }

    labelPoint(evt, graphic) {
        const newGraphic = new this._bundle.Graphic(evt.geometries[0], new this._bundle.TextSymbol(`${graphic.length} km\n${graphic.area} km\u00b2`));
        newGraphic.key = this.graphicKey;
        this.graphicsLayer.add(newGraphic);

        this.createBackground();
    }

    createBackground() {
        // delete background
        $('#graphicsRvColl_layer rect').remove();

        // get text element and loop them to create background
        const graphics = $('#graphicsRvColl_layer text').not('.rv-draw-text-hide');
        for (let graphic of graphics.toArray()) {
            const lBox = (<any>graphic).getBBox();

            let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', String(lBox.x - 2));
            rect.setAttribute('y', String(lBox.y + 1));
            rect.setAttribute('width', String(lBox.width + 4));
            rect.setAttribute('height', String(lBox.height - 2));
            rect.setAttribute('fill', 'rgba(255,255,255,0.9)');

            $(rect).insertBefore(graphic);
        }
    }

    densifyGeom(geom) {
        let params = new this._bundle.DensifyParams();
        params.geodesic = true;
        params.geometries = [geom];
        params.lengthUnit = this._geometryService.UNIT_KILOMETER;

        this._geometryService.densify(params, geoms => {
            const graphics = this.graphicsLayer.graphics;

            const key: string[] = ['tmp'];
            for (let graphic of graphics) {
                if (geoms[0].getExtent().intersects(graphic.geometry)) {
                    key.push(graphic.key);
                }
            }

            // use this kind of loop because graphics array is dynamic
            for (let i = 0; i < graphics.length; i++) {
                const graphic = graphics[i];
                if (key.indexOf(graphic.key) !== -1) {
                    this.graphicsLayer.remove(graphic);
                    i--;
                }
            }

            this.createBackground();
        });
    };
}