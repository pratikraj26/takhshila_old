app
.directive('scroll', function($window) {
	return {
		link: function(scope, element, attrs) {
			// var windowEl = angular.element($window);
			// var handler = function() {
			// 	scope.scroll = this.pageYOffset;
			// 	console.log(scope.scroll);
			// }
			// windowEl.on('scroll', scope.$apply.bind(scope, handler));
			// handler();
			scope.scroll = this.pageYOffset;
			angular.element($window).bind("scroll", function() {
				scope.scroll = this.pageYOffset;
				scope.$apply();
			});
		}
	};
})
.directive('equalizeSize', function($window) {
	return {
		link: function(scope, element, attrs) {
			console.log("This is an equalize height directive");
			var windowHeight = $(window).height();
			var windowWidth = $(window).width();

			if(windowWidth > windowHeight){
				element.css('max-height', (windowHeight) + 'px');
				element.css('max-width', (windowHeight) + 'px');
			}else{
				element.css('max-height', (windowWidth) + 'px');
				element.css('max-width', (windowWidth) + 'px');
			}
			// var windowEl = angular.element($window);
			// var handler = function() {
			// 	scope.scroll = this.pageYOffset;
			// 	console.log(scope.scroll);
			// }
			// windowEl.on('scroll', scope.$apply.bind(scope, handler));
			// handler();
			// scope.scroll = this.pageYOffset;
			// angular.element($window).bind("scroll", function() {
			// 	scope.scroll = this.pageYOffset;
			// 	scope.$apply();
			// });
		}
	};
})
.directive('lxRipple', ['$timeout', function($timeout){
	var offset = function(element){

	}
	return {
		restrict: 'A',
		link: function(scope, element, attrs)
		{
			var timeout;

			element
			.css({
				position: 'relative',
				overflow: 'hidden'
			})
			.bind('mousedown', function(e)
			{
				var ripple;

				if (element.find('.ripple').length === 0)
				{
					ripple = angular.element('<span/>', {
						class: 'ripple'
					});

					if (attrs.lxRipple)
					{
						ripple.addClass('bgc-' + attrs.lxRipple);
					}

					element.prepend(ripple);
				}
				else
				{
					ripple = element.find('.ripple');
				}

				ripple.removeClass('ripple--is-animated');

				if (!ripple.height() && !ripple.width())
				{
					var diameter = Math.max(element.outerWidth(), element.outerHeight());

					ripple.css({ height: diameter, width: diameter });
				}

				var x = e.pageX - element.offset().left - ripple.width() / 2;
				var y = e.pageY - element.offset().top - ripple.height() / 2;

				ripple.css({ top: y+'px', left: x+'px' }).addClass('ripple--is-animated');

				timeout = $timeout(function()
				{
					ripple.removeClass('ripple--is-animated');
				}, 651);
			});

			scope.$on('$destroy', function()
			{
				$timeout.cancel(timeout);
			});
		}
	};
}])

.directive('lxTextField', ['$timeout', function($timeout){
	return {
		restrict: 'E',
		scope: {
			label: '@',
			disabled: '&',
			error: '&',
			valid: '&',
			fixedLabel: '&',
			icon: '@',
			theme: '@'
		},
		templateUrl: '../templates/../templates/text-field.html',
		replace: true,
		transclude: true,
		link: function(scope, element, attrs, ctrl, transclude)
		{
			if (angular.isUndefined(scope.theme))
			{
				scope.theme = 'light';
			}

			var modelController,
			$field;

			scope.data = {
				focused: false,
				model: undefined
			};

			function focusUpdate()
			{
				scope.data.focused = true;
				scope.$apply();
			}

			function blurUpdate()
			{
				scope.data.focused = false;
				scope.$apply();
			}

			function modelUpdate()
			{
				scope.data.model = modelController.$modelValue || $field.val();
			}

			function valueUpdate()
			{
				modelUpdate();
				scope.$apply();
			}

			function updateTextareaHeight()
			{
				$timeout(function()
				{
					var tmpTextArea = angular.element('<textarea class="text-field__input" style="width: ' + $field.width() + 'px;">' + $field.val() + '</textarea>');
					tmpTextArea.appendTo('body');

					$field.css({ height: tmpTextArea[0].scrollHeight + 'px' });

					tmpTextArea.remove();
				});
			}

			transclude(function()
			{
				$field = element.find('textarea');

				if ($field[0])
				{
					updateTextareaHeight();

					$field.on('cut paste drop keydown', function()
					{
						updateTextareaHeight();
					});
				}
				else
				{
					$field = element.find('input');
				}

				$field.addClass('text-field__input');
				$field.on('focus', focusUpdate);
				$field.on('blur', blurUpdate);
				$field.on('propertychange change click keyup input paste', valueUpdate);

				modelController = $field.data('$ngModelController');

				scope.$watch(function()
				{
					return modelController.$modelValue;
				}, modelUpdate);
			});
		}
	};
}])
