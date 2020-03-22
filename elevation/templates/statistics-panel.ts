export const STATISTICS_PANEL_TEMPLATE = ` 
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

        <div class="content" style="margin-right: 15px; margin-bottom: 0px;">

            <div class="rv-elevation-resultpanel-statistics-table" ng-class="{ 'disabled': status === 'loading', 'hidden': !isStatisticsTableVisible()}">

                <table class="md-table">
                    <thead class="md-head">
                        <tr class="md-row">
                            <th class="md-column">
                                <span>{{ 'plugins.elevation.resultPanel.stats.elevation.label' | translate }}</span>
                            </th>
                            <th class="md-column md-numeric">
                            <span>{{ 'plugins.elevation.resultPanel.stats.elevation.unit' | translate }}</span>
                        </th>
                        </tr>
                    </thead>
                    <tbody class="md-body">
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.elevation.min' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.elevation.min) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.elevation.max' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.elevation.max) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.elevation.mean' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.elevation.mean) }}</td>
                        </tr>
                    </tbody>
                    <thead class="md-head">
                        <tr class="md-row">
                            <th class="md-column">
                                <span>{{ 'plugins.elevation.resultPanel.stats.slope.label' | translate }}</span>
                            </th>
                            <th class="md-column md-numeric">
                                <span>{{ 'plugins.elevation.resultPanel.stats.slope.unit' | translate }}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="md-body">
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.slope.min' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.slope.min) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.slope.max' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.slope.max) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.slope.mean' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.slope.mean) }}</td>
                        </tr>
                    </tbody>
                    <thead class="md-head">
                        <tr class="md-row">
                            <th class="md-column">
                                <span>{{ 'plugins.elevation.resultPanel.stats.aspect.label' | translate }}</span>
                            </th>
                            <th class="md-column md-numeric">
                                <span>{{ 'plugins.elevation.resultPanel.stats.aspect.unit' | translate }}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="md-body">
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.aspect.north' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.north * 100, 0) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.aspect.south' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.south * 100, 0) }}</td>
                        </tr>
                        <tr class="md-row">
                            <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.aspect.west' | translate }}</td>
                            <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.west * 100, 0) }}</td>
                        </tr>
                        <tr class="md-row">
                        <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.aspect.east' | translate }}</td>
                        <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.east * 100, 0) }}</td>
                    </tr>
                    <tr class="md-row">
                    <td class="md-cell">{{ 'plugins.elevation.resultPanel.stats.aspect.flat' | translate }}</td>
                    <td class="md-cell md-numeric">{{ getFormattedValue(result.aspect.flat * 100, 0) }}</td>
                </tr>
                    </tbody>
                </table>

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
            {{ 'plugins.elevation.resultPanel.refreshStatsBtn.label' | translate }}
        </md-button>

        <md-progress-linear md-mode="indeterminate" ng-disabled="status !== 'loading'"></md-progress-linear>

    </div>
`;