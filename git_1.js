///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define([  'dojo/_base/declare',
          'jimu/BaseWidget',
          'dojo/on',
          'dojo/_base/lang',
          'dojo/Deferred',
          'dojo/dom',
          "dojo/dom-attr",
          'dojo/parser',
          'dijit/layout/TabContainer',
          'dijit/layout/ContentPane',
          'dijit/form/Select',
          'esri/map',
          'esri/tasks/query',
          'esri/tasks/QueryTask',
          "esri/geometry/webMercatorUtils",
          "esri/toolbars/draw",
          "esri/graphic",
          "esri/layers/FeatureLayer",
          "esri/symbols/SimpleMarkerSymbol",
          "esri/symbols/SimpleLineSymbol",
          "esri/symbols/SimpleFillSymbol",
          "esri/symbols/PictureFillSymbol",
          "esri/symbols/CartographicLineSymbol", 
          "esri/Color",  
          "esri/dijit/Search",
          "dojox/layout/FloatingPane",
          "dijit/Dialog",
          "dijit/form/Button",
          'dojo/dom-style',
          "dojo/fx/Toggler",
          "dojo/fx",
          "dojo/ready"],
function(declare, BaseWidget, on, lang, Deferred, dom, domAttr, parser, TabContainer, ContentPane, Select, map, Query, QueryTask, webMercatorUtils,
   Draw, Graphic, FeatureLayer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, PictureFillSymbol, CartographicLineSymbol, Color, Search, easing, Chart, Chart2D, Default, Pie, blue, green, MoveSlice, Highlight, Tooltip, ColumnsPlot, ClusteredColumns,
    Markers, Tufte, Magnify, MouseZoomAndPan, FloatingPane, Dialog, Button, domStyle, Toggler, coreFx, ready) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,
    that: null,
    map: null,

    baseClass: 'jimu-widget-GWL',

    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
    },

    startup: function() {
      this.inherited(arguments);
      this.layerList();
      this.gwl_main();      
      this.gwl_Select();
      console.log('startup');
    },

    layerList: function () {     
      //Lists all Graphic layers on the map
      debugger;
      layer_list = this.map.graphicsLayerIds;
      that = this; 
      map = this.map;
      var query = new Query()   
      query.where = "1=1"
      query.geometry = this.extensionFilter
      query.returnGeometry = true
      query.outFields = ["*"]        
      // layer_gwl_1 = new FeatureLayer("https://geomonitor.co.in/server/rest/services/ABHY/GWM_Stations/FeatureServer/0");
      // window.layer_gwl_1 = layer_gwl_1;
      layer_list.forEach(function (element) {
        if (element.includes("GWM_STATIONS_14042020_ABHY_Blocks")) {
          gwl_layer = element;
          window.gwl_layer = that.map.getLayer(element);
          gwl_layer.setVisibility(true);                        
        }
        else if (element.includes("ABHY_Blocks_Merge")) {
          window.abhy_block_bound = that.map.getLayer(element);
          abhy_block_bound.setVisibility(true);            
        }
        else{
          window.other_layer = that.map.getLayer(element);
          other_layer.setVisibility(false);
        }
      });
    },

    gwl_Select: function(){
        var dijitSearch = new Search({
          map: this.map
        }, "searchLocation_gwl");
        dijitSearch.startup();

        new Select({
          name: "State chooser",
          id: "state_gwl"
        }, this.lineType_gwl).startup()

        new Select({
          name: "District_Chooser",
          id: "dist_gwl"
        }, this.Location_District_gwl).startup()

        new Select({
          name: "Block_Chooser",
          id: "block_gwl"
        }, this.Location_Block_gwl).startup()

        new Select({
          name: "Village_Chooser",
          id: "gp_gwl"
        }, this.Location_Village_gwl).startup()

        var state_array = ['Select State','Maharashtra','Karnataka', 'Rajasthan', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'];
        var map_s = state_array.map(function (record) {
          return dojo.create("option", {
            label: record,
            value: record
          })
        })
        var stateval = dijit.byId('state_gwl')
        stateval.options.length = 0
        stateval.addOption(map_s)
        stateval.attr('value', state_array[0]);

        var districts = [];
        var that = this;
        AOI_chooser = dijit.byId('state_gwl')
        window.inpstate = AOI_chooser;
        var distValue = dijit.byId('dist_gwl')
        window.inpdist = distValue;

        var query1 = new Query()
        query1.returnGeometry = true

        this.own(on(AOI_chooser, 'change', lang.hitch(this, function (evt) {

          this.lineType_gwl = evt;
          window.selectedstate = evt;
          query1.where = "state_12 like" +" "+"\'"+ this.lineType_gwl+"\'"
          while (districts.length > 0) {
            districts.pop();
          }
          query1.outFields = ["district_12"]
          query1.returnGeometry = false
          query1.returnDistinctValues = true
          //querying displacement service url and getting all districts data
          new QueryTask(gwl_layer.url).execute(query1, function retrieve(response) {
            window.response = response;
            window.response.features.forEach(function (feature) {
              dist_val = feature.attributes.district_12;
              districts.push(dist_val);
              var map_d = districts.map(function (record) {
                return dojo.create("option", {
                  label: record,
                  value: record
                })
              })
              distValue.options.length = 0
              distValue.addOption("Select District")
              distValue.addOption(map_d)
              distValue.attr('value', districts[0])
            });
          });
        })));

        this.own(on(distValue, 'change', lang.hitch(this, function (evt) {
          this.Location_District = evt;
          window.selecteddist = evt;
          query1.where = "district_12 like" +" "+"\'"+ evt+"\'"
          // query1.where = "x = " + evt
          query1.outFields = ["block_12"]
          query1.returnGeometry = false
          query1.returnDistinctValues = true          
          that.queryBlocks(query1);
        })));        
    },

    queryBlocks: function (query1) {

        that = this;
        var blocks = [];
        var blockValue = dijit.byId('block_gwl')
        window.inpblock = blockValue;
        new QueryTask(gwl_layer.url).execute(query1, function retrieve(response) {
          //quering and pushing all blocks datat to an array
          window.response2 = response;
          window.response2.features.forEach(function (feature) {
            block_val = feature.attributes.block_12;
             blocks.push(block_val);                   
            //appending block options to dropdown
            var map_b = blocks.map(function (record) {
              return dojo.create("option", {
                label: record,
                value: record
              })
            })
            blockValue.options.length = 0
            blockValue.addOption("Select Block")
            blockValue.addOption(map_b)
            blockValue.attr('value', blocks[0])
          });
        });
        //10 blocks in maharshtra sangli-------------atpadi
        this.own(on(blockValue, 'change', lang.hitch(this, function (evt) {
          this.Location_Block = evt;
          window.selectedblock = evt;
          gwl_layer.setDefinitionExpression("state_12 like" +" "+"\'"+ selectedstate +"\'"  + " " + "AND" + " " + "district_12 like" +" "+"\'"+ selecteddist +"\'"+ " " + "AND" + " " + "block_12 like" + " " + "\'" + selectedblock + "\'");
          abhy_block_bound.setDefinitionExpression("BLOCK like" +" "+"\'"+ selectedblock +"\'");
          // query1.where = "state_12 like" +" "+"\'"+ selectedstate +"\'"  + " " + "AND" + " " + "district_12 like" +" "+"\'"+ selecteddist +"\'" 
          //                 + " " + "AND" + " " + "block_12 like" + " " + "\'" + evt + "\'" ;
          // query1.outFields = ["*"]
          // query1.returnGeometry = true
          // query1.returnDistinctValues = false
          // that.visualize_Blocks(query1);
        })));
    
    },

    visualize_Blocks: function (query1) {

        that = this;
        // map.graphics.clear();
        new QueryTask(gwl_layer.url).execute(query1, function retrieve(response) {
          //quering and pushing all gps datat to an array
              window.response2 = response;
              window.response2.features.forEach(function (feature) {            
              debugger;
              gwl_layer.setDefinitionExpression("state_12 like" +" "+"\'"+ selectedstate +"\'"  + " " + "AND" + " " + "district_12 like" +" "+"\'"+ selecteddist +"\'"+ " " + "AND" + " " + "block_12 like" + " " + "\'" + selectedblock + "\'");                     
          });
        });
    },      

    selectByLocation: function(map){

      toolbar = new Draw(map);
      dojo.query(".gwl_tool").on("click", activateTool);

      function activateTool() {
        this.label = "Point";
        toolbar = new Draw(map); 
        toolbar.activate(Draw.POINT);
        toolbar.on("draw-end", addToMap);
      }

      function addToMap(evt) {
        map.graphics.clear();
        var symbol;
        toolbar.deactivate();
        switch (evt.geometry.type) {
          case "point":
          case "multipoint":
            symbol = new SimpleMarkerSymbol();
            break;
          case "polyline":
            symbol = new SimpleLineSymbol();
            break;
          default:
            symbol = new SimpleFillSymbol();
            break;
        }
        var graphic = new Graphic(evt.geometry, symbol);
        map.graphics.add(graphic);
        showCoordinates(evt.geometry);
      }

      function showCoordinates(evt) {
        debugger;
        var query1 = new esri.tasks.Query();
        query1.where = "1=1"
        query1.geometry =  evt; 
        query1.returnGeometry = false
        query1.outFields = ["*"]
        query1.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;          
        //the map is in web mercator but display coordinates in geographic (lat, long)
        mp = webMercatorUtils.webMercatorToGeographic(evt);
        new QueryTask(layer_abhy.url).execute(query1, function(feature, index){
          //feature._extent.contains(mp)
            // if (feature.geometry.contains(mp)) {

               dom.byId('lat').value = Number(mp.y.toFixed(6))
               dom.byId('long').value = Number(mp.x.toFixed(6))

                console.log(feature);
                inpstate = feature.features[0].attributes.state_name
                inpdist = feature.features[0].attributes.district_name
                inpblock = feature.features[0].attributes.block
                inpgp = feature.features[0].attributes.gname 
                feature.fields.forEach(function(field){
                    var fieldname = field.name;
                    if (feature.features[0].attributes[fieldname] == null || feature.features[0].attributes[fieldname] == " ") {
                        feature.features[0].attributes[fieldname] = 0;
                    }
                }); 
                feature = feature.features[0];                                
               // Gram Panchayat Information and Water Budget
                dom.byId('tol_pop').value = feature.attributes.tol_population
                dom.byId('male_pop').value = feature.attributes.male_population
                dom.byId('female_pop').value = feature.attributes.female_population
                dom.byId('tol_farmers').value = feature.attributes.tol_farmers
                dom.byId('tol_agri').value = feature.attributes.tol_agri_labours
                dom.byId('tol_h_act').value = feature.attributes.tol_household_activities
                dom.byId('otr_govt_emp').value = feature.attributes.others_govt_private_employees
                dom.byId('f_area').value = feature.attributes.forest_area
                dom.byId('fal_land').value = feature.attributes.fallow_land
                dom.byId('bar_land').value = feature.attributes.barrren_land
                dom.byId('waste_land').value = feature.attributes.cult_waste_land
                dom.byId('non_agri').value = feature.attributes.area_non_agri
                dom.byId('i_canals').value = feature.attributes.irri_canals
                dom.byId('i_tanks').value = feature.attributes.irri_tanks
                dom.byId('i_dug_wells').value =  feature.attributes.irri_dugwells
                dom.byId('i_bore').value =  feature.attributes.irri_dug_borewells
                dom.byId('wl_bullock').value =  feature.attributes.bullock_drawn
                dom.byId('wl_diesel').value =  feature.attributes.diesel_pump
                dom.byId('wl_cpump').value =  feature.attributes.centrifugal_pump
                dom.byId('wl_pump').value =  feature.attributes.water_pump

                dom.byId('wi_light').value = feature.attributes.male_population //not available in attributes
                dom.byId('wi_cook').value = feature.attributes.female_population //not available in attributes

                dom.byId('kc_rice').value = feature.attributes.rice
                dom.byId('kc_scane').value = feature.attributes.sugarcane
                dom.byId('kc_cot').value = feature.attributes.cotton
                dom.byId('kc_maiz').value = feature.attributes.maize
                dom.byId('kc_othr').value =  feature.attributes.others
                dom.byId('rc_weat').value = feature.attributes.wheat
                dom.byId('rc_must').value = feature.attributes.mustard
                dom.byId('rc_gr').value = feature.attributes.gram
                dom.byId('rc_barly').value = feature.attributes.rabi_barley
                dom.byId('rc_othr').value =  feature.attributes.rabi_others
                dom.byId('k_r_tom').value =  feature.attributes.kharif_rabi_tomoto
                dom.byId('k_r_othr').value = feature.attributes.kharif_rabi_others
                dom.byId('lp_c_b').value = Math.round(feature.attributes.livestock_cows_buffaloes)
                dom.byId('lp_bullock').value = Math.round(feature.attributes.livestock_bullocks)
                dom.byId('lp_s_g').value = Math.round(feature.attributes.livestock_sheeps_goats)
                dom.byId('mon_rain').value = feature.attributes.monsoon_rainfall
                dom.byId('n_mon_rain').value =  feature.attributes.non_monsoon_rainfall
                dom.byId('mon_gw').value =  feature.attributes.monsoon_gw_level
                dom.byId('n_mon_gw').value =  feature.attributes.non_monsoon_gw_level
                dom.byId('wu_dp').value =  feature.attributes.water_drinking_purpose
                dom.byId('wu_ap').value =  feature.attributes.water_agriculture_purpose
                dom.byId('wu_ip').value =  feature.attributes.water_industrial_purpose
                dom.byId('wu_domp').value =  feature.attributes.water_domestic_purpose
                dom.byId('ps_ec').value = feature.attributes.power_availbility
                dom.byId('ps_hh').value =  feature.attributes.power_hhs
                dom.byId('ps_e_i').value =  feature.attributes.power_iirigation
                dom.byId('ps_avg_e').value =  feature.attributes.power_avg_hours_connectivity
                dom.byId('so_shg').value =  feature.attributes.social_self_help
                dom.byId('so_yc').value = feature.attributes.social_youth_clubs
                dom.byId('so_coop_sc').value = feature.attributes.social_cooperative
                dom.byId('so_othr').value = feature.attributes.social_others
                dom.byId('rcon_pucca').value = feature.attributes.pucca_road
                dom.byId('rcon_kuch').value =  feature.attributes.kuchha_road


                //tab 3 data binding

                dom.byId('ar_rfall').value = 0 // feature.attributes.Gwr_Rainfall_Area
                dom.byId('a_rfall').value = 0 // feature.attributes.Gwr_Rainfall_Rainfall
                dom.byId('v_rfall').value = 0 // feature.attributes.Gwr_Rainfall_Rainfall

                dom.byId('a_spr').value = 0 //feature.attributes.springs_Discharge
                dom.byId('ar_spr').value = 0 //feature.attributes.Springs_Total_Geographical_Area_in_Hectares
                dom.byId('avg_d_spr').value = 0   // feature.attributes.Springs_Depth
                dom.byId('dis_a_spr').value = 0// feature.attributes.springs_Discharge
                dom.byId('a_spr_v').value = 0 // feature.attributes.springs_Discharge

                dom.byId('dam_no').value = 0 //feature.attributes.No_Of_CheckDams
                dom.byId('dam_v').value = 0 // feature.attributes.CheckDams_Capacity
                dom.byId('dam_dis').value = 0 //  feature.attributes.checkdams_Discharge
                dom.byId('dam_avg_dep').value = 0 // feature.attributes.checkdams_Discharge
                dom.byId('dam_vv').value = 0 // feature.attributes.CheckDams_Capacity

                dom.byId('canal_no').value = 0 //feature.attributes.Canals_River_Canal_Functioning_All_round_the_year
                dom.byId('canal_a').value = 0 //feature.attributes.Canals_Area_in_Hectares
                dom.byId('canal_avg_d').value = 0 // feature.attributes.Canals_Depth
                dom.byId('canal_dis').value = 0 // feature.attributes.canals_Discharge
                dom.byId('canal_v').value = 0 // feature.attributes.canals_Discharge

                dom.byId('res_no').value = 0 // feature.attributes.reservoir_Discharge
                dom.byId('res_v').value = 0 // feature.attributes.reservoir_Discharge
                dom.byId('res_dis').value = 0 //feature.attributes.Reservoir_Name
                dom.byId('res_vv').value = 0 //feature.attributes.Reservoir_Name

                dom.byId('lpt_no').value = 0 //feature.attributes.Harvesting_Tanks_Lakes_Area_in_Hectares
                dom.byId('lpt_a').value = 0 //feature.attributes.Tanks_Lakes_Area_in_Hectares
                dom.byId('lpt_avg_d').value = 0 // feature.attributes.Tanks_Depth
                dom.byId('lpt_dis').value = 0 // feature.attributes.lakespondstanks_Discharge
                dom.byId('lpt_v').value = 0 // feature.attributes.Harvesting_Tanks_Lakes_Area_in_Hectares

                dom.byId('riv_no').value = 0 //feature.attributes.reservoir_Discharge
                dom.byId('riv_a').value = 0 //feature.attributes.reservoir_Discharge
                dom.byId('riv_avg_d').value = 0 //feature.attributes.Reservoir_Name
                dom.byId('riv_dis').value = 0 //feature.attributes.Reservoir_Name
                dom.byId('riv_v').value = 0 //feature.attributes.Reservoir_Name



                dom.byId('rfall_a').value = 0 // feature.attributes.river_Discharge
                dom.byId('rfall_mm').value = 0 // feature.attributes.River_Canals_Area_in_Hectares
                dom.byId('rfall_ar').value = 0 //feature.attributes.River_Canal_Functioning_All_round_the_year
                


                dom.byId('rfall_rf').value = 0 //feature.attributes.river_Discharge
                dom.byId('rfall_rec').value = 0 // feature.attributes.River_Depth



                dom.byId('nt_har_wells').value = 0
                dom.byId('nt_har_canals').value = 0
                dom.byId('nt_har_lpt').value = 0
                dom.byId('nt_har_bunds').value = 0
                dom.byId('nt_har_rc').value = 0

                dom.byId('ir_max_sarea').value = 0
                dom.byId('ir_rr').value = 0
                dom.byId('ir_sub_days').value = 0
                dom.byId('ir_rc').value = 0

                dom.byId('dam_max_sarea').value = 0
                dom.byId('dam_avg_dep').value = 0
                dom.byId('dam_no').value = 0
                dom.byId('dam_rc').value = 0
                dom.byId('seep_l').value = 0;
                dom.byId('seep_typ').value = 0
                dom.byId('seep_dis').value = 0;
                dom.byId('seep_soil').value = 0
                dom.byId('seep_fac').value = 0
                dom.byId('seep_fl_days').value = 0
                dom.byId('seep_avg_p').value = 0
                dom.byId('seep_rcswi').value = 0

                dom.byId('swi_out_dis').value = 0
                dom.byId('swi_no_out').value = 0
                dom.byId('swi_wr_out').value = 0
                dom.byId('swi_gwl').value = 0
                dom.byId('swi_ir_pady').value = 0
                dom.byId('swi_ir_npady').value = 0
                dom.byId('swi_rc').value = 0

                dom.byId('gwi_gross').value = 0
                dom.byId('gwi_gwl').value = 0
                dom.byId('gwi_irp').value = 0
                dom.byId('gwi_irnp').value = 0
                dom.byId('gwi_rc').value = 0

                dom.byId('ird_hr').value = 0
                dom.byId('ird_no').value = 0
                dom.byId('ird_pdays').value = 0
                dom.byId('ird_avgprate').value = 0
                dom.byId('ird_draft').value = 0

                dom.byId('dp_tol_pop').value = 0
                dom.byId('dp_tol_cat').value = 0
                dom.byId('dp_tol_buf').value = 0
                dom.byId('dp_tol_gs').value = 0
                dom.byId('dp_draft').value = 0
                dom.byId('ind_swi').value = 0
                dom.byId('ind_gwi').value = 0
                dom.byId('ind_tol_p').value = 0
                dom.byId('ind_draft').value = 0 

                //Module 1 Formulae

                //Formula to calculate Recharge due to canal...
                //Rc= WA*SF*Days(WA = Wetted Areas, SF = Seepage Factor, Days)
                //feature.attributes.wettedAreas*feature.attributes.SeepageFactor*feature.attributes.seep_fl_days
                var Rc = dom.byId('rec_du_2_canal').value = 2*3*5

                //Formula to calculate Recharge due to Applied Surface Water Irrigation...
                //Rswi= AD*Days*RFF(AD = Average Discharge, Days , RFF=Return Flow Factor)
                //feature.attributes.canal_avg_d*feature.attributes.seep_fl_days*feature.attributes.Canals_River_Canal_Functioning_All_round_the_year
                var Rsw = dom.byId('rec_du_2_swi').value = 12*3*5

                //Formula to calculate Recharge due to Applied Ground Water Irrigation....
                //Rgwi= GD1*RFF(GD1 =GrossGroundWater Draftfor Irrigation , RFF=Return Flow Factor)
                //feature.attributes.gwi_rc*feature.attributes.seep_fac
                var Rgw = dom.byId('rec_du_2_gwi').value = 2*13

                //Formula to calculate Recharge due to Applied Tanks and Ponds
                //Rtp= AWSA*N*RF(AWSA = Avg Water Spread Area, N =No.ofDays,  RF=Recharge Factor)
                //feature.attributes.avgofsurfacewaterrainfall*feature.attributes.seep_fl_days*feature.attributes.rec_du_2_t    
                var Rt = dom.byId('rec_du_2_t&p').value = 2*3*15

                //Formula to calculate Recharge due to Water Conservation Resources
                //Rwcs= GS*RF(GS = Gross Storage,  RF=Recharge Factor)
                //feature.attributes.Storage*feature.attributes.rec_du_2_gwi
                var Rwc = dom.byId('rec_du_2_wcs').value = 10*3

                //Formula to calculate Recharge due to Rainfall
                //Rrf = h*Sy*A + Dg - Rc - Rsw - Rgw - Rt - Rwc..........
                //(h->Rise in water level;;Sy->Specific Yield;;A->area for computation of recharge;;Dg->Gross Ground water draft;;Rc->Recharge due to seepage from canals;;Rsw->Recharge from surface water irrigation;;Rgw->Recharge due to Groundwater;;Rt->Recharge from tanks;;Rwc->recharge from water conservation structures)
                // feature.attributes.Storage*feature.attributes.rec_du_2_gwi*feature.attributes.area_non_agri + feature.attributes.dp_draft - Rc - Rsw - Rgw - Rt - Rwc
                dom.byId('rec_du_2_rainfall').value = 10*3*5 + 12 - 8 - 3 - 1 - 2 - 3

                //Formula to calculate Allocation for Domestic and Industrial Needs....
                //A = 22*N*Lg(A = Allocation for domestic&industrial water req., N = Projected Pop.density, Lg= Fractional Load on Groundwater)
                //22*feature.attributes.gwi_rc*feature.attributes.seep_fac 
                dom.byId('alloc_4_dom&ind').value = 22*2*13

                //Formula to calculate Potential Resource Due to Shallow Water Table Areas....
                //PRWL = (5-DTW)*A*Sv---(PRWL = Pot. Resource in water, DTW = Avg Depth to Water, A= Area of water logged, Sy=Specific Yield )
                //(5-feature.attributes.gwi_rc)*feature.attributes.gwi_rc*feature.attributes.seep_fac 
                dom.byId('pot_du_2_wt').value = (5-3)*4*6

                //Formula to calculate Potential Resource Due to Flood Prone Area....
                //PRFL = 1.4* N * A/1000---(PRFL = Pot. Resource in Flood Prone Area, N = No.ofdays water, A= Flood Prone Area)
                //feature.attributes.gwi_rc*feature.attributes.seep_fac
                dom.byId('pot_du_2_fpa').value = 1.4*5*9/1000

                //Formula to calculate Static Ground Water Resources....
                //SGWR = A * (Z2-Z1) * Sy---(SGWR = Static Ground Water Resource, A = Area of Assessment Unit, Z2= Bottom of Unconfined Aquifer, Z1=Max ext.of Zone water, Sy= Specific Yield in zone)
                //feature.attributes.gwi_rc*feature.attributes.seep_fac                                                                                             
                dom.byId('static_gwresource').value = 30*(15-5)*9

                // Module 2 Water Utilisation Formulae

                //(i)Formula to calculate Ground Water Draft....
                //Gw(m3) = Hr * Dy * R * N-----(Hr->Daily Pumping hrs;;Dy->Total no.of Pumping Days;;R->avg Pumping rate;;N->Total no.of Tubewells)
                //feature.attributes.gwi_rc*feature.attributes.seep_fac*feature.attributes.rec_du_2_gwi*feature.attributes.no.oftubewells                                                                                            
                var Gw = dom.byId('static_gwresource').value = 3*2*9*1
                //(ii)Formula to calculate Surface Water Draft....
                //Sw = Surface Water Availability
                //feature.attributes.surf_water_avail                                                                                           
                var Sw = dom.byId('static_gwresource').value = 3
                //Formula to calculate Total Draft for Irrigation....
                //TDI = (0.7*Gw) + (0.3*Sw)                                                                                          
                var Irrigation = dom.byId('static_gwresource').value = (0.7*2) + (0.3*3)  

                //Formula to calculate Domestic Purpose....
                //(P->total population,Qp->per cap demand 4 population;; C-> total no.of cattle, Qc->per cap demand 4 cattle;; B->total no.of Buffaloes, Qb->per cap demand 4 buffaloes;; S->Total no.of  Goat & Sheep;;Qs->per cap demand 4 goat nd Sheep)
                //Total Water Requirement  for human and livestock(m3) = (P*Qp) + (C*Qc) + (B*Qb) + (S*Qs).....(Qp = 55);;(Qc = 110);;(Qb = 110);;(Qs = 7)
                //TWR4Human&LiveStock(m3) = (feature.attributes.tol_population*feature.attributes.per_cap_pop) + (feature.attributes.cattle*feature.attributes.per_cap_cattle) + (feature.attributes.buffaloes*feature.attributes.per_cap_buff) + (feature.attributes.g_and_s*feature.attributes.per_cap_gnds)
                var Domestic = dom.byId('static_gwresource').value = (20*55) + (3*110) + (2*110) + (2*7)

                //Formula to calculate Industry Water Draft....
                //Industry Water Draft(m3) = (Ws + Wg)* N* n---(Ws->Surface water Intake(m3/day) = 20% total availability;; Wg->Ground Water Intake(m3/day);; n->total no.of production days;; N->Total no.of Industries)
                //IWD(m3) = (feature.attributes.surf_water_intake + feature.attributes.gw_intake)*feature.attributes.tol_no_industries*feature.attributes.tol_no_prod_days
                var Industry = dom.byId('pot_du_2_fpa').value = (2 + 3)*4*6 

                //Formula to calculate Environmental Flow....
                //Environmental Flow = 0.05* TotalWaterAvailability---> 0.05*feature.attributes.tol_water_avail
                var Environmental_flow = dom.byId('pot_du_2_fpa').value = 0.05* 5

                //Total Water Draft = Irrigation + Domestic + Industry + Environmental Flow
                dom.byId('pot_du_2_fpa').value = 1 + 2 + 3 + 4                          

                // feature.attributes.jan_19 = dom.byId('jan').value;
                // feature.attributes.feb_19 = dom.byId('feb').value;
                // feature.attributes.mar_19 = dom.byId('mar').value;
                // feature.attributes.apr_19 = dom.byId('apr').value;
                // feature.attributes.may_19 = dom.byId('may').value;
                // that.layer_disp.applyEdits(null, [feature], null); 
            // }
        });
      }         
    },       

    gwl_main: function(){
        dojo.query(".gwl_tab").forEach(function (n) {
          new ContentPane({
            // just pass a title: attribute, this, we're stealing from the node
            title: domAttr.get(n, "title"),
            doLayout: false
          }, n);
        });
        var gwl_main_tab = new TabContainer({
          style: domAttr.get("gwl_main", "style"),
          doLayout: false
        }, "gwl_main");

        gwl_main_tab.startup();      
    },

    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){
      console.log('onClose');
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    },

    showVertexCount: function(count){
      this.vertexCount.innerHTML = 'The vertex count is: ' + count;
    }
  });
});