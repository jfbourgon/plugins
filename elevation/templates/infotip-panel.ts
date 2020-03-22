export const INFOTIP_PANEL_TEMPLATE = ` 
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
