/*eslint no-console: 0*/
/*eslint no-debugger: 0*/

// ng-model='ctrl.user.guessDate' ng-change='ctrl.guessChanged()'
(function() {
'use strict';

function GuessController(AuthService) {
  var self = this;
  this.guessChanged = function(e) {
    var date;
    e.preventDefault();
    if($(this).val()) {
      date = new Date($(this).val()).getTime();
    } else {
      date = null;
    }
    self.user.guessDate = date;
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
      var input = $(el[0]).find('input');
      var guessAsDate = new Date(ctrl.user.guessDate);
      input.pickadate({
        hiddenName: true,
        min: new Date()
      });

      if(ctrl.user.guessDate) {
        var picker = input.pickadate('picker');
        picker.set('select', guessAsDate);
      }

      input.on('change', ctrl.guessChanged);
    }
  };
}

angular.module(window.appName)
.directive('gsDate', DateDirective);


}());
