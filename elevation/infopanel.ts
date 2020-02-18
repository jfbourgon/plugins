
import { stringify as toWKT } from 'wellknown';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';

const FileSaver = require('file-saver');
var Chart = require('chart.js');

import { INFO_PANEL_TEMPLATE, DOWNLOAD_BUTTON_TEMPLATE } from './templates'

const INFO_PANEL_ID = 'elevationInfoPanel';

export default class InfoPanel {

  private mapApi: any;
  private esriBundle: any;
  private mode: any;
  private options: any;

  public panel: any;

  private result: any;

  constructor (mapApi: any, esriBundle: any, mode: any, options: any) {

    this.mapApi = mapApi;
    this.esriBundle = esriBundle;

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

  show (geometry) {

    console.warn(geometry);

    let latLongGeometry = (<any>RAMP).GAPI.proj.localProjectGeometry(4326, geometry);

    // parse ArcGIS JSON, convert it to GeoJSON
    const geojson = arcgisToGeoJSON(latLongGeometry);
    const wkt = toWKT(geojson);

    const panel = this.mapApi.panels.create(INFO_PANEL_ID, 1);
    panel.header.title = 'Title';

    const close = panel.header.closeButton;
    close.removeClass('primary');
    close.addClass('black md-ink-ripple');

    panel.element.addClass('ag-theme-material mobile-fullscreen tablet-fullscreen rv-elevation-dialog-hidden');

    this.panel = panel;

    let that = this;

    this.mapApi.agControllerRegister('DownloadBtnCtrl', function() {

      this.downloadResultsAsJson = function() {

        const { downloadFileName, data } = that.prepareDownload()

        // save the file. Some browsers like IE and Edge doesn't support File constructor, use blob
        // https://stackoverflow.com/questions/39266801/saving-file-on-ie11-with-filesaver
        const file = new Blob([data], { type: 'application/json' });
        FileSaver.saveAs(file, downloadFileName);

        // console.warn(that.getResult());
      }

      this.isButtonDisabled = function() {
        return that.getResult() === null;
      }

    });

    this.mapApi.agControllerRegister('InfoPanelCtrl', ['$scope','$http', function($scope, $http) {

      $scope.mode = that.mode;

      $scope.status = 'loading';
      $scope.wkt = wkt;

      $scope.steps = [5, 10, 20, 50, 100];
      $scope.stepFactor = 10;
      $scope.smoothProfile = true;

      $scope.result = null;
      that.setResult(null);

      $scope.isStatisticsTableVisible = function() {
        return $scope.mode === 'statistics' && $scope.status === 'loaded'
      }

      $scope.isProfileChartVisible = function() {
        return $scope.mode === 'profile'; // && $scope.status === 'loaded'
      }

      $scope.refresh = function() {
        $scope.doRequest();
      }

      $scope.doRequest = function() {

        that.setResult(null);
        $scope.status = 'loading';

        if ($scope.mode === 'profile') {
          $scope.doProfileRequest();
        } else {
          $scope.doStatisticsRequest();
        }
      }

      $scope.handleSmoothChange = function() {
        $scope.smoothProfile = !$scope.smoothProfile;
        $scope.updateChart();
      }

      $scope.handleStepChange = function(stepFactor) {
        $scope.stepFactor = stepFactor;
        $scope.doRequest();
      }

      $scope.updateChart = function() {

        const { Point, SpatialReference, geometryEngine } = that.esriBundle;

        let data = that.getResult().reduce((acc, point, index, array) => {

          if (index === 0) {

            acc.push({ x: 0, y: point.altitude, vertex: point.vertex })

          } else {

            const previousPoint = array[index - 1];
            const previousDistance = acc[index - 1].x;

            const { geometry: { coordinates: [ x1, y1 ] } } = previousPoint;
            const { geometry: { coordinates: [ x2, y2 ] } } = point;

            const projectedPoint1 = (<any>RAMP).GAPI.proj.localProjectPoint(4326, 3978, { x: x1, y: y1 });
            const projectedPoint2 = (<any>RAMP).GAPI.proj.localProjectPoint(4326, 3978, { x: x2, y: y2});

            const point1 = new Point(projectedPoint1.x, projectedPoint1.y, new SpatialReference(3978));
            const point2 = new Point(projectedPoint2.x, projectedPoint2.y, new SpatialReference(3978));

            const distance = geometryEngine.distance(point1, point2, 'kilometers');

            acc.push({ x: previousDistance + distance, y: point.altitude, vertex: point.vertex });

          }

          return acc;

        }, []);


        let chartLineData = data.map((item, i) => {
          return { x: item.x, y: item.y };
        })

        let chartPointData = data.map((item, i) => {
          return item.vertex ? { x: item.x, y: item.y } : null;
        }).filter(item => item ? true : false);

        let chartIntermediatePointData = data.map((item, i) => {
          return item.vertex === false ? { x: item.x, y: item.y } : null;
        }).filter(item => item ? true : false);


        if ($scope.chart) {

          $scope.chart.data.datasets[0].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[0].data = chartPointData;

          $scope.chart.data.datasets[1].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[1].data = chartIntermediatePointData;

          $scope.chart.data.datasets[2].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[2].data = chartLineData;

          $scope.chart.options.scales.xAxes[0].ticks.suggestedMax = chartLineData[chartLineData.length - 1].x;
          // $scope.chart.options.scales.xAxes[0].ticks.stepSize = chartLineData.length - 1;

          $scope.chart.update();

        } else {

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
                  // offset: true,
                  gridLines: {
                    display: true,
                    suggestedMax: chartLineData[chartLineData.length - 1].x,
                    min: 0,
                    // stepSize: chartLineData.length - 1
                  },
                  ticks: {
                    // max: chartLineData.length - 1,
                    min: 0,
                    // stepSize: chartLineData.length - 1,
                    display: true
                  },
                  scaleLabel: {
                    display: true,
                    fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                    fontSize: '14',
                    labelString: 'Distance cumulée le long du profil (en kilomètres)'
                  },
                }],

                yAxes: [{
                  display: true,
                  ticks: {
                    maxTicksLimit: 7
                  },
                  scaleLabel: {
                    display: true,
                    fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                    fontSize: '14',
                    labelString: 'Élévation (en mètres)'
                  }
                }]

              }

            },

            data: {
              datasets: [
                {
                  tension: $scope.smoothProfile ? 0.4 : 0,
                  fill: false,
                  showLine: false,
                  pointBackgroundColor: '#6A50A3',
                  pointRadius: 4,
                  data: chartPointData
                },
                {
                  tension: $scope.smoothProfile ? 0.4 : 0,
                  fill: false,
                  showLine: false,
                  pointBackgroundColor: '#fff',
                  pointRadius: 3,
                  pointBorderColor: '#6A50A3',
                  data: chartIntermediatePointData
                },
                {
                  tension: $scope.smoothProfile ? 0.4 : 0,
                  pointRadius: 0,
                  pointHoverRadius: 0,
                  backgroundColor: 'rgba(217,205,229, 0.5)',
                  borderColor: '#6A50A3',
                  data: chartLineData
                }
              ]
            }
          });

        }

        $scope.result = data;

      }

      $scope.updateStatisticsTable = function(data) {
        $scope.result = data;
      }

      $scope.doProfileRequest = function () {

        let params = {
          path: $scope.wkt,
          steps: $scope.stepFactor
        };

        $http.get('http://geogratis.gc.ca/services/elevation/cdem/profile', {
          // withCredentials : true,
          params: params
        }).then(function successCallback(response) {

          let { data } = response;

          $scope.status = 'loaded';

          $scope.result = data;
          that.setResult(data);
          $scope.updateChart();

        }, function errorCallback(response) {
            $scope.status = 'error';
        });

      }

      $scope.doStatisticsRequest = function () {

        $http.get('http://geogratis.gc.ca/services/elevation/cdem/profile', {
          // withCredentials : true,
        }).then(function successCallback(response) {

          let { data } = response;

          $scope.status = 'loaded';

          $scope.result = data;
          that.setResult(data);
          $scope.updateStatisticsTable(data);

        }, function errorCallback(response) {

          $scope.status = 'loaded';

          $scope.result = response;
          that.setResult(response);
          $scope.updateStatisticsTable(response);

        });

      }

      $scope.doRequest();

    }]);


    let downloadButtonTemplate = $(DOWNLOAD_BUTTON_TEMPLATE);
    this.mapApi.$compile(downloadButtonTemplate)
    panel.header.prepend(downloadButtonTemplate);

    let infoPanelTemplate = $(INFO_PANEL_TEMPLATE);
    this.mapApi.$compile(infoPanelTemplate);
    panel.body.empty();
    panel.body.prepend(infoPanelTemplate);

    panel.open();
    // const header = infoPanel.header;
    // header.$.prepend(this.mapApi.$compile(DOWNLOAD_BUTTON_TEMPLATE));

    $('.dialog-container').addClass('rv-elevation-dialog-container');

    setTimeout(() => {

      // The following line is not working, need to use jquery workaround...
      // infoPanel.element.removeClass('rv-elevation-dialog-hidden');
      $('#elevationInfoPanel').removeClass('rv-elevation-dialog-hidden');

    }, 10);

  }

  hide () {

  }

}
