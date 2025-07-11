/***
!Metadata:
|''Name:''|ArchivedTimeline|
|''Description:''|Timeline archived monthly.|
|''Version:''|0.7.1|
|''Date:''|Jan 25, 2009|
|''Source:''|http://sourceforge.net/project/showfiles.php?group_id=150646|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.0.11|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|

!Syntax:
{{{<<timeline [modified|created [maxentries [dateFormate]]]>>}}}
!Examples:
{{{<<timeline>>}}}
{{{<<timeline created 10>>}}}
{{{<<timeline modified 10 "MMM DD, YYYY">>}}}

!Revision History:
|''Version''|''Date''|''Note''|
|0.7.1|Jan 25, 2009|Corrected the link format of the list of tiddlers within achived timeline if the title of them included the character "''|''", reported by Eduard Wagner.|
|0.7.0|Jul 25, 2007|Accept a date format parameter|
|0.6.3|Jan 14, 2007|Cleaned codes, Removed config.macros.timeline.slider and config.macros.timeline.onClickSlider|
|0.6.2|Dec 10, 2006|Add monthFormat to display month format for Chinese|
|0.6.1|Aug 12, 2006|A great effect on config.macros.timeline.slider for Firefox, thanks Bob McElrath|
|0.6.0|Jul 25, 2006|Runs compatibly with TW 2.1.0 (rev #403+)|
|0.5.2|Jun 21, 2006|Fixed bugs for dateFormat of TW 2.1|
|~|~|Change default dateFormat to "0DD MMM, YYYY"|
|0.5.1|Jun 04, 2006|Added config.macros.archivedTimeline.orderBy for localization|
|0.5.0|Apr 19, 2006|Fixed bug for twice records of the same date ()|
|~|~|Added Date.prototype.convertToLocalYYYYMMDDHHMM<br />in order to backward compatible with 2.0.6-|
|0.4.0|Apr 03, 2006|Added new parameter, {{{<<timeline [sortfield] [maxentries]>>}}}|
|~|~|Added config.options.txtTimelineMaxentries|
|0.3.1|Feb 04, 2006|JSLint checked|
|0.3.0|Feb 04, 2006|Fixed several missing variable declarations|
|0.2.0|Dec 26, 2005|changed for the new feature of Macro timeline of TW 2.0.0 beta 6|
|0.1.0|Nov 3, 2005|Initial release|

!Code section:
***/
//{{{
config.options.txtTimelineMaxentries=0;
config.macros.archivedTimeline = {
	tooltips: "Archives sorted by  ",
	orderBy:{modified: "modified", created: "created"},
	monthFormat: "0DD MMM YYYY",
	dateFormat: "0DD MMM YYYY"
};
config.macros.timeline = config.macros.archivedTimeline;

config.macros.timeline.handler = function(place,macroName,params) {
	var field = params[0] ? params[0] : "modified";

	place.appendChild(document.createTextNode(this.tooltips + this.orderBy[field]));
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var lastMonth = ""; var lastDay = ""; var theText = "----\n"; var i = 0;
	var last = (params[1])?params[1]:config.options.txtTimelineMaxentries;
		last = (isNaN(last)||last<1) ? 0:tiddlers.length-Math.min(tiddlers.length,parseInt(last));
	var dateFormat = params[2] ? params[2] : this.dateFormat;
	var cookie, archives, panel;
	for (var t=tiddlers.length-1; t>=last; t--) {
		var tiddler = tiddlers[t];
		var theMonth = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,6);
		var theDay = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,8);
		if(theMonth != lastMonth) {
			lastMonth = lastMonth || theMonth;
			place.appendChild(document.createElement('hr'));
			cookie = 'chktimeline'+(i++);
			archives = this.formatString(this.monthFormat, lastMonth);
			panel = config.macros.slider.createSlider(place,cookie,archives,this.tooltips + archives);
			lastMonth = theMonth;

		}
		if(theDay != lastDay){
			var ul = document.createElement("ul");
			panel.appendChild(ul);
			createTiddlyElement(ul,"li",null,"listTitle",tiddler[field].formatString(dateFormat));
			lastDay = theDay; 
		}
		createTiddlyElement(ul,"li",null,"listLink").appendChild(createTiddlyLink(place,tiddler.title,true));
	}
place.appendChild(document.createElement('hr'));
};

config.macros.timeline.formatString = function(template, yyyymm)
{
	var dateString = new Date(yyyymm.substr(0,4)+'/'+yyyymm.substr(4,2)+'/01');
	template = template.replace(/DDD|0DD|DD/g,'');
	return dateString.formatString(template);
};
if (!Date.prototype.convertToLocalYYYYMMDDHHMM){
	Date.prototype.convertToLocalYYYYMMDDHHMM = function(){
		return(String.zeroPad(this.getFullYear(),4) + String.zeroPad(this.getMonth()+1,2) + String.zeroPad(this.getDate(),2) + String.zeroPad(this.getHours(),2) + String.zeroPad(this.getMinutes(),2));
	}
}
//}}}