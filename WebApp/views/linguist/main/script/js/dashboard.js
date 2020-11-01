var dashboard = angular.module('dashboardApp', []);
dashboard.controller('dashboardCtrl', function($scope) {
   $scope.state = true;
   $scope.started = true;

   $scope.restart = function(){
      let httpCallback = function(response){
         $scope.init();
     };
     httpGetAsync("../linguist/api/restartServerState", {}, httpCallback);
   }

   $scope.stopServer = function(){
      let httpCallback = function(response){
         $scope.init();
     };
     httpGetAsync("../linguist/api/stopServerState", {}, httpCallback);
   }

   $scope.init = function(){
      let httpCallback = function(response){
         let res = JSON.parse(response);
         console.log(res)
         $scope.$apply(function(){
            $scope.state = res.serverIsUpdated;
            $scope.started = res.serverStarted;
         });
     };
     httpGetAsync("../linguist/api/getServerState", {}, httpCallback);
   }

   $scope.init();
});
