/***
|Name|DOMTweaksPlugin|
|Source|http://www.TiddlyTools.com/#DOMTweaksPlugin|
|Version|1.0.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|set DOM element IDs, add/remove classes and/or reposition rendered elements|
This plugin defines several useful macro-based functions for performing direct manipulation of DOM elements, including setting element ID's, moving elements, and adding/removing classnames from elements.
!!!!!Usage
<<<
{{{<<DOM setID id force>>}}}
>assign an ID to the DOM element in which this macro is being rendered.  If the current DOM element already has an ID, the new ID will //not// replace  the current ID, unless you include the additional "''force''" keyword parameter.  (note: requiring this extra parameter helps minimize any problems that may arise if an existing, system-assigned ID is unintentionally re-assigned due to mis-placement of the macro... e.g., renaming 'mainMenu' or 'header' is NOT a good idea, and is prevented unless "force" is used)
{{{<<DOM move id>>}}}
>Move any uniquely identified DOM element to the current rendering location.  Allows dynamic relocation of standard TW elements such as 'sidebar', 'mainMenu', as well as any other DOM elements that have an ID assigned to them (via the {{{<<DOM setID id>>}}} macro).  You can also use this macro to move [[NestedSlidersPlugin]]-generated slider/floating panels that have had an ID assigned to them (using either the {{{<<DOM setID id>>}}} macro or the NestedSlidersPlugin {{{#panelID:}}} syntax).
{{{<<DOM addclass classname>>}}}
>add a classname to the DOM element in which this macro is being rendered
{{{<<DOM removeClass classname>>}}}
>remove a classname from the DOM element in which this macro is being rendered
<<<
!!!!!Revisions
<<<
2007.07.20 [1.0.1] in setID handler, check for existing ID so multiple elements don't get the same ID.  Also added basic parameter checks.
2007.07.20 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.DOMTweaksPlugin= {major: 1, minor: 0, revision: 1, date: new Date(2007,7,20)};
config.macros.DOM= {
	handler: function(place,macroName,params) {
		if (!params.length) return;
		switch (params[0].toUpperCase()) {
			case "SETID":
				if (!params[1]) return;
				if (place.id==params[1]) break; // already has this ID... do nothing!
				if (document.getElementById(params[1])) // if ID is already used by something else
					displayMessage("DOMTweaks: ID already in use: '"+params[1]+"'");
				else if (!place.id.length || params[2]&&params[2].toUpperCase=="FORCE")
					place.id=params[1]; // set (or clear) the ID
				else
					displayMessage("DOMTweaks: to re-assign existing ID for '"+place.id+"', use the 'Force' option... Luke. :-)" );
				break;
			case "MOVE":
				if (!params[1]) return;
				var e=document.getElementById(params[1]); if (e) place.insertBefore(e,null);
				break;
			case "ADDCLASS":
				if (!params[1]) return;
				if (addClass instanceof Function) addClass(place,params[1]);
				break;
			case "REMOVECLASS":
				if (!params[1]) return;
				if (removeClass instanceof Function) removeClass(place,params[1]);
				break;
		}
	}
}
//}}}