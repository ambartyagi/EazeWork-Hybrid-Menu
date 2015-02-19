angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.date1 = new Date();
  $scope.date2 = new Date();
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
.controller('SignInCtrl', function($scope, $state,$http) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    //var soap = soapStarter;
    /*var result = $http.get('http://www.eazework.net/test/webservices/loginservice.asmx?wsdl',*/
    /*       { isJSON: true }).then(function(result){*/
    /*                            soap.setWSDL('http://www.eazework.net/test/webservices/loginservice.asmx', result.data);*/
    /*                            }).then($http.get('http://www.eazework.net/test/webservices/loginservice.asmx?op=ValidateUser')).then(function(result){*/
    /*                                             $state.go('app.playlists');*/
    /*                                        });*/

    /*$http.post('http://localhost:9000/eazework/login',{url:user.url,userName:user.username,password:user.password}).
    success(function(data,status,headers,config){
      $state.go('app.playlists');
    }).error(function(data,status,headers,config){
                   console.log('Error Returned', data);
                 });*/
                $state.go('app.addNew');
    }
    })
.controller('PlaylistCtrl', function($scope, $stateParams) {
});
