//------------------- Resource API New Controller -------------------//
var apiResNew = angular.module('apiResNewApp', []);
apiResNew.controller('apiResNewCtrl', function($scope) {

    $scope.allModels = [];

    $scope.init = function(){
        let httpCallback = function(response){
            let res = JSON.parse(response);
            $scope.$apply(function(){
                Object.keys(res).forEach(function(key)
                {
                    let obj = res[key];
                    obj.model = key;
                    $scope.allModels.push(obj);
                });
            });
        };
        httpGetAsync("../../fms/maestro/api/getAllDataModel", {}, httpCallback);
    };

    $scope.generate = function(key){
        console.log("generate key: " +key);
        let httpCallback = function(response){
            console.log(response);
        };
        httpPostAsync("../../fms/maestro/api/genResApi", {model:key}, httpCallback);

    };
    
    $scope.delete = function(key){
        console.log("delete key: " +key);
        let httpCallback = function(response){
            console.log(response);
        };
        httpPostAsync("../../fms/maestro/api/delResApi", {model:key}, httpCallback);

    };

    $scope.init();
});

//------------------- API View Controller -------------------//
var apiViewApp = angular.module('apiViewApp', []);
apiViewApp.controller('apiViewCtrl', function($scope) {

    $scope.resourceApis = [];
    $scope.hasResourceApis = false;
    $scope.customizedApis = [];
    $scope.hasCustomeizedApis = false;
    $scope.dindex = 0;
    $scope.selOrder = {};
    $scope.inputOrder = {};
    $scope.inputAttr = {};
    $scope.inputParam = {};
    $scope.inputValue = {};

    $scope.orderBys = {};
    $scope.attributes = {};
    $scope.parameters = {};

    $scope.init = function(){

        let httpCallback = function(response){
            let res = JSON.parse(response);

            $scope.$apply(function(){

                let resources = res.resource;
                resources.forEach(function(resource){
                    resource.actions.forEach(function(action){
                        $scope.selOrder[resource.name+"-"+action.type] = "ASC";
                        $scope.inputOrder[resource.name+"-"+action.type] = "";
                        $scope.orderBys[resource.name+"-"+action.type] = [];
                        $scope.attributes[resource.name+"-"+action.type] = [];
                        $scope.inputParam[resource.name+"-"+action.type] = "";
                        $scope.inputValue[resource.name+"-"+action.type] = "";
    
                        action['reqBody'] = "";
                        action['reqLimit'] = "";
                        action['reqOffset'] = "";
                        action['orderBys'] = [];
                        action['parameters'] = [];
                        action['attributes'] = [];
                        action['request'] = "-";
                        action['response'] = "";
                        action['sendRequestBody'] = "";
                        action['responseTime'] = "";
                    });
                });

                let cusresources = res.customized;
                cusresources.forEach(function(cresource){
                    // cresource.actions.forEach(function(action){
                        $scope.selOrder[cresource.apiName+"-"+cresource.actionType] = "ASC";
                        $scope.inputOrder[cresource.apiName+"-"+cresource.actionType] = "";
                        $scope.orderBys[cresource.apiName+"-"+cresource.actionType] = [];
                        $scope.attributes[cresource.apiName+"-"+cresource.actionType] = [];
                        $scope.inputParam[cresource.apiName+"-"+cresource.actionType] = "";
                        $scope.inputValue[cresource.apiName+"-"+cresource.actionType] = "";
    
                        cresource.actionType = cresource.actionType.toLowerCase();
                        cresource.name = cresource.apiName;
                        cresource.type = cresource.actionType;
                        cresource['reqBody'] = "";
                        cresource['reqLimit'] = "";
                        cresource['reqOffset'] = "";
                        cresource['orderBys'] = [];
                        cresource['parameters'] = [];
                        cresource['attributes'] = [];
                        cresource['request'] = "-";
                        cresource['response'] = "";
                        cresource['sendRequestBody'] = "";
                        cresource['responseTime'] = "";
                    // });
                });
                
                $scope.resourceApis = resources;
                $scope.hasResourceApis = resources.length > 0 ? true:false;
                $scope.customizedApis = cusresources;
                $scope.hasCustomeizedApis = cusresources.length > 0 ? true:false;

                console.log(resources)
                console.log(cusresources)
            });
        };
        httpGetAsync("../../fms/maestro/api/getApis", {}, httpCallback);
    };

    $scope.addParameters = function(resourceApiName, isCustom){

        if($scope.inputParam[resourceApiName] !== ''){

            if(!isCustom){
                $scope.resourceApis.forEach(function(resourceApi){
                    resourceApi.actions.forEach(function(action){
                        if(resourceApi.name+'-'+action.type === resourceApiName){
                            
                            let found = false;
                            action.parameters.forEach(function(parameter){
                                if(parameter.param === $scope.inputParam[resourceApiName]
                                    && parameter.value == $scope.inputValue[resourceApiName]){
                                    found = true;
                                }
                            });

                            if(!found){
                                action.parameters.push({
                                    "param":$scope.inputParam[resourceApiName],
                                    "value":$scope.inputValue[resourceApiName]
                                });
                            }
                        }
                    });
                });
            }else{
                $scope.customizedApis.forEach(function(cresourceApi){
                    if(cresourceApi.name+'-'+cresourceApi.type === resourceApiName){
                        let found = false;
                        cresourceApi.parameters.forEach(function(parameter){
                            if(parameter.param === $scope.inputParam[resourceApiName]
                                && parameter.value == $scope.inputValue[resourceApiName]){
                                found = true;
                            }
                        });
                        if(!found){
                            cresourceApi.parameters.push({
                                "param":$scope.inputParam[resourceApiName],
                                "value":$scope.inputValue[resourceApiName]
                            });
                        }
                    }
                });
            }

            $scope.inputParam[resourceApiName] = '';
            $scope.inputValue[resourceApiName] = '';
        }
    };

    $scope.removeParameter = function(input, isCustom){
        if(!isCustom){
            $scope.resourceApis.forEach(function(resourceApi){

                resourceApi.actions.forEach(function(action){
                    if(resourceApi.name+'-'+action.type === input.apiName){
                        let newParams = [];
                        action.parameters.forEach(function(parameter){
                            if(parameter.param === input.param
                                && parameter.value == input.value){
                                delete parameter;
                            }else{
                                newParams.push(parameter);
                            }
                        });
                        action.parameters = newParams;
                    }
                });
            });
        }else{
            $scope.customizedApis.forEach(function(cresourceApi){
                if(cresourceApi.name+'-'+cresourceApi.type === input.apiName){
                    let newParams = [];
                    cresourceApi.parameters.forEach(function(parameter){
                        if(parameter.param === input.param
                            && parameter.value == input.value){
                            delete parameter;
                        }else{
                            newParams.push(parameter);
                        }
                    });
                    cresourceApi.parameters = newParams;
                }
            });
        }
    };

    $scope.addOrderby = function(resourceApiName, isCustom){
        
        if($scope.inputOrder[resourceApiName] !== ''){
            if(!isCustom){
                $scope.resourceApis.forEach(function(resourceApi){

                    resourceApi.actions.forEach(function(action){
                        if(resourceApi.name+'-'+action.type === resourceApiName){
                            
                            let found = false;
                            action.orderBys.forEach(function(orderBy){
                                if(orderBy.col === $scope.inputOrder[resourceApiName]
                                    && orderBy.order == $scope.selOrder[resourceApiName]){
                                    found = true;
                                }
                            });

                            if(!found){
                                action.orderBys.push({
                                    "col":$scope.inputOrder[resourceApiName],
                                    "order":$scope.selOrder[resourceApiName]
                                });
                            }
                        }
                    })
                    
                });
            }else{
                $scope.customizedApis.forEach(function(cresourceApi){
                    if(cresourceApi.name+'-'+cresourceApi.type === resourceApiName){
                        let found = false;
                        cresourceApi.orderBys.forEach(function(orderBy){
                            if(orderBy.col === $scope.inputOrder[resourceApiName]
                                && orderBy.order == $scope.selOrder[resourceApiName]){
                                found = true;
                            }
                        });
                        if(!found){
                            cresourceApi.orderBys.push({
                                "col":$scope.inputOrder[resourceApiName],
                                "order":$scope.selOrder[resourceApiName]
                            });
                        }
                    }
                });
            }

            $scope.inputOrder[resourceApiName] = '';
            $scope.selOrder[resourceApiName] = 'ASC';
        }
    };
    $scope.removeOrderby = function(input, isCustom){
        if(!isCustom){
            $scope.resourceApis.forEach(function(resourceApi){

                resourceApi.actions.forEach(function(action){
                    if(resourceApi.name+'-'+action.type === input.apiName){
                        let newOrderBys = [];
                        action.orderBys.forEach(function(orderBy){
                            if(orderBy.col === input.col
                                && orderBy.order == input.order){
                                //delete orderBy;
                            }else{
                                newOrderBys.push(orderBy);
                            }
                        });
                        action.orderBys = newOrderBys;
                    }
                });
            });
        }else{
            $scope.customizedApis.forEach(function(cresourceApi){
                if(cresourceApi.name+'-'+cresourceApi.type === input.apiName){
                    let newParams = [];
                    cresourceApi.orderBys.forEach(function(orderBy){
                        if(orderBy.col === input.col
                            && orderBy.order == input.order){
                            delete orderBy;
                        }else{
                            newParams.push(orderBy);
                        }
                    });
                    cresourceApi.orderBys = newParams;
                }
            });
        }
    };

    $scope.addAttribute = function(resourceApiName, isCustom){

        if($scope.inputAttr[resourceApiName] !== ''){
            if(!isCustom){
                $scope.resourceApis.forEach(function(resourceApi){

                    resourceApi.actions.forEach(function(action){

                        if(resourceApi.name+'-'+action.type === resourceApiName){

                            let found = false;
                            action.attributes.forEach(function(attribute){
                                if(attribute === $scope.inputAttr[resourceApiName]){
                                    found = true;
                                }
                            });
        
                            if(!found){
                                action.attributes.push($scope.inputAttr[resourceApiName]);
                            }
                        }

                    })
                    
                });
            }else{
                $scope.customizedApis.forEach(function(cresourceApi){
                    if(cresourceApi.name+'-'+cresourceApi.type === resourceApiName){
                        let found = false;
                        cresourceApi.attributes.forEach(function(attribute){
                            if(attribute === $scope.inputAttr[resourceApiName]){
                                found = true;
                            }
                        });
                        if(!found){
                            cresourceApi.attributes.push($scope.inputAttr[resourceApiName]);
                        }
                    }
                });
            }

            $scope.inputAttr[resourceApiName] = '';
        }
    };
    $scope.removeAttribute = function(input, isCustom){
        if(!isCustom){
            $scope.resourceApis.forEach(function(resourceApi){

                resourceApi.actions.forEach(function(action){
                    if(resourceApi.name+'-'+action.type === input.apiName){
                        let newAttributes = [];
                        action.attributes.forEach(function(attribute){
                            if(attribute === input.attr){
                                //delete orderBy;
                            }else{
                                newAttributes.push(attribute);
                            }
                        });
                        action.attributes = newAttributes;
                    }
                });
                
            });
        }else{
            $scope.customizedApis.forEach(function(cresourceApi){
                if(cresourceApi.name+'-'+cresourceApi.type === input.apiName){
                    let newAttributes = [];
                    cresourceApi.attributes.forEach(function(attribute){
                        if(attribute === input.attr){
                            delete attribute;
                        }else{
                            newAttributes.push(attribute);
                        }
                    });
                    cresourceApi.attributes = newAttributes;
                }
            });
        }
    };
    
    $scope.test = function(resourceApiName, api){   
        console.log(api)
        let apiUrl = "";
        let apis = {};
        let reqBody = {};
        if(api.apiType === 'customised'){
            apis = $scope.customizedApis;
            apiUrl = api.path;
        }else{
            apis = $scope.resourceApis;
            apiUrl = api.path;
        }

        apis.forEach(function(resourceApi){
            if(resourceApi.name === resourceApiName){
                resourceApi.request ="";

                let query = "";

                //form the limit
                if(typeof api.reqLimit !== 'undefined'
                    && api.reqLimit !== ''){
                    if(query === ""){
                        query+="?limit="+api.reqLimit
                    }else{
                        query+="&limit="+api.reqLimit
                    }
                }

                //form the offset
                if(typeof api.reqOffset !== 'undefined'
                    && api.reqOffset !== ''){
                    if(query === ""){
                        query+="?offset="+api.reqOffset
                    }else{
                        query+="&offset="+api.reqOffset
                    }
                }
                //form the attributes
                if(typeof api.attributes !== 'undefined'
                    && (Array.isArray(api.attributes) && api.attributes.length > 0)){
                    let arrayString = "";
                    for(let ai = 0; ai < api.attributes.length; ai++){
                        let attr = api.attributes[ai];
                        if(arrayString === "") arrayString += attr;
                        else arrayString += ","+ attr;
                    }
                    if(arrayString !== ""){
                        arrayString = "attributes=" + arrayString;

                        if(query === ""){
                            query+="?"+arrayString;
                        }else{
                            query+="&"+arrayString;
                        }
                    }
                }
                
                
                //form the orderby
                if(typeof api.orderBys !== 'undefined'
                    && (Array.isArray(api.orderBys) && api.orderBys.length > 0)){
                    let arrayString = "";
                    for(let oi = 0; oi < api.orderBys.length; oi++){
                        let orderObj = api.orderBys[oi];
                        if(arrayString === "") arrayString += orderObj.col+"-"+orderObj.order;
                        else arrayString += ","+ orderObj.col+"-"+orderObj.order;;
                        // let objArray = [];
                        // objArray.push(orderObj.col);
                        // objArray.push(orderObj.order);
                    }
                    if(arrayString !== ""){
                        arrayString = "order=" + arrayString;

                        if(query === ""){
                            query+="?"+arrayString;
                        }else{
                            query+="&"+arrayString;
                        }
                    }
                    
                }

                //form the parameters
                if(typeof api.parameters !== 'undefined'
                    && (Array.isArray(api.parameters) && api.parameters.length > 0)){
                    let arrayString = "";
                    for(let oi = 0; oi < api.parameters.length; oi++){
                        let paramObj = api.parameters[oi];
                        if(arrayString === "") arrayString += paramObj.param+"="+paramObj.value;
                        else arrayString += "&"+ paramObj.param+"="+paramObj.value;;
                        // let objArray = [];
                        // objArray.push(orderObj.col);
                        // objArray.push(orderObj.order);
                    }
                    if(arrayString !== ""){
                        //arrayString = "order=" + arrayString;

                        if(query === ""){
                            query+="?"+arrayString;
                        }else{
                            query+="&"+arrayString;
                        }
                    }
                    
                }

                if(typeof api.reqBody !== 'undefined'
                    && api.reqBody !== ''){

                    reqBody = JSON.parse(api.reqBody);
                }
                
                // resourceApi.sendRequestBody = JSON.stringify(reqBody);

                // resourceApi.request = JSON.stringify(resourceApi);
                api.request = apiUrl + query;
            }
        });

        let startTime = new Date();
        let httpCallback = function(response){
            let endTime = new Date();
            let durationMs = endTime.getTime() - startTime.getTime();
            
            $scope.$apply(function(){
                api.response = response;
                api.responseTime = "Response in " + durationMs + "ms";
            });
        };

        if(api.type === 'get')
            httpGetAsync("../.."+ api.request, {}, httpCallback);
        else if(api.type === 'post')
            httpPostAsync("../.."+ api.request, reqBody, httpCallback);
        else if(api.type === 'put')
            httpPutAsync("../.."+ api.request, reqBody, httpCallback);
        else if(api.type === 'delete')
            httpDeleteAsync("../.."+ api.request, reqBody, httpCallback);
        
    };

    
    $scope.init();
    
});