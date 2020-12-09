// Config

export const PROFILE_SERVICE_DEFAULT_URL = 'https://datacube-dev.services.geo.ca/datacube/services/elevation/{{source}}/profile';
export const STATISTICS_SERVICE_DEFAULT_URL = 'https://datacube-dev.services.geo.ca/datacube/services/elevation/{{source}}/stats';
export const VIEWSHED_SERVICE_DEFAULT_URL = 'https://datacube-dev.services.geo.ca/datacube/services/elevation/{{source}}/viewshed.json';

export const DEFAULT_ELEVATION_SOURCES = ['hrdsm', 'hrdtm'];

// Symbols for drawing interactions and results

export const DEFAULT_DRAW_FILL_SYMBOL_COLOR = 'rgba(217,205,229, 0.5)';
export const DEFAULT_DRAW_LINE_SYMBOL_COLOR = '#6A50A3';

export const DEFAULT_DRAW_VERTEX_SYMBOL_SIZE = 8;
export const DEFAULT_DRAW_LINE_SYMBOL_SIZE = 1;

export const DEFAULT_RADIUS_LINE_SYMBOL_COLOR = '#000';
export const DEFAULT_RADIUS_LINE_SYMBOL_SIZE = 2;
export const DEFAULT_RADIUS_FILL_SYMBOL_COLOR = 'rgba(0, 0, 0, 0.1)';

export const PROFILE_CHART_FONT_FAMILY = 'Roboto, "Helvetica Neue", sans-serif';
export const PROFILE_CHART_FONT_SIZE = 14;

// Busines-logic

export const DEFAULT_COORDINATE_ROUNDING_SCALE = 6;

export const VIEWSHED_DEFAULT_OFFSET = 100;
export const VIEWSHED_MAX_OFFSET = 1000;

export const VIEWSHED_ZOOM_LEVEL_TO_RADIUS_MAP = {
   8 : 50000,
   9 : 30000,
  10 : 10000,
  11 : 7500,
  12 : 5000,
  13 : 2500,
  14 : 1000,
  15 : 1000,
  16 : 1000
}

export const PROFILE_STEP_FACTORS = [5, 10, 20, 50, 100];
export const PROFILE_DEFAULT_STEP_FACTOR = 10;

// UI

export const RESULT_PANEL_ID = 'elevationResultPanel';
export const INFOTIP_PANEL_ID = 'elevationInfoTipPanel';

export const DRAWING_LAYER_ID = 'rvElevationDrawing';
export const RESULTS_LAYER_ID = 'rvElevationResults';