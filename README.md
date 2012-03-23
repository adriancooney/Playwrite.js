#Playwrite.js
Writing simple english to manipulate the contents of your browser window. Not supposed to be practical, just a learning experience.

##Planned API
###Adding keywords
Adding a keyword or hook.

	PW.addKeyword({
		type: FUNCTION,
		keywords: ["create"],
		req: [SHAPE], //Required parameter to pass to exec
		opt: [DIMENSION, COLOR], //Optional parameters
		exec: function(shape, dimension, color) {
			//document.createElement.. etc.
		}
	});
