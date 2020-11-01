//------------------- Resource API New Controller -------------------//
var clientsManage = angular.module('clientsManageApp', []);
clientsManage.controller('clientsManageCtrl', function($scope) {
    $scope.data = {
        allServices: [],
    };
    $scope.currEndpoint = "";
    $scope.selectedService = "Select Service"
    $scope.isViewing = false;

    $scope.removeClientService = function(){
        console.log("deleting....")
        let httpCallback = function(response){
            $scope.init();
        }
        httpDeleteAsync("../linguist/api/deleteClientDefinition", {
            serviceName: $scope.selectedService,
        }, httpCallback);
    };

    $scope.saveProtoContent = function(){
        let httpCallback = function(response){
            $scope.init();
        }
        httpPutAsync("../linguist/api/saveClientProto", {
            serviceName: $scope.selectedService,
            protoContent: $scope.editor.getValue()
        }, httpCallback);
    };

    $scope.saveEndpoint = function(){
        let httpCallback = function(response){
            $scope.init();
        }
        httpPutAsync("../linguist/api/saveClientDefinition", {
            serviceName: $scope.selectedService,
            serverURL: $scope.currEndpoint
        }, httpCallback);
    };

    $scope.selectService = function(service){
        $scope.selectedService = service;
        $scope.isViewing = true;

        $scope.data.allServices.forEach( svc => {
            if(svc.serviceName === service){
                $scope.currEndpoint = svc.serverURL;

                $scope.editor = ace.edit("editor");
                let r = function(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
                r(function(){
                    $scope.editor.setTheme("ace/theme/monokai");
                    $scope.editor.session.setMode("ace/mode/protobuf");
                    $scope.editor.setReadOnly(false);
                    $scope.editor.setValue(svc.protoContent, -1);
                    $scope.editor.on("input", function() {
                        isCodeAdded = !$scope.editor.session.getUndoManager().isClean();
                    });
                    
                });
            }
        });
    };

    $scope.init = function(){
        let httpCallback = function(response){
            let res = JSON.parse(response);
            $scope.data.allServices = [];
            $scope.currEndpoint = "";
            $scope.selectedService = "Select Service"
            $scope.isViewing = false;
            // console.log(res)
            
            $scope.$apply(function(){
                Object.keys(res).forEach( svcKey => {
                    $scope.data.allServices.push({
                        serviceName: svcKey,
                        serverURL: res[svcKey].serverURL,
                        protoContent: res[svcKey].protoContent
                    });
                });
            });
        };
        httpGetAsync("../linguist/api/getClient", {}, httpCallback);
    };
   
    $scope.init();
});

