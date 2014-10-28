// Copyright 2012-2014 Felix Kaelberer <bvbbpp@gmx-topmail.de>
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.
//
"use strict";

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var prefBranch = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
                 .getBranch("extensions.bvbbpp.");

var MOBILE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS
             .toLowerCase().indexOf("android") >= 0;

var URL_TEST = /bvbb\.net\/fileadmin\/user_upload\/(schuch|saison\d\d\d\d)\/meisterschaft/;

function run(evt) {
  var doc = evt.target;
  if (URL_TEST.test(doc.URL) && doc.URL.indexOf("view-source:") < 0) {
    var BVBBPP = new Bvbbpp(doc);
    BVBBPP.run();
  }
}


var windowListener = {
  onOpenWindow: function(aWindow) {
    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                           .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("DOMContentLoaded", run, false);
  },
  onCloseWindow: function(aWindow) {
    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                           .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.removeEventListener("DOMContentLoaded", run, false);
  },
  onWindowTitleChange: function(aWindow, aTitle) {
  }
};


function startup(aData, aReason) {
  Cu.import("chrome://bvbbpp/content/bvbbpp.js");

  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  // listen to any existing windows
  var windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    var domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    domWindow.addEventListener("DOMContentLoaded", run, false);
    reloadTabs(domWindow);
  }

  // listen to any new windows
  wm.addListener(windowListener);
}


function reloadTabs(window) {
  if (window.gBrowser && window.gBrowser.browsers) {
    var num = window.gBrowser.browsers.length;
    for (var i = 0; i < num; i++) {
      var tab = window.gBrowser.getBrowserAtIndex(i);
      var uri = tab.currentURI.spec;
      if (URL_TEST.test(uri)) {
        tab.reload();
      }
    }
  }
}


function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean up any UI changes made
  if (aReason === APP_SHUTDOWN) {
    return;
  }
  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
  // stop listening to any existing windows
  var windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    var domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    domWindow.removeEventListener("DOMContentLoaded", run, false);
    reloadTabs(domWindow);
  }

  // Stop listening for new windows
  wm.removeListener(windowListener);

  var baseUrl = aData.resourceURI.spec;
  Cu.unload(baseUrl + "/content/bvbbpp.js");
  Cu.unload(baseUrl + "/content/utils.js");
}


function install(aData, aReason) {
//  Cu.import("chrome://bvbbpp/content/bvbbpp.js");
//  for (var i = 0; i < PREFS.length; i++) {
//    if (!prefBranch.prefHasUserValue(PREFS[i].name)) {
//      prefBranch.setBoolPref(PREFS[i].name, PREFS[i].def);
//    }
//  }
}


function uninstall(aData, aReason) {
  prefBranch.deleteBranch("");
//  for (var i = 0; i < PREFS.length; i++) {
//    prefBranch.clearUserPref(PREFS[i].name);
//  }
  shutdown(aData, aReason);
}
