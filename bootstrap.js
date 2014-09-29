// Copyright 2012-2014 Felix Kaelberer <bvbbpp@gmx-topmail.de>
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.
//
"use strict";

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
var MOBILE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS
             .toLowerCase().indexOf("android") >= 0;


//preferences and defaults
//TODO: de-duplicate prefs
var PREFS = [{
  name: "useIframe",
  def: true
}, {
  name: "hideDoodle",
  def: MOBILE
}, {
  name: "hideICS",
  def: MOBILE
}];

function run(evt) {
  var doc = evt.target;
  if (PAGE_TEST.test(doc.URL)) {
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
      if (PAGE_TEST.test(uri)) {
        tab.reload();
      }
    }
  }
}


function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
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

  if (aReason === ADDON_DISABLE) { // somehow throws exceptions upon uninstall.
    Cu.unload("chrome://bvbbpp/content/bvbbpp.js");
  }
}


function install(aData, aReason) {
  for (var i = 0; i < PREFS.length; i++) {
    if (!prefManager.getBranch("extensions.bvbbpp.").prefHasUserValue(PREFS[i].name)) {
      prefManager.getBranch("extensions.bvbbpp.").setBoolPref(PREFS[i].name, PREFS[i].def);
    }
  }
}


function uninstall(aData, aReason) {
  shutdown(aData, aReason);
  for (var i = 0; i < PREFS.length; i++) {
    prefManager.getBranch("extensions.bvbbpp.").clearUserPref(PREFS[i].name);
  }
}
