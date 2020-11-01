//------------------- Resource API New Controller -------------------//
var clientsUpload = angular.module('clientsUploadApp', []);
clientsUpload.controller('clientsUploadCtrl', function($scope) {

    $scope.uploadFile = function () {
        // console.log($scope.clientDefFile)
        var file = $scope.clientDefFile;
        var formData = new FormData();
        formData.append("inputFile", file);
        let httpCallback = function(response){
            // $scope.$apply(function(){
            //     $scope.init();
            // });
            alert("Uploaded. Restart of plugin is required.")
        };
        httpBinPostAsync("../linguist/upload/uploadClientDefinition", formData, httpCallback);
    };
});

clientsUpload.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function() {
             scope.$apply(function() {
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }]);