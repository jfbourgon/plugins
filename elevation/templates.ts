// panels templates: collaboration
export const TOOLBAR_TEMPLATE = `
    <div class="rv-button-group hover rv-whiteframe-z2 rv-mapnav-elevation-content hidden" ng-controller="ElevationToolbarCtrl as ctrl">
        <md-button ng-repeat-start="control in ctrl.controls" name="{{ controls }}"
            aria-label="{{ control.label | translate }}"
            class="md-icon-button rv-button-32 rv-icon-16 rv-elevation-button rv-draw-{{ control.name }}-button"
            ng-class="{ 'rv-control-active': control.selected() }"
            ng-click="control.action($event)">
            <md-tooltip md-direction="left">{{ control.tooltip | translate }}</md-tooltip>
            <md-icon>
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" ng-attr-view_box="{{control.viewbox}}" focusable="false">
                <g id="drawicon{{control.name}}" ng-init="control.createIcon()"><path id="path{{control.name}}" d=""></path></g></svg>
            </md-icon>
        </md-button>
        <!-- this will insert divider after every element except the last one -->
        <md-divider ng-if="!$last" ng-repeat-end></md-divider>
    </div>
    <span class="rv-spacer"></span>
`;

export const INFO_PANEL_TEMPLATE = ` 
    <div ng-controller="InfoPanelCtrl" class="body">

        <div class="toolbar">

            <md-menu-bar class="menubar">

                <md-menu md-position-mode="target-left target" ng-if="mode === 'profile'">
                    <md-button
                        aria-label="Menu"
                        ng-disabled="status === 'loading'"
                        class="md-icon-button black"
                        ng-click="$mdOpenMenu($event)">
                        <md-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                            <g><g><g><path d="M23,8c0,1.1-0.9,2-2,2c-0.18,0-0.35-0.02-0.51-0.07l-3.56,3.55C16.98,13.64,17,13.82,17,14c0,1.1-0.9,2-2,2s-2-0.9-2-2 c0-0.18,0.02-0.36,0.07-0.52l-2.55-2.55C10.36,10.98,10.18,11,10,11s-0.36-0.02-0.52-0.07l-4.55,4.56C4.98,15.65,5,15.82,5,16 c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2c0.18,0,0.35,0.02,0.51,0.07l4.56-4.55C8.02,9.36,8,9.18,8,9c0-1.1,0.9-2,2-2s2,0.9,2,2 c0,0.18-0.02,0.36-0.07,0.52l2.55,2.55C14.64,12.02,14.82,12,15,12s0.36,0.02,0.52,0.07l3.55-3.56C19.02,8.35,19,8.18,19,8 c0-1.1,0.9-2,2-2S23,6.9,23,8z"/></g></g></g>
                            </svg>
                        </md-icon>
                        <md-tooltip>{{ 'plugins.elevation.infoPanel.stepMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-step-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.infoPanel.stepMenuBtn.tooltip' | translate | uppercase }}</span>
                        </md-menu-item>
                        <md-menu-divider class="rv-lg"></md-menu-divider>
                        <md-menu-item ng-repeat="step in steps">
                            <md-button ng-click="handleStepChange(step)">
                                <span style='flex-basis: auto; overflow-wrap:normal;'>{{step}}</span>
                                <md-icon md-svg-icon="action:done" ng-if="step === stepFactor"></md-icon>
                            </md-button>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>

                <md-switch ng-model="smoothProfile" ng-disabled="status === 'loading'" ng-if="mode === 'profile'" class="md-primary" aria-label="{{ 'plugins.elevation.infoPanel.smoothProfileBtn.label' | translate }}" ng-change="handleSmoothChange()">
                    <md-label>{{ 'plugins.elevation.infoPanel.smoothProfileBtn.label' | translate }}</md-label>
                </md-switch>

            </md-menu-bar>

        </div>

        <div class="content">

            <div ng-if="isStatisticsTableVisible()" class="rv-elevation-infopanel-statistics-table">
                <div>STATISTICS TABLE</div>
            </div>

            <div class="rv-elevation-infopanel-chart" ng-class="{ 'disabled': status === 'loading', 'hidden': !isProfileChartVisible()}">
                <canvas id="rv-elevation-chart" style="width: 100%; height: 100%;" role="img" aria-label="{{ 'plugins.elevation.infoPanel.chart.label' | translate }}">
                    <p>{{ 'plugins.elevation.infoPanel.chart.label' | translate }}</p>
                    <span id="elevation-chart-x-axis-label" class="hidden">{{ 'plugins.elevation.infoPanel.chart.xAxisLabel' | translate }}</span>
                    <span id="elevation-chart-y-axis-label" class="hidden">{{ 'plugins.elevation.infoPanel.chart.yAxisLabel' | translate }}</span>
                </canvas>
            </div>

            <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()" ng-if="status === 'error'">{{ 'plugins.elevation.infoPanel.retryBtn.label' | translate }}</md-button>

        </div>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`;

export const DOWNLOAD_BUTTON_TEMPLATE = `
        <md-button
        ng-controller="DownloadBtnCtrl as ctrl"
            class="md-icon-button black md-ink-ripple"
            ng-disabled="ctrl.isButtonDisabled()"
            ng-click="ctrl.downloadResultsAsJson()"
        >
            <md-tooltip>{{ 'plugins.elevation.infoPanel.header.downloadBtn.tooltip' | translate }}</md-tooltip>
            <md-icon>
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 -1 24 24" focusable="false">
                    <g>
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/>
                    </g>
                </svg>
            </md-icon>
        </md-button>
`
