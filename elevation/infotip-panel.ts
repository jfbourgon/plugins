import storage from './simple-storage';

import { INFOTIP_PANEL_TEMPLATE } from './templates/infotip-panel'
import { INFOTIP_PANEL_ID } from './constants.js';

const PANEL_CSS = {
  top: '50%',
  left: '50%',
  width: '500px',
  height: '360px',
  marginLeft: '-250px',
  marginTop: '-180px'
};

export default class InfoTipPanel {

  private mapApi: any;

  constructor (mapApi: any) {
    this.mapApi = mapApi;
  }

  show () {

    const infoTipPanel = this.mapApi.panels.create(INFOTIP_PANEL_ID, 1); // 1 is for creating a modal dialog

    infoTipPanel.header.title = this.mapApi.getTranslatedText('plugins.elevation.pluginName');

    infoTipPanel.element.addClass('ag-theme-material mobile-fullscreen tablet-fullscreen rv-elevation-dialog-hidden');
    infoTipPanel.element.css(PANEL_CSS);

    const that = this;

    this.mapApi.agControllerRegister('InfoTipPanelCtrl', function() {

      this.dismiss = function() {

        // set flag not to show dialog again
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

    let panelTemplate = $(INFOTIP_PANEL_TEMPLATE);

    this.mapApi.$compile(panelTemplate);
    infoTipPanel.body.empty();
    infoTipPanel.body.prepend(panelTemplate);

    infoTipPanel.open();

  }

}