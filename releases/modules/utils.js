// Copyright 2012-2014 Felix Kaelberer <bvbbpp@gmx-topmail.de>
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.

"use strict";

var EXPORTED_SYMBOLS = [ "removeElement", "removeElements", "removeParent", "removeParents",
                         "newParentElement", "clearElement", "newElement", "replaceChildren",
                         "setElementAttributes", "log", "romanize", "deromanize", "getDocument",
                         "twoDigits" ];

var Cc = Components.classes;
var Ci = Components.interfaces;
var console = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);


function log(msg) {
  console.logStringMessage("BVBB++: " + msg);
}


function twoDigits(num) {
  return (num < 10 ? "0" : "") + num;
}


function error(e, msg) {
  var err = e ? "Fehler in utils.js, Zeile" + e.lineNumber + ": " + e.message + " " : "";
  Components.utils.reportError("BVPP++: " + err + (msg ? msg : ""));
}


function getDocument(url) {
  return new Promise(function(resolve, reject) {
    var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
              .createInstance(Components.interfaces.nsIXMLHttpRequest);
    req.open('GET', url);
    req.responseType = "document";
    req.overrideMimeType('text/html; charset=iso-8859-1');

    req.onload = function() {
      if (req.status === 200) {
        resolve(req.response);
      }
    };

    req.onerror = function() {
      reject("Kann Datei " + url + " nicht laden. Antwort ist 'null'.");
    };

    req.send();
  });
}


function removeElement(e) {
  if (e) {
    e.parentNode.removeChild(e);
  }
}


function removeParent(e) {
  while (e && e.hasChildNodes()) {
    e.parentNode.insertBefore(e.firstChild, e);
  }
  if (e && e.parentNode) {
    e.parentNode.removeChild(e);
  }
}


/**
 * Remove all elements of the given tag type, but keep their children.
 * @param tag A tag name (string)
 * @param regex A regular expression (applied to innerHTML) to filter the tags (optional).
 */
function removeParents(doc, tag, regex) {
  if (!doc) {
    return;
  }
  var e = doc.getElementsByTagName(tag);
  for (var i = e.length - 1; i >= 0; i--) {
    if (!regex || regex.test(e[i].innerHTML)) {
      removeParent(e[i]);
    }
  }
}

/**
 * remove all children of the element and add the ones passed in arguments 2, 3, ...
 */
function replaceChildren(e) {
  if (!e || !arguments) {
    return e;
  }
  clearElement(e);

  for (var i = 1; i < arguments.length; i++) {
    if (arguments[i]) {
      e.appendChild(arguments[i]);
    }
  }
  return e;
}


function clearElement(e) {
  while (e.hasChildNodes()) {
    e.removeChild(e.firstChild);
  }
  return e;
}


function newParentElement(type, e) {
  if (!e) {
    return;
  }
  var doc = e.ownerDocument;
  if (!doc) {
    return;
  }
  var parent = doc.createElement(type);
  parent.appendChild(e);
  for (var i = 2; i + 1 < arguments.length; i += 2) {
    parent.setAttribute(arguments[i], arguments[i + 1]);
  }
  return parent;
}


function removeElements(doc, tag, regex) {
  if (!doc) {
    return;
  }
  var e = doc.getElementsByTagName(tag);
  for (var i = e.length - 1; i >= 0; i--) {
    if (!regex || regex.test(e[i].innerHTML)) {
      removeElement(e[i]);
    }
  }
}


function newElement(doc, type, textContent) {
  var e = doc.createElement(type);
  if (textContent && textContent != "") {
    e.textContent = textContent;
  }
  for (var i = 3; i + 1 < arguments.length; i += 2) {
    e.setAttribute(arguments[i], arguments[i + 1]);
  }
  return e;
}


function setElementAttributes(doc, tag, attribute, value, regex) {
  var e = doc.getElementsByTagName(tag);
  for (var i = 0; i < e.length; i++) {
    if (!regex || regex.test(e[i].outerHTML)) {
      e[i].setAttribute(attribute, value);
    }
  }
}


// deromanize from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function deromanize(str) {
  str = str.toUpperCase();
  var validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
  var token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
  var key = {M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1};
  var num = 0;
  var m;
  if (!(str && validator.test(str))) {
    return false;
  }
  while (m = token.exec(str)) {
    num += key[m[0]];
  }
  return num;
}


// romanize from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function romanize(num) {
  if (!+num) {
    return false;
  }
  var digits = String(+num).split("");
  var key = [ "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM", "", "X", "XX", "XXX",
              "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII",
              "VIII", "IX" ];
  var roman = "";
  var i = 3;
  while (i--) {
    roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  }
  var r = Array(+digits.join("") + 1).join("M") + roman;
  return r;
}
