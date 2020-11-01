//------------------- Resource API New Controller -------------------//
var clientTest = angular.module('clientTestApp', []);
clientTest.controller('clientTestCtrl', function($scope) {

   let reinit = function(){
      $scope.data = {}
      $scope.serviceGroups = [];
      $scope.services = [];
      $scope.isViewing = false;
      $scope.selectedServiceGrp = "Select Service Group";
      $scope.selectedService = "Select Service";
      $scope.selectedServiceFunctions = {};
      $scope.isSelected = false;
      $scope.requestBody = "";
      $scope.reqResponse = "";
      $scope.selectedServiceName = "";
   }
   reinit();

   $scope.test = function(){
      console.log($scope.selectedServiceGrp);
      console.log($scope.selectedService);
      console.log($scope.selectedServiceName);
      console.log($scope.requestBody);
      console.log($scope.selectedServiceFunctions);
      let inputData = {
         serviceName: $scope.selectedServiceName,
         functionName: $scope.selectedService,
         inputData: $scope.requestBody,
         functionType: $scope.selectedServiceFunctions[$scope.selectedService].type
      };

      let httpCallback = function(response){
         let res = JSON.parse(response);
         
         $scope.$apply(function(){
            $scope.reqResponse = JSON.stringify(res.data)
         });
     };
     httpPostAsync("../linguist/api/testClient", inputData, httpCallback);
   };

   $scope.selectService = function(service){
      $scope.selectedService = service;
      $scope.isSelected = true;
   };

   $scope.selectServiceGrp = function(service){
      $scope.selectedServiceGrp = service;
      $scope.isViewing = true;

      Object.keys($scope.data).forEach( svcKey => {

         if(svcKey === service){
            let functions = $scope.data[svcKey].serviceFunctions;
            // console.log(functions)
            $scope.selectedServiceFunctions = functions;
            $scope.selectedServiceName = $scope.data[svcKey].serviceName
            Object.keys(functions).forEach(funcKey => {
               $scope.services.push(funcKey)
            });
         }
      });
   };

   $scope.init = function(){
      let httpCallback = function(response){
          let res = JSON.parse(response);
          console.log(res)
          
          $scope.$apply(function(){
            reinit();
            $scope.data = res;

            Object.keys(res).forEach( svcKey => {
               $scope.serviceGroups.push(svcKey)
            });
          });
      };
      httpGetAsync("../linguist/api/getClient", {}, httpCallback);
  };
 
  $scope.init();
});
