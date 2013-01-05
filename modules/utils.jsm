var EXPORTED_SYMBOLS = ["removeElement", "removeElements", "removeParent", "removeParents", "newParentElement", 		
						"insertParentElement", "clearElement", "newElement", "replaceChildren", "setElementAttributes", 
						"alert", "romanize", "deromanize", "loadDocument", "loadDocumentAsync"];

var Cc = Components.classes;
var Ci = Components.interfaces;
var console = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);


function alert(msg) {
	console.logStringMessage("BVBB++: " + msg);
};

function error(e, msg) {
	var message = e ? "BVBB++: Fehler in Zeile " + e.lineNumber + ": " + e.message + " " + (msg?msg:"") : "BVBB++: " + msg;
	console.logStringMessage(message);
};

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

function loadDocumentAsync(link, callback, arg1, arg2, arg3, arg4) { 
	try {
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		request.onreadystatechange = function(evt) {
										if (this.readyState == 4) {
//											alert("read " + arg3);
											var doc = request.response;
											if (!doc)
												alert("Kann Datei " + link + " nicht laden. Antwort ist 'null'.");
											callback(doc, arg1, arg2, arg3, arg4);
										}
									 };
		request.open("GET", link, true, null, null);
		request.responseType = "document";
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

/**
 * Remove all elements of the given tag type, but keep their children.
 * @param tag A tag name (string)
 * @param regex A regular expression (applied to innerHTML) to filter the tags (optional).  
 */
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

/**
 * remove all children of the element and add the ones passed in arguments 2, 3, ... 
 */
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
	if (!child)
		return;
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
	str = str.toUpperCase();
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