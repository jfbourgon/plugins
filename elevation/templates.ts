
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
    </div>
`;

export const PROFILE_INFO_PANEL_TEMPLATE = ` 
    <div id="elevation-rv-info-panel" ng-controller="InfoPanelCtrl" class="body">

        <div class="toolbar">

            <md-menu-bar class="menubar">

                <md-menu md-position-mode="target-left target">
                    <md-button
                        aria-label="Menu"
                        ng-disabled="status === 'loading'"
                        class="black"
                        style="margin: 0px;"
                        ng-click="$mdOpenMenu($event)"
                    >
                        {{ ('plugins.elevation.infoPanel.statsSource.' + statsSource) | translate }}
                        <md-tooltip>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-stats-source-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate | uppercase }}</span>
                        </md-menu-item>
                        <md-menu-divider class="rv-lg"></md-menu-divider>
                        <md-menu-item ng-repeat="source in statsSources">
                            <md-button ng-click="handleStatsSourceChange(source)">
                                <span style='flex-basis: auto; overflow-wrap:normal;'>{{ ('plugins.elevation.infoPanel.statsSource.' + source) | translate }}</span>
                                <md-icon md-svg-icon="action:done" ng-if="source === statsSource"></md-icon>
                            </md-button>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>

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

            </md-menu-bar>
            <md-menu-bar class="menubar">

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

            <div class="rv-elevation-retry-btn-container" ng-if="status === 'error'">
                <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()">{{ 'plugins.elevation.infoPanel.retryBtn.label' | translate }}</md-button>
            </div>

        </div>

        <md-button class="md-primary" id="rv-elevation-refresh-btn" ng-click="refresh()" ng-disabled="!isDirty" ng-class="{ 'disabled': isDirty === false }">
            <md-icon style="position: relative; top: -2px;">
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                    <g><g><g><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></g></g></g>
                </svg>
            </md-icon>
            {{ 'plugins.elevation.infoPanel.refreshChartBtn.label' | translate }}
        </md-button>

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
                        class="black"
                        style="margin: 0px;"
                        ng-click="$mdOpenMenu($event)"
                    >
                        {{ ('plugins.elevation.infoPanel.statsSource.' + statsSource) | translate }}
                        <md-tooltip>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-stats-source-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate | uppercase }}</span>
                        </md-menu-item>
                        <md-menu-divider class="rv-lg"></md-menu-divider>
                        <md-menu-item ng-repeat="source in statsSources">
                            <md-button ng-click="handleStatsSourceChange(source)">
                                <span style='flex-basis: auto; overflow-wrap:normal;'>{{ ('plugins.elevation.infoPanel.statsSource.' + source) | translate }}</span>
                                <md-icon md-svg-icon="action:done" ng-if="source === statsSource"></md-icon>
                            </md-button>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>

            </md-menu-bar>

        </div>

        <div class="content" style="margin-right: 15px; margin-bottom: 0px;">

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
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.elevation.min) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.elevation.max' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.elevation.max) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.elevation.mean' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.elevation.mean) }}</td>
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
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.slope.min) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.slope.max' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.slope.max) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.slope.mean' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.slope.mean) }}</td>
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
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.north * 100, 0) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.south' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.south * 100, 0) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.west' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.west * 100, 0) }}</td>
                        </tr>
                        <tr class="md-row">
                        <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.east' | translate }}</td>
                        <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.east * 100, 0) }}</td>
                    </tr>
                    <tr class="md-row">
                    <td class="md-cell">{{ 'plugins.elevation.infoPanel.stats.aspect.flat' | translate }}</td>
                    <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.flat * 100, 0) }}</td>
                </tr>
                    </tbody>
                </table>

            </div>

            <div class="rv-elevation-retry-btn-container" ng-if="status === 'error'">
                <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()">{{ 'plugins.elevation.infoPanel.retryBtn.label' | translate }}</md-button>
            </div>

        </div>

        <md-button class="md-primary" id="rv-elevation-refresh-btn" ng-click="refresh()" ng-disabled="!isDirty" ng-class="{ 'disabled': isDirty === false }">
            <md-icon style="position: relative; top: -2px;">
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                    <g><g><g><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></g></g></g>
                </svg>
            </md-icon>
            {{ 'plugins.elevation.infoPanel.refreshStatsBtn.label' | translate }}
        </md-button>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`;


export const VIEWSHED_INFO_PANEL_TEMPLATE = ` 
    <div id="elevation-rv-info-panel" ng-controller="InfoPanelCtrl" class="body">

        <div class="toolbar">

            <md-menu-bar class="menubar">

                <md-menu md-position-mode="target-left target">
                    <md-button
                        aria-label="Menu"
                        ng-disabled="status === 'loading'"
                        class="black"
                        style="margin: 0px;"
                        ng-click="$mdOpenMenu($event)"
                    >
                        {{ ('plugins.elevation.infoPanel.statsSource.' + statsSource) | translate }}
                        <md-tooltip>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-stats-source-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.infoPanel.statsSourceMenuBtn.tooltip' | translate | uppercase }}</span>
                        </md-menu-item>
                        <md-menu-divider class="rv-lg"></md-menu-divider>
                        <md-menu-item ng-repeat="source in statsSources">
                            <md-button ng-click="handleStatsSourceChange(source)">
                                <span style='flex-basis: auto; overflow-wrap:normal;'>{{ ('plugins.elevation.infoPanel.statsSource.' + source) | translate }}</span>
                                <md-icon md-svg-icon="action:done" ng-if="source === statsSource"></md-icon>
                            </md-button>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>

            </md-menu-bar>

        </div>

        <hr/>

        <div class="content" style="height: auto;">

            <div style="display: flex; flex: 1; flex-direction: column; width: 100%; padding: 20px 20px 0px 20px;">

                <label>{{ 'plugins.elevation.infoPanel.viewshedOffsetLabel' | translate }}</label>

                <md-slider-container flex style="margin-top: 10px;">
                    <md-slider flex ng-disabled="status === 'loading'" min="0" max="{{maxViewshedOffset}}" ng-change="handleViewshedOffsetChange()" ng-model="viewshedOffset" class="md-primary"></md-slider>
                    <input type="number" step="any" max="{{maxViewshedOffset}}" style="padding: 0px 12px; width: 70px; height: 36px; line-height: 48px; font-size: 14px; text-align: right; max-width: inherit; border: 1px solid rgb(221, 221, 221);" ng-model="viewshedOffset" ng-change="handleViewshedOffsetChange()"/>
                </md-slider-container>

            </div>

            <div class="rv-elevation-retry-btn-container" ng-if="status === 'error'">
                <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()">{{ 'plugins.elevation.infoPanel.retryBtn.label' | translate }}</md-button>
            </div>

        </div>

        <md-button class="md-primary" id="rv-elevation-refresh-btn" ng-click="refresh()" ng-disabled="!isDirty" ng-class="{ 'disabled': isDirty === false }">
            <md-icon style="position: relative; top: -2px;">
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                    <g><g><g><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></g></g></g>
                </svg>
            </md-icon>
            {{ 'plugins.elevation.infoPanel.refreshViewshedBtn.label' | translate }}
        </md-button>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`

export const INFO_TIP_PANEL_TEMPLATE = ` 
    <div id="elevation-rv-info-tip" class="body" ng-controller="InfoTipPanelCtrl as ctrl">
        <div class="content" style="flex-direction: column; align-items: flex-start;">
            <div style="display: flex; flex-direction: row; align-items: center;">
                <md-icon style="margin-right: 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                    <g><g><g><path d="M3.5,18.5L9.5,12.5L13.5,16.5L22,6.92L20.59,5.5L13.5,13.5L9.5,9.5L2,17L3.5,18.5Z"/></g></g></g>                    </svg>
                </md-icon>
                <p style="flex: 1;" ng-bind-html="'plugins.elevation.infoTipPanel.profileText' | translate"></p>
            </div>
            <div style="display: flex; flex-direction: row; align-items: center;">
                <md-icon style="margin-right: 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                    <g><g><g><path d="M3,21V17.29L10.78,12.8L14.55,15L21,11.25V21H3M21,8.94L14.55,12.67L10.78,10.5L3,15V12.79L10.78,8.3L14.55,10.5L21,6.75V8.94Z"/></g></g></g>
                    </svg>
                </md-icon>
                <p style="flex: 1;" ng-bind-html="'plugins.elevation.infoTipPanel.statisticsText' | translate"></p>
            </div>
            <div style="display: flex; flex-direction: row; align-items: center;">
                <md-icon style="margin-right: 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                        <g><g><g><path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/></g></g></g>
                    </svg>
                </md-icon>
                <p style="flex: 1;" ng-bind-html="'plugins.elevation.infoTipPanel.viewshedText' | translate"></p>
            </div>
        </div>
        <div class="footer">
            <md-button class="black md-ink-ripple md-primary" ng-click="ctrl.dismiss()">
                {{ 'plugins.elevation.infoTipPanel.okBtn.label' | translate }}
            </md-button>
        </div>
    </div>
`

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
