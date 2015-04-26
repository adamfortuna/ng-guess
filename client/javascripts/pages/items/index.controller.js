(function() {
'use strict';

function ItemIndexController() {
  this.items = [
    'This data is set in:',
    'client/javascripts/pages/items/index.controller.js',
    'You can change it there',
    'As long as you recompile the JS',
    'which happens automatically',
    'if you have `gulp` running.'
  ];
}

angular.module(window.appName)
.controller('ItemIndexController', ItemIndexController);

}());
