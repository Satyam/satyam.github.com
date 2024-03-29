/**
 * The DataSource utility provides a common configurable interface for widgets
 * to access a variety of data, from JavaScript arrays to online servers over
 * XHR.
 *
 * @namespace YAHOO.util
 * @module datasource
 * @requires yahoo, event
 * @optional connection
 * @title DataSource Utility
 * @beta
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The DataSource class defines and manages a live set of data for widgets to
 * interact with. Examples of live databases include in-memory
 * local data such as a JavaScript array, a JavaScript function, or JSON, or
 * remote data such as data retrieved through an XHR connection.
 *
 * @class DataSource
 * @uses YAHOO.util.EventProvider
 * @constructor
 * @param oLiveData {Object} Pointer to live database.
 * @param oConfigs {Object} (optional) Object literal of configuration values.
 */
YAHOO.util.DataSource = function(oLiveData, oConfigs) {
    if(!oLiveData) {
        return;
    }
    
    this.liveData = oLiveData;
    this._oQueue = {interval:null, conn:null, requests:[]};

    if(oLiveData.nodeType && oLiveData.nodeType == 9) {
        this.dataType = YAHOO.util.DataSource.TYPE_XML;
    }
    else if(YAHOO.lang.isArray(oLiveData)) {
        this.dataType = YAHOO.util.DataSource.TYPE_JSARRAY;
    }
    else if(YAHOO.lang.isString(oLiveData)) {
        this.dataType = YAHOO.util.DataSource.TYPE_XHR;
    }
    else if(YAHOO.lang.isFunction(oLiveData)) {
        this.dataType = YAHOO.util.DataSource.TYPE_JSFUNCTION;
    }
    else if(oLiveData.nodeName && (oLiveData.nodeName.toLowerCase() == "table")) {
        this.dataType = YAHOO.util.DataSource.TYPE_HTMLTABLE;
        this.liveData = oLiveData.cloneNode(true);
    }
    else if(YAHOO.lang.isObject(oLiveData)) {
        this.dataType = YAHOO.util.DataSource.TYPE_JSON;
    }
    else {
        this.dataType = YAHOO.util.DataSource.TYPE_UNKNOWN;
    }

    // Set any config params passed in to override defaults
    if(oConfigs && (oConfigs.constructor == Object)) {
        for(var sConfig in oConfigs) {
            if(sConfig) {
                this[sConfig] = oConfigs[sConfig];
            }
        }
    }
    
    // Validate and initialize public configs
    var maxCacheEntries = this.maxCacheEntries;
    if(!YAHOO.lang.isNumber(maxCacheEntries) || (maxCacheEntries < 0)) {
        maxCacheEntries = 0;
    }

    // Initialize interval tracker
    this._aIntervals = [];

    this._sName = "DataSource instance" + YAHOO.util.DataSource._nIndex;
    YAHOO.util.DataSource._nIndex++;


    /////////////////////////////////////////////////////////////////////////////
    //
    // Custom Events
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Fired when a request is made to the local cache.
     *
     * @event cacheRequestEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     */
    this.createEvent("cacheRequestEvent");

    /**
     * Fired when data is retrieved from the local cache.
     *
     * @event cacheResponseEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.response {Object} The response object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     * @param oArgs.tId {Number} Transaction ID.
     */
    this.createEvent("cacheResponseEvent");

    /**
     * Fired when a request is sent to the live data source.
     *
     * @event requestEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     */
    this.createEvent("requestEvent");

    /**
     * Fired when live data source sends response.
     *
     * @event responseEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.response {Object} The raw response object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     */
    this.createEvent("responseEvent");

    /**
     * Fired when response is parsed.
     *
     * @event responseParseEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.response {Object} The parsed response object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     */
    this.createEvent("responseParseEvent");

    /**
     * Fired when response is cached.
     *
     * @event responseCacheEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.response {Object} The parsed response object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     */
    this.createEvent("responseCacheEvent");
    /**
     * Fired when an error is encountered with the live data source.
     *
     * @event dataErrorEvent
     * @param oArgs.request {Object} The request object.
     * @param oArgs.callback {Function} The callback function.
     * @param oArgs.caller {Object} (deprecated) Use callback.scope.
     * @param oArgs.message {String} The error message.
     */
    this.createEvent("dataErrorEvent");

    /**
     * Fired when the local cache is flushed.
     *
     * @event cacheFlushEvent
     */
    this.createEvent("cacheFlushEvent");
};

YAHOO.augment(YAHOO.util.DataSource, YAHOO.util.EventProvider);

/////////////////////////////////////////////////////////////////////////////
//
// Public constants
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Type is unknown.
 *
 * @property TYPE_UNKNOWN
 * @type Number
 * @final
 * @default -1
 */
YAHOO.util.DataSource.TYPE_UNKNOWN = -1;

/**
 * Type is a JavaScript Array.
 *
 * @property TYPE_JSARRAY
 * @type Number
 * @final
 * @default 0
 */
YAHOO.util.DataSource.TYPE_JSARRAY = 0;

/**
 * Type is a JavaScript Function.
 *
 * @property TYPE_JSFUNCTION
 * @type Number
 * @final
 * @default 1
 */
YAHOO.util.DataSource.TYPE_JSFUNCTION = 1;

/**
 * Type is hosted on a server via an XHR connection.
 *
 * @property TYPE_XHR
 * @type Number
 * @final
 * @default 2
 */
YAHOO.util.DataSource.TYPE_XHR = 2;

/**
 * Type is JSON.
 *
 * @property TYPE_JSON
 * @type Number
 * @final
 * @default 3
 */
YAHOO.util.DataSource.TYPE_JSON = 3;

/**
 * Type is XML.
 *
 * @property TYPE_XML
 * @type Number
 * @final
 * @default 4
 */
YAHOO.util.DataSource.TYPE_XML = 4;

/**
 * Type is plain text.
 *
 * @property TYPE_TEXT
 * @type Number
 * @final
 * @default 5
 */
YAHOO.util.DataSource.TYPE_TEXT = 5;

/**
 * Type is an HTML TABLE element.
 *
 * @property TYPE_HTMLTABLE
 * @type Number
 * @final
 * @default 6
 */
YAHOO.util.DataSource.TYPE_HTMLTABLE = 6;

/**
 * Error message for invalid dataresponses.
 *
 * @property ERROR_DATAINVALID
 * @type String
 * @final
 * @default "Invalid data"
 */
YAHOO.util.DataSource.ERROR_DATAINVALID = "Invalid data";

/**
 * Error message for null data responses.
 *
 * @property ERROR_DATANULL
 * @type String
 * @final
 * @default "Null data"
 */
YAHOO.util.DataSource.ERROR_DATANULL = "Null data";



/////////////////////////////////////////////////////////////////////////////
//
// Private variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Internal class variable to index multiple DataSource instances.
 *
 * @property DataSource._nIndex
 * @type Number
 * @private
 * @static
 */
YAHOO.util.DataSource._nIndex = 0;

/**
 * Internal class variable to assign unique transaction IDs.
 *
 * @property DataSource._nTransactionId
 * @type Number
 * @private
 * @static
 */
YAHOO.util.DataSource._nTransactionId = 0;

/**
 * Name of DataSource instance.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.util.DataSource.prototype._sName = null;

/**
 * Local cache of data result object literals indexed chronologically.
 *
 * @property _aCache
 * @type Object[]
 * @private
 */
YAHOO.util.DataSource.prototype._aCache = null;

/**
 * Local queue of request connections, enabled if queue needs to be managed.
 *
 * @property _oQueue
 * @type Object
 * @private
 */
YAHOO.util.DataSource.prototype._oQueue = null;

/**
 * Array of polling interval IDs that have been enabled, needed to clear all intervals.
 *
 * @property _aIntervals
 * @type Array
 * @private
 */
YAHOO.util.DataSource.prototype._aIntervals = null;

/////////////////////////////////////////////////////////////////////////////
//
// Private methods
//
/////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Max size of the local cache.  Set to 0 to turn off caching.  Caching is
 * useful to reduce the number of server connections.  Recommended only for data
 * sources that return comprehensive results for queries or when stale data is
 * not an issue.
 *
 * @property maxCacheEntries
 * @type Number
 * @default 0
 */
YAHOO.util.DataSource.prototype.maxCacheEntries = 0;

 /**
 * Pointer to live database.
 *
 * @property liveData
 * @type Object
 */
YAHOO.util.DataSource.prototype.liveData = null;

/**
 * Where the live data is held.
 *
 * @property dataType
 * @type Number
 * @default YAHOO.util.DataSource.TYPE_UNKNOWN
 *
 */
YAHOO.util.DataSource.prototype.dataType = YAHOO.util.DataSource.TYPE_UNKNOWN;

/**
 * Format of response.
 *
 * @property responseType
 * @type Number
 * @default YAHOO.util.DataSource.TYPE_UNKNOWN
 */
YAHOO.util.DataSource.prototype.responseType = YAHOO.util.DataSource.TYPE_UNKNOWN;

/**
 * Response schema object literal takes a combination of the following properties:
 *
 * <dl>
 * <dt>resultsList</dt> <dd>Pointer to array of tabular data</dd>
 * <dt>totalRecords</dt> <dd>Pointer to number of records (JSON over XHR only)</dd>
 * <dt>resultNode</dt> <dd>Pointer to node name of row data (XML data only)</dd>
 * <dt>recordDelim</dt> <dd>Record delimiter (text data only)</dd>
 * <dt>fieldDelim</dt> <dd>Field delimiter (text data only)</dd>
 * <dt>fields</dt> <dd>Array of field names (aka keys), or array of object literals
 * such as: {key:"fieldname",parser:YAHOO.util.DataSource.parseDate}</dd>
 * </dl>
 *
 * @property responseSchema
 * @type Object
 */
YAHOO.util.DataSource.prototype.responseSchema = null;

 /**
 * Alias to YUI Connection Manager, to allow implementers to customize the utility.
 *
 * @property connMgr
 * @type Object
 * @default YAHOO.util.Connect
 */
YAHOO.util.DataSource.prototype.connMgr = null;

 /**
 * If data is accessed over XHR via Connection Manager, this setting defines
 * request/response management in the following manner:
 * <dl>
 *     <dt>queueRequests</dt>
 *     <dd>If a request is already in progress, wait until response is returned
 *     before sending the next request.</dd>
 *
 *     <dt>cancelStaleRequests</dt>
 *     <dd>If a request is already in progress, cancel it before sending the next
 *     request.</dd>
 *
 *     <dt>ignoreStaleResponses</dt>
 *     <dd>Send all requests, but handle only the response for the most recently
 *     sent request.</dd>
 *
 *     <dt>allowAll</dt>
 *     <dd>Send all requests and handle all responses.</dd>
 *
 * </dl>
 *
 * @property connXhrMode
 * @type String
 * @default "allowAll"
 */
YAHOO.util.DataSource.prototype.connXhrMode = "allowAll";

 /**
 * If data is accessed over XHR via Connection Manager, true if data should be
 * sent via POST, otherwise data will be sent via GET.
 *
 * @property connMethodPost
 * @type Boolean
 * @default false
 */
YAHOO.util.DataSource.prototype.connMethodPost = false;

 /**
 * If data is accessed over XHR via Connection Manager, the connection timeout
 * defines how many  milliseconds the XHR connection will wait for a server
 * response. Any non-zero value will enable the Connection utility's
 * Auto-Abort feature.
 *
 * @property connTimeout
 * @type Number
 * @default 0
 */
YAHOO.util.DataSource.prototype.connTimeout = 0;

/////////////////////////////////////////////////////////////////////////////
//
// Public static methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Converts data to type String.
 *
 * @method DataSource.parseString
 * @param oData {String | Number | Boolean | Date | Array | Object} Data to parse.
 * The special values null and undefined will return null.
 * @return {Number} A string, or null.
 * @static
 */
YAHOO.util.DataSource.parseString = function(oData) {
    // Special case null and undefined
    if(!YAHOO.lang.isValue(oData)) {
        return null;
    }
    
    //Convert to string
    var string = oData + "";

    // Validate
    if(YAHOO.lang.isString(string)) {
        return string;
    }
    else {
        return null;
    }
};

/**
 * Converts data to type Number.
 *
 * @method DataSource.parseNumber
 * @param oData {String | Number | Boolean | Null} Data to convert. Beware, null
 * returns as 0.
 * @return {Number} A number, or null if NaN.
 * @static
 */
YAHOO.util.DataSource.parseNumber = function(oData) {
    //Convert to number
    var number = oData * 1;
    
    // Validate
    if(YAHOO.lang.isNumber(number)) {
        return number;
    }
    else {
        return null;
    }
};
// Backward compatibility
YAHOO.util.DataSource.convertNumber = function(oData) {
    return YAHOO.util.DataSource.parseNumber(oData);
};

/**
 * Converts data to type Date.
 *
 * @method DataSource.parseDate
 * @param oData {Date | String | Number} Data to convert.
 * @return {Date} A Date instance.
 * @static
 */
YAHOO.util.DataSource.parseDate = function(oData) {
    var date = null;
    
    //Convert to date
    if(!(oData instanceof Date)) {
        date = new Date(oData);
    }
    else {
        return oData;
    }
    
    // Validate
    if(date instanceof Date) {
        return date;
    }
    else {
        return null;
    }
};
// Backward compatibility
YAHOO.util.DataSource.convertDate = function(oData) {
    return YAHOO.util.DataSource.parseDate(oData);
};

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Public accessor to the unique name of the DataSource instance.
 *
 * @method toString
 * @return {String} Unique name of the DataSource instance.
 */
YAHOO.util.DataSource.prototype.toString = function() {
    return this._sName;
};

/**
 * Overridable method passes request to cache and returns cached response if any,
 * refreshing the hit in the cache as the newest item. Returns null if there is
 * no cache hit.
 *
 * @method getCachedResponse
 * @param oRequest {Object} Request object.
 * @param oCallback {Function} Handler function to receive the response.
 * @param oCaller {Object} The Calling object that is making the request.
 * @return {Object} Cached response object or null.
 */
YAHOO.util.DataSource.prototype.getCachedResponse = function(oRequest, oCallback, oCaller) {
    var aCache = this._aCache;

    // If cache is enabled...
    if(this.maxCacheEntries > 0) {        
        // Initialize local cache
        if(!aCache) {
            this._aCache = [];
        }
        // Look in local cache
        else {
            var nCacheLength = aCache.length;
            if(nCacheLength > 0) {
                var oResponse = null;
                this.fireEvent("cacheRequestEvent", {request:oRequest,callback:oCallback,caller:oCaller});
        
                // Loop through each cached element
                for(var i = nCacheLength-1; i >= 0; i--) {
                    var oCacheElem = aCache[i];
        
                    // Defer cache hit logic to a public overridable method
                    if(this.isCacheHit(oRequest,oCacheElem.request)) {
                        // The cache returned a hit!
                        // Grab the cached response
                        oResponse = oCacheElem.response;
                        this.fireEvent("cacheResponseEvent", {request:oRequest,response:oResponse,callback:oCallback,caller:oCaller});
                        
                        // Refresh the position of the cache hit
                        if(i < nCacheLength-1) {
                            // Remove element from its original location
                            aCache.splice(i,1);
                            // Add as newest
                            this.addToCache(oRequest, oResponse);
                        }
                        break;
                    }
                }
                return oResponse;
            }
        }
    }
    else if(aCache) {
        this._aCache = null;
    }
    return null;
};

/**
 * Default overridable method matches given request to given cached request.
 * Returns true if is a hit, returns false otherwise.  Implementers should
 * override this method to customize the cache-matching algorithm.
 *
 * @method isCacheHit
 * @param oRequest {Object} Request object.
 * @param oCachedRequest {Object} Cached request object.
 * @return {Boolean} True if given request matches cached request, false otherwise.
 */
YAHOO.util.DataSource.prototype.isCacheHit = function(oRequest, oCachedRequest) {
    return (oRequest === oCachedRequest);
};

/**
 * Adds a new item to the cache. If cache is full, evicts the stalest item
 * before adding the new item.
 *
 * @method addToCache
 * @param oRequest {Object} Request object.
 * @param oResponse {Object} Response object to cache.
 */
YAHOO.util.DataSource.prototype.addToCache = function(oRequest, oResponse) {
    var aCache = this._aCache;
    if(!aCache) {
        return;
    }

    // If the cache is full, make room by removing stalest element (index=0)
    while(aCache.length >= this.maxCacheEntries) {
        aCache.shift();
    }

    // Add to cache in the newest position, at the end of the array
    var oCacheElem = {request:oRequest,response:oResponse};
    aCache[aCache.length] = oCacheElem;
    this.fireEvent("responseCacheEvent", {request:oRequest,response:oResponse});
};

/**
 * Flushes cache.
 *
 * @method flushCache
 */
YAHOO.util.DataSource.prototype.flushCache = function() {
    if(this._aCache) {
        this._aCache = [];
        this.fireEvent("cacheFlushEvent");
    }
};

/**
 * Sets up a polling mechanism to send requests at set intervals and forward
 * responses to given callback.
 *
 * @method setInterval
 * @param nMsec {Number} Length of interval in milliseconds.
 * @param oRequest {Object} Request object.
 * @param oCallback {Function} Handler function to receive the response.
 * @param oCaller {Object} (deprecated) Use oCallback.scope.
 * @return {Number} Interval ID.
 */
YAHOO.util.DataSource.prototype.setInterval = function(nMsec, oRequest, oCallback, oCaller) {
    if(YAHOO.lang.isNumber(nMsec) && (nMsec >= 0)) {
        var oSelf = this;
        var nId = setInterval(function() {
            oSelf.makeConnection(oRequest, oCallback, oCaller);
        }, nMsec);
        this._aIntervals.push(nId);
        return nId;
    }
    else {
    }
};

/**
 * Disables polling mechanism associated with the given interval ID.
 *
 * @method clearInterval
 * @param nId {Number} Interval ID.
 */
YAHOO.util.DataSource.prototype.clearInterval = function(nId) {
    // Remove from tracker if there
    var tracker = this._aIntervals || [];
    for(var i=tracker.length-1; i>-1; i--) {
        if(tracker[i] === nId) {
            tracker.splice(i,1);
            clearInterval(nId);
        }
    }
};

/**
 * Disables all known polling intervals.
 *
 * @method clearAllIntervals
 */
YAHOO.util.DataSource.prototype.clearAllIntervals = function(nId) {
    var tracker = this._aIntervals || [];
    for(var i=tracker.length-1; i>-1; i--) {
        tracker.splice(i,1);
        clearInterval(nId);
    }
};

/**
 * Executes a configured callback.  For object literal callbacks, the third
 * param determines whether to execute the success handler or failure handler.
 * @method issueCallback
 * @param callback {Function|Object} the callback to execute
 * @param params {Array} params to be passed to the callback method
 * @param error {Boolean} whether an error occurred
 * @param scope {Object} the scope from which to execute the callback
 * (deprecated - use an object literal callback)
 */
YAHOO.util.DataSource.issueCallback = function (callback,params,error,scope) {
    if (YAHOO.lang.isFunction(callback)) {
        callback.apply(scope, params);
    } else if (YAHOO.lang.isObject(callback)) {
        scope = callback.scope || scope || window;
        var callbackFunc = callback.success;
        if (error) {
            callbackFunc = callback.failure;
        }
        if (callbackFunc) {
            callbackFunc.apply(scope, params.concat([callback.argument]));
        }
    }
};

/**
 * First looks for cached response, then sends request to live data.
 *
 * @method sendRequest
 * @param oRequest {Object} Request object.
 * @param oCallback {Object} Callback object literal.
 * @param oCaller {Object} (deprecated) Use oCallback.scope.
 * @return {Number} Transaction ID, or null if response found in cache.
 */
YAHOO.util.DataSource.prototype.sendRequest = function(oRequest, oCallback, oCaller) {
    // First look in cache
    var oCachedResponse = this.getCachedResponse(oRequest, oCallback, oCaller);
    if(oCachedResponse) {
        YAHOO.util.DataSource.issueCallback(oCallback,[oRequest,oCachedResponse],false,oCaller);
        return null;
    }

    // Not in cache, so forward request to live data
    return this.makeConnection(oRequest, oCallback, oCaller);
};

/**
 * Overridable method provides default functionality to make a connection to
 * live data in order to send request. The response coming back is then
 * forwarded to the handleResponse function. This method should be customized
 * to achieve more complex implementations.
 *
 * @method makeConnection
 * @param oRequest {Object} Request object.
 * @param oCallback {Object} Callback object literal.
 * @param oCaller {Object} (deprecated) Use oCallback.scope.
 * @return {Number} Transaction ID.
 */
YAHOO.util.DataSource.prototype.makeConnection = function(oRequest, oCallback, oCaller) {
    this.fireEvent("requestEvent", {request:oRequest,callback:oCallback,caller:oCaller});
    var oRawResponse = null;
    var tId = YAHOO.util.DataSource._nTransactionId++;

    // How to make the connection depends on the type of data
    switch(this.dataType) {
        // If the live data is a JavaScript Function
        // pass the request in as a parameter and
        // forward the return value to the handler
        case YAHOO.util.DataSource.TYPE_JSFUNCTION:
            oRawResponse = this.liveData(oRequest);
            this.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
            break;
        // If the live data is over Connection Manager
        // set up the callback object and
        // pass the request in as a URL query and
        // forward the response to the handler
        case YAHOO.util.DataSource.TYPE_XHR:
            var oSelf = this;
            var oConnMgr = this.connMgr || YAHOO.util.Connect;
            var oQueue = this._oQueue;

            /**
             * Define Connection Manager success handler
             *
             * @method _xhrSuccess
             * @param oResponse {Object} HTTPXMLRequest object
             * @private
             */
            var _xhrSuccess = function(oResponse) {
                // If response ID does not match last made request ID,
                // silently fail and wait for the next response
                if(oResponse && (this.connXhrMode == "ignoreStaleResponses") &&
                        (oResponse.tId != oQueue.conn.tId)) {
                    return null;
                }
                // Error if no response
                else if(!oResponse) {
                    this.fireEvent("dataErrorEvent", {request:oRequest,
                            callback:oCallback, caller:oCaller,
                            message:YAHOO.util.DataSource.ERROR_DATANULL});

                    // Send error response back to the caller with the error flag on
                    // TODO: should this send oResponse, considering the fork?
                    YAHOO.util.DataSource.issueCallback(oCallback,[oRequest, {error:true}], true, oCaller);

                    return null;
                }
                // Forward to handler
                else {
                    this.handleResponse(oRequest, oResponse, oCallback, oCaller, tId);
                }
            };

            /**
             * Define Connection Manager failure handler
             *
             * @method _xhrFailure
             * @param oResponse {Object} HTTPXMLRequest object
             * @private
             */
            var _xhrFailure = function(oResponse) {
                this.fireEvent("dataErrorEvent", {request:oRequest,
                        callback:oCallback, caller:oCaller,
                        message:YAHOO.util.DataSource.ERROR_DATAINVALID});

                // Backward compatibility
                if((this.liveData.lastIndexOf("?") !== this.liveData.length-1) &&
                    (oRequest.indexOf("?") !== 0)){
                }

                // Send failure response back to the caller with the error flag on
                oResponse = oResponse || {};
                oResponse.error = true;
                YAHOO.util.DataSource.issueCallback(oCallback,[oRequest,oResponse],true, oCaller);

                return null;
            };

            /**
             * Define Connection Manager callback object
             *
             * @property _xhrCallback
             * @param oResponse {Object} HTTPXMLRequest object
             * @private
             */
             var _xhrCallback = {
                success:_xhrSuccess,
                failure:_xhrFailure,
                scope: this
            };

            // Apply Connection Manager timeout
            if(YAHOO.lang.isNumber(this.connTimeout)) {
                _xhrCallback.timeout = this.connTimeout;
            }

            // Cancel stale requests
            if(this.connXhrMode == "cancelStaleRequests") {
                    // Look in queue for stale requests
                    if(oQueue.conn) {
                        if(oConnMgr.abort) {
                            oConnMgr.abort(oQueue.conn);
                            oQueue.conn = null;
                        }
                        else {
                        }
                    }
            }

            // Get ready to send the request URL
            if(oConnMgr && oConnMgr.asyncRequest) {
                var sLiveData = this.liveData;
                var isPost = this.connMethodPost;
                var sMethod = (isPost) ? "POST" : "GET";
                var sUri = (isPost) ? sLiveData : sLiveData+oRequest;
                var sRequest = (isPost) ? oRequest : null;

                // Send the request right away
                if(this.connXhrMode != "queueRequests") {
                    oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, _xhrCallback, sRequest);
                }
                // Queue up then send the request
                else {
                    // Found a request already in progress
                    if(oQueue.conn) {
                        // Add request to queue
                        oQueue.requests.push({request:oRequest, callback:_xhrCallback});

                        // Interval needs to be started
                        if(!oQueue.interval) {
                            oQueue.interval = setInterval(function() {
                                // Connection is in progress
                                if(oConnMgr.isCallInProgress(oQueue.conn)) {
                                    return;
                                }
                                else {
                                    // Send next request
                                    if(oQueue.requests.length > 0) {
                                        sUri = (isPost) ? sLiveData : sLiveData+oQueue.requests[0].request;
                                        sRequest = (isPost) ? oQueue.requests[0].request : null;
                                        oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, oQueue.requests[0].callback, sRequest);

                                        // Remove request from queue
                                        oQueue.requests.shift();
                                    }
                                    // No more requests
                                    else {
                                        clearInterval(oQueue.interval);
                                        oQueue.interval = null;
                                    }
                                }
                            }, 50);
                        }
                    }
                    // Nothing is in progress
                    else {
                        oQueue.conn = oConnMgr.asyncRequest(sMethod, sUri, _xhrCallback, sRequest);
                    }
                }
            }
            else {
                // Send null response back to the caller with the error flag on
                YAHOO.util.DataSource.issueCallback(oCallback,[oRequest,{error:true}],true,oCaller);
            }

            break;
        // Simply forward the entire data object to the handler
        default:
            /* accounts for the following cases:
            YAHOO.util.DataSource.TYPE_UNKNOWN:
            YAHOO.util.DataSource.TYPE_JSARRAY:
            YAHOO.util.DataSource.TYPE_JSON:
            YAHOO.util.DataSource.TYPE_HTMLTABLE:
            YAHOO.util.DataSource.TYPE_XML:
            */
            oRawResponse = this.liveData;
            this.handleResponse(oRequest, oRawResponse, oCallback, oCaller, tId);
            break;
    }
    return tId;
};

/**
 * Handles raw data response from live data source. Calls appropriate parsing
 * function to get oParsedResponse. Passes oParsedResponse to callback function
 * which will get called with arguments:
 * 
 * <dl>      
 *     <dd>fnCallback(oRequest, oParsedResponse)</dd>
 * </dl> 
 * 
 * where the oParsedResponse object literal has the following properties:
 * <dl>
 *     <dd><dt>tId {Number}</dt> Unique transaction ID</dd>
 *     <dd><dt>results {Array}</dt> Array of parsed data results</dd>
 *     <dd><dt>error {Boolean}</dt> True if there was an error</dd>
 *     <dd><dt>totalRecords {Number}</dt> Total number of records (if available)</dd> 
 * </dl>
 *
 * @method handleResponse
 * @param oRequest {Object} Request object
 * @param oRawResponse {Object} The raw response from the live database.
 * @param oCallback {Object} Callback object literal.
 * @param oCaller {Object} (deprecated) Use oCallback.scope.
 * @param tId {Number} Transaction ID.
 */
YAHOO.util.DataSource.prototype.handleResponse = function(oRequest, oRawResponse, oCallback, oCaller, tId) {
    this.fireEvent("responseEvent", {request:oRequest, response:oRawResponse,
            callback:oCallback, caller:oCaller, tId: tId});
    var xhr = (this.dataType == YAHOO.util.DataSource.TYPE_XHR) ? true : false;
    var oParsedResponse = null;
    var oFullResponse = oRawResponse;

    switch(this.responseType) {
        case YAHOO.util.DataSource.TYPE_JSARRAY:
            if(xhr && oRawResponse.responseText) {
                oFullResponse = oRawResponse.responseText; 
            }
            oFullResponse = this.doBeforeParseData(oRequest, oFullResponse);
            oParsedResponse = this.parseArrayData(oRequest, oFullResponse);
            break;
        case YAHOO.util.DataSource.TYPE_JSON:
            if(xhr && oRawResponse.responseText) {
                oFullResponse = oRawResponse.responseText;
            }

            // Convert to JSON object if it's a string
            if(YAHOO.lang.isString(oFullResponse)) {
                // Check for YUI JSON Util
                if(YAHOO.lang.JSON) {
                    oFullResponse = YAHOO.lang.JSON.parse(oFullResponse);
                }
                // Look for JSON parsers using an API similar to json2.js
                else if(window.JSON && JSON.parse) {
                    oFullResponse = JSON.parse(oFullResponse);
                }
                // Look for JSON parsers using an API similar to json.js
                else if(oFullResponse.parseJSON) {
                    oFullResponse = oFullResponse.parseJSON();
                }
                // No JSON lib found so parse the string
                else {
                    try {
                        // Trim leading spaces
                        while (oFullResponse.length > 0 &&
                                (oFullResponse.charAt(0) != "{") &&
                                (oFullResponse.charAt(0) != "[")) {
                            oFullResponse = oFullResponse.substring(1, oFullResponse.length);
                        }
    
                        if(oFullResponse.length > 0) {
                            // Strip extraneous stuff at the end
                            var objEnd = Math.max(oFullResponse.lastIndexOf("]"),oFullResponse.lastIndexOf("}"));
                            oFullResponse = oFullResponse.substring(0,objEnd+1);
    
                            // Turn the string into an object literal...
                            // ...eval is necessary here
                            oFullResponse = eval("(" + oFullResponse + ")");
    
                        }
                    }
                    catch(e) {
                    }
                }
            }

            oFullResponse = this.doBeforeParseData(oRequest, oFullResponse);
            oParsedResponse = this.parseJSONData(oRequest, oFullResponse);
            break;
        case YAHOO.util.DataSource.TYPE_HTMLTABLE:
            if(xhr && oRawResponse.responseText) {
                oFullResponse = oRawResponse.responseText;
            }
            oFullResponse = this.doBeforeParseData(oRequest, oFullResponse);
            oParsedResponse = this.parseHTMLTableData(oRequest, oFullResponse);
            break;
        case YAHOO.util.DataSource.TYPE_XML:
            if(xhr && oRawResponse.responseXML) {
                oFullResponse = oRawResponse.responseXML;
            }
            oFullResponse = this.doBeforeParseData(oRequest, oFullResponse);
            oParsedResponse = this.parseXMLData(oRequest, oFullResponse);
            break;
        case YAHOO.util.DataSource.TYPE_TEXT:
            if(xhr && oRawResponse.responseText) {
                oFullResponse = oRawResponse.responseText;
            }
            oFullResponse = this.doBeforeParseData(oRequest, oFullResponse);
            oParsedResponse = this.parseTextData(oRequest, oFullResponse);
            break;
        default:
            //var contentType = oRawResponse.getResponseHeader["Content-Type"];
            oFullResponse = this.doBeforeParseData(oRequest, oFullResponse);
            oParsedResponse = this.doBeforeParseData(oRequest, oFullResponse);
            break;
    }

    if(oParsedResponse && !oParsedResponse.error) {
        // Last chance to touch the raw response or the parsed response
        oParsedResponse = this.doBeforeCallback(oRequest, oFullResponse, oParsedResponse);
        this.fireEvent("responseParseEvent", {request:oRequest,
                response:oParsedResponse, callback:oCallback, caller:oCaller});
        // Cache the response
        this.addToCache(oRequest, oParsedResponse);
    }
    else {
        this.fireEvent("dataErrorEvent", {request:oRequest, response: oRawResponse, callback:oCallback, 
                caller:oCaller, message:YAHOO.util.DataSource.ERROR_DATANULL});
        
        // Be sure the error flag is on
        oParsedResponse = oParsedResponse || {};
        oParsedResponse.error = true;
    }

    // Send the response back to the caller
    oParsedResponse.tId = tId;
    YAHOO.util.DataSource.issueCallback(oCallback,[oRequest,oParsedResponse],oParsedResponse.error,oCaller);
};

/**
 * Overridable method gives implementers access to the original full response
 * before the data gets parsed. Implementers should take care not to return an
 * unparsable or otherwise invalid response.
 *
 * @method doBeforeParseData
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full response from the live database.
 * @return {Object} Full response for parsing.
 */
YAHOO.util.DataSource.prototype.doBeforeParseData = function(oRequest, oFullResponse) {
    return oFullResponse;
};

/**
 * Overridable method gives implementers access to the original full response and
 * the parsed response (parsed against the given schema) before the data
 * is added to the cache (if applicable) and then sent back to callback function.
 * This is your chance to access the raw response and/or populate the parsed
 * response with any custom data.
 *
 * @method doBeforeCallback
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full response from the live database.
 * @param oParsedResponse {Object} The parsed response to return to calling object.
 * @return {Object} Parsed response object.
 */
YAHOO.util.DataSource.prototype.doBeforeCallback = function(oRequest, oFullResponse, oParsedResponse) {
    return oParsedResponse;
};

/**
 * Overridable method parses Array data into a response object.
 *
 * @method parseArrayData
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full Array from the live database.
 * @return {Object} Parsed response object with the following properties:<br>
 *     - results (Array) Array of parsed data results<br>
 *     - error (Boolean) True if there was an error<br>
 *     - totalRecords (Number) Total number of records (if available)
 */
YAHOO.util.DataSource.prototype.parseArrayData = function(oRequest, oFullResponse) {
    if(YAHOO.lang.isArray(oFullResponse)) {
        if(YAHOO.lang.isArray(this.responseSchema.fields)) {
            var results = [],
                fields = this.responseSchema.fields,
                i;
            for (i = fields.length - 1; i >= 0; --i) {
                if (typeof fields[i] !== 'object') {
                    fields[i] = { key : fields[i] };
                }
            }

            var parsers = {};
            for (i = fields.length - 1; i >= 0; --i) {
                var p = fields[i].parser || fields[i].converter;
                if (p) {
                    parsers[fields[i].key] = p;
                }
            }

            var arrType = YAHOO.lang.isArray(oFullResponse[0]);
            for(i=oFullResponse.length-1; i>-1; i--) {
                var oResult = {};
                var rec = oFullResponse[i];
                if (typeof rec === 'object') {
                    for(var j=fields.length-1; j>-1; j--) {
                        var field = fields[j];
                        var data = arrType ? rec[j] : rec[field.key];

                        if (parsers[field.key]) {
                            data = parsers[field.key].call(this,data);
                        }

                        // Safety measure
                        if(data === undefined) {
                            data = null;
                        }

                        oResult[field.key] = data;
                    }
                }
                results[i] = oResult;
            }

            var oParsedResponse = {results:results};
            return oParsedResponse;
        }
    }
    return null;
};

/**
 * Overridable method parses plain text data into a response object.
 *
 * @method parseTextData
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full text response from the live database.
 * @return {Object} Parsed response object with the following properties:<br>
 *     - results (Array) Array of parsed data results<br>
 *     - error (Boolean) True if there was an error<br>
 *     - totalRecords (Number) Total number of records (if available)
 */
YAHOO.util.DataSource.prototype.parseTextData = function(oRequest, oFullResponse) {
    if(YAHOO.lang.isString(oFullResponse)) {
        if(YAHOO.lang.isArray(this.responseSchema.fields) &&
                YAHOO.lang.isString(this.responseSchema.recordDelim) &&
                YAHOO.lang.isString(this.responseSchema.fieldDelim)) {
            var oParsedResponse = {results:[]};
            var recDelim = this.responseSchema.recordDelim;
            var fieldDelim = this.responseSchema.fieldDelim;
            var fields = this.responseSchema.fields;
            if(oFullResponse.length > 0) {
                // Delete the last line delimiter at the end of the data if it exists
                var newLength = oFullResponse.length-recDelim.length;
                if(oFullResponse.substr(newLength) == recDelim) {
                    oFullResponse = oFullResponse.substr(0, newLength);
                }
                // Split along record delimiter to get an array of strings
                var recordsarray = oFullResponse.split(recDelim);
                // Cycle through each record
                for(var i = 0, len = recordsarray.length, recIdx = 0; i < len; ++i) {
                    var oResult = {};
                    var bError = false;
                    if (YAHOO.lang.isString(recordsarray[i])) {
                        // Split each record along field delimiter to get data array
                        var fielddataarray = recordsarray[i].split(fieldDelim);
                        for(var j=fields.length-1; j>-1; j--) {
                            try {
                                // Remove quotation marks from edges, if applicable
                                var data = fielddataarray[j];
                                if (YAHOO.lang.isString(data)) {
                                    if(data.charAt(0) == "\"") {
                                        data = data.substr(1);
                                    }
                                    if(data.charAt(data.length-1) == "\"") {
                                        data = data.substr(0,data.length-1);
                                    }
                                    var field = fields[j];
                                    var key = (YAHOO.lang.isValue(field.key)) ? field.key : field;
                                    // Backward compatibility
                                    if(!field.parser && field.converter) {
                                        field.parser = field.converter;
                                    }
                                    if(field.parser) {
                                        data = field.parser.call(this, data);
                                    }
                                    // Safety measure
                                    if(data === undefined) {
                                        data = null;
                                    }
                                    oResult[key] = data;
                                }
                                else {
                                    bError = true;
                                }
                            }
                            catch(e) {
                                bError = true;
                            }
                        }
                        if(!bError) {
                            oParsedResponse.results[recIdx++] = oResult;
                        }
                    }
                }
            }
            return oParsedResponse;
        }
    }
    return null;
            
};

/**
 * Overridable method parses XML data into a response object.
 *
 * @method parseXMLData
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full XML response from the live database.
 * @return {Object} Parsed response object with the following properties<br>
 *     - results (Array) Array of parsed data results<br>
 *     - error (Boolean) True if there was an error<br>
 *     - totalRecords (Number) Total number of records (if available)
 */
YAHOO.util.DataSource.prototype.parseXMLData = function(oRequest, oFullResponse) {
    var bError = false;
    var oParsedResponse = {};
    var xmlList = null;
    var totRecLocator = this.responseSchema.totalRecords;

    // In case oFullResponse is something funky
    try {
        xmlList = (this.responseSchema.resultNode) ?
            oFullResponse.getElementsByTagName(this.responseSchema.resultNode) :
            null;

        if (totRecLocator) {
            // Look for a totalRecords node
            var totalRecords = null;
            var totRec = oFullResponse.getElementsByTagName(totRecLocator)[0];
            if (totRec) {
                totalRecords = totRec.firstChild.nodeValue;
            } else {
                totRec = oFullResponse.firstChild.attributes.getNamedItem(totRecLocator);
                if (totRec) {
                    totalRecords = totRec.value;
                } else if (xmlList && xmlList.length) {
                    var par = xmlList.item(0).parentNode;
                    if (par) {
                        totRec = par.attributes.getNamedItem(totRecLocator);
                        if (totRec) {
                            totalRecords = totRec.value;
                        }
                    }
                }
            }

            if (YAHOO.lang.isValue(totalRecords)) {
                oParsedResponse.totalRecords = parseInt(totalRecords,10)|0;
            }
        }
    }
    catch(e) {
    }
    if(!xmlList || !YAHOO.lang.isArray(this.responseSchema.fields)) {
        bError = true;
    }
    // Loop through each result
    else {

        oParsedResponse.results = [];
        for(var k = xmlList.length-1; k >= 0 ; k--) {
            var result = xmlList.item(k);
            var oResult = {};
            // Loop through each data field in each result using the schema
            for(var m = this.responseSchema.fields.length-1; m >= 0 ; m--) {
                var field = this.responseSchema.fields[m];
                var key = (YAHOO.lang.isValue(field.key)) ? field.key : field;
                var data = null;
                // Values may be held in an attribute...
                var xmlAttr = result.attributes.getNamedItem(key);
                if(xmlAttr) {
                    data = xmlAttr.value;
                }
                // ...or in a node
                else {
                    var xmlNode = result.getElementsByTagName(key);
                    if(xmlNode && xmlNode.item(0) && xmlNode.item(0).firstChild) {
                        data = xmlNode.item(0).firstChild.nodeValue;
                    }
                    else {
                           data = "";
                    }
                }
                // Backward compatibility
                if(!field.parser && field.converter) {
                    field.parser = field.converter;
                }
                if(field.parser) {
                    data = field.parser.call(this, data);
                }
                // Safety measure
                if(data === undefined) {
                    data = null;
                }
                oResult[key] = data;
            }
            // Capture each array of values into an array of results
            oParsedResponse.results[k] = oResult;
        }
    }
    if(bError) {
        oParsedResponse.error = true;
    }
    else {
    }
    return oParsedResponse;
};

/**
 * Executes a function created on the fly to parse the response JSON according to 
 * the defined schema.
 * @method executeJSONParser
 * @param oFullResponse {Object} The raw JSON-typed data from the server.
 * @return {Object}
 * @private
 */
YAHOO.util.DataSource.prototype.executeJSONParser = function (oFullResponse) {
    // Create the parsing method per the responseSchema only once
    if (!this.jsonResponseParser) {

        var schema       = this.responseSchema,
            fields       = schema.fields,
            resultsList  = schema.resultsList,
            totalRecords = schema.totalRecords,
            keys         = [],
            keyAssign,
            i;

        if (/\(/.test(resultsList)) {
            throw new SyntaxError("resultsList may only contain valid characters for variable names");
        }

        // Commit the atrocity of creating a function on the fly. parserDef
        // will become the body passed to new Function.  The signature will be
        // function (oFullResponse)
        var parserDef = 
            // grab the results list from the response
            "var results=oFullResponse";
        
        // Default direct assignment of oFullResponse as the resultsList if
        // the schema was not configured with a resultsList key.  Otherwise
        // create results=oFullResponse.location['in'].resultsList
        if (YAHOO.lang.isValue(resultsList)) {
            parserDef += "." + resultsList;
        }
        parserDef += ";";

        // if the list wasn't found at that location, default an empty array
        parserDef +=
            "if(!results){" +
                "results=[];" +
            "}" +

            // make sure it's an array
            "if(!YAHOO.lang.isArray(results)){" +
                "results=[results];" +
            "}";

        // Check for non-flat field keys.  If no keys need depth greater than
        // 1 (e.g. {key:"a.b.c"}), the raw data records can be used.
        for (i = fields.length - 1; i >= 0; --i) {
            keys[i] = typeof fields[i] === 'object' ? fields[i].key : fields[i];
        }

        // Test for any key having a '.' or '[' char
        if (/\[|\./.test(keys.join(''))) {
            // There are non-flat keys.  Iterate through the results, flattening
            // the keys -- {key:'a.b.c'} pulls value into result data like
            // { 'a.b.c': result.a.b.c, ... } (note the key is a flat string)
            parserDef +=
            "for(var i=results.length-1;i>=0;--i){" +
                "var r=results[i];" +
                "results[i]={";

            keyAssign = [];
            for (i = keys.length - 1; i >= 0; --i) {
                // Escape the quotes in 'a["b"]' style notation for the key
                // portion.
                keyAssign[i] = '"'+keys[i].replace(/"/g,'\\"')+'":r.'+keys[i];
            }
            parserDef += keyAssign.join(',') +
                "};" +
            "}";
        }

        // Generate the oParsedResponse
        parserDef +=
            "return {" +
                "results:results";

        // Include totalRecords if defined in the schema
        if (totalRecords) {
            parserDef += "," +
                "totalRecords:oFullResponse."+totalRecords;
        }
        
        parserDef +=
            "};";


        this.jsonResponseParser = new Function("oFullResponse",parserDef);
    }

    return this.jsonResponseParser(oFullResponse);
};

/**
 * Overridable method parses JSON data into a response object.
 *
 * @method parseJSONData
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full JSON from the live database.
 * @return {Object} Parsed response object with the following properties<br>
 *     - results (Array) Array of parsed data results<br>
 *     - error (Boolean) True if there was an error<br>
 *     - totalRecords (Number) Total number of records (if available)
 */
YAHOO.util.DataSource.prototype.parseJSONData = function(oRequest, oFullResponse) {
    var oParsedResponse = {results:[]};
    if(oFullResponse && (YAHOO.lang.isObject(oFullResponse))) {
        if(YAHOO.lang.isArray(this.responseSchema.fields)) {
            var fields          = this.responseSchema.fields,
                parserMap       = {},
                bError          = false,
                bHasParser      = false,
                i;

            // Build the parser map
            for (i = fields.length - 1; i >= 0; --i) {
                var key    = fields[i].key || fields[i],
                    parser = fields[i].parser || fields[i].converter;

                if (parser) {
                    parserMap[key] = parser;
                    bHasParser = true;
                }
            }

            // Parse out a jsonList
            try {
                oParsedResponse = this.executeJSONParser(oFullResponse);
            }
            catch(e) {
                bError = true;
            }

            // Check for errors
            if(bError || !oParsedResponse || !oParsedResponse.results) {
                if (!oParsedResponse) {
                    oParsedResponse = {results:[]};
                }

                oParsedResponse.error = true;
            }

            // Loop through the results to parse data if there are parsers
            if (bHasParser) {
                for (i = oParsedResponse.results.length - 1; i >= 0; --i) {
                    var r = oParsedResponse.results[i];
                    for (var p in parserMap) {
                        if (YAHOO.lang.hasOwnProperty(parserMap,p)) {
                            r[p] = parserMap[p].call(this,r[p]);
                            if (r[p] === undefined) {
                                r[p] = null;
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        oParsedResponse.error = true;
    }

    return oParsedResponse;
};

/**
 * Overridable method parses an HTML TABLE element reference into a response object.
 *
 * @method parseHTMLTableData
 * @param oRequest {Object} Request object.
 * @param oFullResponse {Object} The full HTML element reference from the live database.
 * @return {Object} Parsed response object with the following properties<br>
 *     - results (Array) Array of parsed data results<br>
 *     - error (Boolean) True if there was an error<br>
 *     - totalRecords (Number) Total number of records (if available)
 */
YAHOO.util.DataSource.prototype.parseHTMLTableData = function(oRequest, oFullResponse) {
    var bError = false;
    var elTable = oFullResponse;
    var fields = this.responseSchema.fields;
    var oParsedResponse = {results:[]};

    // Iterate through each TBODY
    for(var i=0; i<elTable.tBodies.length; i++) {
        var elTbody = elTable.tBodies[i];

        // Iterate through each TR
        for(var j=elTbody.rows.length-1; j>-1; j--) {
            var elRow = elTbody.rows[j];
            var oResult = {};
            
            for(var k=fields.length-1; k>-1; k--) {
                var field = fields[k];
                var key = (YAHOO.lang.isValue(field.key)) ? field.key : field;
                var data = elRow.cells[k].innerHTML;

                // Backward compatibility
                if(!field.parser && field.converter) {
                    field.parser = field.converter;
                }
                if(field.parser) {
                    data = field.parser.call(this, data);
                }
                // Safety measure
                if(data === undefined) {
                    data = null;
                }
                oResult[key] = data;
            }
            oParsedResponse.results[j] = oResult;
        }
    }

    if(bError) {
        oParsedResponse.error = true;
    }
    else {
    }
    return oParsedResponse;
};

/**
 * The Number utility provides helper functions to deal with data of type Number.
 *
 * @namespace YAHOO.util
 * @requires datasource
 * @title Number Utility
 * @beta
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The static Number class provides helper functions to deal with data of type
 * Number.
 *
 * @class Number
 * @static
 */
 YAHOO.util.Number = {
 
     /**
     * Takes a native JavaScript Number and formats to string for display to user.
     *
     * @method format
     * @param nData {Number} Number.
     * @param oConfig {Object} (Optional) Optional configuration values:
     *  <dl>
     *   <dt>prefix {String}</dd>
     *   <dd>String prepended before each number, like a currency designator "$"</dd>
     *   <dt>decimalPlaces {Number}</dd>
     *   <dd>Number of decimal places to round.</dd>
     *   <dt>decimalSeparator {String}</dd>
     *   <dd>Decimal separator</dd>
     *   <dt>thousandsSeparator {String}</dd>
     *   <dd>Thousands separator</dd>
     *   <dt>suffix {String}</dd>
     *   <dd>String appended after each number, like " items" (note the space)</dd>
     *  </dl>
     * @return {String} Formatted number for display.
     */
    format: function(nData, oConfig) {
        oConfig = oConfig || {};
        
        if(!YAHOO.lang.isNumber(nData)) {
            nData *= 1;
        }

        if(YAHOO.lang.isNumber(nData)) {
            var sOutput = nData + "";
            var sDecimalSeparator = (oConfig.decimalSeparator) ? oConfig.decimalSeparator : ".";
            var nDotIndex;

            // Manage decimals
            if(YAHOO.lang.isNumber(oConfig.decimalPlaces)) {
                // Round to the correct decimal place
                var nDecimalPlaces = oConfig.decimalPlaces;
                var nDecimal = Math.pow(10, nDecimalPlaces);
                sOutput = Math.round(nData*nDecimal)/nDecimal + "";
                nDotIndex = sOutput.lastIndexOf(".");

                if(nDecimalPlaces > 0) {
                    // Add the decimal separator
                    if(nDotIndex < 0) {
                        sOutput += sDecimalSeparator;
                        nDotIndex = sOutput.length-1;
                    }
                    // Replace the "."
                    else if(sDecimalSeparator !== "."){
                        sOutput = sOutput.replace(".",sDecimalSeparator);
                    }
                    // Add missing zeros
                    while((sOutput.length - 1 - nDotIndex) < nDecimalPlaces) {
                        sOutput += "0";
                    }
                }
            }
            
            // Add the thousands separator
            if(oConfig.thousandsSeparator) {
                var sThousandsSeparator = oConfig.thousandsSeparator;
                nDotIndex = sOutput.lastIndexOf(sDecimalSeparator);
                nDotIndex = (nDotIndex > -1) ? nDotIndex : sOutput.length;
                var sNewOutput = sOutput.substring(nDotIndex);
                var nCount = -1;
                for (var i=nDotIndex; i>0; i--) {
                    nCount++;
                    if ((nCount%3 === 0) && (i !== nDotIndex)) {
                        sNewOutput = sThousandsSeparator + sNewOutput;
                    }
                    sNewOutput = sOutput.charAt(i-1) + sNewOutput;
                }
                sOutput = sNewOutput;
            }

            // Prepend prefix
            sOutput = (oConfig.prefix) ? oConfig.prefix + sOutput : sOutput;

            // Append suffix
            sOutput = (oConfig.suffix) ? sOutput + oConfig.suffix : sOutput;

            return sOutput;
        }
        // Still not a Number, just return unaltered
        else {
            return nData;
        }
    }
 };



/**
 * The Date utility provides helper functions to deal with data of type Date.
 *
 * @namespace YAHOO.util
 * @requires datasource
 * @title Date Utility
 * @beta
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The static Date class provides helper functions to deal with data of type
 * Number.
 *
 * @class Date
 * @static
 */
 YAHOO.util.Date = {
     /**
     * Takes a native JavaScript Date and formats to string for display to user.
     *
     * @method format
     * @param oDate {Date} Date.
     * @param oConfig {Object} (Optional) Optional configuration values:
     *  <dl>
     *   <dt>format {String}</dd>
     *   <dd>Currently only the following formats are supported:
     *   "MM/DD/YYYY", "YYYY/MM/DD", or "DD/MM/YYYY"</dd>
     *  </dl>
     * @return {String} Formatted date for display.
     */
    format: function(oDate, oConfig) {
        oConfig = oConfig || {};
        
        if(oDate instanceof Date) {
            var format = oConfig.format || "MM/DD/YYYY";
            var mm = oDate.getMonth()+1;
            var dd = oDate.getDate();
            var yyyy = oDate.getFullYear();
            
            switch(format) {
                case "YYYY/MM/DD":
                    return yyyy + "/" + mm +"/" + dd;
                case "DD/MM/YYYY":
                    return dd + "/" + mm + "/" + yyyy;
                default: // "MM/DD/YYYY"
                    return mm + "/" + dd + "/" + yyyy;
            }
        }
        else {
            return YAHOO.lang.isValue(oDate) ? oDate : "";
        }
    }
 };
 

YAHOO.register("datasource", YAHOO.util.DataSource, {version: "@VERSION@", build: "@BUILD@"});
