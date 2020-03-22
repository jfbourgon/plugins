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