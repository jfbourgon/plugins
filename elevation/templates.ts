// panels templates: collaboration
export const TOOLBAR_TEMPLATE = `
    <div class="rv-button-group hover rv-whiteframe-z2 rv-mapnav-elevation-content hidden" ng-controller="ElevationToolbarCtrl as ctrl">
        <!-- <md-button class="md-warn md-raised" style="position: absolute; right: 35px; top: -7px;">Stop Editing</md-button> -->
        <md-button ng-repeat-start="control in ctrl.controls" name="{{ controls }}"
            aria-label="{{ control.label | translate }}"
            class="md-icon-button rv-button-32 rv-icon-16 rv-elevation-button rv-draw-{{ control.name }}-button"
            ng-class="{ 'rv-control-active': control.selected() }"
            ng-click="control.action($event)"
            ng-disabled="control.disabled()"
            ng-if="control.visible()"
            >
            <md-tooltip md-direction="left">{{ control.tooltip | translate }}</md-tooltip>
            <md-icon>
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" ng-attr-view_box="{{control.viewbox}}" focusable="false">
                <g id="drawicon{{control.name}}" ng-init="control.createIcon()"><path id="path{{control.name}}" d=""></path></g></svg>
            </md-icon>
        </md-button>
        <!-- this will insert divider after every element except the last one -->
        <md-divider ng-if="!$last" ng-repeat-end></md-divider>
    </md-but>
    <span class="rv-spacer"></span>
`;

export const PROFILE_INFO_PANEL_TEMPLATE = ` 
    <div id="elevation-rv-info-panel" ng-controller="InfoPanelCtrl" class="body">

        <div class="toolbar">

            <md-menu-bar class="menubar">

                <md-menu md-position-mode="target-left target">
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

            <div class="rv-elevation-infopanel-chart" ng-class="{ 'disabled': status === 'loading', 'hidden': !isProfileChartVisible()}">
                <canvas id="rv-elevation-chart" style="width: 100%; height: 100%;" role="img" aria-label="{{ 'plugins.elevation.infoPanel.chart.label' | translate }}">
                    <p>{{ 'plugins.elevation.infoPanel.chart.label' | translate }}</p>
                    <span id="elevation-chart-x-axis-label" class="hidden">{{ 'plugins.elevation.infoPanel.chart.xAxisLabel' | translate }}</span>
                    <span id="elevation-chart-y-axis-label" class="hidden">{{ 'plugins.elevation.infoPanel.chart.yAxisLabel' | translate }}</span>
                </canvas>
            </div>

            <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()" ng-if="status === 'error'">{{ 'plugins.elevation.infoPanel.retryBtn.label' | translate }}</md-button>
            <md-button id="rv-elevation-retry-btn" class="md-raised" ng-click="refresh()" ng-if="isDirty">{{ 'plugins.elevation.infoPanel.refreshBtn.label' | translate }}</md-button>

        </div>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`;

export const STATISTICS_INFO_PANEL_TEMPLATE = ` 
    <div id="elevation-rv-info-panel" ng-controller="InfoPanelCtrl" class="body">

        <div class="toolbar">

            <md-menu-bar class="menubar">

                <md-menu md-position-mode="target-left target">
                    <md-button
                        aria-label="Menu"
                        ng-disabled="status === 'loading'"
                        class="md-icon-button black"
                        ng-click="$mdOpenMenu($event)">
                        <md-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                            <g><path d="M0,0h24v24H0V0z" fill="none"/><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></g>
                            </svg>
                        </md-icon>
                        <md-tooltip>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-stats-source-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate | uppercase }}</span>
                        </md-menu-item>
                        <md-menu-divider class="rv-lg"></md-menu-divider>
                        <md-menu-item>
                            <md-button ng-click="handleStatsSourceChange('cdem')">
                                <span style='flex-basis: auto; overflow-wrap:normal;'>{{ 'plugins.elevation.infoPanel.statsSource.cdem' | translate }}</span>
                                <md-icon md-svg-icon="action:done" ng-if="'cdem' === statsSource"></md-icon>
                            </md-button>
                        </md-menu-item>
                        <md-menu-item>
                        <md-button ng-click="handleStatsSourceChange('cdsm')">
                            <span style='flex-basis: auto; overflow-wrap:normal;'>{{ 'plugins.elevation.infoPanel.statsSource.cdsm' | translate }}</span>
                            <md-icon md-svg-icon="action:done" ng-if="'cdsm' === statsSource"></md-icon>
                        </md-button>
                    </md-menu-item>
                    </md-menu-content>
                </md-menu>

            </md-menu-bar>

        </div>

        <div class="content" style="overflow-y: auto;">

            <div class="rv-elevation-infopanel-statistics-table" ng-class="{ 'disabled': status === 'loading', 'hidden': !isStatisticsTableVisible()}">

                <table class="md-table">
                    <thead class="md-head">
                        <tr class="md-row">
                            <th class="md-column">
                                <span>{{ 'plugins.elevation.infoPanel.stats.elevation.label' | translate }}</span>
                            </th>
                            <th class="md-column md-numeric">
                            <span>{{ 'plugins.elevation.infoPanel.stats.elevation.unit' | translate }}</span>
                        </th>
                        </tr>
                    </thead>
                    <tbody class="md-body">
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.elevation.min' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.elevation.min}}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.elevation.max' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.elevation.max}}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.elevation.mean' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.elevation.mean}}</td>
                        </tr>
                    </tbody>
                    <thead class="md-head">
                        <tr class="md-row">
                            <th class="md-column">
                                <span>{{ 'plugins.elevation.infoPanel.stats.slope.label' | translate }}</span>
                            </th>
                            <th class="md-column md-numeric">
                                <span>{{ 'plugins.elevation.infoPanel.stats.slope.unit' | translate }}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="md-body">
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.slope.min' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.slope.min}}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.slope.max' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.slope.max}}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.slope.mean' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.slope.mean}}</td>
                        </tr>
                    </tbody>
                    <thead class="md-head">
                        <tr class="md-row">
                            <th class="md-column">
                                <span>{{ 'plugins.elevation.infoPanel.stats.aspect.label' | translate }}</span>
                            </th>
                            <th class="md-column md-numeric">
                                <span>{{ 'plugins.elevation.infoPanel.stats.aspect.unit' | translate }}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="md-body">
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.north' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.aspect.north}}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.south' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.aspect.south}}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.west' | translate }}</td>
                            <td class="md-cell md-numeric">{{result.aspect.west}}</td>
                        </tr>
                        <tr class="md-row">
                        <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.east' | translate }}</td>
                        <td class="md-cell md-numeric">{{result.aspect.east}}</td>
                    </tr>
                    <tr class="md-row">
                    <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.flat' | translate }}</td>
                    <td class="md-cell md-numeric">{{result.aspect.flat}}</td>
                </tr>
                    </tbody>
                </table>

            </div>

            <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()" ng-if="status === 'error'">{{ 'plugins.elevation.infoPanel.retryBtn.label' | translate }}</md-button>
            <md-button id="rv-elevation-retry-btn" class="md-raised" ng-click="refresh()" ng-if="isDirty">{{ 'plugins.elevation.infoPanel.refreshBtn.label' | translate }}</md-button>

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
