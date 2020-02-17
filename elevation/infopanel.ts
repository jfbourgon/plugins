
import { stringify as toWKT } from 'wellknown';
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';

const FileSaver = require('file-saver');
var Chart = require('chart.js');

import { INFO_PANEL_TEMPLATE, DOWNLOAD_BUTTON_TEMPLATE } from './templates'

const INFO_PANEL_ID = 'elevationInfoPanel';

export default class InfoPanel {

  private mapApi: any;
  private mode: any;
  private options: any;

  public panel: any;

  private result: any;

  constructor (mapApi: any, mode: any, options: any) {

    this.mapApi = mapApi;

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

      // $scope.steps = [
      //   { id: 5, value: 5 },
      //   { id: 10, value: 10 },
      //   { id: 50, value: 50 }
      // ];
      $scope.mode = that.mode;

      $scope.status = 'loading';
      $scope.wkt = wkt;

      $scope.steps = [5, 10, 20, 50, 100];
      $scope.stepFactor = 10;
      $scope.smoothProfile = false;

      $scope.result = null;
      that.setResult(null);

      $scope.isStatisticsTableVisible = function() {
        return $scope.mode === 'statistics' && $scope.status === 'loaded'
      }

      $scope.isProfileChartVisible = function() {
        return $scope.mode === 'profile' && $scope.status === 'loaded'
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
        // console.warn(value);
        $scope.smoothProfile = !$scope.smoothProfile;
        $scope.updateChart();
      }

      $scope.handleStepChange = function(stepFactor) {
        $scope.stepFactor = stepFactor;
        $scope.doRequest();
      }

      $scope.updateChart = function() {

        console.warn($scope.chart);
        console.warn($scope.smoothProfile);

        let data = that.getResult();

        Chart.defaults.global.animation = false;
        Chart.defaults.global.title = { display: false }
        Chart.defaults.global.legend.display = false;

        var el = document.getElementById('rv-elevation-chart');
        var ctx = (<any>el).getContext('2d');


        $scope.chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
options: {

  maintainAspectRatio: true,
  layout: {

    padding: {
        left: 20,
        right: 30,
        top: 30,
        bottom: 20
    }
}
},
            // The data for our dataset
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                  tension: $scope.smoothProfile ? 0.4 : 0,
                  cubicInterpolationMode: 'monotone',
                spanGaps: true,
                    backgroundColor: 'rgba(217,205,229, 0.5)',
                    borderColor: '#6A50A3',
                    data: [0, null, 5, 2, 20, 30, 45]
                }]
            }
        });
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
