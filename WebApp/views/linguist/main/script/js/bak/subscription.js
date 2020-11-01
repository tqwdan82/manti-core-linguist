var testPublishApp = angular.module('testPublishApp', []);
testPublishApp.controller('testPublishCtrl', function($scope) {
    $scope.data = {
        topic:"",
        data:""
    }

    $scope.init = function(){
        $scope.data = {
            topic:"",
            data:""
        }
        document.getElementById("overlay").style.display = "none";
    };

    $scope.test = function(){
        
        document.getElementById("overlay").style.display = "block";
        let httpCallback = function(response){
            $scope.$apply(function(){
                
                $scope.init();
            });
        };

        let data = {
            topic:$scope.data.topic,
            data:$scope.data.data
        }

        httpPostAsync("../../fms/maestro/api/testPublish", data, httpCallback);

    };


    $scope.init();
});

//-------------------------- View Subscriber --------------------------//
var viewSubscriberApp = angular.module('viewSubscriberApp', []);
viewSubscriberApp.controller('viewSubscriberCtrl', function($scope) {
    $scope.init = function(){
        document.getElementById("overlay").style.display = "block";
        let httpCallback = function(response){
            
            let res = [];
            let resObj = JSON.parse(response);
            console.log(resObj)
            resObj.forEach(function(app){
                if(app.app !== "resource")res.push(app);
            })
            $scope.$apply(function(){
                
                $scope.appServices = res;
                $scope.hasAppServices = Object.keys(res).length > 0;
                document.getElementById("overlay").style.display = "none";
            });
        };
        httpGetAsync("../../fms/maestro/api/getAllSubscribers", {}, httpCallback);
    };

    $scope.delete = function(app, svc, sub){
        document.getElementById("overlay").style.display = "block";
        let input = {
            "application": app,
            "service": svc,
            "subscriber": sub
        };
        let httpCallback = function(response){
            alert("Subscriber is deleted.");
            $scope.init();
        };
        console.log(input)
        httpPostAsync("../../fms/maestro/api/delSubscriber", input, httpCallback);
    }

    $scope.init();
});

//-------------------------- Subscriber editor --------------------------//
var subEditorApp = angular.module('subEditorApp', []);
subEditorApp.controller('subEditorCtrl', function($scope) {
    $scope.application = "";
    $scope.service = "";
    $scope.subscriber;

    $scope.init = function(){
        if($scope.subscriber){
            let input = {
                application: $scope.application,
                service: $scope.service,
                subscriber: $scope.subscriber
            };
            let httpCallback = function(response){
                $scope.editor = ace.edit("editor");
                let r = function(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
                r(function(){
                    $scope.editor.setTheme("ace/theme/monokai");
                    $scope.editor.session.setMode("ace/mode/javascript");
                    $scope.editor.setReadOnly(false);
                    $scope.editor.setValue(response, -1);
                    $scope.editor.on("input", function() {
                        isCodeAdded = !$scope.editor.session.getUndoManager().isClean();
                    });
                    
                });
            };
            httpPostAsync("../../fms/maestro/api/getSubscriptionContent", input, httpCallback);
        }else{
            $scope.editor = ace.edit("editor");
            let r = function(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
            r(function(){
                $scope.editor.setTheme("ace/theme/monokai");
                $scope.editor.session.setMode("ace/mode/javascript");
                $scope.editor.setReadOnly(false);
                $scope.editor.setValue('', -1);
                $scope.editor.on("input", function() {
                    isCodeAdded = !$scope.editor.session.getUndoManager().isClean();
                });
                
            });
        }
    };

    $scope.saveSubscriber = function(){
        var code = $scope.editor.getValue();
        let input = {
            application: $scope.application,
            service: $scope.service,
            subscriber: $scope.subscriber,
            content: code
        };

        let httpCallback = function(response){
            alert("Code updated!");
        };
        httpPostAsync("../../fms/maestro/api/saveSubscriber", input, httpCallback);
    };
});

//-------------------------- New Subscriber editor --------------------------//
var newSubEditorApp = angular.module('newSubEditorApp', []);
newSubEditorApp.controller('newSubEditorCtrl', function($scope) {
    $scope.data ={
        application: "",
        service : "",
        subscriber:""
    };
    $scope.editor;


    $scope.init = function(){
        $scope.editor = ace.edit("editor");
        let r = function(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
        r(function(){
            $scope.editor.setTheme("ace/theme/monokai");
            $scope.editor.session.setMode("ace/mode/javascript");
            $scope.editor.setReadOnly(false);
            $scope.editor.setValue('', -1);
            $scope.editor.on("input", function() {
                isCodeAdded = !$scope.editor.session.getUndoManager().isClean();
            });
            
        });
    };

    $scope.init();

    $scope.saveSubscriber = function(){
        var code = $scope.editor.getValue();
        let input = {
            application: $scope.data.application,
            service: $scope.data.service,
            subscriber: $scope.data.subscriber,
            content: code
        };

        let httpCallback = function(response){
            alert("Code saved!");
        };
        httpPostAsync("../../fms/maestro/api/saveSubscriber", input, httpCallback);
    };

});