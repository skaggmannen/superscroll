function getBrowserScrollSize(){

    var css = {
        "border":  "none",
        "height":  "200px",
        "margin":  "0",
        "padding": "0",
        "width":   "200px"
    };

    var inner = $("<div>").css($.extend({}, css));
    var outer = $("<div>").css($.extend({
        "left":       "-1000px",
        "overflow":   "scroll",
        "position":   "absolute",
        "top":        "-1000px"
    }, css)).append(inner).appendTo("body")
    .scrollLeft(1000)
    .scrollTop(1000);

    var scrollSize = {
        "height": (outer.offset().top - inner.offset().top) || 0,
        "width": (outer.offset().left - inner.offset().left) || 0
    };

    outer.remove();
    return scrollSize;
};


var module = angular.module("SuperScroll", []);

module.directive("superScroll", function() {
	function link(scope, element, attrs) {

		scope.scrollbarWidth = getBrowserScrollSize().width;

		element.css("position", "relative");

		scope.getChildStyle = function () {
			return scope.childStyle;
		};

		var template = angular.element("#ng-scroll-child-template");
		var container = angular.element("#ng-scroll-container");

		template.hide();

		function updateGrid() {
			var cols = Math.floor((scope.width - scope.scrollbarWidth - 2) / scope.childWidth);
			var rows = Math.ceil(scope.height / scope.childHeight);

			if (cols == 0) {
				cols = 1;
			}

			if (rows != scope.rows) {
				scope.rows = rows;
			}
			if (cols != scope.cols) {
				scope.cols = cols;
			}
		};

		function updateLayout() {
			if (scope.childWidth == 0 || scope.childHeight == 0) {
				return;
			}

			updateGrid();

			var totalHeight = Math.ceil(scope.count / scope.cols) * scope.childHeight;

			if (totalHeight != container.height()) {
				container.height(totalHeight);
			}

			scope.cursor = Math.floor(scope.top / (scope.rows * scope.childHeight));

			if (scope.cursor > scope.nextBlock.myCursor ||
				scope.cursor < scope.prevBlock.myCursor) {
				scope.prevBlock.myCursor = scope.cursor - 1;
				scope.currBlock.myCursor = scope.cursor;
				scope.nextBlock.myCursor = scope.cursor + 1;
			}
			else if (scope.cursor > scope.currBlock.myCursor) {
				var tmp = scope.prevBlock;
				scope.prevBlock = scope.currBlock;
				scope.currBlock = scope.nextBlock;
				scope.nextBlock = tmp;
				scope.prevBlock.myCursor = scope.cursor + 1;
			}
			else if (scope.cursor < scope.currBlock.myCursor) {
				var tmp = scope.nextBlock;
				scope.nextBlock = scope.currBlock;
				scope.currBlock = scope.prevBlock;
				scope.prevBlock = tmp;
				scope.prevBlock.myCursor = scope.cursor - 1;
			}
		}

		scope.$watch(function () {
			return {
				width: element.width(),
				height: element.height(),
			};
		}, function (value) {
			scope.width = value.width;
			scope.height = value.height;

			var child = scope.selectedChild;

			updateGrid();

			var newChildRow = Math.floor(child / scope.cols);

			scroll.top = newChildRow * scope.childHeight;

			updateLayout();

			element.scrollTop(scroll.top);
		}, true);

		scope.$watch(function () {
			return {
				width: template.outerWidth(true),
				height: template.outerHeight(true),
			};
		}, function (value, old) {
			scope.childWidth = value.width;
			scope.childHeight = value.height;

			var child = scope.selectedChild;

			updateGrid();

			var newChildRow = Math.floor(child / scope.cols);

			scroll.top = newChildRow * scope.childHeight;

			updateLayout();

			element.scrollTop(scroll.top);
		}, true);

		scope.$watch(attrs.resource, function(value) {
			scope.count = value.count();
			updateLayout();
		});

		scope.cols = 10;
		scope.rows = 0;

		angular.element(window).resize(function () {
			scope.$apply();
		});

		scope.getTemplateStyle = function () {
			var style = Object();
			jQuery.extend(style, scope.childStyle);
			style.position = "absolute";
			style.left = "-10000px";
			return style;
		};

		function Block(scope, cursor) {
			var self = this;
			
			self.myCursor = cursor;

			self.getImages = function() {
				var rows = scope.rows;
				var cols = scope.cols;

				if (self.myCursor < 0)
				{
					return [];
				}

				var count = rows * cols;

				return scope.resource.get(self.myCursor * count, count);
			};

			self.getStyle = function () {
				return {
					position: 'absolute',
					top: self.myCursor * scope.rows * scope.childHeight + 'px',
					width: "100%",
					height: "auto",
				};
			};
		}

		scope.blocks = [
			new Block(scope, -1),
			new Block(scope, 0),
			new Block(scope, 1),
		];

		scope.prevBlock = scope.blocks[0];
		scope.currBlock = scope.blocks[1];
		scope.nextBlock = scope.blocks[2];

		element.bind('scroll', function($event) {
			scope.top = element[0].scrollTop;

			updateLayout();

			var currentRow = scope.top / scope.childHeight;

			if (currentRow != scope.currentRow) {
				scope.selectedChild = Math.floor(currentRow) * scope.cols;	
			}

			scope.$apply();
		});
	}

	return {
		link: link,
		restrict: 'AE',
		template: '	<div id="ng-scroll-container" style="position: relative; width: 100%; height: 100%"> \
						<div id="ng-scroll-child-template" ng-style="getTemplateStyle()" class="{{ childClass }}"></div> \
						<div ng-repeat="block in blocks" id="image-block-{{ $index }}" ng-style="block.getStyle()" > \
							<div ng-repeat="image in block.getImages()" ng-style="getChildStyle()" class="{{ childClass }}">{{ image }}</div> \
						</div> \
					</div>',
		scope: {
			childStyle: "=",
			childClass: "=",
			resource: "=",
		}
	}
});