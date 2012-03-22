##Adding keywords
Keywords must be added via the `SW.addKeyword` function. Example:
	PW.addKeyword({
		type: FUNCTION,
		keywords: ["create"],
		req: [SHAPE], //Required parameters
		opt: [DIMENSION, COLOR], //Optional Parameters
		exec: function(shape, dimension, color) {

		}
	});
