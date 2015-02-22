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

.controller('PlaylistsCtrl', function($scope, $ionicModal) {
  $scope.playlists = [
    { title: 'Approve Leave For xxx', id: 1, type: 'leave' },
    { title: 'Approve Expense', id: 2, type: 'exp'},
    { title: 'Create Form xxx', id: 3, type: 'form' },
    { title: 'Create Form xxx', id: 4, type: 'form' },
    { title: 'Create Form xxx', id: 5, type: 'form' },
    { title: 'Create Form xxx', id: 6, type: 'form' }
  ];

  $scope.formData = {};

    $ionicModal.fromTemplateUrl('templates/leaveForm.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });

      // Triggered in the login modal to close it
      $scope.closeForm = function() {
        $scope.modal.hide();
      };

      // Open the login modal
      $scope.showForm = function() {
        $scope.modal.show();
      };

      // Perform the login action when the user submits the login form
      $scope.doSubmit = function() {
        console.log('Doing submit', $scope.formData);
      };
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
                $state.go('app.activity');
    }
    })
.controller('ApplyLeaveCtrl', function($scope, $stateParams) {

})
.controller('PlaylistCtrl', function($scope, $stateParams) {

});
