/**
 *    ____  __                          _ __           _     
 *    / __ \/ /___ ___  ___      _______(_) /____      (_)____
 *   / /_/ / / __ `/ / / / | /| / / ___/ / __/ _ \    / / ___/
 *  / ____/ / /_/ / /_/ /| |/ |/ / /  / / /_/  __/   / (__  ) 
 * /_/   /_/\__,_/\__, / |__/|__/_/  /_/\__/\___(_)_/ /____/  
 *               /____/                          /___/        
 *
 * 	Welcome to the Playwrite.js source code.
 * 	I hope you have an enjoyable stay.
 * 	
 * 	The way Playwrite works is that it parses each word and breaks it down to a type. It then puts these types together 
 *	to form code.
 *
 * 	e.g "Can you please, when the document loads, create a block about 10cm in width and height in the center of the page."
 * 	In this example, we can ignore the "Can you please", "the", "a", "about", "in", "and", "in the", "of the". This leaves
 * 	with "when document loads, create block 10cm width height center page"
 * 	Definitely more computer readable. Now we interpret these words to see what they _really_ mean.
 *	The keyword "when" signifies executing at a specific time i.e. an event. The event is the specified with "load"
 * 	(similiar to my other library, When.js). So this is the wrapper, all the functions after this will go into this event
 * 	(within the scope of the command/sentence) and be called when it is fired. This moves us onto the next word, "create".
 * 	Create on it's own isn't much use but alongside (and before!) the word block, we can deduce that the user wants a <div>/
 * 	<section> created in the page. We then have dimensions of "10cm" for width and height and a position "center"  in which 
 *	we can send along as parameters to the "create" function. create("block", "10x10", "center"). Of course this could be
 * 	watered down even but that's the overall concept. What I want this library, along with being a learning experience for me,
 * 	is to be is a bit like Processing. Instant visual feedback from simple language. I really don't think the simplicity of a
 * 	language syntax can go any further than that. And no, I don't expect it to be a learning tool. Moreover a tool for enticing
 * 	people to learn what's going on behind the scenes.
 *	
 * 	Example as to the way one command's scope is parsed.
 *	when loads -- Event
 *	└── create -- Function
 *	      ├── color -- Color
 *	      ├── dimensions -- Dimension
 *	      └── shape -- Shape
 *
 * 	
 * 	TODO: Add regex hooks for things like hex color testing
 * 	TODO: Add element keyword type (ELEMENT) and then search document and send element as params
 * 	TODO: Element keywords such as "banner" and "sidebar"
 * 	TODO: Add keyword "delete", e.g "Delete the banner"
 * 	TODO: Google Chrome addon for document manipulation
 * 	TODO: Add support for setting up scopes where new line/paragraph ends scope e.g. Do all of this when page loads. <paragraph of commands><newline> 
 *	TODO: Add direction type e.g. North, up, down, left
 *	TODO: Create a compiler
 *	TODO: Add browser support
 * 	TODO: 'expects' API where functions params are to 'expected' for efficient parsing
 *	TODO: Catch errors when calling added functions
 * 	
 */	

var Playwrite = PW = {
	types: {
		FUNCTION: 1,
		EVENT: 2,
		LOOP: 3,
		IF: 4,
		STRING: 5,
		COLOR: 6,
		SHAPE: 7,
		DIMENSION: 8,
		POSITION: 9,
		ELEMENT: 10,
		DIRECTION: 11
	},

	//Index for efficent testing and linking
	index: {},

	//Commands library. After some testing on efficiency,
	//I see no reason why not to store all in one variable
	//Chrome can easily handle a store of 10000 functions
	library: {
		1: {}, //Each number corresponds to it's type
		2: {}
	},

	//Expose types to the window for easier access
	//When adding groups
	exposeTypes: function(scope) {
		for(var type in PW.types) {
			scope[type] = PW.types[type];
		}
	},

	addKeyword: function(data) {
		//Get the type
		var type = data.type,
		    keywords = data.keywords || data.keyword || data.words || data.word; //Allow for other names

		console.log(keywords);
		//Check if the type exists
		if(!type) throw new TypeError("Please specify a type on your keyword(s): " + keywords.toLocaleString());
		//Check keywords
		if(!keywords || keywords.length < 1) throw new TypeError("You forgot to specify keywords in one addition. Sorry, can't tell you which."); //TODO: Tell them which
		//Check if any keywords exist
		keywords.forEach(function(word) { if(PW.index[word]) throw new Error("Sorry, the key word \"" + word + "\" already exists. Please choose another. http://www.google.ie/search?q=synonym+for+" + word); });

		//Add the keyword via the function and catch any errors
		//try {
			//Call the function, decided by the type
			if(PW.add[type]) PW.add[type].call(this, keywords, data);
			else throw new TypeError("Type not supported: " + type);
		//} catch(error) {
			//Do with error
		//	console.log(error);	
		//}	
		
	},

	add: {
		/**
		 * ADD: FUNCTION
		 * Parameters:
		 * 	keywords [array]	
		 * 	req [array] -- Requied parameters to be sent to the function. An array of types e.g. [STRING, ELEMENT]
		 * 	exec [function] -- Function to be executed when keyword is called. Parameters will be passed in the order they are given in the req
		 * 	opt [array][optional] -- Optional parameters to be passed to the function
		 */
		1: function(keywords, data) {
		     	var required = data.req,
		    	    optional = data.opt,
		    	    execute = data.exec;
			
			//Check if function and if the function passed exists
			if(!execute || typeof execute !== "function") throw new TypeError("Please define a function for your function on keyword(s): " + keywords.toLocaleString());
			
			//Now process the first keyword keyword and add to library
			PW.library[1][keywords[0]] = data;

			//Add the rest the index
			keywords.forEach(function(word) {
				//Add main word from the library as the link and the type
				PW.index[word] = [keywords[0], 1];
			});
		},

		/**
		 * ADD: EVENT
		 * NOTE: Events keywords do not need to specified in a colloquial manner. They will be loosely matched so that means no tiny event names.
		 * Parameters:
		 * 	keywords [Array]
		 *	bindTo [Object] -- The object to bind th event to e.g. document, window, getElementById("element")
		 *	reqElement [Boolean] -- If true, it will override the bindTo and bind the event to the passed element
		 *
		 */
		2: function(keywords, data) {
			var bindTo = data.bindTo,
			    reqElement = data.reqElement || false;

			if(!bindTo && !reqElement) throw new Error("Please specify somethine to bind to or have \"reqElement\" set to true, buddy.");
			
			//Add the main keyword			
			PW.library[2][keywords[0]] = {bindTo: bindTo, reqElement: reqElement};
			
			keywords.forEach(function(word) {
				//Add the rest to the index
				PW.index[word] = [keywords[0], 2];
			});
		}
	},

	getScript: function() {
		//Loop through each script tag and check for the "playwrite" within type
		Array.prototype.forEach.call(document.getElementsByTagName("script"), function(tag) {
			if((new RegExp("playwrite")).test(tag.getAttribute("type"))) PW.script = tag.innerHTML;
		});

		return this.script;
	},

	commandize: function() {
		//Extremely simple functions to convert the script into commands
		this.commands = this.script.split(".");
		return this.commands;
	},

	interpretCommand: function(command) {
		
	},

	Command: function(command) {
		//Check against the library if the keyword exists
		this.keywordExists = function(word) {
			return (PW.index[word]) ? word : false;
		};

		//Get the data on the keyword
		this.getKeywordData = function(word) {
			//Get the link data from the index
			var item = PW.index[word];
			return PW.library[item[1]][item[0]]; //PW.library[TYPE][WORD]
		};

		/**
		 * The command enviornment for executing within scope
		 * NOTE: ALWAYS MAKE A NEW INSTANCE
		 * 
		 * What I need to do here is create an object. This object is the foundation.
		 * When I want to introduce a callback, I create another object, and insert
		 * that into the foundation. If I want another callback, I insert that into 
		 * the object that is inserted into the foundation. See the concept of recursion 
		 * coming through? When the command is finish parsing, I'll go to the very 
		 * top level and work my way back, compiling into the previous until we get
		 * to the foundation. Then we return the compiled function for calling or
		 * binding to an event. We are working backwards here! This means the _last_
		 * function to be parsed i.e. the furtherest down the scope tree will be the
		 * foundation! 
		 *
		 * Originally, I was thinking of someway to insert a callback into the functions
		 * and was nearly resorting to Function.toString and using eval()! D:
		 * Went for a walk and came up with this brainwave. It's most probably done before
		 * but I can't search for my self-implemented internet ban. :'(
		 */
		this.Enclosure = function() {
			//Params object that will be sent
			this.command = [];
			this.params = [];
			this.length = 0;
			
			/**
			 * Example so I can wrap my head around this
			 * document.addEventListener("DOMContentLoaded", function() {
			 * 	setTimeout(function() {
			 * 		create("block");
			 * 	}, 500);
			 * });
			 *
			 * In this example, the foundation is "addEventListener"
			 * Level one "setTimeout"
			 * Level two "create"
			 *
			 * So functions returned should look like this,
			 * (function(callback) {
			 * 	addEventListener("DOMContentLoaded", callback);
			 * })( function(callback) {
			 * 	setTimeout(callback);
			 * } )( function() { create("block"); } ));
			 *
			 * I've hit a road block. Each function I send is being evaluated on the spot (as Javascript should do)
			 * so I'm finding it hard to get find a solution to return the _function_, and not any evaluated function
			 * i.e. a value. I may have to resort to converting them to strings, but hopefully this fix will only be
			 * temporary. People just don't seem to like eval();
			 * 
			 * Eval will not even be a temporary fix. Things like addEventListener overrides any parameters given to it
			 * rendering any further function useless. What I was originally planning to do was bunch all the callbacks
			 * into an array, and send this array as a parameter to each function. I would then implement some sort 
			 * of levelling system where the function would know which callback to take. However, as I said earlier,
			 * addEventListener will override any given callbacks therefore rendering any functions afterwards useless.
			 * Emphasis on temporary because I know the above would be disgusting.
			 *
			 * Why is this so damn hard to do?
			 * Here is the problem:
			 *   f(f(f(f)))
			 * 	  ^^^
			 * The above is a skinned down example. What I want to do is pass each function as a parameter but there are
			 * evaluation as I compile (as shown beautifully above). Sure the top level function  is being sent as a 
			 * parameter is being sent but the rest are jsut values. I need to find someway to push the functions as
			 * parameters to their parent function.
			 */

			//Take the data and compile the command and return it
			this.compile = function() {
				var that = this;
				this.command.forEach(function(clbk, i) {
					
				};
			};

			//Push to the param object
			this.addParams = function(params) {
				this.params = this.params.concat(params);
			};

			this.wrap = function(wrap) {
				//var temp = [wrap];
				//this.command = temp.concat(this.command);
				this.command.push(wrap);
				return this.command;
			};

			/**
			 * Returns the length of the current command enviornment
			 *
			this.getLength = function() {
				var i = 0;
				function check(command) {
					if(command === undefined) return 0;
					//console.log("STARTING", i);
					//Recursive recur throught this recursive recurring recurtion
					//if the command.func is a function and not an object, it's the end
					if(typeof command.func === "function") {
						//console.log("TYPEOF FUNCTION TRUE", i);
						//WE HAVE REACHED THE END, SIR	
						return;
						//For some ridiculously odd reason, I can't seem to get
						//any value of something it it's returned here. Really weird
						//Can some explain? I left the console.logs in if anyones interested
					} else {
						//console.log("NOPE NOT A FUNCTION", i);
						//Increment the level
						i++;
						//And call it again
					 	check(command.func);
					}
				}

				//And begin and also end
				check(this.command); //Weird bug, didn't want to have to do this
				return i + 2; //Because the first level has two levels
			}; */
		};

		//Split the words up into an array for processing
		var words = command.split(" "), that = this;

		//Loop through each word
		words.forEach(function(word) {
			//Interpret each word
			if(that.keywordExists(word)) {
				var data = that.getKeywordData(word);

				
			}
		});	
	},

	init: function() {
		PW.getScript();

		this.commandize(this.script).forEach(function(command) {
			PW.Command(command);
		});
	},

	onLoad: function() {
		PW.exposeTypes(window); //Expose the types to the window
	}
};

PW.onLoad(); //Initlize some stuff

PW.addKeyword({
	type: FUNCTION,
	keywords: ["create"],
	req: [SHAPE], //Required parameters
	opt: [DIMENSION, COLOR], //Optional Parameters
	exec: function(shape, dimension, color) {
		console.log("Hello!");
	}
});

PW.addKeyword({
	type: FUNCTION,
	keywords: ["write"],
	req: [STRING, ELEMENT],
	exec: function(string, element) {
		element.innerText = string;
	}
});

PW.addKeyword({
	type: FUNCTION,
	keywords: ["add"],
	opt: [ELEMENT, STRING],
	exec: function(element, string) {
		if(!string) throw new Error("Add what?");
	}
});

PW.addKeyword({
	type: EVENT,
	keyword: ["load"],
	bindTo: document
});

PW.addKeyword({
	type: EVENT,
	keywords: ["click"],
	reqElement: true
});

/*
PW.addKeyword({
	type: ELEMENT,
	keywords: ["banner", "header", "top bit"]
});*/
