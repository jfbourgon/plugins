export const PROFILE_PANEL_TEMPLATE = ` 
    <div id="elevation-rv-result-panel" ng-controller="ResultPanelCtrl" class="body">

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
                        {{ ('plugins.elevation.resultPanel.statsSource.' + statsSource) | translate }}
                        <md-tooltip>{{ 'plugins.elevation.resultPanel.statsSourceMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-stats-source-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.resultPanel.statsSourceMenuBtn.tooltip' | translate | uppercase }}</span>
                        </md-menu-item>
                        <md-menu-divider class="rv-lg"></md-menu-divider>
                        <md-menu-item ng-repeat="source in statsSources">
                            <md-button ng-click="handleStatsSourceChange(source)">
                                <span style='flex-basis: auto; overflow-wrap:normal;'>{{ ('plugins.elevation.resultPanel.statsSource.' + source) | translate }}</span>
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
                        <md-tooltip>{{ 'plugins.elevation.resultPanel.stepMenuBtn.tooltip' | translate }}</md-tooltip>
                    </md-button>
                    <md-menu-content class="rv-menu rv-dense rv-elevation-step-menu">
                        <md-menu-item ng-disabled={true}>
                            <span style='flex-basis: auto; overflow-wrap:normal; font-size: 0.7rem; color: #aaa;'>{{ 'plugins.elevation.resultPanel.stepMenuBtn.tooltip' | translate | uppercase }}</span>
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

                <md-switch ng-model="smoothProfile" ng-disabled="status === 'loading'" ng-if="mode === 'profile'" class="md-primary" aria-label="{{ 'plugins.elevation.resultPanel.smoothProfileBtn.label' | translate }}" ng-change="handleSmoothChange()">
                    <md-label>{{ 'plugins.elevation.resultPanel.smoothProfileBtn.label' | translate }}</md-label>
                </md-switch>

            </md-menu-bar>

        </div>

        <div class="content">

            <div class="rv-elevation-resultpanel-chart" ng-class="{ 'disabled': status === 'loading', 'hidden': !isProfileChartVisible()}">
                <canvas id="rv-elevation-chart" style="width: 100%; height: 100%;" role="img" aria-label="{{ 'plugins.elevation.resultPanel.chart.label' | translate }}">
                    <p>{{ 'plugins.elevation.resultPanel.chart.label' | translate }}</p>
                    <span id="elevation-chart-x-axis-label" class="hidden">{{ 'plugins.elevation.resultPanel.chart.xAxisLabel' | translate }}</span>
                    <span id="elevation-chart-y-axis-label" class="hidden">{{ 'plugins.elevation.resultPanel.chart.yAxisLabel' | translate }}</span>
                </canvas>
            </div>

            <div class="rv-elevation-retry-btn-container" ng-if="status === 'error'">
                <md-button id="rv-elevation-retry-btn" class="md-raised md-warn" ng-click="refresh()">{{ 'plugins.elevation.resultPanel.retryBtn.label' | translate }}</md-button>
            </div>

        </div>

        <md-button class="md-primary" id="rv-elevation-refresh-btn" ng-click="refresh()" ng-disabled="!isDirty" ng-class="{ 'disabled': isDirty === false }">
            <md-icon style="position: relative; top: -2px;">
                <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false">
                    <g><g><g><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/></g></g></g>
                </svg>
            </md-icon>
            {{ 'plugins.elevation.resultPanel.refreshChartBtn.label' | translate }}
        </md-button>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`;