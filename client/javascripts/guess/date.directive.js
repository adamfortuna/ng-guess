/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

(function() {
'use strict';

function GuessController(AuthService) {
  console.log('GuessController', this.user)
  if(!this.user.guessDate || (this.user.guessDate < new Date())) {
    this.user.guessDate = new Date();
    console.log('guess', this.user.guessDate);
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
