(function () {
    var Lang = YAHOO.lang,
        DT = YAHOO.widget.DataTable;

    // This is my requery method.  See: http://www.satyam.com.ar/yui/2.8.0/requery.html
    // Warning:  there is a good reason why this method is not part of the YUI Library: it does not always work
    // Please read the page at the URL above
    DT.prototype.requery = function (newRequest) {
        var ds = this.getDataSource(),
            req;
        if (this.get('dynamicData')) {
            // For dynamic data, newRequest is ignored since the request is built by function generateRequest.
            var paginator = this.get('paginator');
            this.onPaginatorChangeRequest(paginator.getState({
                'page': paginator.getCurrentPage()
            }));
        } else {
            // The LocalDataSource needs to be treated different
            if (ds instanceof YAHOO.util.LocalDataSource) {
                ds.liveData = newRequest;
                req = "";
            } else {
                req = (newRequest === undefined ? this.get('initialRequest') : newRequest);
            }
            ds.sendRequest(req, {
                success: this.onDataReturnInitializeTable,
                failure: this.onDataReturnInitializeTable,
                scope: this,
                argument: this.getState()
            });
        }
    };

    // Link formatter uses the same field both for the URL and the value shown.  
    // This redefinition is backward compatible and allows for a linkOptions property to define where the URL comes from.
    // See: http://yuilibrary.com/projects/yui2/ticket/2528778
    DT.Formatter.link = DT.prototype.formatLink = function (el, oRecord, oColumn, oData) {
        var url = oData,
            options = oColumn.linkOptions,
            target;
        if (options) {
            if (options.urlSource) {
                url = oRecord.getData(options.urlSource);
            }
            target = (options.target && (' target="' + options.target + '"')) || '';
        }
        if (Lang.isString(url)) {
            el.innerHTML = '<a href="' + url + '"' + target + '>' + oData + '</a>';
        }
        else {
            el.innerHTML = Lang.isValue(oData) ? oData : "";
        }
    };

    // The email formatter uses the same field for display purposes and the link
    // this patch lets it take the eMail address from another field
    DT.Formatter.email = DT.prototype.formatEmail = function (el, oRecord, oColumn, oData) {
        var address = oData,
            options = oColumn.emailOptions;
        if (options && options.addressSource) {
            address = oRecord.getData(options.addressSource);
        }
        if (Lang.isString(address)) {
            el.innerHTML = '<a href="mailto:' + address + '">' + oData + '</a>';
        }
        else {
            el.innerHTML = Lang.isValue(oData) ? oData : "";
        }
    };

	// Compensating for ticket: http://yuilibrary.com/projects/yui2/ticket/2527662
	DT.prototype._initRecordSet = function() {
		if(this._oRecordSet) {
			this._oRecordSet.reset();
		}
		else {
			var rs = this._oRecordSet = new YAHOO.widget.RecordSet();

			rs.createEvent("recordAddEvent");
			rs.createEvent("recordDeleteEvent");
			rs.createEvent("recordsAddEvent");
			rs.createEvent("recordsDeleteEvent");
			rs.createEvent("recordSetEvent");
			rs.createEvent("recordsSetEvent");
			rs.createEvent("recordUpdateEvent");
			rs.createEvent("recordValueUpdateEvent");
			rs.createEvent("resetEvent");
		}
	};

	/* see tickets:
		http://yuilibrary.com/projects/yui2/ticket/2528858
		http://yuilibrary.com/projects/yui2/ticket/2528859
	*/
	var lang = Lang;
	YAHOO.widget.RecordSet.prototype.deleteRecord = function(index) {
        if(lang.isNumber(index) && (index > -1) && (index < this.getLength())) {

			var oData = this.getRecord(index).getData();
            
            this._deleteRecord(index);
            this.fireEvent("recordDeleteEvent",{data:oData,index:index});
            return oData;
        }
        else {
            return null;
        }
    };


    YAHOO.widget.RecordSet.prototype.deleteRecords = function(index, range) {
        if(!lang.isNumber(range)) {
            range = 1;
        }
        if(lang.isNumber(index) && (index > -1) && (index < this.getLength())) {
            var recordsToDelete = this.getRecords(index, range);
            // Copy data from each Record for the event that gets fired later
            var deletedData = [];
            
            for(var i=0; i<recordsToDelete.length; i++) {
                deletedData[deletedData.length] = recordsToDelete[i].getData();
            }
            this._deleteRecord(index, range);

            this.fireEvent("recordsDeleteEvent",{data:deletedData,index:index});

            return deletedData;
        }
        else {
            return null;
        }
    };
	// see: http://yuilibrary.com/projects/yui2/ticket/2528860
	DT.prototype.getFirstTdEl = function(row) {
		var elRow = (row !== undefined?this.getTrEl(row): this.getFirstTrEl());
		if(elRow && (elRow.cells.length > 0)) {
			return elRow.cells[0];
		}
		return null;
	};

	DT.prototype.getLastTdEl = function(row) {
		var elRow = (row !== undefined?this.getTrEl(row) : this.getLastTrEl());
		if(elRow && (elRow.cells.length > 0)) {
			return elRow.cells[elRow.cells.length-1];
		}
		return null;
	};


})();

