var sr_debug, sr_debugII;
/**
 * @ngdoc function
 * @name embeditor.component:searchbox
 * @description
 * 
 */

(function () {
   'use strict';

   angular.module('embeditor.components.searchbox', ['embeditor.services.youTubeDataAPI'])

      .directive('embeditorSearchbox', searchbox);
      
   // Element
   function searchbox(){
      return {
         restrict: 'E',  
         controller: searchboxCtrl,
         link: searchboxEventHandlers,
         templateUrl:  'templates/searchbox.html'
      };
   };


   // Controller
   function searchboxCtrl($scope, $resource, $timeout, youTubeDataAPI) {

      var self = this;

      // Google Suggestion API 
      var googleSuggestionAPI = $resource('https://suggestqueries.google.com/complete/search', 
         { callback:'JSON_CALLBACK'},
         { get: {method: 'JSONP', isArray: true}}
      );

      //Public
      self.autoCompleteOn = true;
      self.synch = false;
      self.youTube = youTubeDataAPI;
      self.timeout = $timeout;
      self.phone = ( navigator.userAgent.match(/(iPod|iPhone)/g) ? true : false );
      
      // Autocomplete on/of toggles necessary to stop md-autocomplete from
      // re-running search when a selection is made and the searchText updates/changes
      self.textChange = function(){
         self.autoCompleteOn = true;
      };

      // Autocomplete dropdown selection & Search button handler
      self.submit = function(searchTerm){

         console.log('entering submit');

         self.autoCompleteOn = false;

         // Submit will get a bogus selection call when the searchboxes' models 
         // get synched on a query event. So, ignore and reset the flag
         if (self.synch){
            self.synch = false;

         // Otherwise this is for real: run query
         } else if (searchTerm && searchTerm.length){
            console.log('entering query');
            self.youTube.query(searchTerm);
         }
      };

      // Calls google to get array of youtube specific autocomplete suggestions 
      self.getSuggestions = function(val){

         // Autocomplete toggled on when query text changes
         if (self.autoCompleteOn){

            var results = [];
            var params = {'hl':'en', 'ds':'yt', 'q':val, 'client':'youtube' };
            
            return googleSuggestionAPI.get(params).$promise.then(function(data) {
         
               // Extract suggestion strings from response, excluding current query
               angular.forEach(data[1], function(item){ 
                  if (item[0] !== val){
                     results.push({value: item[0]});
                  }
               });

               // Trim results, return.
               if (results.length > 5){ 
                  results.length = 5; 
               }
               return results;
            });

         // Return empty array if autocomplete is toggled off on selection
         } else {
            return [];
         }
      };
   };
   searchboxCtrl.$inject = ['$scope', '$resource', '$timeout', 'youTubeDataAPI'];

   // Link (Event handlers)
   function searchboxEventHandlers(scope, elem, attrs, searchboxCtrl){

      scope.ctrl = searchboxCtrl;

      var mdElem = elem.find('md-autocomplete');
      var mdInput = mdElem.find('input');
      var mdScope = mdElem.isolateScope();
      var mdCtrl = mdScope.$mdAutocompleteCtrl;
      var preventDefault = true;

      // Keeps searchText and selectedItem synched across instances of search box
      // so that the last typed search is identical in toolbar and sidebar
      // On iphone this causes problems because it focusses the search box
      scope.$on('youTubeDataAPI:query', function(event, msg){

         if (!scope.ctrl.phone){
 
            scope.ctrl.synch = true;
            mdScope.searchText = msg;
            mdScope.selectedItem = {value: msg}

            // Might get rid of weird sticking open when sidenav closes . . .
            mdCtrl.keydown({keyCode: 27}); // Escape closes dropdown.

         // Hack that zeroes out inputs on phone due to weird IPhone input bug.  
         // Don't understand why this works but nothing else does. Repo issue #190.  
         } else {
            mdScope.searchText = '';
            mdScope.selectedItem = {value: ''};
            mdInput.blur();
         }
            
      });

      
      // Captures carriage return in input box and hacks into mdAutoComplete to execute
      // selection, close dropdown w/escape event. Does nothing if searchText is empty string 
      mdElem.bind('keypress', function(event){
      
         if (event.which === 13 && mdScope.searchText && mdScope.searchText.length ){
            mdCtrl.keydown({keyCode: 27}); // Escape closes dropdown.
            mdCtrl.selectedItem = {value: mdScope.searchText}; // autocomplete watches this obj.
                     
         }
      });

      // Captures blur event (triggered by 'Done') on iPhone. Requires that submit be called
      // explicitly - the watcher is not reacting to the value change per above.

      // Hack to skip some weird Android blur bug.
      mdInput.bind('focus', function(event){
         console.log('focussing');
         preventDefault = true;

         //cordova.plugins.Keyboard.show();

      })

      mdInput.bind('touchcancel', function(event){
         console.log('hearing touchcancel');
         sr_debug = event;
      })

      mdInput.bind('touchstart', function(event){
         console.log('hearing touchstart');
         sr_debug = event;
      })

      mdInput.bind('touchend', function(event){
         console.log('hearing touchend');
         sr_debug = event;
      })

      mdInput.bind('blur', function(event){
         
         console.log('fuck you');
         event.preventDefault();
         mdScope.$apply();

         
         if ( scope.ctrl.phone && mdScope.searchText && mdScope.searchText.length ){
            console.log('running escape code');
            mdCtrl.keydown({keyCode: 27}); // Escape closes dropdown.
            scope.ctrl.submit(mdScope.searchText);
            scope.$apply();
         }
      })
   }
   

})();
