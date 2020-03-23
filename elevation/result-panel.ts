
import { stringify as toWKT } from 'wellknown';
import { arcgisToGeoJSON, geojsonToArcGIS } from '@esri/arcgis-to-geojson-utils';

const Draggabilly = require('draggabilly');

const FileSaver = require('file-saver');
const Chart = require('chart.js');

const numeral = require('numeral');

import { PROFILE_PANEL_TEMPLATE } from './templates/profile-panel';
import { STATISTICS_PANEL_TEMPLATE } from './templates/statistics-panel';
import { VIEWSHED_PANEL_TEMPLATE } from './templates/viewshed-panel';
import { DOWNLOAD_BUTTON_TEMPLATE } from './templates/download-btn';

import { RESULTS_LAYER_ID } from './constants';
import { DEFAULT_DRAW_FILL_SYMBOL_COLOR, DEFAULT_DRAW_LINE_SYMBOL_COLOR, DEFAULT_DRAW_LINE_SYMBOL_SIZE, DEFAULT_RADIUS_LINE_SYMBOL_COLOR, DEFAULT_RADIUS_FILL_SYMBOL_COLOR, DEFAULT_RADIUS_LINE_SYMBOL_SIZE } from './constants';
import { PROFILE_CHART_FONT_FAMILY, PROFILE_CHART_FONT_SIZE } from './constants';
import { DEFAULT_COORDINATE_ROUNDING_SCALE, VIEWSHED_ZOOM_LEVEL_TO_RADIUS_MAP, VIEWSHED_DEFAULT_OFFSET, VIEWSHED_MAX_OFFSET, PROFILE_STEP_FACTORS, PROFILE_DEFAULT_STEP_FACTOR } from './constants'

import { RESULT_PANEL_ID } from './constants';

import { buildCircle, roundGeoJsonCoordinates } from './util.js'

// Create dummy "ISO" locale to format numbers (regardless of user's locale)

numeral.register('locale', 'iso', {
  delimiters: {
      thousands: ' ',
      decimal: ','
  }
});

numeral.locale('iso');

export default class ResultPanel {

  public translations: any;

  private mapApi: any;
  private services: any;
  private esriBundle: any;
  private mode: any;
  private options: any;

  public panel: any;

  private result: any;
  private isDirty: any;

  private app: any;

  constructor (mapApi: any, esriBundle: any, mode: any, options: any) {

    this.mapApi = mapApi;
    this.esriBundle = esriBundle;
    this.services = options.services;

    this.mode = mode;
    this.options = options;

    this.result = null;

  }

  setResult (result) {
    this.result = result;
  }

  getResult () {
    return this.result;
  }

  prepareDownload () {

    const downloadFileName = this.mode;

    return {
      downloadFileName,
      data: JSON.stringify(this.result)
    }

  }

  updateGeometry (geometry /*, zoomLevel */) {

    const ctrl = (<any>window).angular.element(document.getElementById('elevation-rv-result-panel'));
    const scope = ctrl.scope();

    scope.setGeometry(geometry, /*, zoomLevel */);

  }

  get graphicsLayer(): any {
    return this.mapApi.esriMap._layers[RESULTS_LAYER_ID];
  }

  updateViewshedGraphic(geometry: any, center: any, radius: number) {

    this.graphicsLayer.clear();

    let { Graphic, SimpleFillSymbol, SimpleLineSymbol, Color, Polygon } = this.esriBundle;

    let outlineColor = new Color.fromHex(DEFAULT_DRAW_LINE_SYMBOL_COLOR);
    let fillColor = new Color.fromString(DEFAULT_DRAW_FILL_SYMBOL_COLOR);

    let radiusOutlineColor = new Color.fromHex(DEFAULT_RADIUS_LINE_SYMBOL_COLOR);
    let radiusFillColor = new Color.fromString(DEFAULT_RADIUS_FILL_SYMBOL_COLOR);

    let drawLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlineColor, DEFAULT_DRAW_LINE_SYMBOL_SIZE);
    let drawFillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, drawLineSymbol, fillColor);

    let radiusDrawLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DOT, radiusOutlineColor, DEFAULT_RADIUS_LINE_SYMBOL_SIZE);
    let radiusDrawFillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, radiusDrawLineSymbol, radiusFillColor);

    let polygon = new Polygon(geometry);

    let ring = buildCircle(center.x, center.y, radius);
    let circle = new Polygon([ring]);

    let polygonGraphic = new Graphic(polygon, drawFillSymbol);
    let radiusGraphic = new Graphic(circle, radiusDrawFillSymbol);

    this.graphicsLayer.add(polygonGraphic);
    this.graphicsLayer.add(radiusGraphic);

    let polygonExtent = polygon.getExtent();
    let circleExtent = circle.getExtent();

    this.mapApi.esriMap.setExtent(polygonExtent, true);

  }

  show (geometry, zoomLevel) {

    const panel = this.mapApi.panels.create(RESULT_PANEL_ID);

    let titleId = 'plugins.elevation.resultPanel.title.' + this.mode;
    panel.header.title = this.mapApi.getTranslatedText(titleId);

    const close = panel.header.closeButton;

    panel.allowOffscreen = true;

    close.removeClass('primary');
    close.addClass('black md-ink-ripple');

    panel.element.addClass('ag-theme-material mobile-fullscreen tablet-fullscreen rv-elevation-dialog-hidden');
    panel.element.addClass(this.mode === 'viewshed' ? 'rv-elevation-dialog-small' : 'rv-elevation-dialog-large')

    // Make panel draggable...
    panel.element.addClass('draggable');
    const draggable = new Draggabilly(panel.element.get(0), {
      handle: '.rv-header'
    });

    this.panel = panel;

    let that = this;

    this.mapApi.agControllerRegister('DownloadBtnCtrl', function() {

      this.downloadResultsAsJson = function() {

        const { downloadFileName, data } = that.prepareDownload()

        // Save the file. Some browsers like IE and Edge doesn't support File constructor, use blob
        // https://stackoverflow.com/questions/39266801/saving-file-on-ie11-with-filesaver

        const file = new Blob([data], { type: 'application/json' });
        FileSaver.saveAs(file, downloadFileName);

      }

      this.isButtonDisabled = function() {
        return that.getResult() === null;
      }

    });

    // Create Angular controller for result panel

    this.mapApi.agControllerRegister('ResultPanelCtrl', ['$scope','$http', function($scope, $http) {

      $scope.mode = that.mode;

      $scope.status = 'loading';
      $scope.geometry = geometry;

      $scope.steps = PROFILE_STEP_FACTORS
      $scope.stepFactor = PROFILE_DEFAULT_STEP_FACTOR;
      $scope.smoothProfile = true;

      $scope.services = that.services;

      $scope.statsSources = Object.keys(that.services);
      $scope.statsSource =  $scope.statsSources[0];

      $scope.viewshedOffset = VIEWSHED_DEFAULT_OFFSET;
      $scope.maxViewshedOffset = VIEWSHED_MAX_OFFSET;

      $scope.mapZoomLevel = zoomLevel || 1;

      $scope.result = null;
      $scope.isDirty = false;

      $scope.getFormattedValue = function(value, format = '0,0.00') {
        return numeral(value).format(format);
      }

      $scope.isStatisticsTableVisible = function() {
        return $scope.mode === 'statistics' && $scope.status !== 'error';
      }

      $scope.isProfileChartVisible = function() {
        return $scope.mode === 'profile' && $scope.status !== 'error';
      }

      $scope.setGeometry = function(geometry) {
        $scope.isDirty = true;
        $scope.geometry = geometry;
      }

      $scope.refresh = function() {
        $scope.doRequest();
      }

      $scope.doRequest = function() {

        that.setResult(null);

        $scope.status = 'loading';

        switch ($scope.mode) {
          case 'profile':
            $scope.doProfileRequest();
            break;
          case 'statistics':
            $scope.doStatisticsRequest();
            break;
          case 'viewshed':
            $scope.doViewshedRequest();
            break;
        }

        $scope.isDirty = false;

      }


      $scope.handleSmoothChange = function() {
        $scope.smoothProfile = !$scope.smoothProfile;
        $scope.updateChart();
      }

      $scope.handleViewshedOffsetChange = function() {
        $scope.isDirty = true;
      }

      $scope.handleStepChange = function(stepFactor) {

        if ($scope.stepFactor == stepFactor) {
          return;
        }

        $scope.stepFactor = stepFactor;
        $scope.isDirty = true;

      }

      $scope.handleStatsSourceChange = function(statsSource) {

        if ($scope.statsSource == statsSource) {
          return;
        }

        $scope.statsSource = statsSource;
        $scope.isDirty = true;

      }

      $scope.updateChart = function() {

        const SMOOTH_FACTOR = 0.4;
        const CHART_FONT_FAMILY = PROFILE_CHART_FONT_FAMILY;
        const CHART_FONT_SIZE = PROFILE_CHART_FONT_SIZE;

        let data = that.getResult();

        // The profile chart is composed of 4 datasets:
        // 1. The profile itself (line)
        // 2. The data points (user-drawn)
        // 3. The interpolated points (according to the step factor)
        // 4. The NULL-elevation points

        let chartLineData = data.map((item, i) => {
          return { x: (item.distance / 1000), y: item.altitude };
        })

        let chartPointData = data.map((item, i) => {
          return item.vertex ? { x: (item.distance / 1000), y: item.altitude } : null;
        }).filter(item => item ? true : false);

        let chartIntermediatePointData = data.map((item, i) => {
          return item.vertex === false ? { x: (item.distance / 1000), y: item.altitude } : null;
        }).filter(item => item ? true : false);

        let chartNullElevationData = data.map((item, i) => {
          return (item.vertex === true && item.altitude === null) ? { x: (item.distance / 1000), y: 0 } : null;
        }).filter(item => item ? true : false);

        if ($scope.chart) {

          $scope.chart.data.datasets[0].tension = $scope.smoothProfile ? SMOOTH_FACTOR : 0;
          $scope.chart.data.datasets[0].data = chartPointData;

          $scope.chart.data.datasets[1].tension = $scope.smoothProfile ? SMOOTH_FACTOR : 0;
          $scope.chart.data.datasets[1].data = chartIntermediatePointData;

          $scope.chart.data.datasets[2].data = chartNullElevationData;

          $scope.chart.data.datasets[3].tension = $scope.smoothProfile ? SMOOTH_FACTOR : 0;
          $scope.chart.data.datasets[3].data = chartLineData;

          $scope.chart.options.scales.xAxes[0].ticks.suggestedMax = chartLineData[chartLineData.length - 1].x;

          $scope.chart.update();

        } else {

          // Very hacky way of getting translated strings from plugin translations

          const xAxisLabel = $('#elevation-chart-x-axis-label').text();
          const yAxisLabel = $('#elevation-chart-y-axis-label').text();

          Chart.defaults.global.animation = false;
          Chart.defaults.global.title = { display: false }
          Chart.defaults.global.legend.display = false;
          Chart.defaults.global.elements.line.cubicInterpolationMode = 'monotone';
          Chart.defaults.global.elements.line.spanGaps = true;

          var el = document.getElementById('rv-elevation-chart');
          var ctx = (<any>el).getContext('2d');

          $scope.chart = new Chart(ctx, {

            type: 'line',
            options: {

              maintainAspectRatio: true,

              layout: {

                padding: {
                    left: 20,
                    right: 30,
                    top: 30,
                    bottom: 15
                }
              },

              scales: {

                xAxes: [{
                  type: 'linear',
                  display: true,
                  gridLines: {
                    display: true,
                    suggestedMax: chartLineData[chartLineData.length - 1].x,
                    min: 0,
                  },
                  ticks: {
                    min: 0,
                    display: true
                  },
                  scaleLabel: {
                    display: true,
                    fontFamily: CHART_FONT_FAMILY,
                    fontSize: CHART_FONT_SIZE,
                    labelString: xAxisLabel
                  },
                }],

                yAxes: [{
                  display: true,
                  ticks: {
                    maxTicksLimit: 7
                  },
                  scaleLabel: {
                    display: true,
                    fontFamily: CHART_FONT_FAMILY,
                    fontSize: CHART_FONT_SIZE,
                    labelString: yAxisLabel
                  }
                }]

              }

            },

            data: {
              datasets: [
                {
                  tension: $scope.smoothProfile ? SMOOTH_FACTOR : 0,
                  fill: false,
                  showLine: false,
                  pointBackgroundColor: DEFAULT_DRAW_LINE_SYMBOL_COLOR,
                  pointRadius: 5,
                  data: chartPointData
                },
                {
                  tension: $scope.smoothProfile ? SMOOTH_FACTOR : 0,
                  fill: false,
                  showLine: false,
                  pointBackgroundColor: '#fff',
                  pointRadius: 3,
                  pointBorderColor: DEFAULT_DRAW_LINE_SYMBOL_COLOR,
                  data: chartIntermediatePointData
                },
                {
                  tension: 0,
                  fill: false,
                  showLine: false,
                  pointBackgroundColor: '#fff',
                  pointRadius: 6,
                  pointBorderColor: DEFAULT_DRAW_LINE_SYMBOL_COLOR,
                  pointBorderWidth: 2,
                  pointStyle: 'crossRot',
                  data: chartNullElevationData
                },
                {
                  tension: $scope.smoothProfile ? 0.4 : 0,
                  pointRadius: 0,
                  pointHoverRadius: 0,
                  backgroundColor: DEFAULT_DRAW_FILL_SYMBOL_COLOR,
                  borderColor: DEFAULT_DRAW_LINE_SYMBOL_COLOR,
                  data: chartLineData
                }
              ]
            }
          });

        }

      }

      $scope.updateStatisticsTable = function() {
        let data = that.getResult();
        $scope.result = data;
      }

      $scope.doProfileRequest = function () {

        // Retrieve required classes from ArcGIS JS API bundle

        const { Point, SpatialReference, geometryEngine } = that.esriBundle;
        const { esriMap: map } = that.mapApi;

        // Project user-geometry to lat-long
        // and convert to WKT

        let latLongGeometry = (<any>RAMP).GAPI.proj.localProjectGeometry(4326, $scope.geometry);
        let geojson = arcgisToGeoJSON(latLongGeometry);
        let wkt = toWKT(geojson);

        // Build query url and params

        const url = $scope.services[$scope.statsSource];

        let params = {
          path: wkt,
          steps: $scope.stepFactor
        };

        let options = {
          params: params,
        }

        // Call backend

        $http.get(url, options).then(function successCallback(response) {

          let data = response.data.reduce((acc, point, index, array) => {

            if (index === 0) {

              acc.push({ ...point, ...{ distance: 0 } });

            } else {

              // Measure accumulated horizontal distance along profile

              const previousPoint = array[index - 1];
              const previousDistance = acc[index - 1].distance;

              const { geometry: { coordinates: [ x1, y1 ] } } = previousPoint;
              const { geometry: { coordinates: [ x2, y2 ] } } = point;

              // We project to a 'projected' coordinate system (3978)
              // in order to have coordinates in meters and be able to measure distances along profile

              const projectedPoint1 = (<any>RAMP).GAPI.proj.localProjectPoint(4326, 3978, { x: x1, y: y1 });
              const projectedPoint2 = (<any>RAMP).GAPI.proj.localProjectPoint(4326, 3978, { x: x2, y: y2});

              const point1 = new Point(projectedPoint1.x, projectedPoint1.y, new SpatialReference(3978));
              const point2 = new Point(projectedPoint2.x, projectedPoint2.y, new SpatialReference(3978));

              const distance = Math.round(geometryEngine.distance(point1, point2, 'meters'));

              acc.push({ ...point, ...{ distance: previousDistance + distance } });

            }

            return acc;

          }, []);

          $scope.status = 'loaded';

          that.setResult(data);
          $scope.updateChart();

        }, function errorCallback(response) {
            $scope.status = 'error';
        });

      }

      $scope.doViewshedRequest = function() {

        // Retrieve required classes from ArcGIS JS API bundle

        const { Point, SpatialReference, geometryEngine } = that.esriBundle;
        const { esriMap: map } = that.mapApi;

        // Project user-geometry to lat-long

        let latLongGeometry = (<any>RAMP).GAPI.proj.localProjectGeometry(4326, $scope.geometry);
        let geojson = arcgisToGeoJSON(latLongGeometry);

        // Retrieve request radius from map level

        let level = $scope.mapZoomLevel;
        let radius = VIEWSHED_ZOOM_LEVEL_TO_RADIUS_MAP[level] || VIEWSHED_ZOOM_LEVEL_TO_RADIUS_MAP[10];

        let center = roundGeoJsonCoordinates(geojson, DEFAULT_COORDINATE_ROUNDING_SCALE);

        let params = {
          geom: center,
          offset: $scope.viewshedOffset,
          level: level,
          radius: radius
        };

        let options = {
          params: params,
        }

        const url = $scope.services[$scope.statsSource];

        // Call backend

        $http.get(url, options).then(function successCallback(response) {

          let { data } = response;

          $scope.status = 'loaded';

          that.setResult(data);

          // Project result back to map projection

          let latLongGeometry = geojsonToArcGIS(data);

          let mapProjection = map.spatialReference;
          let projectedGeometry = (<any>RAMP).GAPI.proj.localProjectGeometry(mapProjection, latLongGeometry);

          that.updateViewshedGraphic(projectedGeometry, $scope.geometry, radius);

        }, function errorCallback(response) {

          $scope.status = 'error';

        });

      }

      $scope.doStatisticsRequest = function () {

        // Retrieve required classes from ArcGIS JS API bundle

        const { Point, SpatialReference, geometryEngine } = that.esriBundle;

        // Project user-geometry to lat-long

        let latLongGeometry = (<any>RAMP).GAPI.proj.localProjectGeometry(4326, $scope.geometry);
        let geojson = arcgisToGeoJSON(latLongGeometry);

        let params = {
          geom: roundGeoJsonCoordinates(geojson, DEFAULT_COORDINATE_ROUNDING_SCALE),
          level: $scope.mapZoomLevel
        };

        let options = {
          params: params,
        }

        const url = $scope.services[$scope.statsSource];

        // Call backend

        $http.get(url, options).then(function successCallback(response) {

          let { data } = response;

          $scope.status = 'loaded';

          that.setResult(data);
          $scope.updateStatisticsTable();

        }, function errorCallback(response) {

          $scope.status = 'error';

        });

      }

      $scope.doRequest();

    }]);

    // Create Angular controller for download button

    let downloadButtonTemplate = $(DOWNLOAD_BUTTON_TEMPLATE);
    this.mapApi.$compile(downloadButtonTemplate)
    panel.header.prepend(downloadButtonTemplate);

    let resultPanelTemplate = this.mode === 'viewshed' ? $(VIEWSHED_PANEL_TEMPLATE) : ( this.mode === 'profile' ? $(PROFILE_PANEL_TEMPLATE) : $(STATISTICS_PANEL_TEMPLATE) );

    this.mapApi.$compile(resultPanelTemplate);
    panel.body.empty();
    panel.body.prepend(resultPanelTemplate);

    panel.open();

    $('.dialog-container').addClass('rv-elevation-dialog-container');

    setTimeout(() => {

      // The following line is not working, need to use jquery workaround...
      // resultPanel.element.removeClass('rv-elevation-dialog-hidden');
      $('#elevationResultPanel').removeClass('rv-elevation-dialog-hidden');

    }, 10);

  }

}
