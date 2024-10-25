'use strict';

/** global variables: **/

/* store things in plot_vars: */
var plot_vars = {
  /* possible frames for this volcano: */
  'frame_ids': null,
  /* currently selected frames: */
  'frame_id': null,
  /* div for text content: */
  'text_div': document.getElementById('content_text'),
  'error_div': document.getElementById('error_text'),
  /* prefix for data: */
  'data_prefix': 'licsalert_data',
  /* directory within each volcano / frame directory which contains licsalert
     data: */
  'data_dir': 'json_data',
  /* store plot data here: */
  'plot_data': null,
  /* div for heatmap plotting: */
  'heatmap_div': document.getElementById('heatmap_plots'),
  /* div for slider: */
  'slider_div': document.getElementById('content_slider'),
  /* min for dem plotting: */
  'dem_min': 0,
  /* colorscale for dem plotting: */
  'dem_colorscale': [
    [0, 'rgb(85, 142, 49)'],
    [0.5, 'rgb(217, 216, 98)'],
    [1, 'rgb(96, 17, 5)'],
  ],
  /* colorscale for ifg plotting: */
  'ifg_colorscale': [
    [0, 'rgb(0, 0, 254)'],
    [0.5, 'rgb(255, 255 255)'],
    [1, 'rgb(254, 0, 0)']
  ],
  /* div for ic plotting: */
  'ic_div': document.getElementById('ic_plots'),
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
  'baseline_color': '#9999ff',
  /* color for ifg date plotting: */
  'ifg_date_color': '#99ff99',
  /* div for residuals plotting: */
  'residuals_div': document.getElementById('residuals_plots'),
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
  }
};

/** functions: **/

/* add volcano name and frame text to page: */
async function add_text(volcano_name, frame_id) {
  /* set the page title: */
  document.title = 'LiCSAlert - ' + volcano_name + ' ' + frame_id;
  /* div for text content: */
  var text_div = plot_vars['text_div'];
  /* wipe out content: */
  text_div.innerHTML = '';
  /* create div for text: */
  var text_00_div = document.createElement('div');
  text_00_div.id = 'content_text_00';
  text_00_div.classList = 'text_container';
  text_div.appendChild(text_00_div);
  /* add volcano name header: */
  var volcano_name_h = document.createElement('h2');
  volcano_name_h.innerHTML = volcano_name;
  text_00_div.appendChild(volcano_name_h);
  /* add frame select header: */
  var frame_select_h = document.createElement('h3');
  frame_select_h.innerHTML = 'Select Frame';
  text_00_div.appendChild(frame_select_h);
  /* add frame selection div: */
  var frame_select_div = document.createElement('div');
  /* get all frame ids: */
  var frame_ids = plot_vars['frame_ids'];
  /* loop through all frame ids: */
  for (var i = 0; i < frame_ids.length; i++) {
    /* dreate button for this frame: */
    var frame_id_button = document.createElement('button');
    frame_id_button.innerHTML = frame_ids[i];
    frame_id_button.volcano_name = volcano_name;
    frame_id_button.frame_id = frame_ids[i];
    /* add click listener: */
    frame_id_button.addEventListener('click', function() {
      /* on click ... update frame id: */
      plot_vars['frame_id'] = this.frame_id;
      /* update page: */
      load_page();
    });
    /* disable button for active frame, enable for inaacive: */
    if (frame_ids[i] == frame_id) {
      frame_id_button.setAttribute('disabled', true);
    } else {
      frame_id_button.removeAttribute('disabled');
    };
    /* add button to frame selection div: */
    frame_select_div.appendChild(frame_id_button);
  };
  /* add frame selection div to text div: */
  text_00_div.appendChild(frame_select_div);
};

/* function to get list of available frames: */
async function get_frames() {
  /* sort frames by time - most recent first: */
  frames.sort(function(a, b) {return b['mtime'] - a['mtime'];});
  /* init arrays for storing 'good' frames, where data is available, and 'bad'
     frames for which we do not have data: */
  var frames_good = [];
  var frames_bad = [];
  /* frame modification times, for sorting: */
  /* loop through all frames: */
  for (var i = 0; i < frames.length; i++) {
    /* get frame id: */
    var frame_id = frames[i]['id'];
    /* init plot var for this frame id: */
    if (plot_vars[frame_id] == undefined) {
      plot_vars[frame_id] = {};
    };
    /* data file name for this frame id: */
    var data_file = plot_vars['data_prefix'] + '/' + region + '/' + volcano +
                    '_' + frame_id + '/' + plot_vars['data_dir'] +
                    '/licsalert_data.json.gz';

    /* check data with fetch: */
    var data_url = new Request(data_file, { method: 'HEAD'});
    var data_req = await fetch(data_url);
    /* if successful: */
    if (data_req.status == 200) {
      /* store as good frame: */
      frames_good.push(frame_id);
    } else {
      /* else, store as bad frame: */
      frames_bad.push(frame_id);
    };
  };
  /* all frames: */
  var frame_ids = frames_good.concat(frames_bad);
  /* store all frame ids: */
  plot_vars['frame_ids'] = frame_ids;
  /* if frame id is not set or invalid, set to first frame in list: */
  if (plot_vars['frame_ids'].indexOf(plot_vars['frame_id']) < 0) {
    plot_vars['frame_id'] = frame_ids[0];
  };
};

/* data loading from json function: */
async function load_data(data_file, ifg_data=false) {
  /* if not loading ifg data: */
  if (ifg_data != true) {
    /* clear any error text: */
    var error_div = plot_vars['error_div'];
    error_div.innerHTML = '';
    /* clear any plots: */
    var heatmap_div = plot_vars['heatmap_div'];
    heatmap_div.innerHTML = '';
    var ic_div = plot_vars['ic_div'];
    ic_div.innerHTML = '';
    var residuals_div = plot_vars['residuals_div'];
    residuals_div.innerHTML = '';
    /* clear slider: */
    var slider_div = plot_vars['slider_div'];
    slider_div.innerHTML = '';
  };
  /* url to data file: */
  let data_url = plot_vars['data_prefix'] + '/' + data_file;
  /* get data using fetch: */
  var data_req = await fetch(data_url);
  /* if successful: */
  if (data_req.status == 200) {
    /* store json information from request. if ifg data: */
    if (ifg_data == true) {
      var req_data = await data_req.arrayBuffer();
      req_data = JSON.parse(
        pako.ungzip(req_data, {'to': 'string'})
      );
      req_data['ifg_cml'] == undefined ?
        plot_vars['plot_data']['ifg_cml'] = null :
        plot_vars['plot_data']['ifg_cml'] = req_data['ifg_cml'];
      req_data['ifg_inc'] == undefined ?
        plot_vars['plot_data']['ifg_inc'] = null :
        plot_vars['plot_data']['ifg_inc'] = req_data['ifg_inc'];
      req_data['residual_cml'] == undefined ?
        plot_vars['plot_data']['ifg_resid_cml'] = null :
        plot_vars['plot_data']['ifg_resid_cml'] = req_data['residual_cml'];
      req_data['residual'] == undefined ?
        plot_vars['plot_data']['ifg_resid_inc'] = null :
        plot_vars['plot_data']['ifg_resid_inc'] = req_data['residual'];
      req_data['reconstruction'] == undefined ?
        plot_vars['plot_data']['ifg_recon_inc'] = null :
        plot_vars['plot_data']['ifg_recon_inc'] = req_data['reconstruction'];
    /* else, getting plot data: */
    } else {
      var req_data = await data_req.arrayBuffer();
      req_data = JSON.parse(
        pako.ungzip(req_data, {'to': 'string'})
      );
      plot_vars['plot_data'] = req_data;
    };
  } else {
    /* log error: */
    console.log('* failed to load data from: ' + data_url);
    /* if getting ifg data: */
    if (ifg_data == true) {
      /* ifg data is null: */
      plot_vars['plot_data']['ifg_cml'] = null;
      plot_vars['plot_data']['ifg_inc'] = null;
      plot_vars['plot_data']['ifg_resid_cml'] = null;
      plot_vars['plot_data']['ifg_resid_inc'] = null;
      plot_vars['plot_data']['ifg_recon_inc'] = null;
    /* else, getting plot data: */
    } else {
      /* plot data is null: */
      plot_vars['plot_data'] = null;
      /* add error text div: */
      var error_00_div = document.createElement('div');
      error_00_div.id = 'error_text_00';
      error_00_div.classList = 'text_container error text';
      error_00_div.innerHTML = 'No LiCSAlert data available for frame ' +
                               plot_vars['frame_id'];
      error_div.appendChild(error_00_div);
    };
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
  var x_label = plot_options['x_label'];
  var x_units = plot_options['x_units'];
  var x_dp = plot_options['x_dp'];
  var x_ticks = plot_options['x_ticks'];
  var y = plot_options['y'];
  var y_min = plot_options['y_min'];
  var y_max = plot_options['y_max'];
  var y_label = plot_options['y_label'];
  var y_units = plot_options['y_units'];
  var y_dp = plot_options['y_dp'];
  var y_ticks = plot_options['y_ticks'];
  var x_dp = plot_options['x_dp'];
  var z = plot_options['z'];
  var z_min = plot_options['z_min'];
  var z_max = plot_options['z_max'];
  var z_label = plot_options['z_label'];
  var z_units = plot_options['z_units'];
  var z_dp = plot_options['z_dp'];
  var colorscale = plot_options['colorscale'];
  var colorbar_title = plot_options['colorbar_title'];
  var conf = plot_options['conf'];

  /* init array for plot data: */
  var data = [];

  /* create the colorbar: */
  var colorbar = {
    'title': {
      'text': colorbar_title,
      'side': 'right'
    },
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

  /* create hovertext: */
  x_label == null ? x_label = '': x_label = x_label + ': ';
  x_units == null ? x_units = '': x_units = x_units;
  y_label == null ? y_label = '': y_label = y_label + ': ';
  y_units == null ? y_units = '': y_units = y_units;
  z_label == null ? z_label = '': z_label = z_label + ': ';
  z_units == null ? z_units = '': z_units = z_units;
  var hovertext = [];
  for (var i = 0; i < y.length; i++) {
    hovertext[i] = [];
    for (var j = 0; j < x.length; j++) {
      if ((z[i][j] == null) || (z[i][j] == 'null')) {
        var z_value = 'null';
      } else {
        var z_value = z[i][j].toFixed(z_dp) + z_units;
      };
      hovertext[i][j] = x_label + x[j].toFixed(x_dp) + x_units + '<br>' +
                        y_label + y[i].toFixed(y_dp) + y_units + '<br>' +
                        z_label + z_value;
      };
  };

  /* create the heatmap plot: */
  var heatmap = {
    'type': 'heatmap',
    'x': x,
    'y': y,
    'z': z,
    'zmin': z_min,
    'zmax': z_max,
    'colorscale': colorscale,
    'colorbar': colorbar,
    'hoverinfo': 'text',
    'text': hovertext,
    'showlegend': false
  };
  data.push(heatmap);

  /* create the heatmap layout: */
  var layout = {
    'title': {
      'text': title,
      'x': 0.16,
      'y': 0.85
    },
    'xaxis': {
      'title': {
        'text': 'longitude',
        'font': {
          'size': 10
        },
        'standoff': 5
      },
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
      'title': {
        'text': 'latitude',
        'font': {
          'size': 10
        },
        'standoff': 5
      },
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

  /* draw the plot: */
  var plot = Plotly.newPlot(
    div, data, layout, conf
  );
};

/* time series plotting function: */
function plot_ts(plot_options) {
  /* get plot options: */
  var div = plot_options['div'];
  var title = plot_options['title'];
  var baseline_end = plot_options['baseline_end'];
  var baseline_color = plot_options['baseline_color'];
  var ifg_date = plot_options['ifg_date'];
  var ifg_date_color = plot_options['ifg_date_color'];
  var distances = plot_options['distances'];
  var distance_min = plot_options['distance_min'];
  var distance_max = plot_options['distance_max'];
  var distance_colorscale = plot_options['distance_colorscale'];
  var dates = plot_options['dates'];
  var lines = plot_options['lines'];
  var cml = plot_options['cml'];
  var conf = plot_options['conf'];

  /* init array for plot data: */
  var data = [];

  /* create hovertext: */
  var hovertext = [];
  for (var i = 0; i < cml.length; i++) {
      hovertext.push(
      dates[i] + '<br>' +
      cml[i] + '<br>' +
      distances[i] + 'σ'
    );
  };

  /* create the baseline end date scatter plot: */
  var scatter_baseline = {
    'type': 'scatter',
    'name': '',
    'x': [baseline_end, baseline_end],
    'y': [distance_min, distance_max * 2],
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
  data.push(scatter_baseline);

  /* create the ifg date scatter plot: */
  var scatter_ifg = {
    'type': 'scatter',
    'name': '',
    'x': [ifg_date, ifg_date],
    'y': [distance_min, distance_max * 2],
    'yaxis': 'y2',
    'mode': 'lines',
    'line': {
      'color': ifg_date_color
    },
    'opacity': 0.8,
    'hoverinfo': 'text',
    'text': 'ifg plot date: ' + ifg_date,
    'showlegend': false
  };
  data.push(scatter_ifg);

  /* create the bar plot: */
  var scatter_bar = {
    'type': 'bar',
    'name': '',
    'x': dates,
    'y': distances,
    'yaxis': 'y2',
    'marker': {
      'color': distances,
      'colorscale': distance_colorscale,
      'cmin': distance_min,
      'cmax': distance_max
    },
    'opacity': 0.4,
    'textposition': 'none',
    'hoverinfo': 'none',
    'showlegend': false
  };
  data.push(scatter_bar);

  /* create plots for the lines of best fit: */
  for (var i = 0; i < lines.length; i++) {
    var scatter_line = {
      'type': 'scatter',
      'name': '',
      'x': dates,
      'y': lines[i],
      'yaxis': 'y1',
      'mode': 'lines',
      'marker': {
        'color': 'rgba(169, 169, 169, 0.6)',
      },
      'hoverinfo': 'none',
      'showlegend': false
    };
    data.push(scatter_line);
  };

  /* create colorbar for scatter plot: */
  var scatter_colorbar = {
    'title': {
      'text': 'σ from trend line',
      'side': 'right'
    },
    'tickvals': [distance_min, distance_max],
    'ticktext': [
      (distance_min + '        ').substr(0, 8),
      (distance_max + '        ').substr(0, 8),
    ],
    'tickfont': {
      'size': 10
    },
    'x': 1.005,
    'orientation': 'v',
    'thickness': 15,
    'len': 1.05
  };

  /* create the scatter plot: */
  var scatter = {
    'type': 'scatter',
    'name': '',
    'x': dates,
    'y': cml,
    'yaxis': 'y1',
    'mode': 'markers',
    'marker': {
      'color': distances,
      'colorscale': distance_colorscale,
      'cmin': distance_min,
      'cmax': distance_max,
      'colorbar': scatter_colorbar
    },
    'hoverinfo': 'text',
    'text': hovertext,
    'showlegend': false
  };
  data.push(scatter);

  /* create the plot layout: */
  var layout = {
    'title': {
      'text': title,
      'x': 0.05,
      'y': 0.85
    },
    'xaxis': {
      'title': '',
      'zeroline': false,
      'showline': true,
      'showgrid': true,
      'ticks': 'outside',
      'mirror': true
    },
    'yaxis': {
      'title': '',
      'zeroline': false,
      'showline': true,
      'showgrid': false,
      'ticks': 'outside',
      'mirror': true,
      'side': 'left'
    },
    'yaxis2': {
      'title': '',
      'overlaying': 'y',
      'range': [distance_min, distance_max * 2],
      'zeroline': false,
      'side': 'right',
      'visible': false
    },
    'margin': {
      't': 65,
      'b': 65,
      'r': 50,
      'l': 50
    },
    'hovermode': 'x'
  };

  /* draw the plot: */
  var plot = Plotly.newPlot(
    div, data, layout, conf
  );
};

/* data plotting function: */
async function plot_data() {
  /* get required plotting variables: */
  var frame_id = plot_vars['frame_id'];
  var heatmap_div = plot_vars['heatmap_div'];
  var dem_min = plot_vars['dem_min'];
  var dem_colorscale = plot_vars['dem_colorscale'];
  var ifg_colorscale = plot_vars['ifg_colorscale'];
  var ic_div = plot_vars['ic_div'];
  var ic_min = plot_vars['ic_min'];
  var ic_max = plot_vars['ic_max'];
  var distance_min = plot_vars['distance_min'];
  var distance_max = plot_vars['distance_max'];
  var distance_colorscale = plot_vars['distance_colorscale'];
  var baseline_color = plot_vars['baseline_color'];
  var ifg_date_color = plot_vars['ifg_date_color'];
  var residuals_div = plot_vars['residuals_div'];
  var plot_conf = plot_vars['plot_conf'];

  /* get required data variables: */
  var plot_data = plot_vars['plot_data'];
  var dates_count = plot_data['dates_count'];
  var dates = plot_data['dates'];
  var baseline_end = plot_data['baseline_end'];
  var lats = plot_data['lats'];
  var lons = plot_data['lons'];
  var dem = plot_data['dem'];
  var tc_count = plot_data['tc_count'];
  var tc_sources = plot_data['tc_sources'];
  var tc_cml = plot_data['tc_cml'];
  var tc_distances = plot_data['tc_distances'];
  var tc_lines = plot_data['tc_lines'];
  var residuals = plot_data['residuals'];
  var residuals_distances = plot_data['residuals_distances'];
  var residuals_lines = plot_data['residuals_lines'];

  /* check date for incremental and cumulative ifg and get data: */
  var ifg_date = plot_vars[frame_id]['ifg_date'];
  /* set to most recent if not defined: */
  if (ifg_date == undefined) {
    ifg_date = dates.slice(-1)[0];
  };
  plot_vars[frame_id]['ifg_date'] = ifg_date;
  /* json file for ifg data: */
  var ifg_data_file = region + '/' + volcano + '_' + frame_id + '/' +
                      plot_vars['data_dir'] + '/' + ifg_date + '.json.gz';
  /* load the data: */
  await load_data(ifg_data_file, true);
  /* log data loaded message: */
  console.log('* loaded data from file: ' + ifg_data_file);
  /* get ifg data: */
  var ifg_cml = plot_data['ifg_cml'];
  var ifg_inc = plot_data['ifg_inc'];
  var ifg_resid_cml = plot_data['ifg_resid_cml'];
  var ifg_resid_inc = plot_data['ifg_resid_inc'];
  var ifg_recon_inc = plot_data['ifg_recon_inc'];

  /* calculate some possibly useful values: */
  var lats_min = Math.min.apply(Math, lats);
  var lats_max = Math.max.apply(Math, lats);
  var lons_min = Math.min.apply(Math, lons);
  var lons_max = Math.max.apply(Math, lons);
  var dem_max = Math.max.apply(Math, dem.flat().filter(Number.isFinite));
  dem_max = Math.ceil(dem_max / 1000) * 1000;

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

  /* wipe out any exiting content: */
  residuals_div.innerHTML = '';
  ic_div.innerHTML = '';
  heatmap_div.innerHTML = '';

  /* create divs for heatmap plots: */
  var heatmap_plot_container = document.createElement('div');
  heatmap_plot_container.id = 'heatmap_plot_container';
  heatmap_plot_container.classList = 'plot_container';
  heatmap_div.appendChild(heatmap_plot_container);

  /* --- dem plot: --- */

  /* create div for heatmap plot: */
  var heatmap_dem_div = document.createElement('div');
  var heatmap_dem_id = 'heatmap_dem';
  heatmap_dem_div.id = heatmap_dem_id;
  heatmap_dem_div.classList = 'heatmap_plot';
  heatmap_plot_container.appendChild(heatmap_dem_div);

  /* plot options for dem heatmap: */
  var heatmap_dem_options = {
    'div': heatmap_dem_id,
    'title': 'DEM',
    'x': lons,
    'x_min': lons_min,
    'x_max': lons_max,
    'x_label': 'lon',
    'x_units': null,
    'x_dp': 4,
    'x_ticks': heatmap_x_ticks,
    'y': lats,
    'y_min': lats_min,
    'y_max': lats_max,
    'y_label': 'lat',
    'y_units': null,
    'y_dp': 4,
    'y_ticks': heatmap_y_ticks,
    'z': dem,
    'z_min': dem_min,
    'z_max': dem_max,
    'z_label': 'elevation',
    'z_units': 'm',
    'z_dp': 1,
    'colorscale': dem_colorscale,
    'colorbar_title': 'elevation (m)',
    'conf': plot_conf
  };
  /* plot the heatmap: */
  plot_heatmap(heatmap_dem_options);

  /* --- cumulative ifg plot: --- */

  if (ifg_cml != null) {

    /* create div for heatmap plot: */
    var heatmap_ifg_cml_div = document.createElement('div');
    var heatmap_ifg_cml_id = 'heatmap_ifg_cml';
    heatmap_ifg_cml_div.id = heatmap_ifg_cml_id;
    heatmap_ifg_cml_div.classList = 'heatmap_plot';
    heatmap_plot_container.appendChild(heatmap_ifg_cml_div);

    /* get min and max values: */
    var ifg_cml_min = Math.min.apply(
      Math, ifg_cml.flat().filter(Number.isFinite)
    );
    var ifg_cml_max = Math.max.apply(
      Math, ifg_cml.flat().filter(Number.isFinite)
    );
    /* calculate min and max values for plotting: */
    var ifg_cml_z_max = Math.max(Math.abs(ifg_cml_min), Math.abs(ifg_cml_max));
    var ifg_cml_z_min = -1 * ifg_cml_z_max;

    /* plot options for cumulative ifg heatmap: */
    var heatmap_ifg_cml_options = {
      'div': heatmap_ifg_cml_id,
      'title': 'Cumulative',
      'x': lons,
      'x_min': lons_min,
      'x_max': lons_max,
      'x_label': 'lon',
      'x_units': null,
      'x_dp': 4,
      'x_ticks': heatmap_x_ticks,
      'y': lats,
      'y_min': lats_min,
      'y_max': lats_max,
      'y_label': 'lat',
      'y_units': null,
      'y_dp': 4,
      'y_ticks': heatmap_y_ticks,
      'z': ifg_cml,
      'z_min': ifg_cml_z_min,
      'z_max': ifg_cml_z_max,
      'z_label': 'displacement',
      'z_units': 'm',
      'z_dp': 4,
      'colorscale': ifg_colorscale,
      'colorbar_title': 'displacement (m)',
      'conf': plot_conf
    };
    /* plot the heatmap: */
    plot_heatmap(heatmap_ifg_cml_options);

  };

  /* --- incremental ifg plot: --- */

  if (ifg_inc != null) {

    /* create div for heatmap plot: */
    var heatmap_ifg_inc_div = document.createElement('div');
    var heatmap_ifg_inc_id = 'heatmap_ifg_inc';
    heatmap_ifg_inc_div.id = heatmap_ifg_inc_id;
    heatmap_ifg_inc_div.classList = 'heatmap_plot';
    heatmap_plot_container.appendChild(heatmap_ifg_inc_div);

    /* get min and max values: */
    var ifg_inc_min = Math.min.apply(
      Math, ifg_inc.flat().filter(Number.isFinite)
    );
    var ifg_inc_max = Math.max.apply(
      Math, ifg_inc.flat().filter(Number.isFinite)
    );
    /* calculate min and max values for plotting: */
    var ifg_inc_z_max = Math.max(Math.abs(ifg_inc_min), Math.abs(ifg_inc_max));
    var ifg_inc_z_min = -1 * ifg_inc_z_max;

    /* plot options for incremental ifg heatmap: */
    var heatmap_ifg_inc_options = {
      'div': heatmap_ifg_inc_id,
      'title': 'Incremental',
      'x': lons,
      'x_min': lons_min,
      'x_max': lons_max,
      'x_label': 'lon',
      'x_units': null,
      'x_dp': 4,
      'x_ticks': heatmap_x_ticks,
      'y': lats,
      'y_min': lats_min,
      'y_max': lats_max,
      'y_label': 'lat',
      'y_units': null,
      'y_dp': 4,
      'y_ticks': heatmap_y_ticks,
      'z': ifg_inc,
      'z_min': ifg_inc_z_min,
      'z_max': ifg_inc_z_max,
      'z_label': 'displacement',
      'z_units': 'm',
      'z_dp': 4,
      'colorscale': ifg_colorscale,
      'colorbar_title': 'displacement (m)',
      'conf': plot_conf
    };
    /* plot the heatmap: */
    plot_heatmap(heatmap_ifg_inc_options);

  };

  /* --- cumulative residual ifg plot: --- */

  if (ifg_resid_cml != null) {

    /* create div for heatmap plot: */
    var heatmap_ifg_resid_cml_div = document.createElement('div');
    var heatmap_ifg_resid_cml_id = 'heatmap_ifg_resid_cml';
    heatmap_ifg_resid_cml_div.id = heatmap_ifg_resid_cml_id;
    heatmap_ifg_resid_cml_div.classList = 'heatmap_plot';
    heatmap_plot_container.appendChild(heatmap_ifg_resid_cml_div);

    /* get min and max values: */
    var ifg_resid_cml_min = Math.min.apply(
      Math, ifg_resid_cml.flat().filter(Number.isFinite)
    );
    var ifg_resid_cml_max = Math.max.apply(
      Math, ifg_resid_cml.flat().filter(Number.isFinite)
    );
    /* calculate min and max values for plotting: */
    var ifg_resid_cml_z_max = Math.max(
      Math.abs(ifg_resid_cml_min), Math.abs(ifg_resid_cml_max)
    );
    var ifg_resid_cml_z_min = -1 * ifg_resid_cml_z_max;

    /* plot options for residual ifg heatmap: */
    var heatmap_ifg_resid_cml_options = {
      'div': heatmap_ifg_resid_cml_id,
      'title': 'Cumulative residual',
      'x': lons,
      'x_min': lons_min,
      'x_max': lons_max,
      'x_label': 'lon',
      'x_units': null,
      'x_dp': 4,
      'x_ticks': heatmap_x_ticks,
      'y': lats,
      'y_min': lats_min,
      'y_max': lats_max,
      'y_label': 'lat',
      'y_units': null,
      'y_dp': 4,
      'y_ticks': heatmap_y_ticks,
      'z': ifg_resid_cml,
      'z_min': ifg_resid_cml_z_min,
      'z_max': ifg_resid_cml_z_max,
      'z_label': 'displacement',
      'z_units': 'm',
      'z_dp': 4,
      'colorscale': ifg_colorscale,
      'colorbar_title': 'displacement (m)',
      'conf': plot_conf
    };
    /* plot the heatmap: */
    plot_heatmap(heatmap_ifg_resid_cml_options);

  };

  /* --- incremental residual ifg plot: --- */

  if (ifg_resid_inc != null) {

    /* create div for heatmap plot: */
    var heatmap_ifg_resid_inc_div = document.createElement('div');
    var heatmap_ifg_resid_inc_id = 'heatmap_ifg_resid_inc';
    heatmap_ifg_resid_inc_div.id = heatmap_ifg_resid_inc_id;
    heatmap_ifg_resid_inc_div.classList = 'heatmap_plot';
    heatmap_plot_container.appendChild(heatmap_ifg_resid_inc_div);

    /* get min and max values: */
    var ifg_resid_inc_min = Math.min.apply(
      Math, ifg_resid_inc.flat().filter(Number.isFinite)
    );
    var ifg_resid_inc_max = Math.max.apply(
      Math, ifg_resid_inc.flat().filter(Number.isFinite)
    );
    /* calculate min and max values for plotting: */
    var ifg_resid_inc_z_max = Math.max(
      Math.abs(ifg_resid_inc_min), Math.abs(ifg_resid_inc_max)
    );
    var ifg_resid_inc_z_min = -1 * ifg_resid_inc_z_max;

    /* plot options for residual ifg heatmap: */
    var heatmap_ifg_resid_inc_options = {
      'div': heatmap_ifg_resid_inc_id,
      'title': 'Incremental residual',
      'x': lons,
      'x_min': lons_min,
      'x_max': lons_max,
      'x_label': 'lon',
      'x_units': null,
      'x_dp': 4,
      'x_ticks': heatmap_x_ticks,
      'y': lats,
      'y_min': lats_min,
      'y_max': lats_max,
      'y_label': 'lat',
      'y_units': null,
      'y_dp': 4,
      'y_ticks': heatmap_y_ticks,
      'z': ifg_resid_inc,
      'z_min': ifg_resid_inc_z_min,
      'z_max': ifg_resid_inc_z_max,
      'z_label': 'displacement',
      'z_units': 'm',
      'z_dp': 4,
      'colorscale': ifg_colorscale,
      'colorbar_title': 'displacement (m)',
      'conf': plot_conf
    };
    /* plot the heatmap: */
    plot_heatmap(heatmap_ifg_resid_inc_options);

  };

  /* --- reconstruction ifg plot: --- */

  if (ifg_recon_inc != null) {

    /* create div for heatmap plot: */
    var heatmap_ifg_recon_inc_div = document.createElement('div');
    var heatmap_ifg_recon_inc_id = 'heatmap_ifg_recon_inc';
    heatmap_ifg_recon_inc_div.id = heatmap_ifg_recon_inc_id;
    heatmap_ifg_recon_inc_div.classList = 'heatmap_plot';
    heatmap_plot_container.appendChild(heatmap_ifg_recon_inc_div);

    /* get min and max values: */
    var ifg_recon_inc_min = Math.min.apply(
      Math, ifg_recon_inc.flat().filter(Number.isFinite)
    );
    var ifg_recon_inc_max = Math.max.apply(
      Math, ifg_recon_inc.flat().filter(Number.isFinite)
    );
    /* calculate min and max values for plotting: */
    var ifg_recon_inc_z_max = Math.max(
      Math.abs(ifg_recon_inc_min), Math.abs(ifg_recon_inc_max)
    );
    var ifg_recon_inc_z_min = -1 * ifg_recon_inc_z_max;

    /* plot options for reconstruction ifg heatmap: */
    var heatmap_ifg_recon_inc_options = {
      'div': heatmap_ifg_recon_inc_id,
      'title': 'Incremental reconstruction',
      'x': lons,
      'x_min': lons_min,
      'x_max': lons_max,
      'x_label': 'lon',
      'x_units': null,
      'x_dp': 4,
      'x_ticks': heatmap_x_ticks,
      'y': lats,
      'y_min': lats_min,
      'y_max': lats_max,
      'y_label': 'lat',
      'y_units': null,
      'y_dp': 4,
      'y_ticks': heatmap_y_ticks,
      'z': ifg_recon_inc,
      'z_min': ifg_recon_inc_z_min,
      'z_max': ifg_recon_inc_z_max,
      'z_label': 'displacement',
      'z_units': 'm',
      'z_dp': 4,
      'colorscale': ifg_colorscale,
      'colorbar_title': 'displacement (m)',
      'conf': plot_conf
    };
    /* plot the heatmap: */
    plot_heatmap(heatmap_ifg_recon_inc_options);

  };

  /* --- ic plotting: --- */

  /* for each ic: */
  for (var tc_id = 0; tc_id < tc_count; tc_id++) {
    /* get the data for this ic: */
    var ic = tc_sources[tc_id];
    var distances = tc_distances[tc_id];
    var lines = tc_lines[tc_id];
    var cml = tc_cml[tc_id];

    /* create div for ic plots: */
    var ic_plot_container = document.createElement('div');
    ic_plot_container.id = 'ic_plot_container_' + i;
    ic_plot_container.classList = 'plot_container';
    ic_div.appendChild(ic_plot_container);
    /* create div for heatmap plot: */
    var heatmap_ic_div = document.createElement('div');
    var heatmap_ic_id = 'heatmap_ic_' + tc_id;
    heatmap_ic_div.id = heatmap_ic_id;
    heatmap_ic_div.classList = 'heatmap_plot';
    ic_plot_container.appendChild(heatmap_ic_div);
    /* create div for ts plot: */
    var ts_ic_div = document.createElement('div');
    var ts_ic_id = 'ts_ic_' + tc_id;
    ts_ic_div.id = ts_ic_id;
    ts_ic_div.classList = 'ts_plot';
    ic_plot_container.appendChild(ts_ic_div);

    /* plot options for ic heatmap: */
    var heatmap_ic_options = {
      'div': heatmap_ic_id,
      'title': 'IC' + tc_id,
      'x': lons,
      'x_min': lons_min,
      'x_max': lons_max,
      'x_label': 'lon',
      'x_units': null,
      'x_dp': 4,
      'x_ticks': heatmap_x_ticks,
      'y': lats,
      'y_min': lats_min,
      'y_max': lats_max,
      'y_label': 'lat',
      'y_units': null,
      'y_dp': 4,
      'y_ticks': heatmap_y_ticks,
      'z': ic,
      'z_min': ic_min,
      'z_max': ic_max,
      'z_label': 'value',
      'z_units': '',
      'z_dp': 4,
      'colorscale': ifg_colorscale,
      'colorbar_title': '',
      'conf': plot_conf
    };
    /* plot the heatmap: */
    plot_heatmap(heatmap_ic_options);

    /* plot options for ic time series: */
    var ts_ic_options = {
      'div': ts_ic_id,
      'title': '',
      'baseline_end': baseline_end,
      'baseline_color': baseline_color,
      'ifg_date': ifg_date,
      'ifg_date_color': ifg_date_color,
      'distances': distances,
      'distance_min': distance_min,
      'distance_max': distance_max,
      'distance_colorscale': distance_colorscale,
      'dates': dates,
      'lines': lines,
      'cml': cml,
      'conf': plot_conf
    };
    /* plot the time series: */
    plot_ts(ts_ic_options);
  };

  /* --- residuals plotting: --- */

  /* create div for ic plots: */
  var residuals_plot_container = document.createElement('div');
  residuals_plot_container.id = 'residuals_plot_container';
  residuals_plot_container.classList = 'plot_container';
  residuals_div.appendChild(residuals_plot_container);
  /* create div for heatmap plot: */
  var heatmap_residuals_div = document.createElement('div');
  var heatmap_residuals_id = 'heatmap_residuals';
  heatmap_residuals_div.id = heatmap_residuals_id;
  heatmap_residuals_div.classList = 'heatmap_plot';
  residuals_plot_container.appendChild(heatmap_residuals_div);
  /* create div for ts plot: */
  var ts_residuals_div = document.createElement('div');
  var ts_residuals_id = 'ts_residuals_' + tc_id;
  ts_residuals_div.id = ts_residuals_id;
  ts_residuals_div.classList = 'ts_plot';
  residuals_plot_container.appendChild(ts_residuals_div);

  /* plot options for ic time series: */
  var ts_residuals_options = {
    'div': ts_residuals_id,
    'title': 'RMS residual',
    'baseline_end': baseline_end,
    'baseline_color': baseline_color,
    'ifg_date': ifg_date,
    'ifg_date_color': ifg_date_color,
    'distances': residuals_distances,
    'distance_min': distance_min,
    'distance_max': distance_max,
    'distance_colorscale': distance_colorscale,
    'dates': dates,
    'lines': residuals_lines,
    'cml': residuals,
    'conf': plot_conf
  };
  /* plot the time series: */
  plot_ts(ts_residuals_options);
};

/* add slider: */
function add_slider() {
  /* div to which slider will be added: */
  var slider_container_div = plot_vars['slider_div'];
  /* get dates: */
  var dates = plot_vars['plot_data']['dates'];
  var dates_count = plot_vars['plot_data']['dates_count'];
  var frame_id = plot_vars['frame_id'];
  var ifg_date = plot_vars[frame_id]['ifg_date'];
  /* add div for slider: */
  var slider_div = document.createElement('div');
  slider_div.id = 'slider_00';
  slider_div.classList = 'slider';
  slider_container_div.appendChild(slider_div);
  /* add div for slider text: */
  var slider_text_div = document.createElement('div');
  slider_text_div.id = 'slider_text_00';
  slider_text_div.classList = 'slider_text';
  slider_container_div.appendChild(slider_text_div);
  /* add div for cumulative label: */
  var slider_cml_div = document.createElement('div');
  slider_cml_div.id = 'slider_00_cml';
  slider_cml_div.classList = 'slider_label';
  slider_text_div.appendChild(slider_cml_div);
  /* add div for incremental label: */
  var slider_inc_div = document.createElement('div');
  slider_inc_div.id = 'slider_00_inc';
  slider_inc_div.classList = 'slider_label';
  slider_text_div.appendChild(slider_inc_div);
  /* set initial date labels: */
  slider_cml_div.innerHTML = '<label>Cumulative dates:</label> ' + dates[0] +
                             '-' + ifg_date;
  slider_inc_div.innerHTML = '<label>Incremental date:</label> ' + ifg_date;
  /* add slider: */
  var slider = noUiSlider.create(slider_div, {
    'start': dates.indexOf(ifg_date),
    'range': {
      'min': 0,
      'max': dates_count - 1
    },
    'step': 1,
    'tooltips': false,
  });
  /* add slide listener: */
  slider_div.noUiSlider.on('slide', function() {
    /* get slider value: */
    var slider_value = slider_div.noUiSlider.get();
    /* index to int: */
    var slider_index = parseInt(slider_value);
    /* ifg date: */
    var slider_date = plot_vars['plot_data']['dates'][slider_index];
    /* update labels: */
    slider_cml_div.innerHTML = '<label>Cumulative dates:</label> ' +
                               plot_vars['plot_data']['dates'][0] + '-' +
                               slider_date;
    slider_inc_div.innerHTML = '<label>Incremental date:</label> ' + slider_date;
  });
  /* add change listener: */
  slider_div.noUiSlider.on('change', async function() {
    /* get slider value: */
    var slider_value = slider_div.noUiSlider.get();
    /* index to int: */
    var slider_index = parseInt(slider_value);
    /* ifg date: */
    var slider_date = plot_vars['plot_data']['dates'][slider_index];
    /* store ifg date: */
    plot_vars[frame_id]['ifg_date'] = slider_date;
    /* get current scroll position: */
    var scroll_x = window.scrollX;
    var scroll_y = window.scrollY;
    /* update the plots: */
    await plot_data();
    /* scroll in to position: */
    window.scrollTo(scroll_x, scroll_y);
  });
};

/* page loading / set up function: */
async function load_page() {
  /* get / check available frames: */
  await get_frames();
  /* get current frame: */
  var frame_id = plot_vars['frame_id'];
  /* add the text to the page: */
  await add_text(volcano_name, frame_id);
  /* data file to load: */
  var data_file = region + '/' + volcano + '_' + frame_id + '/' +
                  plot_vars['data_dir'] + '/licsalert_data.json.gz';
  /* load the data: */
  await load_data(data_file);
  /* if data loading failed, give up: */
  if (plot_vars['plot_data'] == null) {
    return;
  };
  /* log data loaded message: */
  console.log('* loaded data from file: ' + data_file);
  /* plot the data: */
  await plot_data();
  /* add slider: */
  add_slider();
};

/** add listeners: **/

/* on page load: */
window.addEventListener('load', function() {
  /* set up the page ... : */
  load_page();
});
