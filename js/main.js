

var myApp = angular.module("TestApp", ["SuperScroll"]);
myApp.controller("TestView", function($scope) {
	$scope.test = "Test";
	$scope.size = 120;
	$scope.resource = {
		// A resource like object
		get: function (offset, count) {
			var images = [];
			for (var i = 0; i < count; i++) {
				if (offset + i >= 10000) {
					break;
				}
				images.push("image(" + (offset + i) + ")");
			}
			return images;
		},
		count: function () {
			return 10000;
		},
	};
});