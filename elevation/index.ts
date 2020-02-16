// import { UIManager } from './ui-manager';
import { UI } from './ui';

export default class ElevationServicePlugin {

  private mapApi;

  private isPluginActive;

  private pluginButton;
  private ui;

  togglePluginState() {

    let isActive = this.isPluginActive;

    if (isActive) {
      this.deactivate();
    } else {
      this.activate();
    }

    this.pluginButton.isActive = !isActive;
    this.isPluginActive = !isActive;

  }

  activate() {
    this.ui.show();
  }

  deactivate() {
    this.ui.hide();
  }


  init(mapApi: any) {

    this.isPluginActive = false;

    let config = this._RV.getConfig('plugins').elevation;
    config.language = this._RV.getCurrentLang();

    // if (!this.toolbar) {
      console.info('Initializing UI...');
      this.ui = new UI(mapApi, config, null);
    // }

    this.pluginButton = mapApi.mapI.addPluginButton(
      ElevationServicePlugin.prototype.translations[config.language].pluginButton,
      this.togglePluginState.bind(this)
    );

    console.info('Elevation service plugin loaded...');

  }

  destroy() {
    this.ui.destroy();
    console.info('Elevation service plugin destroyed...');
  }

}

export default interface ElevationServiceInterface {

  _RV: any;
  translations: any;

}

ElevationServicePlugin.prototype.translations = {
  'en-CA': {
    pluginButton: 'Elevation Service',
    toolbar: {
      profile: {
        label: 'Elevation Profile',
        tooltip: 'Elevation Profile'
      },
      statistics: {
        label: 'Elevation Statistics',
        tooltip: 'Elevation Statistics'
      }
    },
    infoPanel: {
      header: {
        downloadBtn: {
          tooltip: 'Download as JSON'
        }
      },
      stepMenuBtn: {
        tooltip: 'Number of steps'
      }
    }

      // draw: {
      //     menu: 'Draw Toolbar',
      //     picker: 'Select color',
      //     point: 'Draw point',
      //     line: 'Draw line',
      //     polygon: 'Draw polygon',
      //     measure: 'Show/Hide measures',
      //     extent: 'Erase selected graphics',
      //     write: 'Save to download folder',
      //     read: 'Upload graphics file'
      // }
  },
  'fr-CA': {
    pluginButton: 'Service d\'élévation',
    toolbar: {
      profile: {
        label: 'Profil d\'élévation',
        tooltip: 'Profil d\'élévation'
      },
      statistics: {
        label: 'Statistiques d\'élévation',
        tooltip: 'Statistiques d\'élévation'
      }
    },
    infoPanel: {
      header: {
        downloadButton: {
          tooltip: 'Télécharger en format JSON'
        }
      },
      stepMenuBtn: {
        tooltip: 'Nombre de points à interpoler'
      }
    }


      // draw: {
      //     menu: 'Barre de dessin',
      //     picker: 'Sélectionner la couleur',
      //     point: 'Dessiner point',
      //     line: 'Dessiner ligne',
      //     polygon: 'Dessiner polygon',
      //     measure: 'Afficher/Cacher les mesures',
      //     extent: 'Effacer les graphiques sélectionnés',
      //     write: 'Sauvegarder dans le répertoire téléchargement',
      //     read: 'Charger le fichier de graphiques'
      // }
  }
};

(<any>window).elevation = ElevationServicePlugin;