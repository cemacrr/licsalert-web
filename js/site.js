'use strict';

/** global variables: **/

/* store things in plot_vars: */
var plot_vars = {
  /* prefix for data: */
  'data_prefix': 'data/',
  /* store plot data here: */
  'plot_data': null,
  /* plotly plot config: */
  'plot_conf': {
    'showLink': false,
    'linkText': '',
    'displaylogo': false,
    'modeBarButtonsToRemove': [
      'autoScale2d',
      'lasso2d',
      'toggleSpikelines',
      'select2d'
    ],
    'responsive': true
  },
  /* div for dem plotting: */
  'dem_plot_div': document.getElementById('licsalert_dem_plot'),
  /* min and max for dem plotting: */
  'dem_min': 0,
  'dem_max': 1000,
  /* colorscale for dem plotting: */
  'dem_colorscale': [
    [0, 'rgb(85, 142, 49)'],
    [0.5, 'rgb(217, 216, 98)'],
    [1, 'rgb(96, 17, 5)'],
  ],

  /* div for cumulative ifg plotting: */
  'ifg_cml_plot_div': document.getElementById('licsalert_ifg_cml_plot'),

  /* div for incremental ifg plotting: */
  'ifg_inc_plot_div': document.getElementById('licsalert_ifg_inc_plot'),

  /* div for ic plotting: */
  'ic_plot_div': document.getElementById('licsalert_ic_plot'),
  /* div for time series plotting: */
  'ts_plot_div': document.getElementById('licsalert_ts_plot'),
  /* min and max for ic plotting: */
  'ic_min': -0.5,
  'ic_max': 0.5,
  /* colorscale for ic plotting: */
  'ic_colorscale': [
    [0, 'rgb(0, 0, 254)'],
    [0.5, 'rgb(255, 255 255)'],
    [1, 'rgb(254, 0, 0)']
  ],
  /* min and max for distance plotting: */
  'distance_min': 0,
  'distance_max': 5,
  /* colorscale for distance plotting: */
  'distance_colorscale': [
    [0, 'rgb(77, 8, 5)'],
    [0.4, 'rgb(253, 253, 4)'],
    [0.5, 'rgb(253, 253, 4)'],
    [0.6, 'rgb(253, 253, 4)'],
    [1, 'rgb(254, 0, 0)'],
  ],
  /* color for baseline plotting: */
  'baseline_color': '#9999ff'
};

/** functions: **/

/* data loading from json function: */
async function load_data(data_file) {
  /* url to data file: */
  let data_url = plot_vars['data_prefix'] + '/' + data_file;
  /* get data using fetch: */
  var data_req = await fetch(data_url);
  /* if successful: */
  if (data_req.status == 200) {
    /* store json information from request: */
    plot_vars['plot_data'] = await data_req.json();
  } else {
    /* log error: */
    console.log('* failed to load data from: ' + data_url);
    /* plot data is null: */
    plot_vars['plot_data'] = null;
  };
};


/* data plotting function: */
function plot_data() {

  /* get required plotting variables: */
  var plot_conf = plot_vars['plot_conf'];

  var ifg_cml_plot_div = plot_vars['ifg_cml_plot_div'];

  var ifg_inc_plot_div = plot_vars['ifg_inc_plot_div'];

  var dem_plot_div = plot_vars['dem_plot_div'];
  var dem_min = plot_vars['dem_min'];
  var dem_max = plot_vars['dem_max'];
  var dem_colorscale = plot_vars['dem_colorscale'];
  var ic_plot_div = plot_vars['ic_plot_div'];
  var ts_plot_div = plot_vars['ts_plot_div'];
  var ic_min = plot_vars['ic_min'];
  var ic_max = plot_vars['ic_max'];
  var ic_colorscale = plot_vars['ic_colorscale'];
  var distance_min = plot_vars['distance_min'];
  var distance_max = plot_vars['distance_max'];
  var distance_colorscale = plot_vars['distance_colorscale'];
  var baseline_color = plot_vars['baseline_color'];
  /* get required data variables: */
  var plot_data = plot_vars['plot_data'];
  var dates_count = plot_data['dates_count'];
  var dates = plot_data['dates'];
  var baseline_end = plot_data['baseline_end'];
  var lats = plot_data['lats'];
  var lons = plot_data['lons'];
  var dem = plot_data['dem'];
  var ifgs_inc = plot_data['ifgs_inc'];
  var ifgs_cml = plot_data['ifgs_cml'];
  var ifgs_lats = plot_data['ifgs_lats'];
  var ifgs_lons = plot_data['ifgs_lons'];
  var tc_count = plot_data['tc_count'];
  var tc_sources = plot_data['tc_sources'];
  var tc_cml = plot_data['tc_cml'];
  var tc_distances = plot_data['tc_distances'];
  var tc_lines = plot_data['tc_lines'];
  var residuals = plot_data['residuals'];
  var residuals_lines = plot_data['residuals_lines'];

  /* calculate some possibly useful values: */
  var lats_min = Math.min.apply(Math, lats);
  var lats_max = Math.max.apply(Math, lats);
  var lons_min = Math.min.apply(Math, lons);
  var lons_max = Math.max.apply(Math, lons);
  var ifgs_lats_min = Math.min.apply(Math, ifgs_lats);
  var ifgs_lats_max = Math.max.apply(Math, ifgs_lats);
  var ifgs_lons_min = Math.min.apply(Math, ifgs_lons);
  var ifgs_lons_max = Math.max.apply(Math, ifgs_lons);


  /* cumulative ifg plot: */

  var ifg_cml = ifgs_cml[ifgs_cml.length - 1];
  var ifg_cml_min = Math.min.apply(Math, ifg_cml.flat());
  var ifg_cml_max = Math.max.apply(Math, ifg_cml.flat());

  var heatmap_ifg_cml_data = [];

  var heatmap_ifg_cml_hovertext = [];
  for (var i = 0; i < ifgs_lats.length; i++) {
    heatmap_ifg_cml_hovertext[i] = [];
    for (var j = 0; j < ifgs_lons.length; j++) {
      heatmap_ifg_cml_hovertext[i][j] = 'lat: ' + ifgs_lats[i] + '<br>' +
                                        'lon: ' + ifgs_lons[j] + '<br>' +
                                        ifg_cml[i][j];
      };
  };

  var heatmap_ifg_cml_colorbar = {
    'tickvals': [ifg_cml_min.toFixed(2), ifg_cml_max.toFixed(2)],
    'orientation': 'v',
    'thickness': 15,
    'len': 0.9
  };

  var heatmap_ifg_cml = {
    'type': 'heatmap',
    'x': ifgs_lons,
    'y': ifgs_lats,
    'z': ifg_cml,
    'zmin': ifg_cml_min,
    'zmax': ifg_cml_max,
    'colorscale': ic_colorscale,
    'colorbar': heatmap_ifg_cml_colorbar,
    'hoverinfo': 'text',
    'text': heatmap_ifg_cml_hovertext,
    'showlegend': false
  };
  heatmap_ifg_cml_data.push(heatmap_ifg_cml);

  var heatmap_ifg_cml_xticks = [];
  var heatmap_ifg_cml_yticks = [];
  var heatmap_ifg_cml_nticks = 2;
  var heatmap_ifg_cml_xtick_inc = (ifgs_lons_max - ifgs_lons_min) / (heatmap_ifg_cml_nticks * 2);
  for (var i = 0; i < heatmap_ifg_cml_nticks; i++) {
    heatmap_ifg_cml_xticks.push(
      (ifgs_lons_min + ((i + (i +1)) * heatmap_ifg_cml_xtick_inc)).toFixed(2)
    );
  };
  var heatmap_ifg_cml_ytick_inc = (ifgs_lats_max - ifgs_lats_min) / (heatmap_ifg_cml_nticks * 2);
  for (var i = 0; i < heatmap_ifg_cml_nticks; i++) {
    heatmap_ifg_cml_yticks.push(
      (ifgs_lats_min + ((i + (i +1)) * heatmap_ifg_cml_ytick_inc)).toFixed(2)
    );
  };

  var heatmap_ifg_cml_layout = {
    'title': {
      'text': ''
    },
    'xaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': heatmap_ifg_cml_xticks,
      'range': [ifgs_lons_min, ifgs_lons_max],
      'autorange': false,
      'constrain': 'domain',
      'scaleanchor': 'y',
      'scaleratio': 1,
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'yaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': heatmap_ifg_cml_yticks,
      'range': [ifgs_lats_min + 0.0001, ifgs_lats_max - 0.0001],
      'autorange': false,
      'constrain': 'domain',
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'modebar': {
      'orientation': 'h',
    },
    'margin': {
      't': 50,
      'b': 50,
      'r': 50,
      'l': 50
    },
  };

  var heatmap_ifg_cml_plot = Plotly.newPlot(
    ifg_cml_plot_div, heatmap_ifg_cml_data, heatmap_ifg_cml_layout, plot_conf
  );






  /* dem plot: */

  var heatmap_dem_data = [];

  var heatmap_dem_hovertext = [];
  for (var i = 0; i < lats.length; i++) {
    heatmap_dem_hovertext[i] = [];
    for (var j = 0; j < lons.length; j++) {
      heatmap_dem_hovertext[i][j] = 'lat: ' + lats[i] + '<br>' +
                                    'lon: ' + lons[j] + '<br>' +
                                    'elevation: ' + dem[i][j] + 'm';
      };
  };

  var heatmap_dem_colorbar = {
    'tickvals': [dem_min, dem_max],
    'orientation': 'v',
    'thickness': 15,
    'len': 0.9
  };

  var heatmap_dem = {
    'type': 'heatmap',
    'x': lons,
    'y': lats,
    'z': dem,
    'zmin': dem_min,
    'zmax': dem_max,
    'colorscale': dem_colorscale,
    'colorbar': heatmap_dem_colorbar,
    'hoverinfo': 'text',
    'text': heatmap_dem_hovertext,
    'showlegend': false
  };
  heatmap_dem_data.push(heatmap_dem);

  var heatmap_dem_xticks = [];
  var heatmap_dem_yticks = [];
  var heatmap_dem_nticks = 2;
  var heatmap_dem_xtick_inc = (lons_max - lons_min) / (heatmap_dem_nticks * 2);
  for (var i = 0; i < heatmap_dem_nticks; i++) {
    heatmap_dem_xticks.push(
      (lons_min + ((i + (i +1)) * heatmap_dem_xtick_inc)).toFixed(2)
    );
  };
  var heatmap_dem_ytick_inc = (lats_max - lats_min) / (heatmap_dem_nticks * 2);
  for (var i = 0; i < heatmap_dem_nticks; i++) {
    heatmap_dem_yticks.push(
      (lats_min + ((i + (i +1)) * heatmap_dem_ytick_inc)).toFixed(2)
    );
  };

  var heatmap_dem_layout = {
    'title': {
      'text': ''
    },
    'xaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': heatmap_dem_xticks,
      'range': [lons_min, lons_max],
      'autorange': false,
      'constrain': 'domain',
      'scaleanchor': 'y',
      'scaleratio': 1,
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'yaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': heatmap_dem_yticks,
      'range': [lats_min + 0.0001, lats_max - 0.0001],
      'autorange': false,
      'constrain': 'domain',
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'modebar': {
      'orientation': 'h',
    },
    'margin': {
      't': 50,
      'b': 50,
      'r': 50,
      'l': 50
    },
  };

  var heatmap_dem_plot = Plotly.newPlot(
    dem_plot_div, heatmap_dem_data, heatmap_dem_layout, plot_conf
  );


  /* ic plot: */

  var heatmap_data = [];

  var heatmap_hovertext = [];
  for (var i = 0; i < lats.length; i++) {
    heatmap_hovertext[i] = [];
    for (var j = 0; j < lons.length; j++) {
      heatmap_hovertext[i][j] = 'lat: ' + lats[i] + '<br>' +
                                'lon: ' + lons[j] + '<br>' +
                                'IC: ' + tc_sources[0][i][j] + 'm';
      };
  };

  var heatmap_colorbar = {
    'tickvals': [ic_min, ic_max],
    'orientation': 'v',
    'thickness': 15,
    'len': 0.9
  };

  var heatmap = {
    'type': 'heatmap',
    'x': lons,
    'y': lats,
    'z': tc_sources[0],
    'zmin': ic_min,
    'zmax': ic_max,
    'colorscale': ic_colorscale,
    'colorbar': heatmap_colorbar,
    'hoverinfo': 'text',
    'text': heatmap_hovertext,
    'showlegend': false
  };
  heatmap_data.push(heatmap);

  var heatmap_xticks = [];
  var heatmap_yticks = [];
  var heatmap_nticks = 2;
  var heatmap_xtick_inc = (lons_max - lons_min) / (heatmap_nticks * 2);
  for (var i = 0; i < heatmap_nticks; i++) {
    heatmap_xticks.push(
      (lons_min + ((i + (i +1)) * heatmap_xtick_inc)).toFixed(2)
    );
  };
  var heatmap_ytick_inc = (lats_max - lats_min) / (heatmap_nticks * 2);
  for (var i = 0; i < heatmap_nticks; i++) {
    heatmap_yticks.push(
      (lats_min + ((i + (i +1)) * heatmap_ytick_inc)).toFixed(2)
    );
  };

  var heatmap_layout = {
    'title': {
      'text': ''
    },
    'xaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': heatmap_xticks,
      'range': [lons_min, lons_max],
      'autorange': false,
      'constrain': 'domain',
      'scaleanchor': 'y',
      'scaleratio': 1,
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'yaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': heatmap_yticks,
      'range': [lats_min, lats_max],
      'autorange': false,
      'constrain': 'domain',
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'modebar': {
      'orientation': 'h',
    },
    'margin': {
      't': 50,
      'b': 50,
      'r': 50,
      'l': 50
    },
  };

  var heatmap_plot = Plotly.newPlot(
    ic_plot_div, heatmap_data, heatmap_layout, plot_conf
  );

  /* tc time series plot: */

  var scatter_data = [];

  var scatter_baseline = {
    'type': 'scatter',
    'name': '',
    'x': [baseline_end, baseline_end],
    'y': [distance_min, distance_max],
    'yaxis': 'y2',
    'mode': 'lines',
    'line': {
      'color': baseline_color
    },
    'opacity': 0.8,
    'hoverinfo': 'text',
    'text': 'baseline end: ' + baseline_end,
    'showlegend': false
  };
  scatter_data.push(scatter_baseline);

  var bar_hovertext = [];
  for (var i = 0; i < tc_distances[0].length; i++) {
    bar_hovertext.push(
      dates[i] + ': ' + tc_distances[0][i] + 'σ'
    );
  };

  var scatter_bar = {
    'type': 'bar',
    'name': '',
    'x': dates,
    'y': tc_distances[0],
    'yaxis': 'y2',
    'marker': {
      'color': tc_distances[0],
      'colorscale': distance_colorscale,
      'cmin': distance_min,
      'cmax': distance_max
    },
    'opacity': 0.4,
    'textposition': 'none',
    'hoverinfo': 'text',
    'text': bar_hovertext,
    'showlegend': false
  };
  scatter_data.push(scatter_bar);

  var scatter_lines = tc_lines[0];
  for (var i = 0; i < scatter_lines.length; i++) {
    var scatter_line = {
      'type': 'scatter',
      'name': '',
      'x': dates,
      'y': scatter_lines[i],
      'yaxis': 'y1',
      'mode': 'lines',
      'marker': {
        'color': '#999999',
      },
      'hoverinfo': 'none',
      'showlegend': false
    };
    scatter_data.push(scatter_line);
  };

  var scatter_colorbar = {
    'tickvals': [distance_min, distance_max],
    'orientation': 'v',
    'thickness': 15,
    'len': 0.9
  };

  var scatter_hovertext = [];
  for (var i = 0; i < tc_cml[0].length; i++) {
    scatter_hovertext.push(
      dates[i] + ': ' + tc_cml[0][i]
    );
  };

  var scatter = {
    'type': 'scatter',
    'name': '',
    'x': dates,
    'y': tc_cml[0],
    'yaxis': 'y1',
    'mode': 'markers',
    'marker': {
      'color': tc_distances[0],
      'colorscale': distance_colorscale,
      'cmin': distance_min,
      'cmax': distance_max,
      'colorbar': scatter_colorbar
    },
    'hoverinfo': 'text',
    'text': scatter_hovertext,
    'showlegend': false
  };
  scatter_data.push(scatter);

  var scatter_layout = {
    'title': {
      'text': ''
    },
    'xaxis': {
      'title': '',
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'mirror': true
    },
    'yaxis': {
      'title': '',
      'zeroline': false,
      'showline': true,
      'showgrid': false,
      'mirror': true,
      'side': 'left'
    },
    'yaxis2': {
      'title': '',
      'overlaying': 'y',
      'range': [distance_min, distance_max],
      'zeroline': false,
      'side': 'right',
      'visible': false
    },
    'margin': {
      't': 50,
      'b': 50,
      'r': 50,
      'l': 50
    },
    'hovermode': 'x'
  };

  var scatter_plot = Plotly.newPlot(
    ts_plot_div, scatter_data, scatter_layout, plot_conf
  );

};

/* page loading / set up function: */
async function load_page() {
  /* data file to load: */
  var data_file = 'africa/erta_ale_079D_07694_131313.json';
  /* load the data: */
  await load_data(data_file);
  /* if data loading failed, give up: */
  if (plot_vars['plot_data'] == null) {
    return;
  };
  /* log data loaded message: */
  console.log('* loaded data from file: ' + data_file);
  /* plot the data: */
  plot_data();
};

/** add listeners: **/

/* on page load: */
window.addEventListener('load', function() {
  /* set up the page ... : */
  load_page();
});
