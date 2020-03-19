
import { UI } from './ui';

import { DEFAULT_ELEVATION_SOURCES, PROFILE_SERVICE_DEFAULT_URL, STATISTICS_SERVICE_DEFAULT_URL, VIEWSHED_SERVICE_DEFAULT_URL } from './constants';

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

  parseConfig(config) {

    let servicesTypes = {
      profile: PROFILE_SERVICE_DEFAULT_URL,
      statistics: STATISTICS_SERVICE_DEFAULT_URL,
      viewshed: VIEWSHED_SERVICE_DEFAULT_URL
    };

    let defaultServices = {};

    Object.keys(servicesTypes).forEach(serviceType => {

      let conf = config.services && config.services[serviceType];

      let servicesMap = new Map();

      let sources = conf && conf.sources;
      let dataSources = (Array.isArray(sources) && sources.length > 0) ? sources : DEFAULT_ELEVATION_SOURCES;

      let urlTemplate = (conf && conf.url) || servicesTypes[serviceType];

      dataSources.forEach(source => {
        servicesMap.set(source, urlTemplate.replace(/{{source}}/g, source));
      });

      let services = {};
      servicesMap.forEach((value, key, map) => {
        services[key] = value;
      });

      defaultServices[serviceType] = services;

    })

    return {
      services: defaultServices,
      language: this._RV.getCurrentLang()
    };

  }

  init(mapApi: any) {

    this.isPluginActive = false;

    mapApi.getTranslatedText = function (stringId) {

      const template = `<div>{{ '` + stringId + `' | translate }}</div>`;

      let $el = $(template);
      this.$compile($el);

      const text = $el.text();

      $el = null;

      return text;

    }

    let config = this.parseConfig(this._RV.getConfig('plugins').elevation);

    this.ui = new UI(mapApi, config);

    this.pluginButton = mapApi.mapI.addPluginButton(
      ElevationServicePlugin.prototype.translations[config.language].pluginName,
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
    pluginName: 'Elevation Service',
    toolbar: {
      profile: {
        label: 'Elevation Profile',
        tooltip: 'Elevation Profile'
      },
      statistics: {
        label: 'Elevation Statistics',
        tooltip: 'Elevation Statistics'
      },
      viewshed: {
        label: 'Viewshed Analysis',
        tooltip: 'Viewshed Analysis'
      }
    },
    infoTipPanel: {
      okBtn: {
        label: 'Thank you, I understand...'
      },
      profileText: `The <strong>Elevation Profile</strong> tool allows displaying the relief representing the intersection of a line segment with different elevation models.`,
      statisticsText: `The <strong>Elevation Statistics</strong> tool allows the calculation of a series of statistics related to the relief located inside a polygon according to different elevation models.`,
      viewshedText: `The <strong>Viewshed Analysis</strong> tool provides a representation of the portion of the landscape visible from a point of view according to different elevation models.`
    },
    infoPanel: {
      title: {
        profile: 'Elevation Profile',
        statistics: 'Elevation Statistics',
        viewshed: 'Viewshed Analysis'
      },
      header: {
        downloadBtn: {
          tooltip: 'Download result as JSON'
        }
      },
      stepMenuBtn: {
        tooltip: 'Number of interpolated points'
      },
      statsSourceMenuBtn: {
        tooltip: 'Elevation Data Source'
      },
      statsSource: {
        cdem: 'Elevation Model (CDEM)',
        cdsm: 'Surface Model (CDSM)',
        arcticdem2m: 'High Resolution Digital Surface Model',
      },
      stats: {
        elevation: {
          label: 'Elevation',
          unit: '(meters)',
          min: 'Minimum',
          max: 'Maximum',
          mean: 'Mean'
        },
        slope: {
          label: 'Slope',
          unit: '(%)',
          min: 'Minimum',
          max: 'Maximum',
          mean: 'Mean'
        },
        aspect: {
          label: 'Slope Aspect',
          unit: '(% of surface)',
          north: 'Northerly',
          south: 'Southerly',
          east: 'Easterly',
          west: 'Westerly',
          flat: 'Flat'
        },
      },
      smoothProfileBtn: {
        label: 'Smooth Profile'
      },
      retryBtn: {
        label: 'Try again'
      },
      refreshStatsBtn: {
        label: 'Refresh statistics'
      },
      refreshChartBtn: {
        label: 'Refresh chart'
      },
      refreshViewshedBtn: {
        label: 'Refresh viewshed'
      },
      chart: {
        label: 'Elevation Profile',
        xAxisLabel: 'Cumulative distance along profile (kilometers)',
        yAxisLabel: 'Elevation (meters)'
      },
      viewshedOffsetLabel: 'VERTICAL OFFSET (above surface, in meters)'
    }

  },
  'fr-CA': {
    pluginName: 'Service d\'élévation',
    toolbar: {
      profile: {
        label: 'Profil d\'élévation',
        tooltip: 'Profil d\'élévation'
      },
      statistics: {
        label: 'Statistiques d\'élévation',
        tooltip: 'Statistiques d\'élévation'
      },
      viewshed: {
        label: 'Analyse de visibilité',
        tooltip: 'Analyse de visibilité'
      }
    },
    infoTipPanel: {
      okBtn: {
        label: 'Merci, j\'ai compris...'
      },
      profileText: `L'outil <strong>Profil d'élévation</strong> permet d'obtenir un aperçu du relief représentant l'intersection d'un segment de ligne avec différents modèles d'élévation.`,
      statisticsText: `L'outil <strong>Statistiques d'élévation</strong> permet le calcul d'une série de statistiques concernant le relief situé à l'intérieur d'un polygone selon différents modèles d'élévation.`,
      viewshedText: `L'outil <strong>Analyse de visibilité</strong> permet d'obtenir une représentation de la portion du territoire visible à partir d'un point de vue selon différents modèles d'élévation.`
    },
    infoPanel: {
      title: {
        profile: 'Profil d\'élévation',
        statistics: 'Statistiques d\'élévation',
        viewshed: 'Analyse de visibilité'
      },
      header: {
        downloadBtn: {
          tooltip: 'Télécharger le résultat en format JSON'
        }
      },
      stepMenuBtn: {
        tooltip: 'Nombre de points à interpoler'
      },
      statsSourceMenuBtn: {
        tooltip: 'Source des données d\'élévation'
      },
      statsSource: {
        cdem: 'Modèle d\'élévation (CDEM)',
        cdsm: 'Modèle de surface (CDSM)',
        arcticdem2m: 'Modèle numérique de surface haute résolution',
      },
      stats: {
        elevation: {
          label: 'Élévation',
          unit: '(en mètres)',
          min: 'Minimum',
          max: 'Maximum',
          mean: 'Moyenne'
        },
        slope: {
          label: 'Pente',
          unit: '(en %)',
          min: 'Minimum',
          max: 'Maximum',
          mean: 'Moyenne'
        },
        aspect: {
          label: 'Orientation de la pente',
          unit: '(en % de la superficie)',
          north: 'Vers le nord',
          south: 'Vers le sud',
          east: 'Vers l\'est',
          west: 'Vers l\'ouest',
          flat: 'Aucune orientation (plat)'
        },
      },
      smoothProfileBtn: {
        label: 'Arrondir le tracé'
      },
      retryBtn: {
        label: 'Essayer à nouveau'
      },
      refreshBtn: {
        label: 'Actualiser'
      },
      refreshStatsBtn: {
        label: 'Actualiser les statistiques'
      },
      refreshChartBtn: {
        label: 'Actualiser le profil'
      },
      refreshViewshedBtn: {
        label: 'Actualiser la zone de visibilité'
      },
      chart: {
        label: 'Profil d\'élévation',
        xAxisLabel: 'Distance cumulée le long du profil (en kilomètres)',
        yAxisLabel: 'Élévation (en mètres)'
      },
      viewshedOffsetLabel: 'HAUTEUR DU POINT DE VUE (au-dessus de la surface, en mètres)'
    }

  }
};

(<any>window).elevation = ElevationServicePlugin;