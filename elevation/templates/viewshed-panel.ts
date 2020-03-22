export const VIEWSHED_PANEL_TEMPLATE = ` 
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

            </md-menu-bar>

        </div>

        <hr/>

        <div class="content" style="height: auto;">

            <div style="display: flex; flex: 1; flex-direction: column; width: 100%; padding: 20px 20px 0px 20px;">

                <label>{{ 'plugins.elevation.resultPanel.viewshedOffsetLabel' | translate }}</label>

                <md-slider-container flex style="margin-top: 10px;">
                    <md-slider flex ng-disabled="status === 'loading'" min="0" max="{{maxViewshedOffset}}" ng-change="handleViewshedOffsetChange()" ng-model="viewshedOffset" class="md-primary"></md-slider>
                    <input type="number" step="any" max="{{maxViewshedOffset}}" style="padding: 0px 12px; width: 70px; height: 36px; line-height: 48px; font-size: 14px; text-align: right; max-width: inherit; border: 1px solid rgb(221, 221, 221);" ng-model="viewshedOffset" ng-change="handleViewshedOffsetChange()"/>
                </md-slider-container>

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
            {{ 'plugins.elevation.resultPanel.refreshViewshedBtn.label' | translate }}
        </md-button>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`
