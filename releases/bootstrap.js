const Cc = Components.classes;
const Ci = Components.interfaces;

var STYLE = "select {background-color: #FF9900} "+
			"a { font-weight:600; }";


// constants
var WEB = "http://bvbb.net/fileadmin/user_upload/schuch/meisterschaft/";
var WIDTH = "'300px'";
var rendering = false;
var prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.bvbbpp.");
var SHORT_NAMES = ["BB", "LL-1", "LL-2", "BZ-1", "BZ-2", "AK-1", "AK-2", "BK-1", "BK-2", "CK-1", 
                  "CK-2", "DK-1", "DK-2", "EK-1", "EK-2", "FK-1", "FK-2", "GK-1", "GK-2"];
var NAMES = ["Berlin-Brandenburg-Liga", "Landesliga I", "Landesliga II", "Bezirksklasse I", "Bezirksklasse II", 
             "A-Klasse I", "A-Klasse II", "B-Klasse I", "B-Klasse II", "C-Klasse I", "C-Klasse II", "D-Klasse I",
             "D-Klasse II", "E-Klasse I", "E-Klasse II", "F-Klasse I", "F-Klasse II", "G-Klasse I", "G-Klasse II"];
var JUMPTO = "function jumpto(x){" + 
				"if (document.form1.jumpmenu.value != 'null') { "+
					"document.location.href = x;" + 
				"}" +
			"}"; 

var OCHRE		= { old: "#CC9933",  newcol:"#A2ADBC", col:"#FFFFFF"};
var LIGHT_YELLOW= { old: "#FFFFCC",  newcol:"#FAFAF7", col:"#FFFFFF"};
var YELLOW 		= { old: "#FFFF66",  newcol:"#F6F4DA", col:"#FFFFFF"};
var MIX_YELLOW  = { old: "#F7F733",  newcol:"#E7EBDD", col:"#FFFFFF"};
var DARK_YELLOW = { old: "#F0F000",  newcol:"#D9E2E1", col:"#FFFFFF"};
var LIGHT_ORANGE= { old: "#FFCC33",  newcol:"#A2ADBC", col:"#FFFFFF"};
var ORANGE 		= { old: "#FF9900",  newcol:"#A2ADBC", col:"#FFFFFF"};
var DARK_ORANGE = { old: "#CC9933",  newcol:"#727B84", col:"#FFFFFF"};
var AUFSTEIGER	= { old: "#00CC00",  newcol:"#89E291", col:"#FFFFFF"};
var ABSTEIGER	= { old: "#FF6633",  newcol:"#DF9496", col:"#FFFFFF"};
var ZURUECK		= { old: "#FF0022",  newcol:"#DF9496", col:"#FFFFFF"};
var WIN			= { old: "#33FF00",  newcol:"#89E291", col:"#FFFFFF"};
var LOSE		= { old: "#FF0000",  newcol:"#DF9496", col:"#FFFFFF"};
var FRAME_TOP	= { old: "#D8D8D8",  newcol:"#2F3E3E", col:"#FFFFFF"};
var FRAME_BOTTOM= { old: "#474747",  newcol:"#2F3E3E", col:"#FFFFFF"};
var KAMPFLOS	= { old: "#FF6600",  newcol:"#DF9496", col:"#FFFFFF"};


var COLORS = [YELLOW, LIGHT_YELLOW, MIX_YELLOW, DARK_YELLOW, LIGHT_ORANGE, ORANGE, DARK_ORANGE, AUFSTEIGER, ABSTEIGER, ZURUECK, WIN, LOSE, FRAME_TOP, FRAME_BOTTOM];
//var COLORS = [];

// extend DOM so that array methods can be used on NodeLists
for (prop in Array.prototype){
	if (Array.prototype.hasOwnProperty(prop) && typeof(Array.prototype[prop]) === 'function') {
		NodeList[prop] = Array.prototype[prop];
	}
}

function autorun (evt) {
	if (rendering || !evt.target || !evt.target.URL)
		return;
	if (evt.target.URL.indexOf("bvbb.net/fileadmin/user_upload/schuch/meisterschaft") < 0)
		return;
	rendering = true;
	try {
		run(evt.target);
//		error(evt.target, null, "hallo");
	} catch (e) {
		if (evt.target.body) {
			error(evt.target, e);
		}
	}
	rendering = false;
}

function append(e) {
	for (var i=1; i<arguments.length; i++) {
		e.appendChild(arguments[i]);
	}
	return e;
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
		e.innerHTML = innerHTML;
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

function alert(doc, msg) {
	doc.body.insertBefore(newElement(doc, "p", msg), doc.body.firstChild);
};

function error(doc, e, msg) {
	var text = doc.createTextNode("Error in line " + e.lineNumber + ": " + e.message + " " + (msg?msg:""));
	var font = newParentElement("font", text, "size", "3");
	var p = newParentElement("p", font);
	doc.body.insertBefore(p, doc.body.firstChild);
};

function makeAufstellung(doc) {
	var body = doc.body;
	if (!body || !body.firstChild)
		return;

	var data = loadVereine(doc);
	var teamNum = doc.URL.substr(-7, 2);
	var headLine = makeTeamHeadLine(doc, teamNum, data);

	var	h2 = body.getElementsByTagName("h2");
	h2[0].parentNode.replaceChild(headLine, h2[0]);

	if (!prefManager.getBoolPref("schonen")) {
		h2[0].appendChild(doc.createElement("br"));
		h2[0].appendChild(makeLoadStatsButton(doc));
	}

	// diese Auswahl muss woch nach makeLoadStatsButton(doc) kommen. Warum eigentlich?
	var sel = doc.getElementById('teamSelect');
	if (sel) {
		for (var i=0; i<data.length; i++) {
			if (data[i] && parseInt(data[i].nr, 10) == teamNum) {
				sel.selectedIndex = i;
			}
		}
	}
	
	if (!prefManager.getBoolPref("schonen"))
		makePlayerLinks(doc);
		
	var f = body.getElementsByTagName("font");
	for (var i=0; i<f.length; i++) {
		var link = linkToKlasse(doc, f[i].innerHTML);
		if (link) {
			f[i].replaceChild(link, f[i].firstChild);
		}
	}
}

function setElementAttributes(doc, tag, attribute, value, regex) {
	var e = doc.getElementsByTagName(tag);
	for (var i=0; i<e.length; i++) {
		if (!regex || regex.test(e[i].outerHTML)) {
			e[i].setAttribute(attribute, value);
		}
	}
}

function makeVerein(doc) {
	var body = doc.body;
	if (!body || !body.firstChild)
		return;

	var data = loadVereine(doc);
	var teamNum = doc.URL.substr(-7, 2);
	var headLine = makeTeamHeadLine(doc, teamNum, data);

	var	h2 = body.getElementsByTagName("h2");
	if (h2[0]) {
		h2[0].parentNode.replaceChild(headLine, h2[0]);
	}
	var	span = body.getElementsByTagName("span");
	for (var i=span.length-1; i>=0; i--) {
		var font = newElement(doc, "font", null, "size", 2);
		font.appendChild(span[i].firstChild);
		span[i].parentNode.replaceChild(font, span[i]);
	}

	// diese Auswahl muss woch nach makeLoadStatsButton(doc) kommen. Warum eigentlich?
	var sel = doc.getElementById('teamSelect');
	if (sel) {
		for (var i=0; i<data.length; i++) {
			if (data[i]  && parseInt(data[i].nr, 10) == teamNum) {
				sel.selectedIndex = i;
			}
		}
	}

	setElementAttributes(doc.body, "table", "style", "border:0", /Mannschaft/);

	// Vereine Verlinken
	var td = body.getElementsByTagName("td");
	for (var i=0; i<td.length; i++) {
		if (!/<|\d\d:\d\d|^\w$/.test(td[i].innerHTML)) {
			for (var j=0; j<data.length; j++) {
				var shortName = data[j].link.firstChild.innerHTML;
				if (td[i].innerHTML.indexOf(shortName) >= 0) {
					var num = / [IVX]+$/.exec(td[i].innerHTML)[0];
					var l = newElement(doc, "a", shortName + num, 
									   "href", "http://bvbb.net/" + data[j].link, 
									   "title", data[j].name + num);
					replaceChildren(td[i], l);
					break;
				}
			}
		}
	}

	if (!prefManager.getBoolPref("schonen"))
		replaceHallenschluessel(doc);
}


function parseSpielbericht(docu, link) {
	try {
		var doc = loadDocument(docu, link);
		var h2 = doc.body.getElementsByTagName("h2")[2];
		if (!h2) {
			return;
		}
		var datum = /(\d\d.\d\d.\d\d\d\d)/.exec(doc.body.innerHTML)[1];
		var tr = h2.getElementsByTagName("tr");
		var spiele = new Array(8);
		for (var i=0; i<tr.length; i++) {
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
			var hSaetze = (p1[1] > p1[2] ? 1 : 0)  + (p2[1] > p2[2] ? 1 : 0) + (p3 ? (p3[1] > p3[2] ? 1 : 0) : 0);
			var gSaetze = (p1[1] < p1[2] ? 1 : 0)  + (p2[1] < p2[2] ? 1 : 0) + (p3 ? (p3[1] < p3[2] ? 1 : 0) : 0);
			spiele[i] = {
				type: typ[1],
				typeNum: i,
				spieler: [td[1].innerHTML, td[3].innerHTML],
				spieler1: [spieler[0], gegner[0]],
				spieler2: [spieler[1], gegner[1]],
				saetze: [hSaetze, gSaetze],
				sieg: (hSaetze > gSaetze ? [1,0]:[0,1]),
				p: [(p3 ? [p1[1], p2[1], p3[1]] : [p1[1], p2[1]]), (p3 ? [p1[2], p2[2], p3[2]] : [p1[2], p2[2]])]
			};
		}
		var hSa = 0;
		var gSa = 0;
		var hSi=0;
		var gSi=0;
		for (var i=0; i<spiele.length; i++) {
			if (spiele[i]) {
				hSa += spiele[i].hSaetze; 
				gSa += spiele[i].gSaetze; 
				hSi += spiele[i].hSieg; 
				gSi += spiele[i].gSieg;
			}
		}
	} catch (e) {
		error(docu, e, link);
		return;
	}
	
	return { hSaetze: hSa, gSaetze: gSa, hSieg: hSi, gSieg: gSi, spiel: spiele , link: link, datum: datum};
}
	
	
/**
 * Lade den Datensatz der Vereine, als von Objecten mit Attributen 
 * nr: int, 
 * link: html-<a>-Element, 
 * name: String
 * shortName: String
 */
function loadVereine(doc) {
	var vereine = loadDocument(doc, WEB + "spielberichte-vereine/spielbericht-vereine.HTML");
	var td = vereine.getElementsByTagName("td");
	var data = new Array(100); // max 100 vereine, sonst auf drei ziffern testen
	var numSets = 0;
	for (var i=0; i<td.length; i++) {
		if (/>\d\d<|>\d\d\d<$/.test(td[i].innerHTML) && td[i].innerHTML.indexOf("<div") >= 0) {
			var el = td[i].getElementsByTagName("div")[0];
			var l = td[i+1].getElementsByTagName("a")[0];
			data[numSets] = {
			                 nr:   el.innerHTML,
							 link: l,
							 name: td[i+2].innerHTML
							};
			numSets++;
		}
	}
	data = data.filter(function(e) { return e} );
    data.sort(function (a,b) { return a.name!=b.name ? a.name<b.name ? -1 : 1 : 0; });
	return data;
}

     
/**
 * Get HTML-String to a loadStats button 
 */
function makeLoadStatsButton(doc) {
	doc.addEventListener('loadStats', loadPlayerStats, false);			
	var input = doc.createElement("input");
	input.setAttribute("type", "button");
	input.setAttribute("id", "loadStats");
	input.setAttribute("value", "Spielerstatistik laden");
	input.setAttribute("onClick", "document.dispatchEvent(" + 
				      "new CustomEvent(\"loadStats\", {\"detail\": {\"doc\":document}}));");
	return input;
}

function getGroupNum(url) {
	var groupName = url.substr(-9, 4);
	for (var i = 0; i<SHORT_NAMES.length; i++) {
		if (SHORT_NAMES[i] == groupName) 
			return i;
	}
	// wenn nix trifft, dann wars wohl BB (hat nur 2 Buchstaben)
	return 0;
}

function makeGegenueber(doc) {
	if (!doc.body || !doc.body.firstChild)
		return;

	var groupNum = getGroupNum(doc.URL);
	var headLine = makeHeadLine(doc, groupNum);
	var h2 = doc.body.getElementsByTagName("h2");
	h2[1].parentNode.removeChild(h2[1]);
	h2[0].parentNode.replaceChild(headLine, h2[0]);
	var sel = doc.getElementById('groupSelect');
	sel.selectedIndex = groupNum;
	
	
	if (!prefManager.getBoolPref("schonen")) {
		doc.addEventListener('gegenueber', function(e) { makeGegenueberStats(doc, e.detail); }, false);			
	
		var tr = doc.getElementsByTagName("tr");
		for (var i=0; i<tr.length-1; i++) {
			var td = tr[i+1].getElementsByTagName("td");
			for (var j=0; j<td.length-1; j++) {
				td[j].innerHTML = td[j].innerHTML.replace(/(\d+):(\d+)/, "<a style='cursor: pointer' onclick='"+
				   "document.dispatchEvent(new CustomEvent(\"gegenueber\", "+
				   "{\"detail\": {\"team\":" + i + ", \"game\":" + (j-2) + ", \"sum1\":$1, \"sum2\": $2}}));'><u><font color='#00007F'>$1:$2</font></u></a>");
			}
		}
	}
}

function makeGegenueberStats(doc, e) {
	try {
		var groupNum = getGroupNum(doc.URL);
		
		// schon vorhandene Elemente aufraeumen
		var elem;
		if (elem = doc.getElementById('gegenueberstats')) elem.parentNode.removeChild(elem);
		if (elem = doc.getElementById('teamLink')) elem.parentNode.removeChild(elem);
		if (elem = doc.getElementById('klick')) elem.parentNode.removeChild(elem);
		if (elem = doc.getElementById('fehlen')) elem.parentNode.removeChild(elem);
		var body = doc.getElementById('centerstyle')
	
		var tr = doc.getElementsByTagName("table")[0].getElementsByTagName("tr");
		var td = tr[(e.team+1)].getElementsByTagName("td");
		var team = /-(\d\d).HTML/.exec(td[1].innerHTML)[1];
		var teamNum = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(td[1].innerHTML)[1]);
	
		var teamI = /-(\d\d).HTML/.exec(td[1].innerHTML)[1];
		var teamNumI = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(td[1].innerHTML)[1]);
		var teamStrI = teamI + "-" + (teamNumI<10? "0" : "") + teamNumI;
		
		var teamLink = Array(tr.length-1);
		var berichte = Array(2*(tr.length-1));
		var rows = 0;
		
		var next = "</b></td><td style='font-size: 10pt'><b>";
		var table = "<table id='gegenueberstats' bgcolor='"+ YELLOW.col + "' border=1 cellpadding=6><tbody>";
		table += "<tr bgcolor='" + LIGHT_ORANGE.col + "'align='center'><td style='font-size: 10pt'><b>Gegnerischer Verein" + next + "Datum" + next + "Ort" + next + "Spieler" + next + "Gegner" + next + 
				 "Sätze" + "</b></td><td colspan=3><b>" + "Punkte" + "</b></td></tr>";
		table += "</tr></tbody></table>";		
		var html = "<table style='border:0' id='teamLink'><tbody><tr><td width='300px'><div><h4><b id='linkAndType'>"+ "" +"</b></h4></div></td>";
		html += "<td>&nbsp;&nbsp;&nbsp;" + makeLoadStatsButton(doc).outerHTML + "</td></tr></tbody></table>";

		
		html += table;
		html += "<span id='klick'>Klick auf den Vereinsnamen führt zum Spielbericht.</br></span>";
		body.innerHTML += html;

		var sel = doc.getElementById('groupSelect');
		sel.selectedIndex = groupNum;

		

		var tab = doc.getElementById('gegenueberstats');
		for (var j=0; j<tr.length-1; j++) {
			teamLink[j] = /<b>(.*)\s+<\/b>/.exec(tr[(j+1)].innerHTML)[1];
			if (j == e.team)
				continue;
			var innerJ = tr[(j+1)].getElementsByTagName("td")[1].innerHTML;
			var teamJ = /-(\d\d).HTML/.exec(innerJ)[1];
			var teamNumJ = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(innerJ)[1]);
			var teamStrJ = teamJ + "-" + (teamNumJ<10? "0" : "") + teamNumJ;
			berichte[2*j]   = parseSpielbericht(doc, WEB + "spielberichte-vereine/"+ teamStrI + "_" + teamStrJ + ".HTML");
			if (berichte[2*j]) {
				var row = makeTrFromBericht(berichte[2*j], 2*j, e.game, teamLink);
//				alert(doc, row);
				if (row && row.length > 0) {
					tab.innerHTML += row; 
					rows++;
				}
			}
			berichte[2*j+1] = parseSpielbericht(doc, WEB + "spielberichte-vereine/"+ teamStrJ + "_" + teamStrI + ".HTML");
			if (berichte[2*j+1]) {
				var row = makeTrFromBericht(berichte[2*j+1], 2*j+1, e.game, teamLink);
				if (row && row.length > 0) {
					tab.innerHTML += row; 
					rows++;
				}
			}
		}
		var type = ["1. HE", "2. HE", "3. HE", "DE", "1. HD", "2. HD", "DD", "GD"][e.game]; 
		doc.getElementById('linkAndType').innerHTML += teamLink[e.team].replace(/\s+</, "<") + ",&nbsp;&nbsp;" + type;
		if (e.sum1 + e.sum2 > rows)
			body.innerHTML += "<span id='fehlen'>Fehlende Spiele wurden eventuell nicht gewertet!</span>";
		var sel = doc.getElementById('groupSelect');
		sel.selectedIndex = groupNum;
	} catch(err) {error(doc, err)}
}

function makeTrFromBericht(bericht, j, typ, teamLink) {
	// Reihenfolge Gegenueberstellung:  1HE, 2HE, 3HE, DE,   1HD, 2HD,  DD, MIX
	// Reihenfolge Spielbericht:        1HD,  DD, 2HD, DE,   MIX, 1HE, 2HE, 3HE
	var reihenfolge = [5, 6, 7, 3, 0, 2, 1, 4];  // uebersetzung gegenueber-->bericht
	
	var tr = "";
	var spiel = bericht.spiel[reihenfolge[typ]];
	if (!spiel)
		return tr;
	var wir = j%2; // 0 bei heimspiel, 1 bei gast
	var die = 1-wir;
	var sieg = spiel.sieg[wir]
	var hcolor = sieg ? WIN.col : LOSE.col; 
	var gcolor = !sieg ? WIN.col : LOSE.col
	
	var berichtLink = "<a href='" + bericht.link + "'><b>" + teamLink[Math.floor(0.5 * j)] + "</b></a>";
	
	tr += "<td width='152px' bgcolor='"+DARK_YELLOW.col+"'>" + berichtLink + "</td>";
	tr += "<td align='center'>" + bericht.datum + "</td>";
	tr += "<td align='center' width='38px'>" + (wir ? "Ausw." : "Heim") + "</td>";
	tr += "<td>" + spiel.spieler[wir] + "</td><td>" + spiel.spieler[die] + "</td>";
	tr += "<td align='center' width='38px' bgcolor='"+ hcolor + "'>" + 
			spiel.saetze[wir] + " : " + spiel.saetze[die] + "</td>";
	tr += "<td align='center' width='38px'>" + spiel.p[wir][0] + " : " + spiel.p[die][0] + "</td>";
	tr += "<td align='center' width='38px'>" + spiel.p[wir][1] + " : " + spiel.p[die][1] + "</td>";
	if (spiel.p[wir][2])
		tr += "<td align='center' width='38px'>" + spiel.p[wir][2] + " : " + spiel.p[die][2] + "</td>";
	else
		tr += "<td align='center' width='38px'>&nbsp;</td>";
	tr += "</tr>";
	return tr;
}

function makeAnsetzung(doc) {
	if (!doc.body || !doc.body.firstChild)
		return;
	
	var groupNum = getGroupNum(doc.URL);
	var headLine = makeHeadLine(doc, groupNum);

	// unnuetze h2 loeschen
	var	h2 = doc.body.getElementsByTagName("h2")[0];
	if (h2) {
		h2.parentNode.replaceChild(headLine, h2);
	}

	var sel = doc.getElementById('groupSelect');
	sel.selectedIndex = groupNum;

	makeScript(doc, "function highlight(r, col) {" + 
			"var a = document.body.getElementsByTagName(\"a\");" + 
			"for (var i=0; i<a.length; i++)" + 
			"  if (a[i].getAttribute(\"href\") == r) " + 
			"    a[i].parentNode.parentNode.setAttribute(\"bgcolor\", col); }");

	// teams durch links ersetzen und die Teamlinks speichern
	var	team = doc.body.getElementsByTagName("table")[0].getElementsByTagName("div");
	var tab = loadDocument(doc, doc.URL.replace("staffel-", "gegenueber/gegenueber-"));
	var teamObj = new Array(20); // rank: nummer innerhalb des vereins (I,II, ...), verein: globale nummer, link: link zu ansetzungen   
	var a = tab.getElementsByTagName("a");
	
	var teamNumber = 0;// kurznummer in dieser Tabelle
	for (var i=0; i<team.length; i++) {
		// leerzeichen alle entfernen, hier werden &nbsp; benutzt, in der Tabelle nur ' '.
		var teamname = team[i].innerHTML.replace(/<b>|&nbsp;|\s*<\/b>\s*/g, " ").replace(/^\s+|\s+$/g, "");
		if (teamname.length > 0 && teamname.length < 3) {
			teamNumber = parseInt(teamname);
		}
			
		for (var j=0; j<a.length; j++) {
			var name = a[j].innerHTML.replace(/<b>|\s*<\/b>\s*$|\s+$/g, ""); 
			if (name.length < 6)
				continue;
			if (name == teamname) {
				var href = a[j].getAttribute("href");
				team[i].replaceChild(newElement(doc, "a", name, "href", href), team[i].firstChild);
				team[i].setAttribute("onmouseover", "highlight('" + href + "', '" + DARK_YELLOW.col + "')");
				team[i].setAttribute("onmouseout",  "highlight('" + href + "', '" + YELLOW.col + "')");

				teamObj[teamNumber] = { rank: deromanize(name.substring(name.lastIndexOf(" ") + 1)), 							
										link: newElement(doc, "a", teamNumber, "href", href, "title", name),
										verein: parseInt(href.substr(-7, 2), 10)
									  };
			}
		}
	}
	
	// TeamNummern durch links ersetzen und dabei Teamnummern speichern. 
	var num1;
	var num2;
	var error = 0;
	var div = doc.body.getElementsByTagName("div"); 
	for (var j=1; j<div.length; j++) { // start counting at 1 to skip body centering div
		if (/ \/ /.test(div[j].innerHTML)) {
			// Ausdruck durch irgendwas ersetzen. Die ersetzen Werte in den klammern () werden dann in $1 und $2 gespeichert
			div[j].innerHTML.replace(/(\d+) \/ (\d+)/, "");
			num1 = RegExp.$1;
			num2 = RegExp.$2;
			replaceChildren(div[j], teamObj[num1].link.cloneNode(true), 
									doc.createTextNode(" / "),
									teamObj[num2].link.cloneNode(true));
		}
		if (/\d\d.\d\d.\d\d\d\d/.test(div[j].innerHTML)) {
			var t = div[j].innerHTML;
			var date = new Date(t.substr(6, 4), t.substr(3, 2)-1, t.substr(0,2));
			if (date < new Date()) {
				var o1 = teamObj[num1];
				var o2 = teamObj[num2];
				var spiel1 = (o1.verein<10? "0" : "") + o1.verein + "-" + (o1.rank<10? "0" : "") + o1.rank + "_";  
				var spiel2 = (o2.verein<10? "0" : "") + o2.verein + "-" + (o2.rank<10? "0" : "") + o2.rank;  
				var link = WEB + "" + "spielberichte-vereine/" + spiel1 + spiel2 + ".HTML"
				// die variablen $1 und $2 sind noch besetzt 
				replaceChildren(div[j], newElement(doc, "a", t, "href", link));
			}
			var nextWeek = new Date();
			var lastWeek = new Date();
			nextWeek.setDate(nextWeek.getDate()+7);
			lastWeek.setDate(lastWeek.getDate()-7);
			if (lastWeek < date && date < new Date()) {
				div[j].parentNode.setAttribute("bgcolor", LIGHT_YELLOW.col);
			}
			if (nextWeek > date && date > new Date()) {
				div[j].parentNode.setAttribute("bgcolor", DARK_YELLOW.col);
			}
		}
	}
	
	if (!prefManager.getBoolPref("schonen"))
		replaceHallenschluessel(doc);
}

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

function replaceHallenschluessel(doc) {
	var div = doc.getElementsByTagName("div"); 
	var tr = loadDocument(doc, "http://bvbb.net/Hallen.687.0.html").getElementsByTagName("tr");
	var halle = Array(100);

	// speichere hallenschluessel in arrays
	var found = 0;
	for (var i=0; i<tr.length; i++) {
		var f = tr[i].getElementsByTagName("font")[0];
		var d = tr[i].getElementsByTagName("div");
		if (f && d[1] && d[2] && d[3]) { 
			halle[found] = {
					key: 	f.innerHTML,  
					street: d[3].innerHTML.replace(/^\n|<br>|^\s+|\s+$/g, "").replace(/(&nbsp;){2,}/g, " "),
					PLZ: 	d[1].innerHTML.replace(/^\s+/,"") + d[2].innerHTML.replace("(", " ").replace(")", "")
			};
			found++;
		}
	}

	for (var j=0; j<div.length; j++) {
		if (div[j].innerHTML.length != 2)
			continue;
		for (var i=1; i<found; i++) {
			var h = halle[i];
			if (div[j].innerHTML == h.key) {
				div[j].setAttribute("title", (h.street + "\n" + h.PLZ).replace(/&nbsp;/g, " "));
				var href = "http://maps.google.de/maps?q=" + h.street.replace(/\n.*/g, "") + ", " + h.PLZ;
				var a = newElement(doc, "a", div[j].innerHTML, "href", href, "target", "_blank");
				div[j].replaceChild(a, div[j].firstChild);
			}
		}
	}
}

function makeSpielbericht(doc) {
	var body = doc.body;
	if (!body)
		return;

	body.innerHTML = body.innerHTML.replace(/<p><\/p>|<p>&nbsp;<\/p>|<h2><\/h2>|<h2>&nbsp;<\/h2>/g, "");
	if (!body.firstChild)
		return;

	var tr = doc.getElementsByTagName("tr");
	if (!prefManager.getBoolPref("schonen")) {
		tr[0].appendChild(newParentElement("td", makeLoadStatsButton(doc)));
	}
	var link = WEB + "spielberichte-vereine/verein-";
	var heim = doc.URL.substr(doc.URL.length-16, 2);
	var gast = doc.URL.substr(doc.URL.length-10, 2);
	var fonts = tr[2].getElementsByTagName("font");
	var target = getIFrame(doc) ? " target=_blank" : "";
	if (fonts && fonts[2]) {
		fonts[0].innerHTML = "<a" + target + " href='" + link + heim + ".HTML'>" + fonts[0].innerHTML + "</a>";
		fonts[1].innerHTML = "<a" + target + " href='" + link + gast + ".HTML'>" + fonts[1].innerHTML + "</a>";
		fonts[2].innerHTML = linkToKlasse(doc, fonts[2].innerHTML, getIFrame(doc) ? "_blank" : null).outerHTML;
	}

	setElementAttributes(body, "table", "width", 820);
	setElementAttributes(body.getElementsByTagName("table")[2], "tr", "height", 20);
	setElementAttributes(body, "table", "style", "border:0", /Spielbericht|Klasse und Staffel|kampflos verloren/);
	
	if (prefManager.getBoolPref("centering") && !getIFrame(doc)) {
		var div = newElement(doc, "div", null, "id", "centerstyle", "width", WIDTH);
		while (body.hasChildNodes())
			div.appendChild(body.firstChild);
		body.appendChild(div);
	}
	adjustIFrameHeight(doc);
}

/*
 * @target: link-target des erzeugten Links
 * @param klasse: Name einer Klasse als String, darf leerzeichen enthalten. 
 * @return  HTML-Link zu der Klasse
 */
function linkToKlasse(doc, klasse, target) {
	klasse = klasse.replace(/&nbsp;| /g, "").toLowerCase()
	var name, href;
	for (var i=0; i<NAMES.length; i++) {
		if (klasse == NAMES[i].replace(/ /g, "").toLowerCase()) {
			name = NAMES[i];
			href = WEB + "tabellen/uebersicht-" + (i<9?"0":"") + (i+1) + ".HTML";
		}
	}
	if (!name)
		return false; 
	if (target) {
		return newElement(doc, "a", name, "href", href, "target", target);
	} else { 
		return newElement(doc, "a", name, "href", href, "target", target);
	}
}

function loadPlayerStats(e) {
	var doc = e.detail.doc;
	try { 
		var input = doc.getElementsByTagName("input")[0];
		input.parentNode.removeChild(input);
		var isBericht = /gegenueber\/gegenueber-/.test(doc.URL) || /\d\d-\d\d_\d\d-\d\d.HTML$/.test(doc.URL);
		var staemme = /(\d\d)-(\d\d)_(\d\d)-(\d\d).HTML$/.exec(doc.URL);
		
	
		var a = doc.body.getElementsByTagName("a");
		for (var i=0; i<a.length; i++) {
			if (a[i].outerHTML.indexOf("spielerstatistik/P-") >= 0) {
				var ref = a[i].getAttribute("href");
				var playerDoc = loadDocument(doc, ref);
				var wins = getWinPercentage(playerDoc);
				var f = getFestgespielt(doc, playerDoc); // f = [stammmannschaft, festgespielt, vereinsnummer]
				var stamm = f[0]>0 ? "Stammmannschaft " + romanize(f[0]) : "Ersatz";
				var fest = (f[1] > 0 && f[1] != f[0]) ? ", festgespielt in Mannschaft " + romanize(f[1]) : "";
				// mannschaft innerhalb des vereins vom aktuellen spieler, die gerade spielt
				if (isBericht && staemme) {
					var mannschaft = (parseInt(staemme[1], 10) == f[2]) ? parseInt(staemme[2], 10) : parseInt(staemme[4], 10);
				}
				var slash = (a[i].innerHTML.indexOf("&nbsp;/") >= 0) ? "&nbsp;&nbsp;/" : "";
				if (isBericht && (f[0] != mannschaft && staemme || !staemme && f[0] == 0)) {
					if (f[1] == 0) {
						a[i].innerHTML = a[i].innerHTML.replace("&nbsp;&nbsp;/", "") + "&nbsp;(E)" + slash;
						a[i].setAttribute("title", "Ersatz");
					} else {
						a[i].innerHTML = a[i].innerHTML.replace("&nbsp;&nbsp;/", "") + (f[0]==0?" (E":" (") + f[1] + ")" + slash;
						a[i].setAttribute("title", (stamm) + fest);
					}
				}
				if (!isBericht && (f[1] != 0 && f[1] != f[0])) { 
					a[i].innerHTML = a[i].innerHTML.replace(/\s\(\d\)/, "") + (f[0]==0?" (E":" (") + f[1] + ")";
					a[i].setAttribute("title", (stamm) + fest);
				}
				a[i].outerHTML += 
				"<table height=5 width=100 style='border:1px solid #888'>"+
	               "<tr>"+
	                 "<td bgcolor='" + WIN.col + "' width="+wins+"%></td>"+
	                 "<td bgcolor='"+LOSE.col+"' width="+(100-wins)+"%></td>"+
	               "</tr>"+
	             "</table>";
	             var el = a[i].parentNode.parentElement; 
	             el.innerHTML = el.innerHTML.replace(/<br>/g, "");
			}
		}			
		if (doc.contentWindow && doc.contentWindow.document) {
			var iDoc = doc.contentWindow.document.getElementById("ifrmErgebnis");
			if (iDoc) {
				iDoc.style.height = (iDoc.contentWindow.document.documentElement.scrollHeight+1);
			}
		}
		adjustIFrameHeight(doc);
	} catch(err) { 
		error(doc, err);
	}
}

function getIFrame(doc) {
	if (doc.defaultView && doc.defaultView.parent && doc.defaultView.parent.document) {
		var parent = doc.defaultView.parent.document;
		var iFrame = parent.getElementById("ifrmErgebnis");
		return iFrame;
	}
	return false;
}

function adjustIFrameHeight(doc) {
	var iFrame = getIFrame(doc)
	// check if this is an iFrame and adjust parent's height
	if (iFrame && iFrame.style) 
		iFrame.style.height = (doc.documentElement.scrollHeight+1);
}


function makeScript(doc, code) {
	var scr = newElement(doc, "script", code, "language", "javascript", "type", "text/javascript");
	doc.documentElement.appendChild(scr);
}

function makeSpieler(doc) {
	try {
		makeScript(doc, "function highlight(r, j, color, color2) {" + 
				"var table = document.body.getElementsByTagName(\"table\");" + 
				"var tr = table[2].getElementsByTagName(\"tr\");" + 
				"var sp=[0,0], sa=[0,0], pu=[0,0];" + 
				"for (var i=2; i<tr.length; i++) {" + 
				"  var td = tr[i].getElementsByTagName(\"td\");" + 
				"  if (td[j] && td[j].innerHTML.indexOf(r) >= 0) {" +
				"    if (color == '" + YELLOW.col + "')" + 
				"      td[j].removeAttribute(\"bgcolor\"); "+
				"    else" + 
				"      td[j].setAttribute(\"bgcolor\", color); "+
				"    tr[i].setAttribute(\"bgcolor\", color2); "+
					// punkte parsen
				"    var spi = />(\\d)</.exec(td[5].innerHTML);" + 
				"    sp[1-parseInt(spi[1])]++;" + 
				"    var sae = /(\\d)\\s:\\s(\\d)/.exec(td[6].innerHTML);" + 
				"    sa = [sa[0] + parseInt(sae[1]), sa[1] + parseInt(sae[2])];" + 
				"	 var reg = /(\\d\\d):(\\d\\d)/g;" + 
				"	 var pun;" + 
				"    var str = td[7].innerHTML; "  +
				"    while ((pun = reg.exec(str)) !== null) {"+
				"       pu[0] += parseInt(pun[1],10); "+
				"       pu[1] += parseInt(pun[2],10); "+ 
				"    }" + 
//				"    alert('pu: ' + pu.toSource() + '  pun: ' + (pun?pun.toSource():''));"+
				"}}"+
				"var tr = table[5].getElementsByTagName(\"tr\");" + 
				"tr[0].getElementsByTagName(\"td\")[0].innerHTML = '<div align=\"center\"><b>' + r + '</b></div>';" + 
				"var erg = [sp, , sa, , pu];" + 
				"for (var i=0; i<tr.length-1; i+=2) {" + 
				"  var td = tr[i+1].getElementsByTagName(\"td\");" + 
				"  td[1].innerHTML = '<div align=\"center\">' + (erg[i][0] + erg[i][1]) + '</div>';" + 
				"  td[2].innerHTML = '<div align=\"center\">' + erg[i][0] + '</div>';" + 
				"  td[3].innerHTML = '<div align=\"center\">' + Math.round(1000*erg[i][0]/(erg[i][0] + erg[i][1]))/10 + '%</div>';" + 
				"  td[4].innerHTML = '<div align=\"center\">' + erg[i][1] + '</div>';" + 
				"  td[5].innerHTML = '<div align=\"center\">' + Math.round(1000*erg[i][1]/(erg[i][0] + erg[i][1]))/10 + '%</div>';" + 
				"  for (var j=0; j<td.length; j++) {" + 
				"    if (td[j].getAttribute('bgcolor')=='" + WIN.col + "'){"+
				"	   var w = Math.round(100*erg[i][0]/(erg[i][0] + erg[i][1]));" + 
				"      td[j].setAttribute('width', ' ' + (w==0?1:w) + '%');"+
				"    }" + 
				"  }" + 
				"}"+
				"}");


		var table = doc.body.getElementsByTagName("table");
		// ergebnistabelle[4] ist in eine weitere Tabelle[2] geschachtelt -->
		// aeussere Tabelle durch innere ersetzen, und die ueberschrift neumachen.
		table[2].outerHTML = table[4].outerHTML;
		table[2].innerHTML = "<tr bgcolor='"+ LIGHT_ORANGE.col + "'>"+
							 "<td colspan=8 style='font-size:0.9em'><b>H e i m m a n n s c h a f t</b></td>"+
							 "<td bgcolor='" + DARK_ORANGE.col + "' style='border:0' >&nbsp;</td>"+
							 "<td colspan=2 style='font-size:0.9em'><b>G a s t m a n n s c h a f t</b></td></tr>" +
							 table[2].innerHTML;
		table[2].setAttribute("Border", 5);
		table[2].setAttribute("width", 780);
		
		// Satzsiege/verluste farbig
		var td = table[2].getElementsByTagName("td");
		for (var i=0; i<td.length; i++) {
			var reg = /(\d) : (\d)/.exec(td[i].innerHTML);
			if (reg) {
				td[i].setAttribute("bgcolor", reg[1] > reg[2] ? WIN.col : LOSE.col);
				td[i].setAttribute("id", reg[1] > reg[2] ? 'win' : 'lose');
			}
		}
		var tr = table[2].getElementsByTagName("tr");
		for (var i=2; i<tr.length; i++) {
			var td = tr[i].getElementsByTagName("td");
			for (var j=0; j<3; j++) {
				td[j].setAttribute("onmouseover", "highlight('" +td[j].innerHTML+"', " + j + ", '" + DARK_YELLOW.col + "', '" + MIX_YELLOW.col + "')");
				td[j].setAttribute("onmouseout",  "highlight('', " + j + ", '" + YELLOW.col + "', '" + YELLOW.col + "')");
			}
			var reg = /(DE|GD|DD|HE|HD)/.exec(td[3].innerHTML);
			td[3].setAttribute("onmouseover", "highlight('" + reg[1] + "', 3, '" + DARK_YELLOW.col + "', '" + MIX_YELLOW.col + "')");
			td[3].setAttribute("onmouseout",  "highlight('', 3, '" + YELLOW.col + "', '" + YELLOW.col + "')");
		}


		// table[3], table[4] sind text, table[5] die aeussere Tabelle, table[6] ueberschrift					
		tr = table[6].getElementsByTagName("tr")[0];
		tr.setAttribute("bgcolor", DARK_YELLOW.col);
		var td = tr.getElementsByTagName("td");
		td[2].setAttribute("colspan", 2);
		td[3].setAttribute("colspan", 2);
		td[6].setAttribute("colspan", 4);
		var tb = table[7].getElementsByTagName("tbody")[0];
		tb.innerHTML = tr.outerHTML + tb.innerHTML;
		table[5].outerHTML = table[7].outerHTML;
		table[5].setAttribute("cellpadding", 3);
		table[5].setAttribute("bgcolor", "#999999");
		table[5].setAttribute("width", 780);
		table[5].removeAttribute("style");
		setElementAttributes(doc, "table", "style", "border:0", /Statistik|Ergebnisse je|Stamm-Mannschaft/);
		table[6].setAttribute("style", "border:1px solid #888");
		table[7].setAttribute("style", "border:1px solid #888");
		table[8].setAttribute("style", "border:1px solid #888");
		
	} catch (e) {
		error(doc, e);
	}
}

function getWinPercentage(doc) {
	var t;
	var tr = doc.getElementsByTagName("tr");
	for (var i=0; i<tr.length; i++) {
		var inner = tr[i].innerHTML; 
		if (inner.indexOf("<table") >= 0)
			continue;
		if (inner.indexOf(WIN.old) >= 0 || inner.indexOf(WIN.col) >= 0) {
			t = tr[i].getElementsByTagName("td")[0].outerHTML;
			return t.substring(t.indexOf("width=\"") + 7, t.indexOf("%"));
		}
		// enthält die rote Zelle vor der grünen? --> 0% gewonnen.
		if (inner.indexOf(LOSE.old) >= 0 || inner.indexOf(LOSE.col) >= 0) {
			return 0;
		}
	}
}

/**
 * return: i>0: Stammspieler in Mannschaft i, i=0: Ersatz, nicht festgespielt, i<0: ersatzspieler, festgespielt in Mannsch. i.
 */
function getFestgespielt(doc1, doc) {
	try {
		var verein = doc.getElementsByTagName("a")[0].getAttribute("href").substr(-7, 2);
		var stamm = doc.getElementsByTagName("table")[1].getElementsByTagName("div")[2].innerHTML;
		if (stamm == "Ersatz") 
			stamm = 0;
			
		var s = doc.getElementsByTagName("span");
		var mannschaft = new Array(100);
		var num = 0;
		for (var i=0; i<s.length-2; i++) {
			if (/^\d\d\.\d\d\.\d\d$/.test(s[i].innerHTML) && /^\d\d$|^\d$/.test(s[i+2].innerHTML)) {
				var d = s[i].innerHTML;
				var m = parseInt(s[i+2].innerHTML, 10);
				if (num == 0 || mannschaft[num-1].day != d || mannschaft[num-1].mann != m) {
					mannschaft[num] = { day: d, mann: m };
					num++;
				}
			}
		}
		if (num < 3)
			return [stamm, 0, verein];
		var ms = Array(num);
		for (var i=0; i<num; i++) {
			ms[i] = mannschaft[i].mann;
		}
		ms.sort();
		var fest = ms[2];
		if (stamm != 0 && fest != 0 && stamm < fest)
			fest = 0;
		return [stamm, fest, verein];
	} catch (err) {
		error(doc1, err);
	}
}

function loadDocument(docu, link) {
	var doc = docu.implementation.createHTMLDocument("");
	var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
    request.open("GET", link, false, null, null);
	request.overrideMimeType('text/html; charset=iso-8859-1');
	request.send(null);
	doc.documentElement.innerHTML = request.responseText;
	return doc;
}

function makePlayerLinks(doc) {
	try {
		var playerDoc = loadDocument(doc, WEB + "spielerstatistik/P-Drop-down-Spieler.HTML"); 
		var d = doc.getElementsByTagName("b");
		// load options and convert to array
		var p = playerDoc.getElementsByTagName("option");
		// convert entries to objects
		p = Array.map(p, function(e) { return { 
				name:	e.innerHTML.replace(/&nbsp;&nbsp;+\(.*\)/, ""), 
				value:	e.getAttribute("value")
			}});
		for (var i=0; d && i<d.length; i++) {
			var name = d[i].innerHTML.replace(/^\s+|\s+$|(\s\(\d\))/g, "");
			var ext = (RegExp.$1?RegExp.$1:"");
			if (!name || name.length < 5 || name.indexOf("<") >= 0 || name.indexOf("Additionsregeln") >= 0)
				continue;
			for (var j=0; j<p.length; j++) {
				if (p[j].name == name) {
					if ((!p[j-1] || p[j-1].name != name) && (!p[j+1] || p[j+1].name != name)) {
						d[i].innerHTML = "<a href='" + WEB + "spielerstatistik/" + p[j].value + "'>" + name + ext + "</a>";
						break;
					}
					if (doc.URL.indexOf("aufstellung/aufstellung-") >= 0) {
						var playerDoc = loadDocument(doc, WEB + "spielerstatistik/" + p[j].value);
						var ref = playerDoc.body.getElementsByTagName("a")[0].getAttribute("href");
						if (ref.substr(-7) == doc.URL.substr(-7)) {
							d[i].innerHTML = "<a href='" + WEB + "spielerstatistik/" + p[j].value + "'>" + name + ext + "</a>";
							break;
						}
					}
				}
			}
		}
	} catch(err) {
		error(doc, err);
	}
}

function makeTeamHeadLine(doc, teamNum, data) {
	makeScript(doc, JUMPTO);
	
	var auf = doc.URL.indexOf("aufstellung/aufstellung-") > 0;
	var aufstellung, spiele;	
	var teamName = "unbekannt";
	var p = doc.body.getElementsByTagName("b")[0];
	if (auf && p) {
		teamName = p.getElementsByTagName("font")[0].innerHTML;
	}
	if (!auf && p) {
		teamName = p.innerHTML;
	}
	
	if (auf) {
		aufstellung = doc.createTextNode("Aufstellung"); 
		spiele = newElement(doc, "a", "Spielansetzungen", "class", "navigationUnselected", "href", WEB + "spielberichte-vereine/verein-" + teamNum + ".HTML");
	} else {
		aufstellung = newElement(doc, "a", "Aufstellung", "class", "navigationUnselected", "href", WEB + "aufstellung/aufstellung-" + teamNum + ".HTML");
		spiele = doc.createTextNode("Spielansetzungen");
	}
	
	var onChange = "jumpto(document.form1.jumpmenu.options[document.form1.jumpmenu.options.selectedIndex].value)";
	
	var sel = newElement(doc, "select", null, "id", "teamSelect", "name", "jumpmenu", "onChange", onChange);
	for (var i=0; i<data.length; i++) {
		if (!data[i])
			continue;
		var l = WEB + (auf ? "aufstellung/aufstellung-" : "spielberichte-vereine/verein-")  + data[i].nr + ".HTML";
		sel.appendChild(newElement(doc, "option", data[i].name, "value", l));
	}
	var form = newParentElement("form", sel, "name", "form1");

	var	cells = doc.getElementsByTagName("td");
	var stand = doc.createTextNode(""); 
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].innerHTML.indexOf("Stand:") > -1) {
			stand = cells[i].firstChild;
			break;
		}
	}

	var h2 = doc.createElement("h2");
	h2.appendChild(form);
	h2.appendChild(newElement(doc, "span", "&nbsp;&nbsp;&nbsp;&nbsp;"));
	h2.appendChild(aufstellung);
	h2.appendChild(newElement(doc, "span", "&nbsp;&nbsp;"));
	h2.appendChild(spiele);
	h2.appendChild(newElement(doc, "span", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"));
	h2.appendChild(stand);
	
	return h2;
}

function makeHeadLine(doc, groupNum) {
	makeScript(doc, JUMPTO);
	
	var ans = doc.URL.indexOf("meisterschaft/staffel-") > 0;
	var tab = doc.URL.indexOf("tabellen/uebersicht-") > 0;
	var geg = doc.URL.indexOf("gegenueber/gegenueber-") > 0;
	
	var gruppe = SHORT_NAMES[groupNum];
	
	var link = "<a class=navigationUnselected href='" + WEB;
	var ansetzungen = !ans ? link + "staffel-" + gruppe + ".HTML'>" : "";
	ansetzungen += "Ansetzungen";
	ansetzungen += !ans ? "</a>" : "";
	var gegenueber = !geg ?  link + "gegenueber/gegenueber-" + gruppe + ".HTML'>" : "";
	gegenueber += "Gegen\u00FCberstellung";
	gegenueber += !geg ? "</a>" : "";
	var tabelle = !tab ?  link + "tabellen/uebersicht-" + (groupNum<9?"0":"") + (groupNum+1) + ".HTML'>" : "";
	tabelle += "Tabelle";
	tabelle += !tab ? "</a>" : "";
	var form = "<form name='form1'><select id='groupSelect' name='jumpmenu' " + 
	"onChange='jumpto(document.form1.jumpmenu.options[document.form1.jumpmenu.options.selectedIndex].value)'>";
	for (var i=0; i<19; i++) {
		form += "<option value=" + WEB;
		if (tab) 
			form += "tabellen/uebersicht-" + (i<9?"0":"") + (i+1);
		if (ans) 
			form += "staffel-" + SHORT_NAMES[i];
		if (geg) 
			form += "gegenueber/gegenueber-" + SHORT_NAMES[i];
		form += ".HTML>" + NAMES[i] + "</option>";
	}
	form += "</select></form>";

	var	cells = doc.getElementsByTagName("td");
	var stand = ""; 
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].innerHTML.indexOf("Stand:") > -1) {
			stand = cells[i].innerHTML;
			break;
		}
	}

	var h2 = doc.createElement("h2");
	h2.innerHTML =  form + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
					+  tabelle + "&nbsp;&nbsp;"
					+  ansetzungen + "&nbsp;&nbsp;"
					+  gegenueber + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
					+  stand;
	return h2;
}

function removeElements(doc, tag, regex) {
	if (!doc)
		return;
	var	e = doc.getElementsByTagName(tag);
	for (var i = e.length-1; i >= 0; i--) {
		if (!regex || regex.test(e[i].innerHTML)) {
			e[i].parentNode.removeChild(e[i]);
		}
	}
}

function removeParents(doc, tag, regex) {
	if (!doc)
		return;
	var	e = doc.getElementsByTagName(tag);
	for (var i = e.length-1; i >= 0; i--) {
		if (!regex || regex.test(e[i].innerHTML)) {
			while (e[i].hasChildNodes())
				e[i].parentNode.insertBefore(e[i].firstChild, e[i]);			
			e[i].parentNode.removeChild(e[i]);
		}
	}
}

function makeTabelle(doc) {
	var body = doc.body;

	var	siteName = doc.URL;
	var groupNum = parseInt(siteName.substr(-7, 2), 10)-1;

	var headLine = makeHeadLine(doc, groupNum);
				
	var h2 = body.getElementsByTagName("h2")[0]; // uebersicht
	h2.parentNode.replaceChild(headLine, h2);
	var sel = doc.getElementById('groupSelect');
	sel.selectedIndex = groupNum;

	removeElements(body, "p", /Vorheriger/);
	removeElements(body, "h2", /Aufsteiger|Ergebniss-Link|Fenster schlie/);

	var	table = body.getElementsByTagName("table");
	if (table[1] && table[1].getElementsByTagName("tr")[0]) {
		table[1].outerHTML = "";
	}

	var	cells = body.getElementsByTagName("td");
	var kampflos = false; // erschien "kampflos schon in einer Zelle?"
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].getAttribute("width") && cells[i].getAttribute("width") == 30) {
			cells[i].setAttribute("width", 40);
		}
		if (kampflos) {
			cells[i].setAttribute("height", 30);
		}
		kampflos |= /kampflos/.test(cells[i].innerHTML);
	}
	
	var	b = body.getElementsByTagName("b");
	for (var i = b.length-1; i >= 0; i--) {
		b[i].outerHTML = b[i].innerHTML;
	}

	if (prefManager.getBoolPref("useIframe")) {
		var ifrm = newElement(doc, "iframe", null, 
							  "id", "ifrmErgebnis", "width", 885, "height", 10, "frameborder", 0, "marginwidth", 24,
							  "border", 1, "marginheight", 0, "name", "Ergebnis");
		doc.getElementById("centerstyle").appendChild(ifrm);

		// setze target der Links auf "Ergebnis", wenn sie auf ein Spielbericht zeigen.
//		setElementAttributes(doc, "a", "target", "Ergebnis", /\d\d-\d\d_\d\d-\d\d.HTML$/);
		var	links = body.getElementsByTagName("a");
		for (var i=0; i<links.length; i++) {
			if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(links[i].href)) 
				links[i].setAttribute("target", "Ergebnis");
		}
	}
}

function tableToArray(table) {
	var tr = table.getElementsByTagName("tr");
	var cell = new Array(tr.length);
	for (var i=0; i<tr.length; i++) {
		var td = tr[i].getElementsByTagName("td");
		cell[i] = new Array(td.length);
		for (var j=0; j<td.length; j++) {
			cell[i][j] = td[i];
		}
	}
	return cell;
}

function makeStyle(doc) {
	if (!doc)
		return;

	for (var i=0; i<COLORS.length; i++) {
		var newcol = prefManager.getBoolPref("newColors");
		COLORS[i].col = newcol ? COLORS[i].newcol : COLORS[i].old; 
	}

	if (prefManager.getBoolPref("centering") && !/\d\d-\d\d_\d\d-\d\d.HTML$/.test(doc.URL)) {
		doc.body.innerHTML = "<div width=" + WIDTH + " id='centerstyle'>" + doc.body.innerHTML + "</div>";
	}

			
	doc.getElementsByTagName("style")[0].innerHTML = "<!--" + STYLE + "-->";

	for (var i=0; i<COLORS.length; i++) {
		if (COLORS[i].old != COLORS[i].col) {
			doc.documentElement.innerHTML = doc.documentElement.innerHTML.replace(new RegExp(
															COLORS[i].old.substring(1), "g"), 
															COLORS[i].col.substring(1));
		}
		
	}
		
	var  style = doc.getElementById("style");
	
	if (!style) {
		style = doc.createElement("link");
		style.id = "style";
		style.type = "text/css";
		style.rel = "stylesheet";
		style.href = "chrome://bvbbpp/skin/skin.css";
		doc.head.appendChild(style); 

		var icon = doc.createElement("link");
		icon.id = "icon";
		icon.rel = "shortcut icon";
		icon.href = "http://www.bvbb.net/fileadmin/user_upload/pics/logo.jpg";
		doc.head.appendChild(icon); 
	}
	
	var it = doc.getElementsByTagName("i");
	for (var i=it.length-1; i>=0; i--) {
		it[i].parentNode.replaceChild(it[i].firstChild, it[i]);
	}
}

function run(doc) {
	if (!doc || !doc.URL)
		return;
	var url = doc.URL;

	if(url.indexOf("bvbb.net/fileadmin/user_upload/schuch/meisterschaft") < 0)
		return;

	if (doc.getElementById("bvbbBody"))
		return;

	if (doc.body)
		doc.body.setAttribute("id", "bvbbBody");

	makeStyle(doc);
	removeElements(doc.body, "h2", /Fenster schlie/);
	removeElements(doc.body, "table", /Fenster schlie/);

	if (!prefManager.getBoolPref("newWindow")) {
		if (!getIFrame(doc)) {
			setElementAttributes(doc.body, "a", "target", "_self", /_blank/);
		}
	}
	
	if (url.indexOf("meisterschaft/staffel-") > -1) {
		makeAnsetzung(doc);
	}
	if (url.indexOf("gegenueber/gegenueber-") > -1) {
		makeGegenueber(doc);
	}
	if (url.indexOf("aufstellung/aufstellung-") > -1) {
		makeAufstellung(doc);
	}
	if (url.indexOf("spielberichte-vereine/verein-") > -1) { 
		makeVerein(doc);
	} 
	if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(url)) {
		makeSpielbericht(doc);
	}
	if (url.indexOf("uebersicht") > -1) {
		makeTabelle(doc);
	}
	if (url.indexOf("spielerstatistik/P-") > -1) {
		makeSpieler(doc);
	}
	
}

var windowListener = {
	onOpenWindow: function(aWindow) {
	    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    domWindow.addEventListener("DOMContentLoaded", autorun, false);
	},
	onCloseWindow: function(aWindow) {
	    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    domWindow.removeEventListener("DOMContentLoaded", autorun, false);
	},
	onWindowTitleChange: function(aWindow, aTitle) {}
};
 
function startup(aData, aReason) {
	var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
	// listen to any existing windows
	var windows = wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements()) {
		var domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
//		domWindow.alert("register\n" + domWindow.gBrowser.tabs);
	    domWindow.addEventListener("DOMContentLoaded", autorun, false);
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
			if (uri.indexOf("bvbb.net/fileadmin/user_upload/schuch/meisterschaft") >= 0) {
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
//		domWindow.alert("unregister");
	    domWindow.removeEventListener("DOMContentLoaded", autorun, false);
		reloadTabs(domWindow);
	}
 
	// Stop listening for new windows
	wm.removeListener(windowListener);
}
 
function install(aData, aReason) {
	startup(aData, aReason);
	prefManager.setBoolPref("schonen", false);
	prefManager.setBoolPref("centering", true);
	prefManager.setBoolPref("newWindow", false);
	prefManager.setBoolPref("useIframe", true);
	prefManager.setBoolPref("newColors", true);
}
function uninstall(aData, aReason) {
	shutdown(aData, aReason);
	prefManager.clearUserPref("centering");
	prefManager.clearUserPref("schonen");
	prefManager.clearUserPref("newWindow");
	prefManager.clearUserPref("useIframe");
	prefManager.clearUserPref("newColors");
}