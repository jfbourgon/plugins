import storage from './simple-storage';
import { INFO_TIP_PANEL_TEMPLATE } from './templates'

const INFO_TIP_PANEL_ID = 'elevationInfoTipPanel';

export default class InfoPanel {

  private mapApi: any;
  private panel: any;


  constructor (mapApi: any) {

    this.mapApi = mapApi;

  }

  show () {

    const infoTipPanel = this.mapApi.panels.create(INFO_TIP_PANEL_ID, 1); // 1 is for creating a modal dialog

    infoTipPanel.header.title = this.mapApi.getTranslatedText('plugins.elevation.pluginName');

    infoTipPanel.element.addClass('ag-theme-material mobile-fullscreen tablet-fullscreen rv-elevation-dialog-hidden');

    infoTipPanel.element.css({
      top: '50%',
      left: '50%',
      width: '500px',
      height: '360px',
      marginLeft: '-250px',
      marginTop: '-180px'
    });

    const that = this;

    this.mapApi.agControllerRegister('InfoTipPanelCtrl', function() {

      this.dismiss = function() {
        storage('skipInfoTipDialog', 'true');
        infoTipPanel.close();
      }

    });

    infoTipPanel.closing.subscribe(e => {

      const { panel, code } = e;

      panel.element.addClass('hidden');
      $('.dialog-container').removeClass('rv-elevation-dialog-container');

      panel.destroy();

    });

    let panelTemplate = $(INFO_TIP_PANEL_TEMPLATE);

    this.mapApi.$compile(panelTemplate);
    infoTipPanel.body.empty();
    infoTipPanel.body.prepend(panelTemplate);

    infoTipPanel.open();

    this.panel = infoTipPanel;

  }

}