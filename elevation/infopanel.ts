
import { stringify as toWKT } from 'wellknown';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';

const Draggabilly = require('draggabilly');

const FileSaver = require('file-saver');
var Chart = require('chart.js');

import { INFO_PANEL_TEMPLATE, DOWNLOAD_BUTTON_TEMPLATE } from './templates'

const INFO_PANEL_ID = 'elevationInfoPanel';

export default class InfoPanel {

  public translations: any;

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

  getTranslatedText (id) {

    const template = `<div>{{ '` + id + `' | translate }}</div>`;

    let $el = $(template);
    this.mapApi.$compile($el);

    const text = $el.text();
    return text;

  }


  show (geometry) {

    let latLongGeometry = (<any>RAMP).GAPI.proj.localProjectGeometry(4326, geometry);

    const geojson = arcgisToGeoJSON(latLongGeometry);
    const wkt = toWKT(geojson);

    const panel = this.mapApi.panels.create(INFO_PANEL_ID, 1);

    let titleId = this.mode === 'profile' ? 'plugins.elevation.infoPanel.title.profile' : 'plugins.elevation.infoPanel.title.statistics';
    panel.header.title = this.getTranslatedText(titleId); //$title.text();

    const close = panel.header.closeButton;
    close.removeClass('primary');
    close.addClass('black md-ink-ripple');

    panel.element.addClass('ag-theme-material mobile-fullscreen tablet-fullscreen rv-elevation-dialog-hidden');

    // Make panel draggable...
    $(`#${INFO_PANEL_ID}`).addClass('draggable');
    const draggable = new Draggabilly(`#${INFO_PANEL_ID}`, {
      handle: '.rv-header'
    });

    this.panel = panel;

    let that = this;

    this.mapApi.agControllerRegister('DownloadBtnCtrl', function() {

      this.downloadResultsAsJson = function() {

        const { downloadFileName, data } = that.prepareDownload()

        // save the file. Some browsers like IE and Edge doesn't support File constructor, use blob
        // https://stackoverflow.com/questions/39266801/saving-file-on-ie11-with-filesaver
        const file = new Blob([data], { type: 'application/json' });
        FileSaver.saveAs(file, downloadFileName);

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
      $scope.stepFactor = 20;
      $scope.smoothProfile = true;

      $scope.result = null;
      that.setResult(null);

      $scope.isStatisticsTableVisible = function() {
        return $scope.mode === 'statistics' && $scope.status !== 'error';
      }

      $scope.isProfileChartVisible = function() {
        return $scope.mode === 'profile' && $scope.status !== 'error';
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

        let data = that.getResult();

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

          $scope.chart.data.datasets[0].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[0].data = chartPointData;

          $scope.chart.data.datasets[1].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[1].data = chartIntermediatePointData;

          // $scope.chart.data.datasets[2].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[2].data = chartNullElevationData;

          $scope.chart.data.datasets[3].tension = $scope.smoothProfile ? 0.4 : 0;
          $scope.chart.data.datasets[3].data = chartLineData;

          $scope.chart.options.scales.xAxes[0].ticks.suggestedMax = chartLineData[chartLineData.length - 1].x;
          // $scope.chart.options.scales.xAxes[0].ticks.stepSize = chartLineData.length - 1;

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
                    labelString: xAxisLabel //'Distance cumulée le long du profil (en kilomètres)'
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
                    labelString: yAxisLabel //'Élévation (en mètres)'
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
                  tension: 0,
                  fill: false,
                  showLine: false,
                  pointBackgroundColor: '#fff',
                  pointRadius: 6,
                  pointBorderColor: '#6A50A3',
                  pointBorderWidth: 2,
                  pointStyle: 'crossRot',
                  data: chartNullElevationData
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

        // $scope.result = data;

      }

      $scope.updateStatisticsTable = function(data) {
        $scope.result = data;
      }

      $scope.doProfileRequest = function () {

        const { Point, SpatialReference, geometryEngine } = that.esriBundle;

        let params = {
          path: $scope.wkt,
          steps: $scope.stepFactor
        };

        $http.get('http://geogratis.gc.ca/services/elevation/cdem/profile', {
          // withCredentials : true,
          params: params
        }).then(function successCallback(response) {

          let data = response.data.reduce((acc, point, index, array) => {

            if (index === 0) {

              // acc.push({ x: 0, y: point.altitude, vertex: point.vertex });
              acc.push({ ...point, ...{ distance: 0 } });

            } else {

              const previousPoint = array[index - 1];
              const previousDistance = acc[index - 1].distance;

              const { geometry: { coordinates: [ x1, y1 ] } } = previousPoint;
              const { geometry: { coordinates: [ x2, y2 ] } } = point;

              const projectedPoint1 = (<any>RAMP).GAPI.proj.localProjectPoint(4326, 3978, { x: x1, y: y1 });
              const projectedPoint2 = (<any>RAMP).GAPI.proj.localProjectPoint(4326, 3978, { x: x2, y: y2});

              const point1 = new Point(projectedPoint1.x, projectedPoint1.y, new SpatialReference(3978));
              const point2 = new Point(projectedPoint2.x, projectedPoint2.y, new SpatialReference(3978));

              const distance = Math.round(geometryEngine.distance(point1, point2, 'meters'));

              // acc.push({ x: previousDistance + distance, y: point.altitude, vertex: point.vertex });
              acc.push({ ...point, ...{ distance: previousDistance + distance } });

            }

            return acc;

          }, []);

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

}
