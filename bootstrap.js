// Copyright 2012-2013 Felix Kaelberer <bvbbpp@gmx-topmail.de>
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.

"use strict";

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
var MOBILE = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS.toLowerCase().indexOf("android") >= 0;

// preferences and defaults
var PREFS = [{
    name : "useIframe",
    def : true
}];

// constants
// TODO: Hallenschluessel mittels array an Saison anpassen.
var HALLENSCHLUESSEL_URL = "http://bvbb.net/Hallen.706.0.html";
var PAGE_TEST = /bvbb\.net\/fileadmin\/user_upload\/(schuch|saison1213|saison1112)\/meisterschaft/;
var WEB_SHORT = "bvbb.net/fileadmin/user_upload/schuch/meisterschaft";
var SEASON_NAMES = ["2013/14", "2012/13", "2011/12"];
var SEASON_WEB = ["schuch", "saison1213", "saison1112"];
var WEB = "http://" + WEB_SHORT + "/";
var SHORT_NAMES = ["BB", "LL-1", "LL-2", "BZ-1", "BZ-2", "AK-1", "AK-2", "BK-1", "BK-2", "CK-1", "CK-2", "DK-1",
                   "DK-2", "EK-1", "EK-2", "FK-1", "FK-2", "GK-1", "GK-2", "GK-3"];
var NAMES = ["Berlin-Brandenburg-Liga", "Landesliga I", "Landesliga II", "Bezirksklasse I", "Bezirksklasse II",
             "A-Klasse I", "A-Klasse II", "B-Klasse I", "B-Klasse II", "C-Klasse I", "C-Klasse II", "D-Klasse I",
             "D-Klasse II", "E-Klasse I", "E-Klasse II", "F-Klasse I", "F-Klasse II", "G-Klasse I", "G-Klasse II",
             "G-Klasse III"];

var LIGHT_YELLOW = "#FFFFCC";
var YELLOW 		 = "#FFFF66";
var MIX_YELLOW	 = "#FAFA44";
var DARK_YELLOW	 = "#F0F000";
var LIGHT_ORANGE = "#FFCC33";
var ORANGE 		 = "#FF9900";
var DARK_ORANGE	 = "#CC9933";
var AUFSTEIGER	 = "#00CC00";
var ABSTEIGER	 = "#FF6633";
var ZURUECK		 = "#FF0022";
var WIN			 = "#33FF00";
var LOSE		 = "#FF0000";
var FRAME_TOP	 = "#D8D8D8";
var FRAME_BOTTOM = "#474747";
var KAMPFLOS	 = "#FF6600";

var COLORS = [YELLOW, LIGHT_YELLOW, MIX_YELLOW, DARK_YELLOW, LIGHT_ORANGE, ORANGE, DARK_ORANGE, AUFSTEIGER, ABSTEIGER,
              ZURUECK, WIN, LOSE, FRAME_TOP, FRAME_BOTTOM];

var DOC = null;
var BODY = null;
var URL = null;

/**
 * shortcut for newElement(DOC, type, textContent, arg2, arg3, ...)
 */
function create() {
	return newElement.apply(this, [DOC].concat([].slice.call(arguments)));
}

function errorMsg(e, msg) {
	return e ? "BVBB++: Fehler in Zeile " + e.lineNumber + ": " + e.message + " " + (msg ? msg : "")
	        : "BVBB++: " + msg;
};

/**
 * Get a preference from the branch "extensions.bvbbpp.". If it doesn't exist, create the preference
 * with default setting.
 * 
 * @param name
 *            pref name
 * @returns pref value
 */
function getPref(name) {
	if (!name)
		return false;
	try {
		return prefManager.getBranch("extensions.bvbbpp.").getBoolPref(name);
	} catch (err) {
		Cu.reportError(errorMsg(err, "Kann Einstellung \"" + name + "\" nicht lesen. Benutze Standardeinstellung."));
	}
	for (var i = 0; i < PREFS.length; i++) {
		if (name == PREFS[i].name) {
			prefManager.getBranch("extensions.bvbbpp.").setBoolPref(PREFS[i].name, PREFS[i].def);
			return PREFS[i].def;
		}
	}
	return false;
}

function makeAufstellung() {
	var teamNum = parseInt(URL.substr(-7, 2), 10);
	makeHeadLine(-1, teamNum);

	var h2 = BODY.getElementsByTagName("h2");
	if (!h2[0])
		return;
	h2[0].parentNode.replaceChild(makeTitle(h2[0].textContent.replace("Mannschaftsaufstellung", "Aufstellung")), h2[0]);
	var button = makeLoadStatsButton();
	button.setAttribute("style", "margin: auto 320px"); // wie geht's besser?
	h2[0].parentNode.appendChild(button);

	makePlayerLinks();

	var f = BODY.getElementsByTagName("font");
	for (var i = 0; i < f.length; i++) {
		var link = linkToKlasse(f[i].innerHTML);
		if (link) {
			f[i].replaceChild(link, f[i].firstChild);
			link.textContent = link.textContent.toUpperCase();
			if (link.textContent.length < 20)
				link.setAttribute("style", "letter-spacing:2px; font-weight:600");
		}
	}	
}

function makeVerein() {
	makeHeadLine(-1, parseInt(URL.substr(-7, 2), 10));

	var h2 = BODY.getElementsByTagName("h2");
	if (h2[0]) {
		var title = "Spieltermine " + h2[0].getElementsByTagName("b")[0].textContent;
		h2[0].parentNode.replaceChild(makeTitle(title), h2[0]);
	}

	var span = BODY.getElementsByTagName("span");
	for (var i = span.length - 1; i >= 0; i--) {
		if (span[i].id == "headline")
			continue;
		var font = create("font", null, "size", 2);
		font.appendChild(span[i].firstChild);
		span[i].parentNode.replaceChild(font, span[i]);
	}

	setElementAttributes(BODY, "table", "style", "border:0", /Mannschaft/);

	// trim links to klasse
	var b = BODY.getElementsByTagName("b");
	for (var i = 0; i < b.length; i++) {
		b[i].textContent = b[i].textContent.replace(/^\s+|\s+$/g, "");
	}

	// Vereine Verlinken
	var vereineVerlinkenCallback = function(loadedDoc) {
		try {
			var vereine = parseVereine(loadedDoc);
			var td = BODY.getElementsByTagName("td");
			for (var i = 0; i < td.length; i++) {
				if (/\d\d.\d\d.\d\d\d\d/.test(td[i].innerHTML) && /<a/.test(td[i].innerHTML))
					removeParents(td[i], "b");
				if (!/<|\d\d:\d\d|^\w$/.test(td[i].innerHTML)) {
					for (var j = 0; j < vereine.length; j++) {
						var v = vereine[j];
						var shortName = v.link.firstChild.innerHTML;
						if (td[i].innerHTML.indexOf(shortName) >= 0) {
							var num = / [IVX]+$/.exec(td[i].innerHTML)[0];
							var l = create("a", shortName + num, "href", v.link.href, "title", v.name + num);
							replaceChildren(td[i], l);
							break;
						}
					}
				}
			}
		} catch (err) {
			Cu.reportError(errorMsg(err));
		}
	}
	loadDocument(WEB + "spielberichte-vereine/spielbericht-vereine.HTML", vereineVerlinkenCallback);

	var tables = BODY.getElementsByTagName("table");
	for (var i=0; i<tables.length; i++) {
		tables[i].setAttribute("width", "600px");
	}
	var cols = BODY.getElementsByTagName("col");
	for (var i=8; i<cols.length; i+=14) {
		cols[i].setAttribute("width", "20px");
	}
	
	replaceHallenschluessel();
}

/**
 * Get HTML-String to a loadStats button
 */
function makeLoadStatsButton() {
	var input = DOC.createElement("input");
	input.type = "button";
	input.id = "loadStats";
	input.value = "Spielerstatistik laden";
	input.doc = DOC;
	input.onclick = function() {
		loadPlayerStats(input.doc);
	};
	return input;
}

function getGroupNum() {
	var groupName = URL.substr(-9, 4);
	for (var i = 0; i < SHORT_NAMES.length; i++) {
		if (SHORT_NAMES[i] == groupName)
			return i;
	}
	// wenn nix trifft, dann wars wohl BB (hat nur 2 Buchstaben)
	return 0;
}

function getSeasonID() {
	var seasonString = /user_upload\/(\w*)\//i.exec(URL)[1];
	for (var i = 0; i < SEASON_WEB.length; i++) {
		if (SEASON_WEB[i] == seasonString)
			return i;
	}
	// wenn nix trifft, dann nimm die aktuelle Saison
	return 0;
}

function makeGegenueber() {
	// HACK: The links might be overwritten in the run method by other sites.
	WEB_SHORT = "bvbb.net/fileadmin/user_upload/" + SEASON_WEB[getSeasonID()] + "/meisterschaft";
	WEB = "http://" + WEB_SHORT + "/";
	
	var groupNum = getGroupNum();
	makeHeadLine(groupNum, -1);

	var h2 = BODY.getElementsByTagName("h2");
	removeElement(h2[1]);
	h2[0].parentNode.replaceChild(makeGroupTitle("Gegen\u00FCberstellung " + NAMES[groupNum]), h2[0]);


	var tr = BODY.getElementsByTagName("tr");
	for (var i = 0; i < tr.length - 1; i++) {
		var td = tr[i + 1].getElementsByTagName("td");
		for (var j = 0; j < td.length - 1; j++) {
			var reg = /(\d+):(\d+)/.exec(td[j].innerHTML);
			if (reg) {
				var font = create("font", reg[1] + ":" + reg[2]);
				var u = newParentElement("u", font);
				var a = newParentElement("a", u, "style", "cursor: pointer");
				a.i = i;
				a.j = (j - 2);
				a.doc = DOC;
				a.sum = parseInt(reg[1], 10) + parseInt(reg[2], 10);
				a.onclick = function() {
					makeGegenueberStats(this);
				};
				td[j].replaceChild(a, td[j].firstChild);
				td[j].align = "center";
			}
		}
	}
}

function makeGegenueberStats(that) {
	try {
		var teamRow = that.i;
		var game = that.j;
		var sum = that.sum;

		// schon vorhandene Elemente aufraeumen
		removeElement(DOC.getElementById("h2stats"));
		var div = DOC.getElementById('centerstyle');

		var tr = DOC.getElementsByTagName("table")[0].getElementsByTagName("tr");
		var td = tr[(teamRow + 1)].getElementsByTagName("td");

		var teamI = /-(\d\d).HTML/.exec(td[1].innerHTML)[1];
		var teamNumI = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(td[1].innerHTML)[1]);
		var teamStrI = teamI + "-" + (teamNumI < 10 ? "0" : "") + teamNumI;

		var teamLink = Array(tr.length - 1);
		var rows = 0;

		// there's a left-over h2 element that we will fill with stats
		var h2 = div.getElementsByTagName("h2")[2];
		if (!h2) {
			h2 = create("h2");
			div.appendChild(h2);
		}
		h2.id = "h2stats";

		var tr1 = create("tr");
		var linkAndType = newParentElement("div", newParentElement("h4",
		        create("b", null, "id", "linkAndType")));
		tr1.appendChild(newParentElement("td", linkAndType, "width", 300));
		tr1.appendChild(newParentElement("td", makeLoadStatsButton()));
		var tbody1 = newParentElement("tbody", tr1);
		var table1 = newParentElement("table", tbody1, "class", "borderless", "style", "border:0");
		h2.appendChild(table1);

		var tr2 = create("tr", null, "class", "bg" + LIGHT_ORANGE.substr(1), "align", "center");
		tr2.appendChild(create("td", "Gegnerischer Verein", "style", "font-size: 10pt"));
		tr2.appendChild(create("td", "Datum", "style", "font-size: 10pt"));
		tr2.appendChild(create("td", "Ort", "style", "font-size: 10pt"));
		tr2.appendChild(create("td", "Spieler", "style", "font-size: 10pt"));
		tr2.appendChild(create("td", "Gegner", "style", "font-size: 10pt"));
		tr2.appendChild(create("td", "S\u00E4tze", "style", "font-size: 10pt"));
		tr2.appendChild(create("td", "Punkte", "style", "font-size: 10pt", "colspan", 3));
		var tbody = newParentElement("tbody", tr2, "id", "gegenueberstats");
		var table = newParentElement("table", tbody, "class", "bg" + YELLOW.substr(1), "border", 1, "cellpadding", 6);
		h2.appendChild(table);

		h2.appendChild(create("span", "Klick auf den Vereinsnamen f\u00FChrt zum Spielbericht.", "style",
		        "font-weight:normal;font-size:8pt"));
		h2.appendChild(create("br"));

		for (var j = 0; j < tr.length - 1; j++) {
			teamLink[j] = /<b>(.*)\s+<\/b>/.exec(tr[(j + 1)].innerHTML)[1];
			if (j == teamRow)
				continue;
			var innerJ = tr[(j + 1)].getElementsByTagName("td")[1].innerHTML;
			var teamJ = /-(\d\d).HTML/.exec(innerJ)[1];
			var teamNumJ = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(innerJ)[1]);
			var teamStrJ = teamJ + "-" + (teamNumJ < 10 ? "0" : "") + teamNumJ;
			var link = WEB + "spielberichte-vereine/" + teamStrI + "_" + teamStrJ + ".HTML";
			var row = makeTrFromBericht(link, 0, game, teamLink[j]);
			if (row) {
				tbody.appendChild(row);
				rows++;
			}
			link = WEB + "spielberichte-vereine/" + teamStrJ + "_" + teamStrI + ".HTML";
			var row = makeTrFromBericht(link, 1, game, teamLink[j]);
			if (row) {
				tbody.appendChild(row);
				rows++;
			}
		}
		var type = ["1. HE", "2. HE", "3. HE", "DE", "1. HD", "2. HD", "DD", "GD"][game];
		DOC.getElementById('linkAndType').appendChild(
		        DOC.createTextNode(teamLink[teamRow].replace(/\s+</, "<") + ", " + type));
		if (sum > rows)
			h2.appendChild(create("span", "Fehlende Spiele wurden eventuell nicht gewertet!", "style",
			        "font-weight:normal;font-size:8pt"));
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function makeTrFromBericht(link, hheim, ttyp, tteamLink) {
	var ttr = create("tr");

	var fillTr = function(bericht, tr, heim, typ, teamLink) {
		if (!bericht)
			return;
		// Reihenfolge Gegenueberstellung: 1HE, 2HE, 3HE, DE, 1HD, 2HD, DD, MIX
		// Reihenfolge im Spielbericht: 1HD, DD, 2HD, DE, MIX, 1HE, 2HE, 3HE
		var reihenfolge = [5, 6, 7, 3, 0, 2, 1, 4]; // uebersetzung gegenueber-->bericht

		var spiel = bericht.spiel[reihenfolge[typ]];
		if (!spiel)
			return;
		var wir = heim; // 0 bei heimspiel, 1 bei gast
		var die = 1 - wir;
		var sieg = spiel.sieg[wir];
		var hclass = "bg" + (sieg ? WIN.substr(1) : LOSE.substr(1));

		var tl = DOC.createTextNode(teamLink);
		var berichtLink = newParentElement("a", newParentElement("b", tl), "href", bericht.link);

		tr.appendChild(newParentElement("td", berichtLink, "width", "152px", "class", "bg" + DARK_YELLOW.substr(1)));
		tr.appendChild(create("td", bericht.datum));
		tr.appendChild(create("td", (wir ? "Ausw." : "Heim"), "align", "center", "width", "38px"));
		var spiWi = spiel.spieler[wir];
		var spiDi = spiel.spieler[die];
		spiWi.removeAttribute("width");
		spiDi.removeAttribute("width");
		tr.appendChild(spiWi);
		tr.appendChild(spiDi);
		tr.appendChild(create("td", spiel.saetze[wir] + " : " + spiel.saetze[die], "align", "center", "width",
		        "38px", "class", hclass));
		tr.appendChild(create("td", spiel.p[wir][0] + " : " + spiel.p[die][0], "align", "center", "width",
		        "38px"));
		tr.appendChild(create("td", spiel.p[wir][1] + " : " + spiel.p[die][1], "align", "center", "width",
		        "38px"));
		tr.appendChild(create("td", spiel.p[wir][2] ? (spiel.p[wir][2] + " : " + spiel.p[die][2]) : " ",
		        "align", "center", "width", "38px"));
	};

	parseSpielbericht(link, fillTr, ttr, hheim, ttyp, tteamLink);
	return ttr;
}

function parseSpielbericht(link, fillTr, tr, heim, typ, teamLink) {
	try {
		var onload = function(doc, ttr, hheim, ttyp, tteamLink) {
			if (!doc)
				return;
			var h2 = doc.body.getElementsByTagName("h2")[2];
			if (!h2) {
				return;
			}
			var datum = /(\d\d.\d\d.\d\d\d\d)/.exec(doc.body.innerHTML)[1];
			var tr = h2.getElementsByTagName("tr");
			var spiele = new Array(8);
			for (var i = 0; i < tr.length; i++) {
				var td = tr[i].getElementsByTagName("td");
				var typ = />(.{2}|.{4})<\/div>/.exec(td[0].innerHTML);

				var bh = td[1].getElementsByTagName("b");
				var bg = td[3].getElementsByTagName("b");
				if (!bg[0] || !bh[0])
					continue;
				var spieler = bh[1] ? [bh[0].innerHTML, bh[1].innerHTML] : [bh[0].innerHTML];
				var gegner = bg[1] ? [bg[0].innerHTML, bg[1].innerHTML] : [bg[0].innerHTML];
				var p1 = />(\d\d) : (\d\d)</.exec(td[5].innerHTML);
				var p2 = />(\d\d) : (\d\d)</.exec(td[6].innerHTML);
				var p3 = />(\d\d) : (\d\d)</.exec(td[7].innerHTML);
				var hSaetze = (p1[1] > p1[2] ? 1 : 0) + (p2[1] > p2[2] ? 1 : 0) + (p3 ? (p3[1] > p3[2] ? 1 : 0) : 0);
				var gSaetze = (p1[1] < p1[2] ? 1 : 0) + (p2[1] < p2[2] ? 1 : 0) + (p3 ? (p3[1] < p3[2] ? 1 : 0) : 0);
				spiele[i] = {
				    type : typ[1],
				    typeNum : i,
				    spieler : [td[1].cloneNode(true), td[3].cloneNode(true)],
				    spieler1 : [spieler[0], gegner[0]],
				    spieler2 : [spieler[1], gegner[1]],
				    saetze : [hSaetze, gSaetze],
				    sieg : (hSaetze > gSaetze ? [1, 0] : [0, 1]),
				    p : [(p3 ? [p1[1], p2[1], p3[1]] : [p1[1], p2[1]]), (p3 ? [p1[2], p2[2], p3[2]] : [p1[2], p2[2]])]
				};
			}
			var sa = [0, 0];
			var si = [0, 0];
			for (var i = 0; i < spiele.length; i++) {
				if (spiele[i]) {
					sa[0] += spiele[i].saetze[0];
					sa[1] += spiele[i].saetze[1];
					si[0] += spiele[i].sieg[0];
					si[1] += spiele[i].sieg[1];
				}
			}
			var bericht = {
			    saetze : sa,
			    sieg : si,
			    spiel : spiele,
			    link : link,
			    datum : datum
			};
			fillTr(bericht, ttr, hheim, ttyp, tteamLink);
		};
		loadDocument(link, onload, tr, heim, typ, teamLink);
	} catch (e) {
		Cu.reportError(errorMsg(e, link));
		return;
	}

}

function makeTitle(title) {
	return create("h1", title, "class", "title");
}
function makeGroupTitle(title, isTabelle) {
	var titleLine = create("h1", title, "class", "title");
	var urlBack;
	var urlForth;
	var num;
	if (!isTabelle) {
		num = getGroupNum(URL);
		urlBack = URL.substr(0, URL.length-9) + SHORT_NAMES[num - 1] + ".HTML";
		urlForth = URL.substr(0, URL.length-(num==0 ? 7 : 9)) + SHORT_NAMES[num + 1] + ".HTML";
	} else {
		num = parseInt(URL.substr(-7, 2), 10) - 1;
		urlBack = URL.substr(0, URL.length-7) + (num <= 9 ? "0" : "") + num + ".HTML";
		urlForth = URL.substr(0, URL.length-7) + ((num + 2) <= 9 ? "0" : "") + (num + 2) + ".HTML";
	}
	var style = "text-decoration: none; color: #ccc";
	if (num > 0)
		titleLine.insertBefore(create("a", "\u25C0 ", "href", urlBack, "style", style), titleLine.firstChild);
	var numNames = NAMES.length;
	if (getSeasonID() > 0)
		numNames--;
	if (num < numNames-1)
		titleLine.appendChild(create("a", " \u25B6", "href", urlForth, "style", style));
	return titleLine;
}

// Gruppenansetzung
function makeAnsetzung() {
	var groupNum = getGroupNum(URL);
	makeHeadLine(groupNum, -1);

	// erstes unnuetzes h2 loeschen
	var h2_0 = BODY.getElementsByTagName("h2")[0];
	h2_0.parentNode.replaceChild(makeGroupTitle("Ansetzungen " + NAMES[groupNum]), h2_0);

	replaceHallenschluessel();

	loadDocument(URL.replace("staffel-", "gegenueber/gegenueber-"), replaceTeamLinks);
}

function replaceTeamLinks(tabelle) {
	try {
		var highlight = function(col, that) {
			var locA = DOC.getElementById("centerstyle").getElementsByTagName("a");
			for (var i = 0; i < locA.length; i++) {
				if (locA[i].getAttribute("href") == that.firstChild.href) {
					locA[i].parentNode.parentNode.setAttribute("class", "bg" + col.substring(1));
				}
			}
		};

		// teams durch links ersetzen und die Teamlinks speichern
		var team = BODY.getElementsByTagName("table")[0].getElementsByTagName("div");
		var teamObj = new Array(20); // rank: nummer innerhalb des vereins (I,II, ...), verein:
		// globale nummer, link: link zu ansetzungen
		var a = tabelle.getElementsByTagName("a");

		var teamNumber = 0;// kurznummer in dieser Tabelle
		for (var i = 0; i < team.length; i++) {
			// leerzeichen alle entfernen, hier werden &nbsp; benutzt, in der Tabelle nur ' '.
			var teamname = team[i].innerHTML.replace(/<b>|&nbsp;|\s*<\/b>\s*/g, " ").replace(/^\s+|\s+$/g, "");
			if (teamname.length > 0 && teamname.length < 3) {
				teamNumber = parseInt(teamname, 10);
			}

			for (var j = 0; j < a.length; j++) {
				var name = a[j].innerHTML.replace(/<b>|\s*<\/b>\s*$|\s+$/g, "");
				if (name.length < 6)
					continue;
				if (name == teamname) {
					var href = a[j].href;
					var newA = create("a", name, "href", href);
					team[i].replaceChild(newA, team[i].firstChild);

					team[i].onmouseover = function() {
						highlight(DARK_YELLOW, this);
					};
					team[i].onmouseout = function() {
						highlight(YELLOW, this);
					};

					teamObj[teamNumber] = {
					    rank : deromanize(name.substring(name.lastIndexOf(" ") + 1)),
					    link : create("a", teamNumber, "href", href, "title", name),
					    verein : parseInt(href.substr(-7, 2), 10)
					};
				}
			}
		}

		// TeamNummern durch links ersetzen und dabei Teamnummern speichern.
		var div = DOC.getElementById("centerstyle").getElementsByTagName("div");
		var nums1 = new Array(div.length);
		var nums2 = new Array(div.length);
		var found = 0;
		// start counting at 2 to skip body centering div and headline
		for (var j = 2; j < div.length; j++) { 
			if (/ \/ /.test(div[j].textContent)) {
				// Ausdruck durch irgendwas ersetzen. Die ersetzen Werte in den klammern () werden
				// dann in $1 und $2 gespeichert
				div[j].textContent.replace(/(\d+) \/ (\d+)/, "");
				var num1 = RegExp.$1;
				var num2 = RegExp.$2;
				replaceChildren(div[j], teamObj[num1].link.cloneNode(true), DOC.createTextNode(" / "),
				        teamObj[num2].link.cloneNode(true));
				nums1[found] = teamObj[num1];
				nums2[found++] = teamObj[num2];
			}
		}

		var makeGameLinks = function(loadedDoc, nums1_, nums2_) {
			try {
				var div = DOC.getElementById("centerstyle").getElementsByTagName("div");
				var directory = loadedDoc.body.textContent;
				var found = 0;
				for (var j = 2; j < div.length; j++) { // start counting at 2 to skip body centering div
					if (/\d\d.\d\d.\d\d\d\d/.test(div[j].textContent)) {
						var t = div[j].textContent;
						var o1 = nums1_[found];
						var o2 = nums2_[found++];
						var spiel1 = (o1.verein < 10 ? "0" : "") + o1.verein + "-" + (o1.rank < 10 ? "0" : "") + o1.rank;
						var spiel2 = (o2.verein < 10 ? "0" : "") + o2.verein + "-" + (o2.rank < 10 ? "0" : "") + o2.rank;
						var link = spiel1 + "_" + spiel2 + ".HTML";
						if (directory && directory.indexOf(link) >= 0) {
							replaceChildren(div[j], create("a", t, "href", WEB + "spielberichte-vereine/" + link));
						}
					}
				}
			} catch(err) {
				Cu.reportError(errorMsg(err));
			}
		};
		// get directory listing, Format=0; Pattern=*-??_??-??.HTML
		var link = WEB + "spielberichte-vereine/?F=0;P=*-??_??-??.HTML";
		loadDocument(link, makeGameLinks, nums1, nums2);
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function replaceHallenschluessel() {
	loadDocument(HALLENSCHLUESSEL_URL, replaceHallenschluesselCallback);
}

function replaceHallenschluesselCallback(hallenDoc) {
	try {
		var div = BODY.getElementsByTagName("div");
		var tr = hallenDoc.getElementsByTagName("tr");
		var halle = Array(100);

		// speichere hallenschluessel in arrays
		var found = 0;
		for (var i = 0; i < tr.length; i++) {
			var f = tr[i].getElementsByTagName("font")[0];
			var d = tr[i].getElementsByTagName("div");
			if (f && d[1] && d[2] && d[3]) {
				halle[found] = {
				    key : f.textContent,
				    street : d[3].textContent.replace(/^\n|<br>|^\s+|\s+$/g, "").replace(/(&nbsp;){2,}/g, " ").replace(
				            "-Nydal-", "-Nydahl-"),
				    PLZ : d[1].textContent.replace(/^\s+/, "") + d[2].textContent.replace("(", " ").replace(")", "")
				};
				found++;
			}
		}

		for (var j = 0; j < div.length; j++) {
			var key = div[j].textContent;
			if (key.length != 2)
				continue;
			for (var i = 1; i < found; i++) {
				var h = halle[i];
				if (key == h.key) {
					div[j].title = (h.street + "\n" + h.PLZ);
					var href = "http://maps.google.de/maps?q=" + h.street.replace(/\s*\n.+/g, "") + ", " + h.PLZ;
					var a = create("a", key, "href", href, "target", "_blank");
					div[j].replaceChild(a, div[j].firstChild);
				}
			}
		}
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function makeSpielbericht() {
	var hasFrame = getIFrame();
	if (!hasFrame) {
		makeHeadLine(-1, -1);
	}
	try {
		// check if correct web page
		if (!/\d\d-\d\d_\d\d-\d\d/.test(DOC.title))
			return;

		removeElements(DOC, "p");
		var h2 = DOC.getElementsByTagName("h2");
		if (h2[5] && h2[5].textContent == "")
			removeElement(h2[5]);
		if (h2[4] && h2[4].textContent == "")
			removeElement(h2[4]);
		removeParent(h2[3]);
		removeParents(h2[2], "b");
		removeParent(h2[1]);
		removeElement(h2[0]);

		var tr = DOC.getElementsByTagName("tr");
		if (!tr || !tr[0])
			return;
		tr[0].appendChild(newParentElement("td", makeLoadStatsButton()));
		var link = WEB + "aufstellung/aufstellung-";
		var heim = URL.substr(URL.length - 16, 2);
		var gast = URL.substr(URL.length - 10, 2);
		var fonts = tr[2].getElementsByTagName("font");
		if (fonts && fonts[2]) {
			var a0 = create("a", fonts[0].textContent, "href", link + heim + ".HTML");
			var a1 = create("a", fonts[1].textContent, "href", link + gast + ".HTML");
			if (hasFrame) {
				a0.target = "_blank";
				a1.target = "_blank";
			}
			replaceChildren(fonts[0], a0);
			replaceChildren(fonts[1], a1);
			replaceChildren(fonts[2], linkToKlasse(fonts[2].innerHTML, hasFrame ? "_blank" : null));
		}

		setElementAttributes(BODY, "table", "width", 820);
		setElementAttributes(BODY.getElementsByTagName("table")[2], "tr", "height", 24);
		setElementAttributes(BODY.getElementsByTagName("table")[2], "td", "style", "padding: 2");
		setElementAttributes(BODY, "table", "style", "border:0", /Spielbericht|Klasse und Staffel|kampflos verloren/);

		if (!hasFrame) {
			var div = create("div", null, "id", "centerstyle", "width", "300px");
			while (BODY.hasChildNodes())
				div.appendChild(BODY.firstChild);
			BODY.appendChild(div);
		}
		adjustIFrameHeight();
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

/**
 * @target: link-target des erzeugten Links
 * @param klasse:
 *            Name einer Klasse als String, darf leerzeichen enthalten.
 * @return HTML-Link zu der Klasse
 */
function linkToKlasse(klasse, target) {
	klasse = klasse.replace(/&nbsp;| /g, "").toLowerCase();
	var name, href;
	for (var i = 0; i < NAMES.length; i++) {
		if (klasse == NAMES[i].replace(/ /g, "").toLowerCase()) {
			name = NAMES[i];
			href = WEB + "tabellen/uebersicht-" + (i < 9 ? "0" : "") + (i + 1) + ".HTML";
		}
	}
	if (!name)
		return false;
	if (target) {
		return create("a", name, "href", href, "target", target);
	}
	return create("a", name, "href", href);
}

function loadPlayerStats(doc) {
	try {
		removeElement(doc.getElementById("loadStats"));
		var isBericht = /gegenueber\/gegenueber-/.test(doc.URL) || /\d\d-\d\d_\d\d-\d\d.HTML$/.test(doc.URL);
		var staemme = /(\d\d)-(\d\d)_(\d\d)-(\d\d).HTML$/.exec(doc.URL);

		var a = doc.body.getElementsByTagName("a");
		for (var i = 0; i < a.length; i++) {
			if (/spielerstatistik\/P-/.test(a[i].href)) {
				var processLink = function(playerDoc, e) {
					var wins = getWinPercentage(playerDoc);
					var f = getFestgespielt(doc, playerDoc); 
					// f = [stammmannschaft, festgespielt, vereinsnummer]
					if (!f)
						return;
					var stamm = f[0] > 0 ? "Stammmannschaft " + romanize(f[0]) : "Ersatz";
					var fest = (f[1] > 0 && f[1] != f[0]) ? ", festgespielt in Mannschaft " + romanize(f[1]) : "";
					// mannschaft innerhalb des vereins vom aktuellen spieler, die gerade spielt
					if (isBericht && staemme) {
						var mannschaft = (parseInt(staemme[1], 10) == f[2]) ? parseInt(staemme[2], 10) : parseInt(
						        staemme[4], 10);
					}
					var slash = (/\//.test(e.textContent)) ? "  /" : "";
					if (isBericht && (f[0] != mannschaft && staemme || !staemme && f[0] == 0)) {
						if (f[1] == 0) {
							e.textContent = e.textContent.replace(/\s+\//, "") + " (E)" + slash;
							e.title = "Ersatz";
						} else {
							e.textContent = e.textContent.replace(/\s+\//, "") + (f[0] == 0 ? " (E" : " (") + f[1]
							        + ")" + slash;
							e.title = stamm + fest;
						}
					}
					if (!isBericht && (f[1] != 0 && f[1] != f[0])) {
						e.textContent = e.textContent.replace(/\s\(\d\)/, "") + (f[0] == 0 ? " (E" : " (") + f[1] + ")";
						e.title = stamm + fest;
					}
					var tr = newElement(doc, "tr");
					tr.appendChild(newElement(doc, "td", null, "class", "bg" + WIN.substr(1), "width", "" + wins + "%"));
					tr.appendChild(newElement(doc, "td", null, "class", "bg" + LOSE.substr(1), "width", "" + (100 - wins)
					        + "%"));
					e.parentNode.insertBefore(
					        newParentElement("table", tr, "height", 5, "width", 100, "class", "stats"), e.nextSibling);
					removeElements(e.parentNode, "br");
					adjustIFrameHeight(doc);
				};
				loadDocument(a[i].href, processLink, a[i]);
			}
		}
		adjustIFrameHeight(doc);
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function getIFrame() {
	if (DOC.defaultView && DOC.defaultView.parent && DOC.defaultView.parent.document) {
		var parent = DOC.defaultView.parent.document;
		var iFrame = parent.getElementById("ifrmErgebnis");
		return iFrame;
	}
	return false;
}

function adjustIFrameHeight() {
	var iFrame = getIFrame();
	// check if this is an iFrame and adjust parent's height
	if (iFrame)
		iFrame.height = (DOC.documentElement.scrollHeight + 40); // leave some space for player
																	// stats
}


function highlight (doc_, that) {
	var j = that.j;
	var table = doc_.body.getElementsByTagName("table");
	var tr = table[1].getElementsByTagName("tr");
	var sp = [0, 0], sa = [0, 0], pu = [0, 0];
	for (var i = 2; i < tr.length; i++) {
		var td = tr[i].getElementsByTagName("td");
		if (!that.name || td[j].textContent.indexOf(that.name) >= 0) {
			if (!that.name) {
				td[j].removeAttribute("style");
			} else {
				td[j].setAttribute("style", that.col1);
			}
			tr[i].setAttribute("style", that.col2);
			var spi = />(\d)</.exec(td[5].innerHTML);
			sp[1 - parseInt(spi[1])]++;
			var sae = /(\d)\s:\s(\d)/.exec(td[6].innerHTML);
			sa = [sa[0] + parseInt(sae[1]), sa[1] + parseInt(sae[2])];
			var reg = /(\d\d):(\d\d)/g;
			var pun;
			var str = td[7].innerHTML;
			while ((pun = reg.exec(str)) !== null) {
				pu[0] += parseInt(pun[1], 10);
				pu[1] += parseInt(pun[2], 10);
			}
		}
	}
	var tr = table[2].getElementsByTagName("tr");
	var descr = tr[0].getElementsByTagName("td")[0];
	replaceChildren(descr, newElement(doc_, "div", (that.name ? that.name : ""), "align", "center", "style",
	        "font-weight:bold; font-size:12"));
	var erg = [sp, , sa, , pu];
	for (var i = 0; i < tr.length - 1; i += 2) {
		var td = tr[i + 1].getElementsByTagName("td");
		td[1].firstChild.textContent = (erg[i][0] + erg[i][1]);
		td[2].firstChild.textContent = erg[i][0];
		td[3].firstChild.textContent = Math.round(1000 * erg[i][0] / (erg[i][0] + erg[i][1])) / 10 + "%";
		td[4].firstChild.textContent = erg[i][1];
		td[5].firstChild.textContent = Math.round(1000 * erg[i][1] / (erg[i][0] + erg[i][1])) / 10 + "%";
		for (var j = 0; j < td.length; j++) {
			if (td[j].getAttribute("bgcolor") == WIN) {
				var w = Math.round(100 * erg[i][0] / (erg[i][0] + erg[i][1]));
				td[j].setAttribute("width", " " + (w == 0 ? 1 : w) + "%");
			}
		}
	}
}



function makeSpieler() {
	makeHeadLine(-1, -1);
	try {
		var h2 = BODY.getElementsByTagName("h2");
		for (var i = 0; i < h2.length; i++) {
			if (/vor dem Namen/.test(h2[i].textContent)) {
				h2[i].replaceChild(create("h2", "Statistik", "style", "margin:20px auto 10px auto; width:780px"), 
				        					  h2[i].getElementsByTagName("table")[1]);
				h2[i].replaceChild(create("div",
								"vor dem Namen steht immer die Stamm-Mannschaft (E = Ersatz)", "style",
				                "margin:-10px auto 0 auto; width:780px; font-size: 12"), h2[i]
				                .getElementsByTagName("table")[0]);
			}
		}


		var table = BODY.getElementsByTagName("table");

		var stand = table[0].getElementsByTagName("td")[1];
		var tr = table[1].getElementsByTagName("tr");
		var name = "" + tr[1].getElementsByTagName("td")[0].textContent;
		// erste spalte "Name" loeschen, und stand hinten anfuegen.
		tr[0].removeChild(tr[0].getElementsByTagName("td")[0]);
		tr[1].removeChild(tr[1].getElementsByTagName("td")[0]);
		tr[0].appendChild(stand);
		setElementAttributes(tr[0], "td", "style", "font-size:10pt;font-weight:bold");
		setElementAttributes(tr[1], "td", "style", "font-size:10pt");
		setElementAttributes(table[1], "tr", "valign", "bottom");
		setElementAttributes(table[1], "td", "width", 0);
		// erste Tabelle durch Namen ersetzen
		table[0].parentNode.replaceChild(create("h1", name), table[0]);

		// Klasse verlinken
		var klasse = table[0].getElementsByTagName("div")[3];
		for (var i = 0; i < NAMES.length; i++) {
			var name1 = NAMES[i].toLowerCase().replace(/\s+/g, "");
			var name2 = klasse.textContent.toLowerCase().replace(/\s+/g, "");
			if (name1 == name2) {
				var a = create("a", klasse.textContent, "href", WEB + "tabellen/uebersicht-"
				        + (i < 9 ? "0" : "") + (i + 1) + ".HTML");
				klasse.replaceChild(a, klasse.firstChild);
				break;
			}
		}

		// ergebnistabelle[4] ist in eine weitere Tabelle[2] geschachtelt -->
		// aeussere Tabelle durch innere ersetzen, und die ueberschrift neumachen.
		table[1].parentNode.replaceChild(table[3], table[1]);
		var t = create("tr", null, "class", "bg" + LIGHT_ORANGE.substr(1));
		t.appendChild(create("td", "H e i m m a n n s c h a f t", "colspan", 8, "style",
		        "font-size:11pt; font-weight:bold"));
		t.appendChild(create("td", " ", "class", "bg" + DARK_ORANGE.substr(1), "style", "border:0"));
		t.appendChild(create("td", "G a s t m a n n s c h a f t", "colspan", 2, "style",
		        "font-size:11pt; font-weight:bold"));
		table[1].insertBefore(t, table[1].firstChild);
		table[1].border = 5;
		table[1].width = 780;

		// Satzsiege/verluste farbig
		var td = table[1].getElementsByTagName("td");
		for (var i = 0; i < td.length; i++) {
			var reg = /(\d) : (\d)/.exec(td[i].innerHTML);
			if (reg) {
				td[i].setAttribute("class", "bg" + (reg[1] > reg[2] ? WIN.substr(1) : LOSE.substr(1)));
				td[i].id = reg[1] > reg[2] ? "win" : "lose";
			}
		}
		tr = table[1].getElementsByTagName("tr");
		for (var i = 2; i < tr.length; i++) {
			var td = tr[i].getElementsByTagName("td");
			for (var j = 0; j < 3; j++) {
				td[j].over = {
				    j : j,
				    name : td[j].textContent,
				    col1 : "background-color:rgba(15, 70, 95, 0.12)",
				    col2 : "background-color:rgba(15, 70, 95, 0.06)"
				};
				td[j].out = {
				    j : j,
				    col1 : "",
				    col2 : ""
				};
				td[j].onmouseover = function() {
					highlight(DOC, this.over);
				};
				td[j].onmouseout = function() {
					highlight(DOC, this.out);
				};
			}
			var reg = /(DE|GD|DD|HE|HD)/.exec(td[3].innerHTML);
			td[3].over = {
			    j : 3,
			    name : reg[1],
			    col1 : "background-color:rgba(15, 70, 95, 0.12)",
			    col2 : "background-color:rgba(15, 70, 95, 0.06)"
			};
			td[3].out = {
			    j : 3,
			    col1 : "",
			    col2 : ""
			};
			td[3].onmouseover = function() {
				highlight(DOC, this.over);
			};
			td[3].onmouseout = function() {
				highlight(DOC, this.out);
			};
		}

		// table[2], table[3] sind text, table[4] die aeussere Tabelle, table[5] ueberschrift
		tr = table[3].getElementsByTagName("tr")[0];
		tr.setAttribute("class", "bg" + DARK_YELLOW.substr(1));
		var td = tr.getElementsByTagName("td");
		td[2].setAttribute("colspan", 2);
		td[3].setAttribute("colspan", 2);
		td[6].setAttribute("colspan", 4);

		var tbody = table[4].getElementsByTagName("tbody")[0];
		tbody.insertBefore(tr, tbody.firstChild);

		table[2].parentNode.replaceChild(table[4], table[2]);
		table[2].cellpadding = 3;
		table[2].setAttribute("bgcolor", "#999999");
		table[2].width = 780;
		table[2].removeAttribute("style");
		setElementAttributes(DOC, "table", "style", "border:0", /Statistik|Ergebnisse je|Stamm-Mannschaft/);
		table[3].setAttribute("style", "border:1px solid #888");
		table[4].setAttribute("style", "border:1px solid #888");
		table[5].setAttribute("style", "border:1px solid #888");
	} catch (e) {
		Cu.reportError(errorMsg(e));
	}
}

function getWinPercentage(doc) {
	if (!doc)
		return -1;
	var table = doc.getElementsByTagName("table");
	if (!table[10] || !table[11] || !table[12])
		return;
	var td = table[10].getElementsByTagName("td");
	var width = /(\d+)%/.exec(td[0].width);
	if (width)
		return width[1];
	return 0;
}

/**
 * return: i>0: Stammspieler in Mannschaft i, i=0: Ersatz, nicht festgespielt, i<0: ersatzspieler,
 * festgespielt in Mannsch. i.
 */
function getFestgespielt(doc1, doc) {
	if (!doc1 || !doc)
		return;
	try {
		var a = doc.getElementsByTagName("a");
		if (!a || !a[0])
			return;
		var verein = a[0].href.substr(-7, 2);
		var stamm = doc.getElementsByTagName("table")[1].getElementsByTagName("div")[2].innerHTML;
		if (stamm == "Ersatz")
			stamm = 0;

		var s = doc.getElementsByTagName("span");
		var mannschaft = new Array(100);
		var num = 0;
		for (var i = 0; i < s.length - 2; i++) {
			if (/^\d\d\.\d\d\.\d\d$/.test(s[i].innerHTML) && /^\d\d$|^\d$/.test(s[i + 2].innerHTML)) {
				var d = s[i].innerHTML;
				var m = parseInt(s[i + 2].innerHTML, 10);
				if (num == 0 || mannschaft[num - 1].day != d || mannschaft[num - 1].mann != m) {
					mannschaft[num] = {
					    day : d,
					    mann : m
					};
					num++;
				}
			}
		}
		if (num < 3)
			return [stamm, 0, verein];
		var ms = Array(num);
		for (var i = 0; i < num; i++) {
			ms[i] = mannschaft[i].mann;
		}
		ms.sort();
		var fest = ms[2];
		if (stamm != 0 && fest != 0 && stamm < fest)
			fest = 0;
		return [stamm, fest, verein];
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function makePlayerLinks() {
	loadDocument(WEB + "spielerstatistik/P-Drop-down-Spieler.HTML", makePlayerLinksCallback, DOC);
}

function makePlayerLinksCallback(playerDoc, doc) {
	try {
		var d = doc.getElementsByTagName("b");
		// load player links from options element and convert to array
		var p = playerDoc.getElementsByTagName("option");
		// convert entries to objects
		p = Array.map(p, function(e) {
			return {
			    name : e.innerHTML.replace(/&nbsp;&nbsp;+\(.*\)/, ""),
			    link : e.value
			};
		});
		// loop over player names in the document
		for (var i = 0; d && i < d.length; i++) {
			var name = d[i].innerHTML.replace(/^\s+|\s+$|(\s\(\d\))/g, "");
			var ext = RegExp.$1 ? RegExp.$1 : "";
			if (!name || name.length < 5 || /</.test(name) || /Additionsregeln/.test(name))
				continue;
			for (var j = 0; j < p.length; j++) {
				// does player name from players list match player name in document?
				if (p[j].name == name) {
					// is player name unique in list?
					if ((!p[j - 1] || p[j - 1].name != p[j].name) && (!p[j + 1] || p[j + 1].name != p[j].name)) {
						replaceChildren(d[i], newElement(doc, "a", name + ext, "href", WEB + "spielerstatistik/"
						        + p[j].link));
						break;
					}
					// name is not unique. Load player's page and check the team name
					if (/aufstellung\/aufstellung-/.test(doc.URL)) {
						var callback = function(playerPage, doc_, name_ext, di, pj) {
							try {
								var ref = playerPage.body.getElementsByTagName("a")[0].href;
								if (ref.substr(-7) == doc_.URL.substr(-7)) {
									replaceChildren(di, newElement(doc_, "a", name_ext, "href", WEB
									        + "spielerstatistik/" + pj.link));
								}
							} catch (err) {
								Cu.reportError(errorMsg(err, "Fehler beim Verlinken von doppelt vorkommenden Spielernamen: "
								        + playerPage.URL));
							}
						};
						loadDocument(WEB + "spielerstatistik/" + p[j].link, callback, doc, name + ext, d[i], p[j]);
					}
				}
			}
		}
	} catch (err) {
		Cu.reportError(errorMsg(err, "Fehler beim Verlinken der Spielernamen."));
	}
}

/**
 * Parse die Seite der Vereine als Objekte mit den Attributen { nr: int, link: html-<a>-Element,
 * name: String }
 */
function parseVereine(vereine) {
	var td = vereine.getElementsByTagName("td");
	var data = new Array(100); // max 100 vereine, sonst auf drei ziffern testen
	var numSets = 0;
	for (var i = 0; i < td.length; i++) {
		if (/>\d\d<|>\d\d\d<$/.test(td[i].innerHTML) && /<div/.test(td[i].innerHTML)) {
			var el = td[i].getElementsByTagName("div")[0];
			var l = td[i + 1].getElementsByTagName("a")[0];
			l.href = "http://bvbb.net/" + l.href.substring(l.href.lastIndexOf("fileadmin"));
			data[numSets] = {
			    nr : parseInt(el.textContent, 10),
			    link : l,
			    name : td[i + 2].textContent
			};
			numSets++;
		}
	}
	data = data.filter(function(e) {
		return e;
	});
	data.sort(function(a, b) {
		return a.name != b.name ? a.name < b.name ? -1 : 1 : 0;
	});
	return data;
}

function loadVereineCallback(loadedDoc, doc, teamNum, ulAuf, ulSpi) {
	try {
		var vereine = parseVereine(loadedDoc);
		// Fill menu with the loaded team list.
		for (var i = 0; i < vereine.length; i++) {
			var ver = vereine[i];
			if (!ver)
				continue;
			var a = newElement(doc, "a", ver.name, "href", WEB + "aufstellung/aufstellung-"
			        + ((ver.nr < 9 ? "0" : "") + (ver.nr)) + ".HTML");
			ulAuf.appendChild(newParentElement("li", a));
			if (ver.nr == teamNum) {
				a.setAttribute("class", "selected");
			}

			a = newElement(doc, "a", ver.name, "href", WEB + "spielberichte-vereine/verein-"
			        + ((ver.nr < 9 ? "0" : "") + (ver.nr)) + ".HTML");
			ulSpi.appendChild(newParentElement("li", a));
			if (ver.nr == teamNum) {
				a.setAttribute("class", "selected");
			}
		}
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function makeHeadLine(groupNum, teamNum) {
	var seasonID = getSeasonID();

	if (MOBILE) {
		groupNum = -1;
		teamNum = -1;
	}
	var ulSeason = create("ul", null);
	var ulTab = create("ul", null);
	var ulAns = create("ul", null);
	var ulGeg = create("ul", null);
	var ulSpi = create("ul", null, "style", "min-width:200px");
	var ulAuf = create("ul", null, "style", "min-width:200px");

	var numNames = NAMES.length;
	if (seasonID > 0)
		numNames--; // keine GKIII vor 2013/14

	var aSeason = create("a", SEASON_NAMES[seasonID], "class", "navigationSelected", "style", "font-weight:600");
	for (var i = 0; i < SEASON_NAMES.length; i++) {
		var target = URL.replace(SEASON_WEB[seasonID], SEASON_WEB[i]);
		ulSeason.appendChild(newParentElement("li", create("a", "Saison " + SEASON_NAMES[i], "href", target)));
	}

	
	// fill group menues;
	for (var i = 0; i < numNames; i++) {
		var l = "tabellen/uebersicht-" + (i < 9 ? "0" : "") + (i + 1);
		ulTab.appendChild(newParentElement("li", create("a", NAMES[i], "href", WEB + l + ".HTML")));
		l = "staffel-" + SHORT_NAMES[i];
		ulAns.appendChild(newParentElement("li", create("a", NAMES[i], "href", WEB + l + ".HTML")));
		l = "gegenueber/gegenueber-" + SHORT_NAMES[i];
		ulGeg.appendChild(newParentElement("li", create("a", NAMES[i], "href", WEB + l + ".HTML")));
	}

	// load teams and fill team menues
	loadDocument(WEB + "spielberichte-vereine/spielbericht-vereine.HTML", loadVereineCallback, DOC, teamNum, ulAuf,
	        ulSpi);

	var aTab = create("a", "Tabelle", "class", "navigationUnselected");
	var aAns = create("a", "Ansetzungen", "class", "navigationUnselected");
	var aGeg = create("a", "Gegen\u00FCberstellung", "class", "navigationUnselected");
	var aSpi = create("a", "Spieltermine", "class", "navigationUnselected");
	var aAuf = create("a", "Aufstellung", "class", "navigationUnselected");
	if (groupNum >= 0) {
		aTab.setAttribute("href", WEB + "tabellen/uebersicht-" + (groupNum < 9 ? "0" : "") + (1 + groupNum) + ".HTML");
		aTab.setAttribute("style", "text-decoration: underline");
		aAns.setAttribute("href", WEB + "staffel-" + SHORT_NAMES[groupNum] + ".HTML");
		aAns.setAttribute("style", "text-decoration: underline");
		aGeg.setAttribute("href", WEB + "gegenueber/gegenueber-" + SHORT_NAMES[groupNum] + ".HTML");
		aGeg.setAttribute("style", "text-decoration: underline");
	}
	if (teamNum >= 0) {
		aSpi.setAttribute("href", WEB + "spielberichte-vereine/verein-" + ((teamNum < 9 ? "0" : "") + teamNum)
		        + ".HTML");
		aSpi.setAttribute("style", "text-decoration: underline");
		aAuf.setAttribute("href", WEB + "aufstellung/aufstellung-" + ((teamNum < 9 ? "0" : "") + teamNum)
		        + ".HTML");
		aAuf.setAttribute("style", "text-decoration: underline");
	}

	var as = [aSeason, aTab, aAns, aGeg, aAuf, aSpi];
	var uls = [ulSeason, ulTab, ulAns, ulGeg, ulAuf, ulSpi];

	var nav = create("ul", null, "role", "menubar");
	for (var i = 0; i < as.length; i++) {
		var li = newParentElement("li", as[i]);
		li.appendChild(uls[i]);
		nav.appendChild(li);
		
		if (!MOBILE) {
			uls[i].setAttribute("class", "desktop");
		}
	}
	var menu = newParentElement("nav", nav, "role", "navigation");

	var td = DOC.getElementsByTagName("td");

	var header = newParentElement("header", menu, "id", "headline");
	header.setAttribute("class", MOBILE ? "mobile" : "desktop");
	for (var i = 0; i < as.length; i++) {
		if (as[i].outerHTML && as[i].href.indexOf(URL.substr(-20)) >= 0) {
			as[i].setAttribute("class", "navigationSelected");
		}
	}

	for (var i = 0; i < td.length; i++) {
		if (/Stand:/.test(td[i].innerHTML)) {
			var stand = td[i].firstChild;
			stand.setAttribute("class", MOBILE ? "standMobile" : "stand");
			if (MOBILE) {
				stand = newParentElement("div", stand, "class", "standMobile");
				BODY.insertBefore(stand, BODY.firstChild);
			} else {
				header.appendChild(stand);
			}
			break;
		}
	}

	if (seasonID != 0) { 
		var c = DOC.getElementById("centerstyle"); 
		c.insertBefore(newElement(DOC, "h1", "Saison " + SEASON_NAMES[seasonID], "class", "title", "style", "color:#C55"), c.firstChild);
	}
	BODY.insertBefore(header, BODY.firstChild);
	return header;
}

function parseAnsetzung(doc, ansetzungen) {
	alert(doc + "   " + doc.URL);
	var tr = doc.getElementsByTagName("h2")[0].getElementsByTagName("tr");
	if (!ansetzungen)
		return;
	// team-Tabelle parsen und die Teamlinks speichern
	var div = ansetzungen.body.getElementsByTagName("h2")[1].getElementsByTagName("div");

	// rank: nummer innerhalb des vereins (I,II, ...), verein: globale nummer, link: link zu ansetzungen
	var teamObj = new Array(20); 

	var teamNumber = 0;// kurznummer in dieser Tabelle
	for (var i = 0; i < div.length; i++) {
		// leerzeichen alle entfernen, hier werden &nbsp; benutzt, in der Tabelle nur ' '.
		var nameI = div[i].innerHTML.replace(/<b>|<i>|&nbsp;|<\/b>|<\/i>/g, " ").replace(/^\s+|\s+$/g, "");
		if (nameI.length > 0 && nameI.length < 3) {
			teamNumber = parseInt(nameI, 10);
			continue;
		}
		for (var j = 2; j < tr.length; j++) {
			var a = tr[j].getElementsByTagName("a")[0];
			var nameJ = a.innerHTML.replace(/<b>|\s*<\/b>\s*$|\s+$/g, "");
			if (nameJ.length < 6)
				continue;
			if (nameJ == nameI) {
				var href = a.getAttribute("href");
				teamObj[teamNumber] = {
				    rank : deromanize(nameJ.substring(nameJ.lastIndexOf(" ") + 1)),
				    link : "<a title='" + nameJ + "' href='" + href + "'>" + teamNumber + "</a>",
				    verein : parseInt(href.substr(-7, 2), 10),
				    tabellenPlatz : j - 2
				};
			}
		}
	}
	teamObj = teamObj.filter(function(e) {
		return e;
	});

	var num1;
	var num2;
	var ansetzung = new Array(200);
	var numAns = 0;
	var div = ansetzungen.body.getElementsByTagName("div");
	for (var j = 0; j < div.length; j++) {
		var ex = /^(\d+) \/ (\d+)$/.exec(div[j].innerHTML);
		if (ex) {
			num1 = ex[1];
			num2 = ex[2];
		}
		if (/\d\d.\d\d.\d\d\d\d/.test(div[j].innerHTML)) {
			// num1 und num2 sind noch von der letzten Zelle belegt
			ansetzung[numAns++] = {
			    t1 : teamObj[num1 - 1].tabellenPlatz,
			    t2 : teamObj[num2 - 1].tabellenPlatz,
			    date : div[j].textContent,
			    time : div[j + 1].textContent,
			    loc : div[j + 2].textContent
			};
		}
	}
	return ansetzung.filter(function(e) {
		return e;
	});
}

function makeTabelle() {
	var groupNum = parseInt(URL.substr(-7, 2), 10) - 1;
	makeHeadLine(groupNum, -1);

	var h2 = BODY.getElementsByTagName("h2")[0]; // uebersicht
	h2.parentNode.replaceChild(makeGroupTitle("Spielstand " + NAMES[groupNum], true), h2);

	removeElements(BODY, "p", /Vorheriger/);
	removeElements(BODY, "h2", /Aufsteiger|Ergebniss-Link|Fenster schlie/);

	var table = BODY.getElementsByTagName("table");
	if (table[1] && table[1].getElementsByTagName("tr")[0]) {
		removeElement(table[1]);
	}

	var td = BODY.getElementsByTagName("td");
	var kampflos = false; // erschien "kampflos schon in einer Zelle?"
	for (var i = 0; i < td.length; i++) {
		if (td[i].width && td[i].width == 30) {
			td[i].width = 40;
		}
		if (kampflos) {
			td[i].height = 30;
		}
		kampflos |= /kampflos/.test(td[i].innerHTML);
	}

	removeParents(DOC, "b");

	// iFrame hinzufuegen
	if (getPref("useIframe")) {
		var ifrm = create("iframe", null, "id", "ifrmErgebnis", "class", "ifrmErgebnis", "name", "Ergebnis",
		        "seamless", "true");
		DOC.getElementById("centerstyle").appendChild(ifrm);

		// setze target der Links auf "Ergebnis", wenn sie auf ein Spielbericht zeigen.
		var links = BODY.getElementsByTagName("a");
		for (var i = 0; i < links.length; i++) {
			if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(links[i].href))
				links[i].target = "Ergebnis";
		}
	}
	var urlAns = URL.replace(/tabellen\/uebersicht-\d\d/, "staffel-" + SHORT_NAMES[groupNum]);
	loadDocument(urlAns, insertAnsetzungen, DOC);
}

function insertAnsetzungen(ansetzungen, doc) {
	try {
		var spiele = parseAnsetzung(doc, ansetzungen);
		if (spiele) {
			var verein = new Array(10);
			var gespielt = [new Array(10), new Array(10), new Array(10), new Array(10), new Array(10),
			                new Array(10), new Array(10), new Array(10), new Array(10), new Array(10)];
			var tr = doc.body.getElementsByTagName("tr");
			for (var i = 0; i < tr.length - 2; i++) {
				var td = tr[i + 2].getElementsByTagName("td");
				verein[i] = td[1].textContent;
				for (var j = 0; j < td.length - 6 - 1; j++) {
					var cell = td[j + 6];
					var div = cell.getElementsByTagName("div")[0];
					if (cell.getAttribute("bgcolor") == ORANGE || /\d : \d.*\d : \d/.test(div.innerHTML)) { 
						// faellt aus oder beide gespielt
						if (cell.getAttribute("bgcolor") == ORANGE) {
							gespielt[i][j] = -1;
							continue;
						}
						var a = cell.getElementsByTagName("a")[0];
						if (a) {
							gespielt[i][j] = a;
						} else {
							gespielt[i][j] = cell.getElementsByTagName("font")[0];
						}
						continue;
					}

					var br = div.appendChild(create("br"));

					if (cell.getAttribute("valign") == "top" || /0 : 8\s*<br>|8 : 0\s*<br>/.test(div.innerHTML)) {
						// Heimspiel gewesen
						gespielt[i][j] = cell.getElementsByTagName("a")[0];
						if (!gespielt[i][j])
							gespielt[i][j] = cell.getElementsByTagName("font")[0];
						var date = dateFromSpiele(spiele, j, i);
						if (date) {
							removeParents(div, "br");
							div.appendChild(br);
							div.appendChild(date);
						}
						continue;
					}
					if (cell.getAttribute("valign") == "bottom" || /<br><font color="#FF6600"/.test(div.innerHTML)) { 
						// auswaerts gewesen
						var date = dateFromSpiele(spiele, i, j);
						if (date) {
							removeParents(div, "br");
							div.insertBefore(br, div.firstChild);
							div.insertBefore(date, div.firstChild);
						}
						continue;
					}
					// nix gewesen
					var hDate = dateFromSpiele(spiele, i, j);
					var aDate = dateFromSpiele(spiele, j, i);
					replaceChildren(div, hDate, br, aDate);
				}
			}
			spiele = spiele.sort(function(spiel1, spiel2) {
				return spiel1.date.replace(/(\d\d).(\d\d).(\d\d\d\d)/, "$3$2$1") + spiel1.time > spiel2.date.replace(
				        /(\d\d).(\d\d).(\d\d\d\d)/, "$3$2$1")
				        + spiel2.time;
			});
			var bald = spiele.filter(function(s) {
				return !gespielt[s.t1][s.t2];
			});
			var vorbei = spiele.filter(function(s) {
				return gespielt[s.t1][s.t2] && gespielt[s.t1][s.t2] != -1;
			});
			var numLines = 4;

			var tbody = create("tbody");
			var hidden = "visibility:collapse";
			var shown = "font-size:11pt; font-weight:bold";

			var showHide = function(that) {
				try {
					var show = (that.getAttribute("name") == "show");
					// down/right-pointing triangle
					that.ownerDocument.getElementById("mehr").textContent = show ? "\u25BC " : "\u25BA ";
					var e = that.nextSibling;
					while (e) {
						e.setAttribute("style", show ? shown : hidden);
						e = e.nextSibling;
					}
					that.setAttribute("name", show ? "hide" : "show");
				} catch (err2) {
					Cu.reportError(errorMsg(err2));
				}
			};

			var head = create("td", null, "colspan", 2, "style",
			        "cursor: pointer; font-size:9pt; font-weight:bold", "class", "bg" + DARK_YELLOW.substr(1));

			var font = create("font", null, "id", "mehr");
			font.textContent = "\u25BA "; // right-pointing triangle
			head.appendChild(font);
			head.appendChild(create("u", "Aktuelle Termine (laut Ansetzung)"));
			var tr = newParentElement("tr", head, "name", "show");
			tr.onclick = function() {
				showHide(this);
			};
			tbody.appendChild(tr);
			tr = newParentElement("tr", create("td", "K\u00FCrzlich", "style",
			        "font-size:11pt; font-weight:bold"), "class", "bg" + DARK_YELLOW.substr(1), "style", hidden);
			tr.appendChild(create("td", "Demn\u00E4chst", "style", "font-size:11pt; font-weight:bold"));
			tbody.appendChild(tr);

			// array of new lines
			tr = new Array(numLines);
			for (var i = 0; i < numLines; i++) {
				tr[i] = create("tr", null, "style", hidden);
			}

			// kuerzlich
			for (var i = Math.max(0, vorbei.length - numLines); i < vorbei.length; i++) {
				var s = vorbei[i];
				var a = gespielt[s.t1][s.t2].cloneNode(true);
				var td1 = create("td", null, "style", "padding-right:20; padding-bottom:0");
				a.textContent = a.textContent.replace(/\s+$/, "");
				td1.appendChild(doc.createTextNode(s.date.replace(/.20/, ".") + ": "));
				td1.appendChild(create("b", verein[s.t1]));
				td1.appendChild(doc.createTextNode(" spielt "));
				td1.appendChild(a);
				td1.appendChild(doc.createTextNode(" gegen "));
				td1.appendChild(create("b", verein[s.t2]));
				tr[i - Math.max(0, vorbei.length - numLines)].appendChild(td1);
			}

			// demnaechst
			for (var i = 0; i < Math.min(numLines, bald.length); i++) {
				var s = bald[i];
				var td2 = create("td", null, "style", "padding-right:10; padding-bottom:0");
				td2.appendChild(doc.createTextNode(s.date.replace(/.20/, ".") + ": "));
				td2.appendChild(create("b", verein[s.t1]));
				td2.appendChild(doc.createTextNode(" empf\u00E4ngt "));
				td2.appendChild(create("b", verein[s.t2]));
				td2.appendChild(create("br"));
				tr[i].appendChild(td2);
			}
			var table = newParentElement("table", tbody, "cellpadding", 4, "class", "borderless");
			for (var i = 0; i < numLines; i++) {
				tbody.appendChild(tr[i]);
			}
			doc.getElementById("centerstyle").insertBefore(newParentElement("p", table),
			        doc.body.getElementsByTagName("table")[0].parentNode);
		}
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

function dateFromSpiele(spiele, i, j) {
	var spiel = spiele.filter(function(el) {
		return el.t1 == i && el.t2 == j;
	})[0];
	if (!spiel)
		return;
	var date = spiel.date.substr(0, spiel.date.length - 4);
	return create("a", date, "class", "col" + ORANGE.substr(1));
}

/**
 * Change colors, set Stylesheet,
 */
function makeStyle() {
	// center page
	if (!/\d\d-\d\d_\d\d-\d\d.HTML$/.test(URL)) {
		var div = create("div", null, "id", "centerstyle");
		while (BODY.hasChildNodes())
			div.appendChild(BODY.firstChild);
		BODY.appendChild(div);
	}

	removeParents(DOC, "i");
	removeElements(DOC, "style");
	removeElements(BODY, "h2", /Fenster schlie/);
	removeElements(BODY, "table", /Fenster schlie/);


	// set css class when color attributes are present
	var deleteLeadingHash = function(c) { return c.substring(1); }
	var cols = COLORS.map(deleteLeadingHash);
	var elem = BODY.getElementsByTagName("*");
	for (var j = 0; j < elem.length; j++) {
		var e = elem[j];
		if (e.getAttribute("border") == "0" || e.getAttribute("style") == "border:0")
			e.setAttribute("class", "borderless");
		var bgcol = e.getAttribute("bgcolor");	
		var fgcol = e.getAttribute("color");
		for (var i = 0; i < COLORS.length; i++) {
			if (bgcol == COLORS[i])
				e.setAttribute("class", "bg" + cols[i]);
			if (fgcol == COLORS[i])
				e.setAttribute("class", e.getAttribute("class") + " col" + cols[i]);
		}
	}

	var link = DOC.createElement("link");
	link.id = "style";
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = "chrome://bvbbpp/skin/skin.css";
	DOC.head.appendChild(link);

	if (!MOBILE) {
		link = DOC.createElement("link");
		link.id = "fonts";
		link.media = "all";
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = "http://fonts.googleapis.com/css?family=Open+Sans:400,600|subset=latin,latin-ext";
		DOC.head.appendChild(link);
	}
	var icon = DOC.createElement("link");
	icon.id = "icon";
	icon.rel = "shortcut icon";
	icon.href = "http://www.bvbb.net/fileadmin/user_upload/pics/logo.jpg";
	DOC.head.appendChild(icon);
}

function run(evt) {
	if (!evt || !evt.target || !evt.target.URL || !evt.target.body)
		return;
	try {
		DOC = evt.target;
		URL = DOC.URL;
		BODY = DOC.body;
		if (!PAGE_TEST.test(URL) || URL.indexOf("view-source:") >= 0)
			return;
		if (!BODY.firstChild || DOC.getElementById("bvbbBody"))
			return;

		WEB_SHORT = "bvbb.net/fileadmin/user_upload/" + SEASON_WEB[getSeasonID()] + "/meisterschaft";
		WEB = "http://" + WEB_SHORT + "/";

		// avoid processing the same file twice (for example, when embedded in an iframe)
		BODY.id = "bvbbBody";

		makeStyle();

		if (!getIFrame()) {
			setElementAttributes(BODY, "a", "target", "_self", /_blank/);
		}

		if (/meisterschaft\/staffel-/.test(URL)) {
			makeAnsetzung();
		}
		if (/gegenueber\/gegenueber-/.test(URL)) {
			makeGegenueber();
		}
		if (/aufstellung\/aufstellung-/.test(URL)) {
			makeAufstellung();
		}
		if (/spielberichte-vereine\/verein-/.test(URL)) {
			makeVerein();
		}
		if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(URL)) {
			makeSpielbericht();
		}
		if (/uebersicht/.test(URL)) {
			makeTabelle();
		}
		if (/spielerstatistik\/P-/.test(URL)) {
			makeSpieler();
		}
	} catch (err) {
		Cu.reportError(errorMsg(err));
	}
}

var windowListener = {
    onOpenWindow : function(aWindow) {
	    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(
	            Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    domWindow.addEventListener("DOMContentLoaded", run, false);
    },
    onCloseWindow : function(aWindow) {
	    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(
	            Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    domWindow.removeEventListener("DOMContentLoaded", run, false);
    },
    onWindowTitleChange : function(aWindow, aTitle) {
    }
};

function startup(aData, aReason) {
	Cu.import("chrome://bvbbpp/content/utils.jsm");

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
			if (uri.indexOf(WEB_SHORT) >= 0) {
				tab.reload();
			}
		}
	}
}

function shutdown(aData, aReason) {
	// When the application is shutting down we normally don't have to clean
	// up any UI changes made
	if (aReason == APP_SHUTDOWN)
		return;
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
	if (typeof romanize != "undefined")
		Cu.unload("chrome://bvbbpp/content/utils.jsm");
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