/***
|''Name:''         |ThostUploadPlugin |
|''Description:''  |Support saving to Tiddlyhost.com |
|''Version:''      |1.0.0 |
|''Date:''         |March 06, 2021 |
|''Source:''       |https://github.com/simonbaird/tiddlyhost/tree/main/rails/tw_content/plugins |
|''Author:''       |BidiX, Simon Baird |
|''License:''      |BSD open source license |
|''~CoreVersion:'' |2.9.2 |
***/
//{{{

version.extensions.ThostUploadPlugin = {
  major: 1, minor: 0, revision: 0,
  date: new Date("Mar 06, 2021"),
  source: 'https://github.com/simonbaird/tiddlyhost/rails/tw_content/plugins',
  author: 'BidiX, Simon Baird',
  coreVersion: '2.9.2'
};

//
// Environment
//

if (!window.bidix) window.bidix = {};
bidix.debugMode = false;

//
// Upload Macro
//

config.macros.thostUpload = {
  handler: function(place,macroName,params) {
    createTiddlyButton(place, "save to tiddlyhost",
      "save this TiddlyWiki to a site on Tiddlyhost.com",
      this.action, null, null, this.accessKey);
  },

  action: function(params) {
    var siteName = config.options.txtThostSiteName.trim();
    if (!siteName) {
      alert("Tiddlyhost site name is missing!");
      clearMessage();
    }
    else {
      bidix.thostUpload.uploadChanges('https://' + siteName + '.tiddlyhost.com');
    }
    return false;
  }
};

//
// Upload functions
//

if (!bidix.thostUpload) bidix.thostUpload = {};

if (!bidix.thostUpload.messages) bidix.thostUpload.messages = {
  invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
  mainSaved: "Main TiddlyWiki file uploaded",
  mainFailed: "Failed to upload main TiddlyWiki file. Your changes have not been saved",
  loadOriginalHttpPostError: "Can't get original file",
  aboutToSaveOnHttpPost: 'About to upload on %0 ...',
  storePhpNotFound: "The store script '%0' was not found."
};

bidix.thostUpload.uploadChanges = function(storeUrl) {
  var callback = function(status, uploadParams, original, url, xhr) {
    if (!status) {
      displayMessage(bidix.thostUpload.messages.loadOriginalHttpPostError);
      return;
    }
    if (bidix.debugMode) {
      alert(original.substr(0,500)+"\n...");
    }

    var posDiv = locateStoreArea(original);
    if ((posDiv[0] == -1) || (posDiv[1] == -1)) {
      alert(config.messages.invalidFileError.format([localPath]));
      return;
    }

    bidix.thostUpload.uploadMain(uploadParams, original, posDiv);
  };

  clearMessage();

  // get original
  var uploadParams = [storeUrl];
  var originalPath = document.location.toString();
  var dest = 'index.html';
  displayMessage(bidix.thostUpload.messages.aboutToSaveOnHttpPost.format([dest]));

  if (bidix.debugMode) {
    alert("about to execute Http - GET on "+originalPath);
  }

  var r = doHttp("GET", originalPath, null, null, null, null, callback, uploadParams, null);

  if (typeof r == "string") {
    displayMessage(r);
  }

  return r;
};

bidix.thostUpload.uploadMain = function(uploadParams, original, posDiv) {
  var callback = function(status, params, responseText, url, xhr) {
    if (status) {
      displayMessage(bidix.thostUpload.messages.mainSaved);
      store.setDirty(false);
    }
    else {
      alert(bidix.thostUpload.messages.mainFailed);
      displayMessage(bidix.thostUpload.messages.mainFailed);
    }
  };

  var revised = bidix.thostUpload.updateOriginal(original, posDiv);
  bidix.thostUpload.httpUpload(uploadParams, revised, callback, uploadParams);
};

bidix.thostUpload.httpUpload = function(uploadParams, data, callback, params) {
  var localCallback = function(status, params, responseText, url, xhr) {
    if (xhr.status == 404) {
      alert(bidix.thostUpload.messages.storePhpNotFound.format([url]));
    }

    var saveNotOk = responseText.charAt(0) != '0';

    if (bidix.debugMode || saveNotOk) {
      alert(responseText);
    }

    if (saveNotOk) {
      status = null;
    }

    callback(status, params, responseText, url, xhr);
  };

  // do httpUpload
  var boundary = "---------------------------"+"AaB03x";
  var uploadFormName = "UploadPlugin";
  // compose headers data
  var sheader = "";
  sheader += "--" + boundary + "\r\nContent-disposition: form-data; name=\"";
  sheader += uploadFormName +"\"\r\n\r\n";
  sheader += "backupDir=x" +
        ";user=x" +
        ";password=x" +
        ";uploaddir=x";
  if (bidix.debugMode) {
    sheader += ";debug=1";
  }
  sheader += ";;\r\n";
  sheader += "\r\n" + "--" + boundary + "\r\n";
  sheader += "Content-disposition: form-data; name=\"userfile\"; filename=\"index.html\"\r\n";
  sheader += "Content-Type: text/html;charset=UTF-8" + "\r\n";
  sheader += "Content-Length: " + data.length + "\r\n\r\n";
  // compose trailer data
  var strailer = "";
  strailer = "\r\n--" + boundary + "--\r\n";
  data = sheader + data + strailer;
  if (bidix.debugMode) {
    alert("about to execute Http - POST on " + uploadParams[0]+ "\n with \n" + data.substr(0,500) + " ... ");
  }
  var r = doHttp("POST", uploadParams[0], data,
    "multipart/form-data; ;charset=UTF-8; boundary=" + boundary, 'x','x', localCallback, params, null);

  if (typeof r == "string") {
    displayMessage(r);
  }

  return r;
};

// same as Saving's updateOriginal but without convertUnicodeToUTF8 calls
bidix.thostUpload.updateOriginal = function(original, posDiv) {
  if (!posDiv) {
    posDiv = locateStoreArea(original);
  }
  if ((posDiv[0] == -1) || (posDiv[1] == -1)) {
    alert(config.messages.invalidFileError.format([localPath]));
    return;
  }

  var revised = original.substr(0, posDiv[0] + startSaveArea.length) + "\n" +
    store.allTiddlersAsHtml() + "\n" +
    original.substr(posDiv[1]);

  var newSiteTitle = getPageTitle().htmlEncode();
  revised = revised.replaceChunk("<title"+">","</title"+">"," " + newSiteTitle + " ");
  revised = updateMarkupBlock(revised,"PRE-HEAD","MarkupPreHead");
  revised = updateMarkupBlock(revised,"POST-HEAD","MarkupPostHead");
  revised = updateMarkupBlock(revised,"PRE-BODY","MarkupPreBody");
  revised = updateMarkupBlock(revised,"POST-SCRIPT","MarkupPostBody");
  return revised;
};

//
// Site config
//

bidix.initOption = function(name,value) {
  if (!config.options[name]) {
    config.options[name] = value;
  }
};

merge(config.optionsDesc, {
  txtThostSiteName: "Site name for uploads to Tiddlyhost.com",
});

bidix.initOption('txtThostSiteName','starkakrats');

//
// Tiddlyhost stuff
//

// So you can see edit controls via http
config.options.chkHttpReadOnly = false;
window.readOnly = false;
window.showBackstage = true;

// Add 'upload to tiddlyhost' button
with (config.shadowTiddlers) {
  SideBarOptions = SideBarOptions.replace(/(<<saveChanges>>)/,"$1<<thostUpload>>");
}

//}}}
