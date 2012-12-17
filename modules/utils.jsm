var EXPORTED_SYMBOLS = ["removeElement", "removeElements", "removeParent", "removeParents", "newParentElement", 		
						"insertParentElement", 
						"clearElement", "newElement", "replaceChildren", "setElementAttributes", "getPref", "alert",
						"romanize", "deromanize", "loadDocument", "loadDocumentAsync"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const console = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
const prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.bvbbpp.");


function alert(msg) {
	console.logStringMessage("BVBB++: " + msg);
//	for (var i=1; i<arguments.length; i++) {
//		doc.body.appendChild(newElement(doc, "p", arguments[i]));
//	}
};

function error(e, msg) {
	var message = e ? "BVBB++: Fehler in Zeile " + e.lineNumber + ": " + e.message + " " + (msg?msg:"") : "BVBB++: " + msg;
	console.logStringMessage(message);
//	var text = doc.createTextNode("Fehler in Zeile " + e.lineNumber + ": " + e.message + " " + (msg?msg:""));
	//var font = newParentElement("font", text, "size", "3");
//	var p = newParentElement("p", font);
//	doc.body.insertBefore(p, doc.body.firstChild);
};

// get preference. If it doesn't exist, create the preference with default setting.
function getPref(name) {
	if (!name)
		return false;
	try{
		return prefManager.getBoolPref(name);
	} catch (err) {
		error(err, "Kann Einstellung \"" + name + "\" nicht lesen. Benutze Standardeinstellung.");
	}
	for (var i=0; i<PREFS.length; i++) {
		if (name == PREFS[i].name) {
			prefManager.setBoolPref(PREFS[i].name, PREFS[i].def);
			return PREFS[i].def;
		}
	}
	return false;
}

function loadDocument(docu, link) {
	try {
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		request.open("GET", link, false, null, null);
		request.overrideMimeType('text/html; charset=iso-8859-1');
		request.send(null);
		var doc = docu.implementation.createHTMLDocument("");
		doc.documentElement.innerHTML = request.responseText;
		return doc;
	} catch (err) {
		error(err, " Kann Datei " + link + " nicht laden.");
	}
}

function loadDocumentAsync(docu, link, callback, arg1, arg2) {
	try {
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		request.onreadystatechange = function(evt) {
										if (this.readyState == 4) {
//											alert("read " + i);
											var doc = docu.implementation.createHTMLDocument("");
											doc.documentElement.innerHTML = request.responseText;
											callback(doc, arg1, arg2);
										}
									 };
		request.open("GET", link, true, null, null);
		request.overrideMimeType('text/html; charset=iso-8859-1');
		request.send(null);
	} catch (err) {
		error(err, " Kann Datei " + link + " nicht laden.");
	}
}

function removeElements(doc, tag, regex) {
	if (!doc)
		return;
	var	e = doc.getElementsByTagName(tag);
	for (var i = e.length-1; i >= 0; i--) {
		if (!regex || regex.test(e[i].innerHTML)) {
			removeElement(e[i]);
		}
	}
}

function removeElement(e) {
	if (e) 
		e.parentNode.removeChild(e); 
}

function removeParent(e) {
	while (e && e.hasChildNodes())
		e.parentNode.insertBefore(e.firstChild, e);			
	if (e && e.parentNode)
		e.parentNode.removeChild(e);
}

function removeParents(doc, tag, regex) {
	if (!doc)
		return;
	var	e = doc.getElementsByTagName(tag);
	for (var i = e.length-1; i >= 0; i--) {
		if (!regex || regex.test(e[i].innerHTML)) {
			removeParent(e[i]);
		}
	}
}

function replaceChildren(e) {
	clearElement(e);
	for (var i=1; i<arguments.length; i++) {
		e.appendChild(arguments[i]);
	}
	return e;
}


function newElement(doc, type, innerHTML) {
	var e = doc.createElement(type);
	if (innerHTML && innerHTML != "")
		e.textContent = innerHTML;
	for (var i=3; i+1<arguments.length; i+=2) {
		e.setAttribute(arguments[i], arguments[i+1]);
	}
	return e;
}

function clearElement(e) {
	while (e.hasChildNodes()) {
		e.removeChild(e.firstChild);
	}
	return e;
}

function insertParentElement(type, child) {
	var doc = child.ownerDocument;
	if (!doc || !child)
		return;
	var p = child.parentNode;
	var e = doc.createElement(type);
	for (var i=2; i+1<arguments.length; i+=2) {
		e.setAttribute(arguments[i], arguments[i+1]);
	}
	e.appendChild(child);
	p.append(e);
	return e;
}

function newParentElement(type, child) {
	var doc = child.ownerDocument;
	if (!doc)
		return;
	var e = doc.createElement(type);
	if (child)
		e.appendChild(child);
	for (var i=2; i+1<arguments.length; i+=2) {
		e.setAttribute(arguments[i], arguments[i+1]);
	}
	return e;
}

function setElementAttributes(doc, tag, attribute, value, regex) {
	var e = doc.getElementsByTagName(tag);
	for (var i=0; i<e.length; i++) {
		if (!regex || regex.test(e[i].outerHTML)) {
			e[i].setAttribute(attribute, value);
		}
	}
}

// deromanize from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function deromanize(str) {
	var	str = str.toUpperCase();
    var validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/;
    var token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g;
    var key = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    var num = 0;
    var m;
	if (!(str && validator.test(str)))
		return false;
	while (m = token.exec(str))
		num += key[m[0]];
	return num;
}

// romanize from http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
function romanize(num) {
	if (!+num)
		return false;
	var	digits = String(+num).split(""),
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
		       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
		       "","I","II","III","IV","V","VI","VII","VIII","IX"],
		roman = "",
		i = 3;
	while (i--)
		roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	var r = Array(+digits.join("") + 1).join("M") + roman;
	return r;
}