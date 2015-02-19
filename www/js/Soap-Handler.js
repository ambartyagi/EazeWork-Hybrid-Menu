angular.module('myModule', ['ng'])

    /**
     * This provider adds SOAP support to the $http service
     * @class soap-interceptorProvider
     * @module myModule
     * @namespace myModule
     */
    .provider('myModule.soap-interceptor', ['$httpProvider', function($httpProvider){
        var providerInstance = this;

        /**
         * This is a cache for WSDL schemas where the key is the SOAP service base url and the value is the
         * service's WSDL
         * @class WsdlCache
         * @module myModule
         * @namespace myModule
         */
        function WsdlCache(){
            var wsdlCacheInstance = this;

            /**
             * This object holds the cached WSDLs and URLs.
             * @prop rawCache
             * @type {object}
             */
            wsdlCacheInstance.rawCache = {};

            /**
             * Safely add a new WSDL to the service. This will later be used to compose SOAP request for the given URL.
             * @method setWSDL
             * @param {string} url - the base URL of the soap service
             * @param {string} wsdl - the xml string of the wsdl of the SOAP service.
             */
            wsdlCacheInstance.setWSDL = function(url, wsdl){
                if(!wsdlCacheInstance.rawCache.hasOwnProperty(url)){
                    if(angular.isString(wsdl)){
                        wsdl = $.parseXML(wsdl);
                    }
                    wsdlCacheInstance.rawCache[url] = wsdl;
                }
            };

            /**
             * Check if a given url has a WSDL in cache.
             * @param {string} url - full SOAP action url, including method and query
             * @returns {boolean}
             */
            wsdlCacheInstance.inCache = function(url){
                var result = false,
                    currentUrl;

                // look for the base url in the cache and make sure it has a wsdl stored.
                for(currentUrl in wsdlCacheInstance.rawCache){
                    if(wsdlCacheInstance.rawCache.hasOwnProperty(currentUrl) && url.indexOf(currentUrl) > -1 && wsdlCacheInstance.rawCache[currentUrl]){
                        result = true;
                        break;
                    }
                }
                return result;
            };

            /**
             * Get the WSDL based on the full url.
             * @method getWSDL
             * @param {string} url - full SOAP action url, including method and query
             * @returns {string | NULL} the cached WSDL or NULL.
             */
            wsdlCacheInstance.getWSDL = function(url){
                var result = null,
                    currentUrl;

                // look for the base url in the cache and make sure it has a wsdl stored.
                for(currentUrl in wsdlCacheInstance.rawCache){
                    if(wsdlCacheInstance.rawCache.hasOwnProperty(currentUrl) && url.indexOf(currentUrl) > -1 && wsdlCacheInstance.rawCache[currentUrl]){
                        result = wsdlCacheInstance.rawCache[currentUrl];
                        break;
                    }
                }
                return result;
            };
        }

        /**
         * This provider adds SOAP support to the $http service.
         *
         * **Example of use**
         * First get the WSDL and cache it. You'll probably get it as a json request from the server like so:
         *
         *     $http.get('http://www.myveryfakedomain.com/CRMAPIWS74?wsdl', { isJSON: true }).then(function(result){
         *         soap.setWSDL('http:/www.myveryfakedomain.com/CRMAPIWS74', result.data);
         *     });
         * Note the { isJSON : true } in the $http service config - this will tell the $http service that this is not a
         * SOAP request. By default, all requests are handled as SOAP.
         *
         * Then, in a service you can use the cached WSDL to invoke a SOAP action
         *
         *     $http.get('http://www.myveryfakedomain.com/CRMAPIWS74/isAlive').then(function(response){
         *        alert(response.data);
         *      });
         *
         *  If you'll call a URL that is not cached using setWSDL method you will get an exception since without the WSDL
         *  this service can not parse the SOAP response.
         *
         * @class soap-interceptor
         * @module myModule
         * @namespace myModule
         */
        function SoapInterceptor(){
            var serviceInstance = this;

            /**
             * The WSDL cache object. See {{#crossLink "rtv.data.WsdlCache"}}{{/crossLink}}
             * @prop cache
             * @type {WsdlCache}
             * @for myModule.soap-interceptor
             */
            serviceInstance.cache = new WsdlCache();

            /**
             * Shorthand method for cache.setWSDL. See {{#crossLink "rtv.data.WsdlCache/setWSDL"}}{{/crossLink}} in
             * WsdlCache
             * @method setWSDL
             * @for myModule.soap-interceptor
             */
            serviceInstance.setWSDL = serviceInstance.cache.setWSDL;

            /**
             * This method gets the cached WSDL and other request-related parameters based on the full url
             * @method getSoapRequestParams
             * @param {string} url - full SOAP action url, including method and query
             * @returns {{wsdl: xmlDocument, baseUrl: string, url: string, method: string}}
             * @for myModule.soap-interceptor
             */
            serviceInstance.getSoapRequestParams = function getSoapRequestParams(url){
                var result = {
                        wsdl : null,
                        baseUrl : '',
                        url : url,
                        method : ''
                    },
                    cache =  serviceInstance.cache.rawCache,
                    queryIndex = -1,
                    currentUrl;

                // look for the base url in the cache and make sure it has a wsdl stored.
                for(currentUrl in cache){
                    if(cache.hasOwnProperty(currentUrl) && url.indexOf(currentUrl) > -1 && cache[currentUrl]){
                        queryIndex = url.indexOf('?');
                        queryIndex = queryIndex > -1 ? queryIndex : url.length;
                        result.method = url.substring(currentUrl.length, queryIndex);
                        if(result.method[0] === '/'){
                            result.method = result.method.substring(1);
                        }
                        result.baseUrl = currentUrl;
                        result.wsdl = cache[currentUrl];
                        break;
                    }
                }

                if(!result.method){
                    throw Error('Base URL for provided url was not found. Please make sure to ' +
                        'call soap interceptor\'s setWSDL() function before executing SOAP requests. Error in request for: ' + url, 'error');
                }
                return result;
            };

            /**
             * Convert the json request to soap request
             * @method handleSoapRequest
             * @param {object} config - angular $http service config object
             * @returns {object} Modified config object
             * @for myModule.soap-interceptor
             * @private
             */
            serviceInstance.handleSoapRequest = function handleSoapRequest(config){
                var namespace, soapAction, soapParams;

                if(!serviceInstance.cache.inCache(config.url)){
                    throw new Error('WSDL for provided url was not found. Please make sure to ' +
                        'call soap interceptor\'s setWSDL() function before executing SOAP requests.Error in request for: ' + config.url, 'error');
                }

                soapParams = serviceInstance.getSoapRequestParams(config.url);
                // get namespace
                namespace = (soapParams.wsdl.documentElement.attributes.targetNamespace + '' === 'undefined') ?
                    soapParams.wsdl.documentElement.attributes.getNamedItem('targetNamespace').nodeValue :
                    soapParams.wsdl.documentElement.attributes.targetNamespace.value;

                // Save extracted data of soap request
                config.soapRequestParams = soapParams;

                // build SOAP request
                config.data =
                    '<?xml version="1.0" encoding="utf-8"?>' +
                        '<soap:Envelope ' +
                        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
                        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                        '<soap:Body>' +
                        '<' + soapParams.method + ' xmlns="' + namespace + '">' +
                        serviceInstance.soapSerializeParameter(config.data) +
                        '</' + soapParams.method + '></soap:Body></soap:Envelope>';


                // Set SOAP headers
                soapAction = ((namespace.lastIndexOf('/') !== namespace.length - 1) ? namespace + '/' : namespace) + soapParams.method;
                config.headers = config.headers || {};
                angular.extend(config.headers, {
                    'SOAPAction' : soapAction,
                    'Content-Type' : 'text/xml; charset=utf-8'
                });

                return config;
            };

            /**
             *
             * @method handleSoapResponse
             * @param {string} response
             * @returns {*} Modified response
             * @for myModule.soap-interceptor
             * @private
             */
            serviceInstance.handleSoapResponse = function handleSoapResponse(response){
                var xmlData, nd;

                /*response.data: Object
                 response.headers: function (name) {
                 response.status: 200*/
                //console.log('handle soap response');

                if(response.config.soapRequestParams){
                    xmlData = $.parseXML(response.data);
                    nd = serviceInstance.getElementsByTagName(xmlData, response.config.soapRequestParams.method + 'Result');

                    if(nd.length === 0){
                        nd = serviceInstance.getElementsByTagName(xmlData, 'return');	// PHP web Service?
                    }
                    if(nd.length === 0) {
                        response.data =  serviceInstance.handleSoapResponseError(xmlData);
                        response.status = 500;
                    }
                    else{
                        response.data = serviceInstance.soapResultToObject(nd[0], response.config.soapRequestParams.wsdl);
                    }
                }
                return response;
            };

            /**
             * Extract error from xml
             * @method handleSoapResponseError
             * @param {string | xml} xmlResponse - xml string or xml dom response
             * @resurns {string} the parsed error.
             */
            serviceInstance.handleSoapResponseError = function(xmlResponse){
                var result = 'Unknown Error';

                if(typeof xmlResponse === 'string'){
                    xmlResponse = $.parseXML(xmlResponse);
                }
                if(xmlResponse.getElementsByTagName('faultcode').length > 0){
                    result = xmlResponse.getElementsByTagName('faultstring')[0].childNodes[0].nodeValue;
                }

                return result;
            };

            /**
             * Serialize a single request parameter to SOAP.
             * @method soapSerializeParameter
             * @param {*} parameter - The parameter to serialize
             * @returns {string} SOAP representation of the parameter.
             * @for myModule.soap-interceptor
             * @private
             */
            serviceInstance.soapSerializeParameter = function serializeParameter(parameter){
                var result = '';
                switch(typeof(parameter))
                {
                    case 'string':
                        result += parameter.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); break;
                    case 'number':
                    case 'boolean':
                        result += parameter.toString(); break;
                    case 'object':
                        // Date
                        if(parameter.constructor.toString().indexOf('function Date()') > -1)
                        {

                            var year = parameter.getFullYear().toString();
                            var month = (parameter.getMonth() + 1).toString(); month = (month.length === 1) ? '0' + month : month;
                            var date = parameter.getDate().toString(); date = (date.length === 1) ? '0' + date : date;
                            var hours = parameter.getHours().toString(); hours = (hours.length === 1) ? '0' + hours : hours;
                            var minutes = parameter.getMinutes().toString(); minutes = (minutes.length === 1) ? '0' + minutes : minutes;
                            var seconds = parameter.getSeconds().toString(); seconds = (seconds.length === 1) ? '0' + seconds : seconds;
                            var milliseconds = parameter.getMilliseconds().toString();
                            var tzminutes = Math.abs(parameter.getTimezoneOffset());
                            var tzhours = 0;
                            while(tzminutes >= 60)
                            {
                                tzhours++;
                                tzminutes -= 60;
                            }
                            tzminutes = (tzminutes.toString().length === 1) ? '0' + tzminutes.toString() : tzminutes.toString();
                            tzhours = (tzhours.toString().length === 1) ? '0' + tzhours.toString() : tzhours.toString();
                            var timezone = ((parameter.getTimezoneOffset() < 0) ? '+' : '-') + tzhours + ':' + tzminutes;
                            result += year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds + timezone;
                        }
                        // Array
                        else if(parameter.constructor.toString().indexOf('function Array()') > -1)
                        {
                            for(var p in parameter)
                            {
                                if(!isNaN(p))   // linear array
                                {
                                    (/function\s+(\w*)\s*\(/ig).exec(parameter[p].constructor.toString());
                                    var type = RegExp.$1;
                                    switch(type)
                                    {
                                        case '':
                                            type = typeof(parameter[p]);
                                        /* falls through */
                                        case 'String':
                                            type = 'string'; break;
                                        case 'Number':
                                            type = 'int'; break;
                                        case 'Boolean':
                                            type = 'bool'; break;
                                        case 'Date':
                                            type = 'DateTime'; break;
                                    }
                                    result += '<' + type + '>' + serviceInstance.soapSerializeParameter(parameter[p]) + '</' + type + '>';
                                }
                                else{
                                    // associative array
                                    result += '<' + p + '>' + serviceInstance.soapSerializeParameter(parameter[p]) + '</' + p + '>';
                                }
                            }
                        }
                        // Object or custom function
                        else{
                            for(var property in parameter){
                                result += '<' + property + '>' + serviceInstance.soapSerializeParameter(parameter[property]) + '</' + property + '>';
                            }
                        }
                        break;
                    default:
                        break; // throw new Error(500, 'serviceInstance.soapSerializeParameter: type "' + typeof(o) + '" is not supported');
                }
                return result;
            };

            /**
             * Get an xml node out of xml document
             * @method getElementsByTagName
             * @param {xml} document
             * @param {string} tagName
             * @returns {xmlNode}
             * @for myModule.soap-interceptor
             * @private
             */
            serviceInstance.getElementsByTagName = function(document, tagName)
            {
                var result = null;
                try {
                    // trying to get node omitting any namespaces (latest versions of MSXML.XMLDocument)
                    result = document.selectNodes('.//*[local-name()="'+ tagName +'"]');
                }
                catch (ex) {
                    // old XML parser support
                    result =  document.getElementsByTagName(tagName);
                }
                return result;
            };

            serviceInstance.soapResultToObject = function(node, wsdl)
            {
                var wsdlTypes = serviceInstance.getTypesFromWsdl(wsdl);
                return serviceInstance.nodeToObject(node, wsdlTypes);
            };

            serviceInstance.nodeToObject = function(node, wsdlTypes)
            {
                var isArray, i;

                // null node
                if(node === null){
                    return null;
                }

                // text node
                if(node.nodeType === 3 || node.nodeType === 4){
                    return serviceInstance.extractValue(node, wsdlTypes);
                }

                // leaf node
                if (node.childNodes.length === 1 && (node.childNodes[0].nodeType === 3 || node.childNodes[0].nodeType === 4)){
                    return serviceInstance.nodeToObject(node.childNodes[0], wsdlTypes);
                }

                isArray = serviceInstance.getTypeFromWsdl(node.nodeName, wsdlTypes).toLowerCase().indexOf('arrayof') !== -1;
                // object node
                if(!isArray)
                {
                    var obj = null;
                    if(node.hasChildNodes()){
                        obj = {};
                    }

                    for(i = 0; i < node.childNodes.length; i++){
                        var nodeValue = serviceInstance.nodeToObject(node.childNodes[i], wsdlTypes),
                            nodeName = node.childNodes[i].nodeName;

                        nodeName = nodeName.lastIndexOf(':') > -1 ? nodeName.substring( nodeName.lastIndexOf(':') + 1).trim() : nodeName;
                        obj[nodeName] = nodeValue;
                    }
                    return obj;
                }
                // list node
                else
                {
                    // create node ref
                    var l = [];
                    for(i = 0; i < node.childNodes.length; i++){
                        l[l.length] = serviceInstance.nodeToObject(node.childNodes[i], wsdlTypes);
                    }
                    return l;
                }
                return null;
            };

            serviceInstance.extractValue = function(node, wsdlTypes)
            {
                var value = node.nodeValue;
                switch(serviceInstance.getTypeFromWsdl(node.parentNode.nodeName, wsdlTypes).toLowerCase())
                {
                    default:
                    case 's:string':
                        return (value !== null) ? value + '' : '';
                    case 's:boolean':
                        return value + '' === 'true';
                    case 's:int':
                    case 's:long':
                        return (value !== null) ? parseInt(value + '', 10) : 0;
                    case 's:double':
                        return (value !== null) ? parseFloat(value + '') : 0;
                    case 's:datetime':
                        if(value === null){
                            return null;
                        }
                        else {
                            value = value + '';
                            value = value.substring(0, (value.lastIndexOf('.') === -1 ? value.length : value.lastIndexOf('.')));
                            value = value.replace(/T/gi,' ');
                            value = value.replace(/-/gi,'/');
                            var d = new Date();
                            d.setTime(Date.parse(value));
                            return d;
                        }
                }
            };

            serviceInstance.getTypesFromWsdl = function(wsdl)
            {
                var nameAttribute = 'name',
                    typeAttribute = 'type';

                var wsdlTypes = [];
                // IE
                var ell = wsdl.getElementsByTagName('s:element');
                var useNamedItem = true;
                // MOZ
                if(ell.length === 0)
                {
                    ell = wsdl.getElementsByTagName('element');
                    useNamedItem = false;
                }
                for(var i = 0; i < ell.length; i++)
                {
                    if(useNamedItem)
                    {
                        if(ell[i].attributes.getNamedItem(nameAttribute) && ell[i].attributes.getNamedItem(typeAttribute)){
                            wsdlTypes[ell[i].attributes.getNamedItem(nameAttribute).nodeValue] = ell[i].attributes.getNamedItem(typeAttribute).nodeValue;
                        }
                    }
                    else
                    {
                        if(ell[i].attributes[nameAttribute] && ell[i].attributes[typeAttribute]){
                            wsdlTypes[ell[i].attributes[nameAttribute].value] = ell[i].attributes[typeAttribute].value;
                        }
                    }
                }
                return wsdlTypes;
            };

            serviceInstance.getTypeFromWsdl = function(elementname, wsdlTypes)
            {
                var type = wsdlTypes[elementname] + '';
                return (type === 'undefined') ? '' : type;
            };
        }



        /**
         * To be used by angular, this method retrieves new {{#crossLink "rtv.data.soap-interceptor"}}{{/crossLink}} instance.
         * @method $get
         * @returns {SoapInterceptor}
         * @for myModule.soap-interceptorProvider
         */
        providerInstance.$get = function(){
            return new SoapInterceptor();
        };
    }])

    // Add http interceptors that allows us to handle http request before it sends and http response parsing
    .config(function dataConfig($httpProvider){
        $httpProvider.interceptors.push(['$q','myModule.soap-interceptor', function($q, soap) {
            return {
                'request': function httpRequestInterceptor(config) {
                    if(!config.isJSON && config.url.indexOf('.html') === -1){
                        config = soap.handleSoapRequest(config);
                    }
                    return config || $q.when(config);
                },

                'response': function httpResponseInterceptor(response) {
                    if(!response.config.isJSON){
                        response = soap.handleSoapResponse(response);
                    }
                    return response || $q.when(response);
                },

                'responseError': function(rejection) {
                    if(!rejection.config.isJSON){
                        rejection.data = soap.handleSoapResponseError(rejection.data);
                    }
                    return $q.reject(rejection);
                }
            };
        }]);
    });
