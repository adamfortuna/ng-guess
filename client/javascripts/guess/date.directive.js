/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function GuessController(AuthService) {
  if(!this.user.guessDate || (this.user.guessDate < new Date())) {
    this.user.guessDate = new Date();
  }

  this.guessChanged = function() {
    var guess = this.user.guessDate ? this.user.guessDate.getTime() : null;
    AuthService.user.ref.child('guessDate').set(guess);
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
    bindToController: true
  };
}

angular.module(window.appName)
.directive('gsDate', DateDirective);


}());
