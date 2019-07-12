import { pinImg, hasPic, noPic } from './html-assets';

class CustomExport {
    feature: string = 'export';

    // A store of the instances of areasOfInterest, 1 per map
    static instances: { [id: string]: CustomExport } = {};

    preInit() {
        console.log('blah');
    }

    init(api: any) {
        this.api = api;

        CustomExport.instances[this.api.id] = this;
    }
}

interface CustomExport {
    translations: any;
    config: any;
    api: any;
    _RV: any;
}

CustomExport.prototype.translations = {
    'en-CA': {
        title: 'Areas of Interest'
    },
    'fr-CA': {
        title: `Zones d'intérêt`
    }
};

(<any>window).customExport = CustomExport;
