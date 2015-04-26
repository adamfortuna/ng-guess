(function() {
'use strict';

angular.module(window.appName)
.controller('ItemShowController', ItemShowController);

function ItemShowController() {
  this.item = 'Testing this out.';
}

}());
