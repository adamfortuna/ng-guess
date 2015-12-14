/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

// ng-model='ctrl.user.guessDate' ng-change='ctrl.guessChanged()'
(function() {
'use strict';

function GuessController(AuthService) {
  this.guessChanged = function(e) {
    var date;
    e.preventDefault();
    if($(this).val()) {
      date = new Date($(this).val()).getTime();
    } else {
      date = null;
    }

    AuthService.user.ref.child('guessDate').set(date);
  };
}

function DateDirective() {
  return {
    replace: true,
    restrict: 'E',
    scope: { user: '=' },
    templateUrl: 'guess/date.html',
    controller: GuessController,
    controllerAs: 'ctrl',
    bindToController: true,
    link: function(scope, el, attrs, ctrl) {
      console.log('pickadate');
      var input = $(el[0]).find('input');
      input.pickadate({
        hiddenName: true,
        min: new Date(),
        format: 'mmmm d, yyyy'
      });

      input.on('change', ctrl.guessChanged);
    }
  };
}

angular.module(window.appName)
.directive('gsDate', DateDirective);


}());
