// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['angular-datepicker','ionic', 'starter.controllers','ng'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
/*.provider('soapStarter',[
  function() {
        var injector = angular.injector(['myModule']);
        var soap = injector.get('myModule.soap-interceptor');
        this.$get = function() {
                  return soap;
              };
        }
])*/
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('signin', {
        url: '/sign-in',
        templateUrl: 'templates/sign-in.html',
        controller: 'SignInCtrl'
      })
  /*.state('forgotpassword', {
        url: '/forgot-password',
        templateUrl: 'templates/forgot-password.html'
      })*/
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.payroll', {
    url: "/payroll",
    views: {
      'menuContent': {
        templateUrl: "templates/payroll.html"
      }
    }
  })

  .state('app.selfservice', {
    url: "/selfservice",
    views: {
      'menuContent': {
        templateUrl: "templates/selfservice.html"
      }
    }
  })
    .state('app.activity', {
      url: "/Activity",
      views: {
        'menuContent': {
          templateUrl: "templates/activity.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.applyleave', {
          url: "/selfservice/applyleave",
          views: {
            'menuContent': {
              templateUrl: "templates/leaveForm.html",
              controller: 'ApplyLeaveCtrl'
            }
          }
        })

  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/sign-in');
});
