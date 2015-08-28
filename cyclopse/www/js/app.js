'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
  .module('embeditor', [
    'ionic',
    'ngAnimate',
    'ngMaterial',
    'ngMdIcons',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    
    'embeditor.components.embed',
    'embeditor.components.embedcodedialog',
    'embeditor.components.player',
    'embeditor.components.rangefinder',
    'embeditor.components.searchbox',
    'embeditor.components.searchsidebar',
    'embeditor.components.toolbar',
    'embeditor.services.codeGenerator',
    'embeditor.services.cyclopseDataAPI',
    'embeditor.services.layoutManager',
    'embeditor.services.youTubeDataAPI',
    'embeditor.services.youtubePlayerAPI'
  ])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        console.log('cordova plugins running');
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(false);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }
    });
  })

  .config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('amber', {'hue-1': '200'})
    .accentPalette('orange', {'hue-1': '500'})
    .backgroundPalette('grey')
  })
  
  .config(function ($locationProvider, $routeProvider) {
    
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'AppCtrl',
        controllerAs: 'app'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        //controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
