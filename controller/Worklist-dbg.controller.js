sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/ui/export/Spreadsheet"

], function (BaseController, JSONModel, formatter, Filter, FilterOperator, tn, Label,MT, Spreadsheet) {
	"use strict";

	return BaseController.extend("OpenGR.OpenGR.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this._dModel = this.getOwnerComponent().getModel();
			this._sModel = this.getOwnerComponent().getModel("smodel");
		    this._xModel = new sap.ui.model.json.JSONModel();

			this._poRec = [];
			this._grRec = [];
			this._rgrRec = [];
			this._invRec = [];
			this._rinvRec = [];
			this._poout = [];
		    this._xRec = [];
		    this._xOut  = {
		    "rec": this._xRec	
		    };
			this._out = {
				"rec": this._poout,
				"gramount": this._tgramount,
				"grcurrency": this._grcurrency,
				"invamount": this._tinvamount,
				"invcurrency": this._invcurrency

			};
			this._oModel = new sap.ui.model.json.JSONModel();

			var porgtoken = function (args) {
				var pgrp = args.text;
				return new tn({
					text: pgrp,
					key: pgrp
				});
			};

			var valToken = function (args) {
				var text = args.text;
				return new tn({
					text: text,
					key: text
				});
			};
			var addsupp = function (args) {
				var text = args.text;
				return new tn({
					text: text,
					key: text
				});
			};
			var pObj = this.byId("purord");
			pObj.addValidator(valToken);

			var pgobj = this.byId("purgrp");
			pgobj.addValidator(porgtoken);
			
			var sObj = this.byId("supp");
			sObj.addValidator(addsupp);


		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {},

		onSearch: function (oEvent) {},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {},

		_getPOHistoryData: function () {
			this._poRec = [];
			this._grRec = [];
			this._rgrRec = [];
			this._invRec = [];
			this._rinvRec = [];
			this._poout = [];
			this._tgramount = 0;
			this._tinvamount = 0;
			this._grcurrency = "";
			this._invcurrency = "";
			this._oModel.setData();
			var oFilters = [];
			
			var tObj = this.byId("purord");
			var kDate = this.byId("kdate");
			var tokens = tObj.getTokens();
		    var porgt = this.byId("purgrp");
			var otokens = porgt.getTokens();
			var supp = this.byId("supp");
			var stokens = supp.getTokens();
			var kValue = kDate.getValue();
			var proceed = "X";
			
			if(kValue === "")
			{
			 proceed = " ";
			 sap.m.MessageBox.warning("Please enter the key date");
			 
			}
			if(  tokens.length === 0 && otokens.length === 0 && stokens.length === 0 )
			{
			 proceed = " ";	
			  var emsg = this.getView().getModel("i18n").getResourceBundle().getText("emsg");
			  sap.m.MessageBox.warning(emsg);
			}
			if(proceed === "X")
			{
			sap.ui.core.BusyIndicator.show(1);
			
			var that = this;
		
			var pohModel = this._dModel;

		
			for (var i = 0; i < tokens.length; i++) {
				var poNo = tokens[i].getKey();
				var poF = new Filter("PurchaseOrder", FilterOperator.EQ, poNo);
				oFilters.push(poF);

			}
		
			for (var z = 0; z < otokens.length; z++) {
				var porgv = otokens[z].getKey();
				var porg = new Filter("PurchasingOrganization", FilterOperator.EQ, porgv);
				oFilters.push(porg);

			}
				for (var p = 0; p < stokens.length; p++) {
				var supno = stokens[p].getKey();
				var sobj = new Filter("Supplier", FilterOperator.EQ, supno);
				oFilters.push(sobj);

			}
		
			var keyDate;
			keyDate = kValue;// + "T00:00:00";
			var keyF = new Filter("PostingDate", FilterOperator.LE, keyDate);
			oFilters.push(keyF);

			var lPromise = new Promise(function (resolve, reject) {

				pohModel.read('/YY1_Open_GR_Details', {
					filters: oFilters,
					success: function (oResponse) {

						for (var j = 0; j < oResponse.results.length; j++) {
							var po = {};
							var gr = {};
							var rgr = {};
							var inv = {};
							var rinv = {};
							if (oResponse.results[j].GoodsMovementType === '101' &&
								oResponse.results[j].PurchasingHistoryCategory === 'E' &&
								oResponse.results[j].PurchasingHistoryDocumentType === '1') {
								po.PurchaseOrder = oResponse.results[j].PurchaseOrder;
								po.PurchaseOrderItem = oResponse.results[j].PurchaseOrderItem;
								po.Supplier = oResponse.results[j].Supplier;
								po.SupplierName = oResponse.results[j].SupplierName;
								po.Material = oResponse.results[j].Material;
								po.ProductName = oResponse.results[j].ProductName;
								po.ddate = oResponse.results[j].PostingDate;
								po.pdate = oResponse.results[j].PostingDate;
								po.MaterialBaseUnit = oResponse.results[j].MaterialBaseUnit;
								po.Plant = oResponse.results[j].Plant;
								po.OrderQuantity = oResponse.results[j].OrderQuantity;
								po.PurchaseOrderQuantityUnit = oResponse.results[j].PurchaseOrderQuantityUnit;
								po.NetAmount = oResponse.results[j].NetAmount;
								po.NetPriceAmount = oResponse.results[j].NetPriceAmount;
								po.pocurrency = oResponse.results[j].DocumentCurrency;

								if (!(that._poRec.filter(function (e) {
										return e.PurchaseOrder === po.PurchaseOrder &&
											e.PurchaseOrderItem === po.PurchaseOrderItem;
									}).length > 0)) {
									that._poRec.push(po);
								}

							}

							if (oResponse.results[j].GoodsMovementType === '101' &&
								oResponse.results[j].PurchasingHistoryCategory === 'E' &&
								oResponse.results[j].PurchasingHistoryDocumentType === '1') {
								gr.PurchaseOrder = oResponse.results[j].PurchaseOrder;
								gr.PurchaseOrderItem = oResponse.results[j].PurchaseOrderItem;
								gr.PurchasingHistoryDocument = oResponse.results[j].PurchasingHistoryDocument;
								gr.PurchasingHistoryDocumentItem = oResponse.results[j].PurchasingHistoryDocumentItem;
								gr.PurchasingHistoryDocumentYear = oResponse.results[j].PurchasingHistoryDocumentYear;
								gr.grquantity = oResponse.results[j].Quantity;
								gr.GRAmount = oResponse.results[j].GRAmount;
								gr.grcurrency = oResponse.results[j].DocumentCurrency_01;

								var grindex = that._grRec.findIndex(function (e) {
									return e.PurchaseOrder === gr.PurchaseOrder &&
										e.PurchaseOrderItem === gr.PurchaseOrderItem;
								});
								if (grindex === -1) {
									that._grRec.push(gr);
								} else {

									//		that._grRec[grindex].grquantity = that._grRec[grindex].grquantity + gr.grquantity;
									//		that._grRec[grindex].GRAmount = that._grRec[grindex].GRAmount  + gr.GRAmount;
									that._grRec[grindex].grquantity = parseFloat(that._grRec[grindex].grquantity) + parseFloat(gr.grquantity);
									that._grRec[grindex].GRAmount = parseFloat(that._grRec[grindex].GRAmount) + parseFloat(gr.GRAmount);

								}

							}

							if (oResponse.results[j].GoodsMovementType === '102' &&
								oResponse.results[j].PurchasingHistoryCategory === 'E' &&
								oResponse.results[j].PurchasingHistoryDocumentType === '1') {
								rgr.PurchaseOrder = oResponse.results[j].PurchaseOrder;
								rgr.PurchaseOrderItem = oResponse.results[j].PurchaseOrderItem;
								rgr.PurchasingHistoryDocument = oResponse.results[j].PurchasingHistoryDocument;
								rgr.PurchasingHistoryDocumentItem = oResponse.results[j].PurchasingHistoryDocumentItem;
								rgr.PurchasingHistoryDocumentYear = oResponse.results[j].PurchasingHistoryDocumentYear;
								rgr.rgrquantity = oResponse.results[j].Quantity;
								rgr.rGRAmount = oResponse.results[j].GRAmount;
								rgr.grcurrency = oResponse.results[j].DocumentCurrency_01;

								var rgrindex = that._rgrRec.findIndex(function (e) {
									return e.PurchaseOrder === rgr.PurchaseOrder &&
										e.PurchaseOrderItem === rgr.PurchaseOrderItem;
								});
								if (rgrindex === -1) {
									rgr.rgrquantity = parseFloat(rgr.rgrquantity) * -1;
									rgr.rGRAmount = parseFloat(rgr.rGRAmount) * -1;

									that._rgrRec.push(rgr);
								} else {
									that._rgrRec[rgrindex].rgrquantity = parseFloat(that._rgrRec[rgrindex].rgrquantity) + (parseFloat(rgr.rgrquantity) * -1);
									that._rgrRec[rgrindex].rGRAmount = parseFloat(that._rgrRec[rgrindex].rGRAmount) + (parseFloat(rgr.rGRAmount) * -1);
								}
							}

							if (oResponse.results[j].DebitCreditCode === 'S' &&
								oResponse.results[j].PurchasingHistoryCategory === 'Q' &&
								oResponse.results[j].PurchasingHistoryDocumentType === '2') {
								inv.PurchaseOrder = oResponse.results[j].PurchaseOrder;
								inv.PurchaseOrderItem = oResponse.results[j].PurchaseOrderItem;
								inv.PurchasingHistoryDocument = oResponse.results[j].PurchasingHistoryDocument;
								inv.PurchasingHistoryDocumentItem = oResponse.results[j].PurchasingHistoryDocumentItem;
								inv.PurchasingHistoryDocumentYear = oResponse.results[j].PurchasingHistoryDocumentYear;
								inv.invquantity = oResponse.results[j].Quantity;
								inv.invamount = oResponse.results[j].InvoiceAmtInCoCodeCrcy;
								inv.invcurrency = oResponse.results[j].DocumentCurrency_01;

								var invindex = that._invRec.findIndex(function (e) {
									return e.PurchaseOrder === inv.PurchaseOrder &&
										e.PurchaseOrderItem === inv.PurchaseOrderItem;
								});
								if (invindex === -1) {
									that._invRec.push(inv);
								} else {
									that._invRec[invindex].invquantity = parseFloat(that._invRec[invindex].invquantity) + parseFloat(inv.invquantity);
									that._invRec[invindex].invamount = parseFloat(that._invRec[invindex].invamount) + parseFloat(inv.invamount);
								}
							}

							if (oResponse.results[j].DebitCreditCode === 'H' &&
								oResponse.results[j].PurchasingHistoryCategory === 'Q' &&
								oResponse.results[j].PurchasingHistoryDocumentType === '2') {
								rinv.PurchaseOrder = oResponse.results[j].PurchaseOrder;
								rinv.PurchaseOrderItem = oResponse.results[j].PurchaseOrderItem;
								rinv.PurchasingHistoryDocument = oResponse.results[j].PurchasingHistoryDocument;
								rinv.PurchasingHistoryDocumentItem = oResponse.results[j].PurchasingHistoryDocumentItem;
								rinv.PurchasingHistoryDocumentYear = oResponse.results[j].PurchasingHistoryDocumentYear;
								rinv.rinvquantity = oResponse.results[j].Quantity;
								rinv.rinvamount = oResponse.results[j].InvoiceAmtInCoCodeCrcy;
								rinv.rinvcurrency = oResponse.results[j].DocumentCurrency_01;

								var rinvindex = that._rinvRec.findIndex(function (e) {
									return e.PurchaseOrder === rinv.PurchaseOrder &&
										e.PurchaseOrderItem === rinv.PurchaseOrderItem;
								});
								if (rinvindex === -1) {
									rinv.rinvquantity = parseFloat(rinv.rinvquantity) * -1;
									rinv.rinvamount = parseFloat(rinv.rinvamount) * -1;
									that._rinvRec.push(rinv);
								} else {
									that._rinvRec[rinvindex].rinvquantity = parseFloat(that._rinvRec[rinvindex].rinvquantity) + (parseFloat(rinv.rinvquantity) *
										-1);
									that._rinvRec[rinvindex].rinvamount = parseFloat(that._rinvRec[rinvindex].rinvamount) + (parseFloat(rinv.rinvamount) * -
										1);
								}
							}

						}
						resolve();
					},
					error: function (oError) {
						var omsg = {};

						reject();
					}
				});
			});

			lPromise.then(function () {
				that._calculateOpenGR();
			});
			}
				
			},
		getData: function (oEvent) {

			this._getPOHistoryData();

		},
		_calculateOpenGR: function () {

			for (var j = 0; j < this._poRec.length; j++) {
				var poout = {};
				poout.PurchaseOrder = this._poRec[j].PurchaseOrder;
				poout.PurchaseOrderItem = this._poRec[j].PurchaseOrderItem;
				poout.Supplier = this._poRec[j].Supplier;
				poout.SupplierName = this._poRec[j].SupplierName;
				poout.Material = this._poRec[j].Material;
				poout.ProductName = this._poRec[j].ProductName;
				poout.ddate = this._poRec[j].ddate;
				poout.pdate = this._poRec[j].pdate;
				poout.MaterialBaseUnit = this._poRec[j].MaterialBaseUnit;
				poout.Plant = this._poRec[j].Plant;
				poout.OrderQuantity = this._poRec[j].OrderQuantity;
				poout.PurchaseOrderQuantityUnit = this._poRec[j].PurchaseOrderQuantityUnit;
				poout.NetAmount = this._poRec[j].NetAmount;
				poout.NetPriceAmount = this._poRec[j].NetPriceAmount;
				poout.pocurrency = this._poRec[j].pocurrency;

				poout.DocumentCurrency = this._poRec[j].DocumentCurrency;

				for (var k = 0; k < this._grRec.length; k++) {

					if (poout.PurchaseOrder === this._grRec[k].PurchaseOrder &&
						poout.PurchaseOrderItem === this._grRec[k].PurchaseOrderItem) {
						poout.grquantity = this._grRec[k].grquantity;
						poout.gramount = this._grRec[k].GRAmount;
						poout.grcurrency = this._grRec[k].grcurrency;
						poout.grunitprice = poout.NetPriceAmount;
						this._grcurrency = poout.grcurrency;
					}
				}
				for (var l = 0; l < this._rgrRec.length; l++) {
					if (poout.PurchaseOrder === this._rgrRec[l].PurchaseOrder &&
						poout.PurchaseOrderItem === this._rgrRec[l].PurchaseOrderItem) {
						poout.rgrquantity = this._rgrRec[l].rgrquantity;
						poout.rgramount = this._rgrRec[l].rGRAmount;
						

					}
				}

				for (var i = 0; i < this._invRec.length; i++) {
					if (poout.PurchaseOrder === this._invRec[i].PurchaseOrder &&
						poout.PurchaseOrderItem === this._invRec[i].PurchaseOrderItem) {

						poout.invquantity = this._invRec[i].invquantity;
						poout.invamount = this._invRec[i].invamount;
						poout.invcurrency = this._invRec[i].invcurrency;
						this._invcurrency = poout.invcurrency;
						poout.invunitprice = poout.NetPriceAmount;
					}

				}
				for (var m = 0; m < this._rinvRec.length; m++) {
					if (poout.PurchaseOrder === this._rinvRec[m].PurchaseOrder &&
						poout.PurchaseOrderItem === this._rinvRec[m].PurchaseOrderItem) {

						poout.rinvquantity = this._rinvRec[m].rinvquantity;
						poout.rinvamount = this._rinvRec[m].rinvamount;

					}

				}

				if (isNaN(poout.rgrquantity)) {
					poout.rgrquantity = 0;
				}
				if (isNaN(poout.rgramount)) {
					poout.rgramount = 0;
				}

				if (isNaN(poout.invquantity)) {
					poout.invquantity = 0;
				}

				if (isNaN(poout.invamount)) {
					poout.invamount = 0;
				}

				if (isNaN(poout.rinvquantity)) {
					poout.rinvquantity = 0;
				}

				if (isNaN(poout.rinvamount)) {
					poout.rinvamount = 0;
				}

				poout.tgrquantity = parseFloat(poout.grquantity) + parseFloat(poout.rgrquantity);
				poout.tinvquantity = parseFloat(poout.invquantity) + parseFloat(poout.rinvquantity);
				poout.tgramount = parseFloat(poout.gramount) + parseFloat(poout.rgramount);
				poout.tinvamount = parseFloat(poout.invamount) + parseFloat(poout.rinvamount);
				poout.damount = parseFloat(poout.tgramount) - parseFloat(poout.tinvamount);
				poout.qdiff = parseFloat(poout.tgrquantity) - parseFloat(poout.tinvquantity);

				poout.tgramount = parseFloat(poout.tgramount).toFixed(2);
				poout.tinvamount = parseFloat(poout.tinvamount).toFixed(2);
				poout.damount = parseFloat(poout.damount).toFixed(2);
			
				
				this._tgramount = parseFloat(this._tgramount) + parseFloat(poout.tgramount);
				this._tinvamount = parseFloat(this._tinvamount) + parseFloat(poout.tinvamount);
			
			
				if (poout.qdiff !== 0) {
					this._poout.push(poout);
				}
				this._poout.sort(function(a,b) {
					var apono = parseInt(a.PurchaseOrder);
					var apoino = parseInt(a.PurchaseOrderItem);
					var bpono = parseInt(b.PurchaseOrder);
					var bpoino = parseInt(b.PurchaseOrderItem);
					if (apono < bpono) {
						return -1;
					}
					if (apono === bpono) {
						if (apoino < bpoino) {
							return -1;
						}
					}

				});
				this._tgramount = parseFloat(this._tgramount).toFixed(2);
				this._tinvamount = parseFloat(this._tinvamount).toFixed(2);
			}

			this._display();
		},
		_display: function () {
			sap.ui.core.BusyIndicator.hide();
			var otab = this.byId("openGRTable");
			this._out.rec = this._poout;
			this._out.gramount = this._tgramount;
			this._out.grcurrency = this._grcurrency;
			this._out.invamount = this._tinvamount;
			this._out.invcurrency = this._invcurrency;
			this._oModel.setData(this._out);
			otab.setModel(this._oModel);
		},
		searchSuppliers: function () {
			var helpObj = sap.ui.core.Fragment.load({
				name: "OpenGR.OpenGR.view.supplierHelp",
				controller: this
			});
			var that = this;
			helpObj.then(function (oTable) {
				that._helpDialog = oTable;
				oTable.open();
				oTable.getTableAsync().then(function (oTab) {
					var lblCuse = new Label({
						text: "{Supplier}"
					});
					var colCuse = new sap.ui.table.Column({
						label: "Supplier",
						template: lblCuse,
						width: "8rem"
					});
					var lblCa = new Label({
						text: "{SupplierName}"
					});
					var colCa = new sap.ui.table.Column({
						label: "SupplierName",
						template: lblCa,
						width: "8rem"
					});

					oTab.addColumn(colCuse);
					oTab.addColumn(colCa);
					oTab.setModel(that._sModel);
					oTab.bindAggregation("rows", {
						path: "/A_Supplier",
						parameters: {
							select: "Supplier,SupplierName"
						}
					});
					oTable.update();
				}).bind(that);

				//	helpObj.open();

			});
		},
		onValueHelpCancel: function () {
			this._helpDialog.close();
		},
		onValueHelpOk: function (oEvent) {
			var tokens = oEvent.getParameter("tokens");
			//	this._cTypes = tokens;
			var sObj = this.byId("supp");
			sObj.setTokens(tokens);
			this._helpDialog.close();
		},
		onValueHelpAfterClose: function () {
			this._helpDialog.destroy();
		},
		downloadData: function () {
			if(this._poout.length > 0)
			{
			var oSetting;
			var ocloumns = this._getColumnsData();
			var tObj = {};
		    tObj.tgramount =   this._tgramount;
		    tObj.tinvamount =  this._tinvamount;
		    tObj.supplier = "Total";
			this._xRec = this._poout;
			this._xRec.push(tObj);
			this._xOut.rec = this._xRec;
			this._xModel.setData(this._xOut);
			var oDatasource = this._xModel.getProperty("/rec");
			oSetting = {
				workbook: {

					columns: ocloumns
				},
				dataSource: oDatasource
			};
		var xSheet = new Spreadsheet( oSetting);
		xSheet.build()
					.then(function () {
						MT.show('Spreadsheet export has finished');
					})
					.finally(xSheet.destroy);
			}
		else{
		 	var noRecordMsg = this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");
				sap.m.MessageBox.warning(noRecordMsg);
		}	
		},
		_getColumnsData: function () {
			var oColumns = [];
			var supplier = this.getView().getModel("i18n").getResourceBundle().getText("supplier");
			var sname = this.getView().getModel("i18n").getResourceBundle().getText("sname");
			var plant = this.getView().getModel("i18n").getResourceBundle().getText("plant");
			var po = this.getView().getModel("i18n").getResourceBundle().getText("po");
			var poitem = this.getView().getModel("i18n").getResourceBundle().getText("poitem");
			var mat = this.getView().getModel("i18n").getResourceBundle().getText("material");
			var pdesc = this.getView().getModel("i18n").getResourceBundle().getText("pdesc");
			var invp = this.getView().getModel("i18n").getResourceBundle().getText("invp");
			var dater = this.getView().getModel("i18n").getResourceBundle().getText("dater");
			var poq = this.getView().getModel("i18n").getResourceBundle().getText("poq");
			var pup = this.getView().getModel("i18n").getResourceBundle().getText("pup");
			var pamt = this.getView().getModel("i18n").getResourceBundle().getText("pamt");
			var poc = this.getView().getModel("i18n").getResourceBundle().getText("poc");
			var qr = this.getView().getModel("i18n").getResourceBundle().getText("qr");
			var grup = this.getView().getModel("i18n").getResourceBundle().getText("grup");
			var ar = this.getView().getModel("i18n").getResourceBundle().getText("ar");
			var grcurrency = this.getView().getModel("i18n").getResourceBundle().getText("grcurrency");

			var qi = this.getView().getModel("i18n").getResourceBundle().getText("qi");
			var iup = this.getView().getModel("i18n").getResourceBundle().getText("iup");
			var invcurrency = this.getView().getModel("i18n").getResourceBundle().getText("invcurrency");
			var ainv = this.getView().getModel("i18n").getResourceBundle().getText("ainv");
			var qd = this.getView().getModel("i18n").getResourceBundle().getText("qd");
			var ad = this.getView().getModel("i18n").getResourceBundle().getText("ad");
			oColumns.push({
				label: supplier,
				property: "Supplier",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: sname,
				property: "SupplierName",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: plant,
				property: "Plant",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: po,
				property: "PurchaseOrder",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: poitem,
				property: "PurchaseOrderItem",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: mat,
				property: "Material",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: pdesc,
				property: "ProductName",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: invp,
				property: "pdate",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: dater,
				property: "ddate",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: poq,
				property: "OrderQuantity",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: pup,
				property: "NetPriceAmount",
				width: 10,
				type: "string"
			});

			oColumns.push({
				label: pamt,
				property: "NetAmount",
				width: 10,
				type: "string"
			});

			oColumns.push({
				label: poc,
				property: "pocurrency",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: qr,
				property: "tgrquantity",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: grup,
				property: "grunitprice",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: ar,
				property: "tgramount",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: grcurrency,
				property: "grcurrency",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: qi,
				property: "tinvquantity",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: iup,
				property: "invunitprice",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: ainv,
				property: "tinvamount",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: qd,
				property: "qdiff",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: ad,
				property: "damount",
				width: 10,
				type: "string"
			});
			oColumns.push({
				label: invcurrency,
				property: "invcurrency",
				width: 10,
				type: "string"
			});
			return oColumns;
		}
	});
});