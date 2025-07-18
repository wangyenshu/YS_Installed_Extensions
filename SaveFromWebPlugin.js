/***
|Name|SaveFromWebPlugin|
|Source|http://www.TiddlyTools.com/#SaveFromWebPlugin|
|Documentation|http://www.TiddlyTools.com/#SaveFromWebPluginInfo|
|Version|1.3.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|extend 'save changes' to get remote document contents and save to local filesystem |
Normally, when you are viewing a TiddlyWiki document over the web (i.e., not via {{{file://}}}) and you select the "save changes" (or "save to disk") command, an error message is displayed: //__"You need to save this TiddlyWiki to a file before you can save changes."__//  This plugin extends the use of {{{<<saveChanges>>}}} so that when you are viewing and/or editing a remote TiddlyWiki document, instead of receiving this somewhat confusing and unhelpful message, you can still click the "save changes" (or "save to disk") command to ''store a copy of the remote document directly onto your local filesystem'', //including any unsaved tiddler changes/additions you have made while working on-line.//
!!!!!Documentation
>see [[SaveFromWebPluginInfo]]
!!!!!Configuration
> see [[SaveFromWebConfig]]
!!!!!Revisions
<<<
2011.02.14 1.3.2 fix OSX error: use picker.file.path
2008.09.29 1.3.1 in saveFromWeb(), do NOT convert UTF8 to Unicode when merging retrieved source for submission to server-side reflector script.  Fixes mangling of international characters and symbols.
|please see [[SaveFromWebPluginInfo]] for additional revision details|
2007.06.26 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.SaveFromWebPlugin= {major: 1, minor: 3, revision: 2, date: new Date(2011,2,14)};
//}}}

//{{{
// DEFAULT SETTINGS
if (config.options.txtSaveFromWebScriptURL==undefined)
	config.options.txtSaveFromWebScriptURL="savefromweb.php";
if (config.options.txtSaveFromWebTargetFilename==undefined)
	config.options.txtSaveFromWebTargetFilename=""; // use current filename when blank
if (config.options.txtSaveFromWebSourceFile==undefined)
	config.options.txtSaveFromWebSourceFile=""; // use current URL when blank
if (config.options.chkSaveFromWebAttemptLocalIO==undefined)
	config.options.chkSaveFromWebAttemptLocalIO=true; // true=try to use local filesystem I/O (requires security permissions)
if (config.options.chkSaveFromWebPreFetch==undefined)
	config.options.chkSaveFromWebPreFetch=false; // true=retrieve TW core when document is first loaded
//}}}

//{{{
// OPTIONAL: get TW core source code when plugin is loaded (i.e., once per document session)
if (document.location.protocol!="file:" && config.options.chkSaveFromWebPreFetch) {
	// retrieve TW source from server...
	var src=document.location.href;
	if (config.options.txtSaveFromWebSourceFile && config.options.txtSaveFromWebSourceFile.length)
		src=config.options.txtSaveFromWebSourceFile;
	var target=config.options.txtSaveFromWebTargetFilename;
	if (!target.length) { // use current filename
		var loc=document.location.pathname;
		var slashpos=loc.lastIndexOf("/");
		target=(slashpos==-1)?loc:loc.substr(slashpos+1);
		if (!target.length) target=document.location.host+".html";
	}
	var xhr=loadRemoteFile(src,function(success,target,txt,src,xhr){if(success)config.saveFromWebSourceCache=txt;},target);
}
//}}}

//{{{
window.saveFromWeb_saveChanges = window.saveChanges;
window.saveChanges = function(onlyIfDirty,tiddlers) {
	// if on file:, just use standard core save handling
	if(document.location.protocol == "file:") { window.saveFromWeb_saveChanges.apply(this,arguments); return; }
	clearMessage();
	// get target filename
	var target=config.options.txtSaveFromWebTargetFilename;
	if (!target.length) { // use current filename
		var loc=document.location.pathname;
		var slashpos=loc.lastIndexOf("/");
		target=(slashpos==-1)?loc:loc.substr(slashpos+1);
		if (!target.length) target=document.location.host+".html";
	}
	// get TW core source location
	var src=document.location.href;
	if (config.options.txtSaveFromWebSourceFile && config.options.txtSaveFromWebSourceFile.length)
		src=config.options.txtSaveFromWebSourceFile;
	// if core source has already been cached, go straight to saving the file...
	if (config.saveFromWebSourceCache)
		{ window.saveFromWeb(true,target,config.saveFromWebSourceCache,src,null); return; }
	// otherwise, retrieve TW source from server...
	displayMessage("Retrieving TiddlyWiki core from "+src);
	var xhr=loadRemoteFile(src,window.saveFromWeb,target);
	if (!xhr) { // couldn't load remote, report core error message
		displayMessage("Could not retrieve TiddlyWiki core... download unsuccessful.");
		alert(config.messages.notFileUrlError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
	}
	return;
}
//}}}

//{{{
window.saveFromWeb = function(success,target,txt,url,xhr) {
	if(!success) {
		displayMessage("Could not retrieve TiddlyWiki core... download unsuccessful.");
		alert(config.messages.cantSaveError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
		return;
	}
	// Locate the storeArea div's in the original source
	var posDiv=locateStoreArea(txt);
	if(!posDiv) { alert(config.messages.invalidFileError.format([url])); return; }

	// cache the document source so subsequent saves don't have to retrieve the source each time
	if (!config.saveFromWebSourceCache) config.saveFromWebSourceCache=txt;

	// if we can get local filesystem access, then ask for a filename and merge/write the file
	if (config.options.chkSaveFromWebAttemptLocalIO) {
		try {
			// get local target path+filename (may be blocked by browser security)
			var target=promptForFilename( "Save file as:","C:\\",target,"html");
			if (!target || !target.length) return;
			saveBackup(target,txt);
			saveRss(target);
			saveEmpty(target,txt,posDiv);
			saveMain(target,txt,posDiv);
			return;
		} catch(e) { }
	}
	// otherwise, fallback to using online 'reflector' script (if any)
	if (config.options.txtSaveFromWebScriptURL.length) {
		displayMessage("Merging tiddlers with core and preparing for download...");
		var merged=txt.substr(0,posDiv[0]+startSaveArea.length)+"\n"+
			store.allTiddlersAsHtml()+"\n"+txt.substr(posDiv[1]);
		var title=getPageTitle().htmlEncode();
		merged=merged.replaceChunk("<title"+">","</title"+">"," "+title+" ");
		merged=updateLanguageAttribute(merged);
		merged=updateMarkupBlock(merged,"PRE-HEAD","MarkupPreHead");
		merged=updateMarkupBlock(merged,"POST-HEAD","MarkupPostHead");
		merged=updateMarkupBlock(merged,"PRE-BODY","MarkupPreBody");
		merged=updateMarkupBlock(merged,"POST-SCRIPT","MarkupPostBody");
		// create form in a hidden frame and submit it to server
		var html='<input type="hidden" name="filename" value="">'
			+'<input type="hidden" name="contents" value="">';
		var form=window.createHiddenForm(config.options.txtSaveFromWebScriptURL,html);
		form.filename.value=target;
		form.contents.value=merged;
		form.submit();
	}
}
//}}}

//{{{
window.createHiddenForm=function(action,body) {
	var f=document.getElementById("saveFromWebFrame");
	if (f) document.body.removeChild(f);
	var f=createTiddlyElement(document.body,"iframe","saveFromWebFrame");
	f.style.width="0px"; f.style.height="0px"; f.style.border="0px";
	var d=f.document;
	if (f.contentDocument) d=f.contentDocument; // For NS6
	else if (f.contentWindow) d=f.contentWindow.document; // For IE5.5 and IE6
	d.open();
	d.writeln('<form target="_self" action="'+action+'" method="post" enctype="multipart/form-data">'+body+'</form>');
	d.close();
	return d.getElementsByTagName("form")[0];
}
//}}}

//{{{
// note: if blocked by browser security, this function will throw an error...
// the CALLING function should use "try{...} catch(e){...}" to handle the security errors
window.promptForFilename=function(msg,path,file,defext) {
	var result="";
	if(window.Components) { // moz
		netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
		var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
		var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
		picker.init(window, msg, nsIFilePicker.modeSave);
		picker.displayDirectory=null;
		picker.defaultExtension=defext;
		picker.defaultString=file;
		picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
		if (picker.show()!=nsIFilePicker.returnCancel) var result=picker.file.path;
	}
	else { // IE (XP only)
		var s = new ActiveXObject('UserAccounts.CommonDialog');
		s.Filter='All files|*.*|Text files|*.txt|HTML files|*.htm;*.html|';
		s.FilterIndex=1; // default to ALL files;
		s.InitialDir=path;
		s.FileName=file;
		if (s.showOpen()) var result=s.FileName;
	}
	return result;
}
//}}}