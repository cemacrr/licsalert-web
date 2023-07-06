'use strict';

/** global variables: **/

/* store things in plot_vars: */
var plot_vars = {
  /* prefix for data: */
  'data_prefix': 'data/',
  /* div for ic plotting: */
  'ic_plot_div': document.getElementById('licsalert_ic_plot'),
  /* div for time series plotting: */
  'ts_plot_div': document.getElementById('licsalert_ts_plot'),
  /* store plot data here: */
  'plot_data': null,
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
  var ifgs_incremental = plot_data['ifgs_incremental'];
  var ifgs_cumulative = plot_data['ifgs_cumulative'];
  var ifgs_lats = plot_data['ifgs_lats'];
  var ifgs_lons = plot_data['ifgs_lons'];
  var tc_count = plot_data['tc_count'];
  var tc_sources = plot_data['tc_sources'];
  var tc_cumulative = plot_data['tc_cumulative'];
  var tc_distances = plot_data['tc_distances'];
  var tc_lines = plot_data['tc_lines'];
  var residuals = plot_data['residuals'];
  var residuals_lines = plot_data['residuals_lines'];

  /* calculate some possibly useful values: */
  var lats_min = Math.min.apply(Math, lats);
  var lats_max = Math.max.apply(Math, lats);
  var lons_min = Math.min.apply(Math, lons);
  var lons_max = Math.max.apply(Math, lons);

  /* ic plot: */

  var heatmap_data = [];

  var heatmap_hovertext = [];
  for (var i = 0; i < lons.length; i++) {
    heatmap_hovertext[i] = [];
    for (var j = 0; j < lats.length; j++) {
      heatmap_hovertext[i][j] = 'lon: ' + lons[i] + '<br>' +
                                'lat: ' + lats[i] + '<br>' +
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

  var heatmap_conf = {
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
  };

  var heatmap_plot = Plotly.newPlot(
    ic_plot_div, heatmap_data, heatmap_layout, heatmap_conf
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
  for (var i = 0; i < tc_cumulative[0].length; i++) {
    scatter_hovertext.push(
      dates[i] + ': ' + tc_cumulative[0][i]
    );
  };

  var scatter = {
    'type': 'scatter',
    'name': '',
    'x': dates,
    'y': tc_cumulative[0],
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

  var scatter_conf = {
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
  };

  var scatter_plot = Plotly.newPlot(
    ts_plot_div, scatter_data, scatter_layout, scatter_conf
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
