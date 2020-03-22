
export const DOWNLOAD_BUTTON_TEMPLATE = `
<md-button
ng-controller="DownloadBtnCtrl as ctrl"
    class="md-icon-button black md-ink-ripple"
    ng-disabled="ctrl.isButtonDisabled()"
    ng-click="ctrl.downloadResultsAsJson()"
>
    <md-tooltip>{{ 'plugins.elevation.resultPanel.header.downloadBtn.tooltip' | translate }}</md-tooltip>
    <md-icon>
        <svg xmlns="http://www.w3.org/2000/svg" fit height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 -1 24 24" focusable="false">
            <g>
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/>
            </g>
        </svg>
    </md-icon>
</md-button>
`
