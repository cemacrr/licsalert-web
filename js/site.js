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
  'heatmap_dem_div': document.getElementById('heatmap_dem'),
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
  'heatmap_ifg_cml_div': document.getElementById('heatmap_ifg_cml'),

  /* div for incremental ifg plotting: */
  'heatmap_ifg_inc_div': document.getElementById('heatmap_ifg_inc'),

  /* colorscale for ifg plotting: */
  'ifg_colorscale': [
    [0, 'rgb(0, 0, 254)'],
    [0.5, 'rgb(255, 255 255)'],
    [1, 'rgb(254, 0, 0)']
  ],




  /* div for ic plotting: */
  'heatmap_ic_div': document.getElementById('heatmap_ic'),
  /* div for time series plotting: */
  'ts_ic_div': document.getElementById('ts_ic'),
  /* min and max for ic plotting: */
  'ic_min': -0.5,
  'ic_max': 0.5,
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


/* heatmap plotting function: */
function plot_heatmap(plot_options) {
  /* get plot options: */
  var div = plot_options['div'];
  var title = plot_options['title'];
  var x = plot_options['x'];
  var x_min = plot_options['x_min'];
  var x_max = plot_options['x_max'];
  var y = plot_options['y'];
  var y_min = plot_options['y_min'];
  var y_max = plot_options['y_max'];
  var z = plot_options['z'];
  var z_min = plot_options['z_min'];
  var z_max = plot_options['z_max'];
  var hovertext = plot_options['hovertext'];
  var x_ticks = plot_options['x_ticks'];
  var y_ticks = plot_options['y_ticks'];
  var colorscale = plot_options['colorscale'];
  var conf = plot_options['conf'];


  var heatmap_data = [];

  var heatmap_colorbar = {
    'tickvals': [z_min, z_max],
    'ticktext': [
      (z_min + '        ').substr(0, 8),
      (z_max + '        ').substr(0, 8),
    ],
    'tickfont': {
      'size': 10
    },
    'orientation': 'v',
    'thickness': 15,
    'len': 0.9
  };

  var heatmap = {
    'type': 'heatmap',
    'x': x,
    'y': y,
    'z': z,
    'zmin': z_min,
    'zmax': z_max,
    'colorscale': colorscale,
    'colorbar': heatmap_colorbar,
    'hoverinfo': 'text',
    'text': hovertext,
    'showlegend': false
  };
  heatmap_data.push(heatmap);

  var heatmap_layout = {
    'title': {
      'text': title,
      'x': 0.16,
      'y': 0.85
    },
    'xaxis': {
      'title': '',
      'tickmode': 'array',
      'tickvals': x_ticks,
      'range': [x_min, x_max],
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
      'tickvals': y_ticks,
      'range': [y_min + 0.0001, y_max - 0.0001],
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
    div, heatmap_data, heatmap_layout, conf
  );

};



/* data plotting function: */
function plot_data() {

  /* get required plotting variables: */
  var heatmap_dem_div = plot_vars['heatmap_dem_div'];
  var dem_min = plot_vars['dem_min'];
  var dem_max = plot_vars['dem_max'];
  var dem_colorscale = plot_vars['dem_colorscale'];
  var heatmap_ifg_cml_div = plot_vars['heatmap_ifg_cml_div'];
  var heatmap_ifg_inc_div = plot_vars['heatmap_ifg_inc_div'];
  var ifg_colorscale = plot_vars['ifg_colorscale'];


  var plot_conf = plot_vars['plot_conf'];




  var heatmap_ic_div = plot_vars['ic_plot_div'];
  var ts_ic_div = plot_vars['ts_ic_div'];
  var ic_min = plot_vars['ic_min'];
  var ic_max = plot_vars['ic_max'];
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

  /* calculate x and y ticks for heatmaps: */
  var heatmap_n_ticks = 2;
  var heatmap_ticks_dp = 2;
  var heatmap_x_ticks = [];
  var heatmap_y_ticks = [];
  var heatmap_x_tick_inc = (lons_max - lons_min) / (heatmap_n_ticks * 2);
  for (var i = 0; i < heatmap_n_ticks; i++) {
    heatmap_x_ticks.push(
      (lons_min + ((i + (i +1)) * heatmap_x_tick_inc)).toFixed(
        heatmap_ticks_dp
      )
    );
  };
  var heatmap_y_tick_inc = (lats_max - lats_min) / (heatmap_n_ticks * 2);
  for (var i = 0; i < heatmap_n_ticks; i++) {
    heatmap_y_ticks.push(
      (lats_min + ((i + (i +1)) * heatmap_y_tick_inc)).toFixed(
        heatmap_ticks_dp
      )
    );
  };



  /* dem plot: */

  /* plot options for dem heatmap: */
  var heatmap_dem_options = {
    'div': heatmap_dem_div,
    'title': 'DEM',
    'x': lons,
    'x_min': lons_min,
    'x_max': lons_max,
    'y': lats,
    'y_min': lats_min,
    'y_max': lats_max,
    'z': dem,
    'z_min': dem_min,
    'z_max': dem_max,
    'x_ticks': heatmap_x_ticks,
    'y_ticks': heatmap_y_ticks,
    'colorscale': dem_colorscale,
    'conf': plot_conf
  };
  /* plot the heatmap: */
  plot_heatmap(heatmap_dem_options);

  /* cumulative ifg plot: */

  var ifg_cml = ifgs_cml[ifgs_cml.length - 1];
  var ifg_cml_min = Math.min.apply(Math, ifg_cml.flat());
  var ifg_cml_max = Math.max.apply(Math, ifg_cml.flat());

  var ifg_cml_z_max = Math.max(Math.abs(ifg_cml_min), Math.abs(ifg_cml_max));
  var ifg_cml_z_min = -1 * ifg_cml_z_max;

  /* plot options for cumulative ifg heatmap: */
  var heatmap_ifg_cml_options = {
    'div': heatmap_ifg_cml_div,
    'title': 'Cumulative',
    'x': lons,
    'x_min': lons_min,
    'x_max': lons_max,
    'y': lats,
    'y_min': lats_min,
    'y_max': lats_max,
    'z': ifg_cml,
    'z_min': ifg_cml_z_min,
    'z_max': ifg_cml_z_max,
    'x_ticks': heatmap_x_ticks,
    'y_ticks': heatmap_y_ticks,
    'colorscale': ifg_colorscale,
    'conf': plot_conf
  };
  /* plot the heatmap: */
  plot_heatmap(heatmap_ifg_cml_options);

  /* incremental ifg plot: */

  var ifg_inc = ifgs_inc[ifgs_inc.length - 1];
  var ifg_inc_min = Math.min.apply(Math, ifg_inc.flat());
  var ifg_inc_max = Math.max.apply(Math, ifg_inc.flat());

  var ifg_inc_z_max = Math.max(Math.abs(ifg_inc_min), Math.abs(ifg_inc_max));
  var ifg_inc_z_min = -1 * ifg_inc_z_max;

  /* plot options for incremental ifg heatmap: */
  var heatmap_ifg_inc_options = {
    'div': heatmap_ifg_inc_div,
    'title': 'Incremental',
    'x': lons,
    'x_min': lons_min,
    'x_max': lons_max,
    'y': lats,
    'y_min': lats_min,
    'y_max': lats_max,
    'z': ifg_inc,
    'z_min': ifg_inc_z_min,
    'z_max': ifg_inc_z_max,
    'x_ticks': heatmap_x_ticks,
    'y_ticks': heatmap_y_ticks,
    'colorscale': ifg_colorscale,
    'conf': plot_conf
  };
  /* plot the heatmap: */
  plot_heatmap(heatmap_ifg_inc_options);









  /* ic plot: */

  var heatmap_data = [];

  var heatmap_hovertext = [];
  for (var i = 0; i < lats.length; i++) {
    heatmap_hovertext[i] = [];
    for (var j = 0; j < lons.length; j++) {

      if (tc_sources[0][i][j] == 'null') {
        var value_text = 'null';
      } else {
        var value_text = tc_sources[0][i][j] + 'm';
      };

      heatmap_hovertext[i][j] = 'lat: ' + lats[i] + '<br>' +
                                'lon: ' + lons[j] + '<br>' +
                                'IC: ' + value_text;
      };
  };

  var heatmap_colorbar = {
    'tickvals': [ic_min, ic_max],
    'ticktext': [
      (ic_min + '        ').substr(0, 8),
      (ic_max + '        ').substr(0, 8),
    ],
    'tickfont': {
      'size': 10
    },
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
      'text': 'IC0',
      'x': 0.16,
      'y': 0.85
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
    'ticktext': [
      (distance_min + '        ').substr(0, 8),
      (distance_max + '        ').substr(0, 8),
    ],
    'tickfont': {
      'size': 10
    },
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
