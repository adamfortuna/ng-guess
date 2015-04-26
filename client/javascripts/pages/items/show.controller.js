(function() {
'use strict';

function ItemShowController() {
  this.item = 'Testing this out.';
}

angular.module(window.appName)
.controller('ItemShowController', ItemShowController);

}());
