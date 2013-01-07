var Cc = Components.classes;
var Ci = Components.interfaces;
var prefManager = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);

//preferences and defaults
var PREFS = [{name:"schonen", def:false}, 
             {name:"centering", def:true}, 
             {name:"newWindow", def:false}, 
             {name:"useIframe", def:true}, 
             {name:"newColors", def:true}];
var STYLE = "select {background-color: #FF9900}";

// constants
var WEB_SHORT = "bvbb.net/fileadmin/user_upload/schuch/meisterschaft";
var WEB = "http://" + WEB_SHORT + "/";
var console = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
var SHORT_NAMES = [ "BB", "LL-1", "LL-2", "BZ-1", "BZ-2", "AK-1", "AK-2", "BK-1", "BK-2", "CK-1", "CK-2", "DK-1",
                   "DK-2", "EK-1", "EK-2", "FK-1", "FK-2", "GK-1", "GK-2" ];
var NAMES = [ "Berlin-Brandenburg-Liga", "Landesliga I", "Landesliga II", "Bezirksklasse I", "Bezirksklasse II",
             "A-Klasse I", "A-Klasse II", "B-Klasse I", "B-Klasse II", "C-Klasse I", "C-Klasse II", "D-Klasse I",
             "D-Klasse II", "E-Klasse I", "E-Klasse II", "F-Klasse I", "F-Klasse II", "G-Klasse I", "G-Klasse II" ];

var OCHRE		 = { old: "#CC9933",  newcol:"#A2ADBC", col:"#FFFFFF"};
var LIGHT_YELLOW = { old: "#FFFFCC",  newcol:"#FAFAF7", col:"#FFFFFF"};
var YELLOW 		 = { old: "#FFFF66",  newcol:"#F6F4DA", col:"#FFFFFF"};
var MIX_YELLOW	 = { old: "#FAFA44",  newcol:"#ECEEDC", col:"#FFFFFF"};
var DARK_YELLOW	 = { old: "#F0F000",  newcol:"#D9E2E1", col:"#FFFFFF"};
var LIGHT_ORANGE = { old: "#FFCC33",  newcol:"#A2ADBC", col:"#FFFFFF"};
var ORANGE 		 = { old: "#FF9900",  newcol:"#A2ADBC", col:"#FFFFFF"};
var DARK_ORANGE	 = { old: "#CC9933",  newcol:"#727B84", col:"#FFFFFF"};
var AUFSTEIGER	 = { old: "#00CC00",  newcol:"#89E291", col:"#FFFFFF"};
var ABSTEIGER	 = { old: "#FF6633",  newcol:"#DF9496", col:"#FFFFFF"};
var ZURUECK		 = { old: "#FF0022",  newcol:"#DF9496", col:"#FFFFFF"};
var WIN			 = { old: "#33FF00",  newcol:"#89E291", col:"#FFFFFF"};
var LOSE		 = { old: "#FF0000",  newcol:"#DF9496", col:"#FFFFFF"};
var FRAME_TOP	 = { old: "#D8D8D8",  newcol:"#2F3E3E", col:"#FFFFFF"};
var FRAME_BOTTOM = { old: "#474747",  newcol:"#2F3E3E", col:"#FFFFFF"};
var KAMPFLOS	 = { old: "#FF6600",  newcol:"#DF9496", col:"#FFFFFF"};


var COLORS = [ YELLOW, LIGHT_YELLOW, MIX_YELLOW, DARK_YELLOW, LIGHT_ORANGE, ORANGE,
                 DARK_ORANGE, AUFSTEIGER, ABSTEIGER, ZURUECK, WIN, LOSE, FRAME_TOP,
                 FRAME_BOTTOM ];

/**
 * Output the error to the Message console. The same method is here and in utils, because we must
 * output an error when loading the utils fails.
 */
function error(e, msg) {
	var message = e ? "BVBB++: Fehler in Zeile " + e.lineNumber + ": " + e.message + " " + (msg?msg:"") : "BVBB++: " + msg;
    Components.utils.reportError(message);
};

/**
 * Get a preference from the branch "extensions.bvbbpp.". If it doesn't exist, create the preference
 * with default setting.
 * @param name  pref name
 * @returns     pref value
 */
function getPref(name) {
	if (!name)
		return false;
	try{
		return prefManager.getBranch("extensions.bvbbpp.").getBoolPref(name);
	} catch (err) {
		error(err, "Kann Einstellung \"" + name + "\" nicht lesen. Benutze Standardeinstellung.");
	}
	for (var i=0; i<PREFS.length; i++) {
		if (name == PREFS[i].name) {
			prefManager.getBranch("extensions.bvbbpp.").setBoolPref(PREFS[i].name, PREFS[i].def);
			return PREFS[i].def;
		}
	}
	return false;
}

function makeAufstellung(doc) {
	var body = doc.body;
	if (!body || !body.firstChild)
		return;

	var headLine = makeTeamHeadLine(doc);

	var	h2 = body.getElementsByTagName("h2");
	if (!h2[0])
		return;
	h2[0].parentNode.replaceChild(headLine, h2[0]);

	if (!getPref("schonen")) {
		h2[0].appendChild(doc.createElement("br"));
		h2[0].appendChild(makeLoadStatsButton(doc));
	}

	if (!getPref("schonen"))
		makePlayerLinks(doc);
		
	var f = body.getElementsByTagName("font");
	for (var i=0; i<f.length; i++) {
		var link = linkToKlasse(doc, f[i].innerHTML);
		if (link) {
			f[i].replaceChild(link, f[i].firstChild);
		}
	}
}

function makeVerein(doc) {
	var body = doc.body;
	if (!body || !body.firstChild)
		return;

	var headLine = makeTeamHeadLine(doc);

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

	setElementAttributes(doc.body, "table", "style", "border:0", /Mannschaft/);
	
	// trim links to klasse
	var	b = body.getElementsByTagName("b");
	for (var i=0; i<b.length; i++) {
		b[i].textContent = b[i].textContent.replace(/^\s+|\s+$/g, "");
	}

	// Vereine Verlinken
	var vereineVerlinkenCallback = function (loadedDoc, doc_) {
	    try {
    	    var vereine = parseVereine(loadedDoc);
        	var td = body.getElementsByTagName("td");
        	for (var i=0; i<td.length; i++) {
        		if (/\d\d.\d\d.\d\d\d\d/.test(td[i].innerHTML) && /<a/.test(td[i].innerHTML))
        			removeParents(td[i], "b");
        		if (!/<|\d\d:\d\d|^\w$/.test(td[i].innerHTML)) {
        			for (var j=0; j<vereine.length; j++) {
        				var shortName = vereine[j].link.firstChild.innerHTML;
        				if (td[i].innerHTML.indexOf(shortName) >= 0) {
        					var num = / [IVX]+$/.exec(td[i].innerHTML)[0];
        					var l = newElement(doc_, "a", shortName + num, 
        									   "href", vereine[j].link.href, 
        									   "title", vereine[j].name + num);
        					replaceChildren(td[i], l);
        					break;
        				}
        			}
        		}
        	}
	    } catch(err) {
	        error(err);
	    } 
	}
	loadDocument(WEB + "spielberichte-vereine/spielbericht-vereine.HTML", vereineVerlinkenCallback, doc);
	
	if (!getPref("schonen"))
		replaceHallenschluessel(doc);
}


/**
 * Get HTML-String to a loadStats button 
 */
function makeLoadStatsButton(doc) {
	var input = doc.createElement("input");
	input.type = "button";
	input.id = "loadStats";
	input.value = "Spielerstatistik laden";
	input.addEventListener("click", function() {loadPlayerStats(doc);}, false);
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

	var headLine = makeHeadLine(doc, getGroupNum(doc.URL));
	var h2 = doc.body.getElementsByTagName("h2");
	h2[1].parentNode.removeChild(h2[1]);
	h2[0].parentNode.replaceChild(headLine, h2[0]);

	
	if (!getPref("schonen")) {
		var tr = doc.getElementsByTagName("tr");
		for (var i=0; i<tr.length-1; i++) {
			var td = tr[i+1].getElementsByTagName("td");
			for (var j=0; j<td.length-1; j++) {
				var reg = /(\d+):(\d+)/.exec(td[j].innerHTML);
				if (reg) {
					var font = newElement(doc, "font", reg[1]+":" + reg[2], "color", "#00007F");
					var u = newParentElement("u", font);
					var a = newParentElement("a", u, "style", "cursor: pointer");
					a.i = i;
					a.j = (j-2);
					a.doc = doc;
					a.sum = parseInt(reg[1],10) + parseInt(reg[2],10);
					a.addEventListener("click", function() {makeGegenueberStats(doc, this);}, false);
					td[j].replaceChild(a, td[j].firstChild);
					td[j].align = "center";
				}
			}
		}
	}
}

function makeGegenueberStats(doc, that) {
	try {
		var teamRow = that.i;
		var game = that.j;
		var sum = that.sum;
		
		// schon vorhandene Elemente aufraeumen
		removeElement(doc.getElementById("h2stats"));
		var body = doc.getElementById('centerstyle');
	
		var tr = doc.getElementsByTagName("table")[0].getElementsByTagName("tr");
		var td = tr[(teamRow+1)].getElementsByTagName("td");
		
		var teamI = /-(\d\d).HTML/.exec(td[1].innerHTML)[1];
		var teamNumI = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(td[1].innerHTML)[1]);
		var teamStrI = teamI + "-" + (teamNumI<10? "0" : "") + teamNumI;
		
		var teamLink = Array(tr.length-1);
		var rows = 0;

		// there's a left-over h2 element that we will fill with stats
		var h2 = body.getElementsByTagName("h2")[2];
		if (!h2) {
			h2 = newElement(doc, "h2");
			body.appendChild(h2);
		}
		h2.id = "h2stats";

		var tr1 = newElement(doc, "tr");
		var linkAndType = newParentElement("div", newParentElement("h4", newElement(doc, "b", null, "id", "linkAndType")));
		tr1.appendChild(newParentElement("td", linkAndType, "width", 300));
		tr1.appendChild(newParentElement("td", makeLoadStatsButton(doc)));
		var tbody1 = newParentElement("tbody", tr1);
		var table1 = newParentElement("table", tbody1, "style", "border:0", "id", "teamLink");
		h2.appendChild(table1);


		var tr2 = newElement(doc, "tr", null, "bgcolor", LIGHT_ORANGE.col, "align", "center");
		tr2.appendChild(newElement(doc, "td", "Gegnerischer Verein", "style", "font-size: 10pt"));
		tr2.appendChild(newElement(doc, "td", "Datum", "style", "font-size: 10pt"));
		tr2.appendChild(newElement(doc, "td", "Ort", "style", "font-size: 10pt"));
		tr2.appendChild(newElement(doc, "td", "Spieler", "style", "font-size: 10pt"));
		tr2.appendChild(newElement(doc, "td", "Gegner", "style", "font-size: 10pt"));
		tr2.appendChild(newElement(doc, "td", "Sätze", "style", "font-size: 10pt"));
		tr2.appendChild(newElement(doc, "td", "Punkte", "style", "font-size: 10pt", "colspan", 3));
		var tbody = newParentElement("tbody", tr2, "id", "gegenueberstats");
		var table = newParentElement("table", tbody, "bgcolor", YELLOW.col, "border", 1, "cellpadding", 6);
		h2.appendChild(table);
		

		h2.appendChild(newElement(doc, "span", "Klick auf den Vereinsnamen führt zum Spielbericht.", 
								  	   "style", "font-weight:normal;font-size:8pt"));
		h2.appendChild(newElement(doc, "br"));

		for (var j=0; j<tr.length-1; j++) {
			teamLink[j] = /<b>(.*)\s+<\/b>/.exec(tr[(j+1)].innerHTML)[1];
			if (j == teamRow)
				continue;
			var innerJ = tr[(j+1)].getElementsByTagName("td")[1].innerHTML;
			var teamJ = /-(\d\d).HTML/.exec(innerJ)[1];
			var teamNumJ = deromanize(/<b>.*\s([X|V|I]+)\s*<\/b>/.exec(innerJ)[1]);
			var teamStrJ = teamJ + "-" + (teamNumJ<10? "0" : "") + teamNumJ;
			var link = WEB + "spielberichte-vereine/"+ teamStrI + "_" + teamStrJ + ".HTML";
			var row = makeTrFromBericht(doc, link, 0, game, teamLink[j]);
			if (row) {
				tbody.appendChild(row); 
				rows++;
			}
			link = WEB + "spielberichte-vereine/"+ teamStrJ + "_" + teamStrI + ".HTML";
			var row = makeTrFromBericht(doc, link, 1, game, teamLink[j]);
			if (row) {
				tbody.appendChild(row); 
				rows++;
			}
		}
		var type = ["1. HE", "2. HE", "3. HE", "DE", "1. HD", "2. HD", "DD", "GD"][game]; 
		doc.getElementById('linkAndType').appendChild(doc.createTextNode(teamLink[teamRow].replace(/\s+</, "<") + ", " + type));
		if (sum > rows)
			h2.appendChild(newElement(doc, "span", "Fehlende Spiele wurden eventuell nicht gewertet!", 
									  "style", "font-weight:normal;font-size:8pt"));
	} catch(err) {
		error(err);
	}
}
	
function makeTrFromBericht(doc, link, hheim, ttyp, tteamLink) {
	var ttr = newElement(doc, "tr");

	var fillTr = function(bericht, tr, heim, typ, teamLink) {
		if (!bericht)
			return;
		// Reihenfolge Gegenueberstellung:  1HE, 2HE, 3HE, DE,   1HD, 2HD,  DD, MIX
		// Reihenfolge Spielbericht:        1HD,  DD, 2HD, DE,   MIX, 1HE, 2HE, 3HE
		var reihenfolge = [5, 6, 7, 3, 0, 2, 1, 4];  // uebersetzung gegenueber-->bericht
		
		var spiel = bericht.spiel[reihenfolge[typ]];
		if (!spiel)
			return;
		var wir = heim; // 0 bei heimspiel, 1 bei gast
		var die = 1-wir;
		var sieg = spiel.sieg[wir];
		var hcolor = sieg ? WIN.col : LOSE.col; 
		
		var tl = doc.createTextNode(teamLink);
		var berichtLink = newParentElement("a", newParentElement("b", tl), "href", bericht.link);
		
		tr.appendChild(newParentElement("td", berichtLink, "width", "152px", "bgcolor", DARK_YELLOW.col));
		tr.appendChild(newElement(doc, "td", bericht.datum));
		tr.appendChild(newElement(doc, "td", (wir ? "Ausw." : "Heim"), "align", "center", "width", "38px")); 
		var spiWi = spiel.spieler[wir];
		var spiDi = spiel.spieler[die];
		spiWi.removeAttribute("width");
		spiDi.removeAttribute("width");
		tr.appendChild(spiWi);
		tr.appendChild(spiDi); 
		tr.appendChild(newElement(doc, "td", spiel.saetze[wir] + " : " + spiel.saetze[die], 
									"align", "center", "width", "38px", "bgcolor", hcolor));
		tr.appendChild(newElement(doc, "td", spiel.p[wir][0] + " : " + spiel.p[die][0], "align", "center", "width", "38px"));
		tr.appendChild(newElement(doc, "td", spiel.p[wir][1] + " : " + spiel.p[die][1], "align", "center", "width", "38px"));
		tr.appendChild(newElement(doc, "td", spiel.p[wir][2] ? (spiel.p[wir][2] + " : " + spiel.p[die][2]) : " ", 
									"align", "center", "width", "38px"));
	};
	
	// 
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
					spieler: [td[1].cloneNode(true), td[3].cloneNode(true)],
					spieler1: [spieler[0], gegner[0]],
					spieler2: [spieler[1], gegner[1]],
					saetze: [hSaetze, gSaetze],
					sieg: (hSaetze > gSaetze ? [1,0]:[0,1]),
					p: [(p3 ? [p1[1], p2[1], p3[1]] : [p1[1], p2[1]]), (p3 ? [p1[2], p2[2], p3[2]] : [p1[2], p2[2]])]
				};
			}
			var sa = [0, 0];
			var si = [0, 0];
			for (var i=0; i<spiele.length; i++) {
				if (spiele[i]) {
					sa[0] += spiele[i].saetze[0]; 
					sa[1] += spiele[i].saetze[1]; 
					si[0] += spiele[i].sieg[0]; 
					si[1] += spiele[i].sieg[1];
				}
			}
			var bericht = {saetze: sa, sieg: si, spiel: spiele , link: link, datum: datum};
			fillTr(bericht, ttr, hheim, ttyp, tteamLink);
		};
		loadDocument(link, onload, tr, heim, typ, teamLink);
	} catch (e) {
		error(e, link);
		return;
	}
	
}

// Gruppenansetzung
function makeAnsetzung(doc) {
	if (!doc.body || !doc.body.firstChild)
		return;
	
	var headLine = makeHeadLine(doc, getGroupNum(doc.URL));

	// unnuetze h2 loeschen
	var	h2 = doc.body.getElementsByTagName("h2")[0];
	if (h2) {
		h2.parentNode.replaceChild(headLine, h2);
	}

	if (!getPref("schonen"))
		replaceHallenschluessel(doc);


    loadDocument(doc.URL.replace("staffel-", "gegenueber/gegenueber-"), replaceTeamLinks, doc);
}

function replaceTeamLinks(tabelle, doc) { 
    try {
        var highlight = function (doc_, col, that) {
            var locA = doc_.body.getElementsByTagName("a"); 
            for (var i=0; i<locA.length; i++) {
                if (locA[i].getAttribute("href") == that.firstChild.href) {
                    locA[i].parentNode.parentNode.setAttribute("bgcolor", col);
                }
            }
        };
    
        // teams durch links ersetzen und die Teamlinks speichern
        var team = doc.body.getElementsByTagName("table")[0].getElementsByTagName("div");
        var teamObj = new Array(20); // rank: nummer innerhalb des vereins (I,II, ...), verein: globale nummer, link: link zu ansetzungen   
        var a = tabelle.getElementsByTagName("a");
        
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
                    var href = a[j].href;
                    var newA = newElement(doc, "a", name, "href", href);
                    team[i].replaceChild(newA, team[i].firstChild);
                    
                    team[i].addEventListener("mouseover", function() {highlight(doc, DARK_YELLOW.col, this);} );
                    team[i].addEventListener("mouseout", function() {highlight(doc, YELLOW.col, this);} );
    
                    teamObj[teamNumber] = { 
                                            rank: deromanize(name.substring(name.lastIndexOf(" ") + 1)),                            
                                            link: newElement(doc, "a", teamNumber, "href", href, "title", name),
                                            verein: parseInt(href.substr(-7, 2), 10)
                                          };
                }
            }
        }
        doc.body.firstChild.appendChild(newElement(doc, "p", "Spiele der vergangenen und kommenden " + 
                                                             "Woche sind farblich hervorgehoben."));
    
        // TeamNummern durch links ersetzen und dabei Teamnummern speichern. 
        var num1;
        var num2;
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
                var nextWeek = new Date();
                var lastWeek = new Date();
                nextWeek.setDate(nextWeek.getDate()+7);
                lastWeek.setDate(lastWeek.getDate()-7);
                if (date < new Date()) {
                    var o1 = teamObj[num1];
                    var o2 = teamObj[num2];
                    var spiel1 = (o1.verein<10? "0" : "") + o1.verein + "-" + (o1.rank<10? "0" : "") + o1.rank;  
                    var spiel2 = (o2.verein<10? "0" : "") + o2.verein + "-" + (o2.rank<10? "0" : "") + o2.rank;  
                    var link = WEB + "" + "spielberichte-vereine/" + spiel1 + "_" + spiel2 + ".HTML";
                    if (date > lastWeek && !getPref("schonen")) {
                        var processDoc = function(linkDoc, e, l) {
                            if (linkDoc && /\d\d-\d\d_\d\d-\d\d/.test(linkDoc.title))  {
                                replaceChildren(e, newElement(doc, "a", e.innerHTML, "href", l));
                            }
                        };
                        loadDocument(link, processDoc, div[j], link);
                    } else {
                        replaceChildren(div[j], newElement(doc, "a", t, "href", link));
                    }
                }
                if (date > lastWeek  && date < new Date()) {
                    div[j].parentNode.setAttribute("bgcolor", LIGHT_YELLOW.col);
                }
                if (date < nextWeek && date > new Date()) {
                    div[j].parentNode.setAttribute("bgcolor", DARK_YELLOW.col);
                }
            }
        }
    } catch(err) {
        error(err);
    }
}



function replaceHallenschluessel(doc) {
    loadDocument("http://bvbb.net/Hallen.687.0.html", replaceHallenschluesselCallback, doc);
}

function replaceHallenschluesselCallback(hallenDoc, doc) {
    try {
        var div = doc.getElementsByTagName("div");
        var tr = hallenDoc.getElementsByTagName("tr");
        var halle = Array(100);

        // speichere hallenschluessel in arrays
        var found = 0;
        for (var i=0; i<tr.length; i++) {
            var f = tr[i].getElementsByTagName("font")[0];
            var d = tr[i].getElementsByTagName("div");
            if (f && d[1] && d[2] && d[3]) { 
                halle[found] = {
                                key: 	f.textContent,  
                                street: d[3].textContent.replace(/^\n|<br>|^\s+|\s+$/g, "").replace(/(&nbsp;){2,}/g, " ")
                                .replace("-Nydal-", "-Nydahl-"),
                                PLZ: 	d[1].textContent.replace(/^\s+/,"") + d[2].textContent.replace("(", " ").replace(")", "")
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
                    div[j].title = (h.street + "\n" + h.PLZ);
                    var href = "http://maps.google.de/maps?q=" + h.street.replace(/\s*\n.+/g, "") + ", " + h.PLZ;

                    var a = newElement(doc, "a", div[j].textContent, "href", href, "target", "_blank");
                    div[j].replaceChild(a, div[j].firstChild);
                }
            }
        }
    } catch (err) {
        error(err);
    }       
}

function makeSpielbericht(doc) {
	try {
		var body = doc.body;
		if (!body || !body.firstChild)
			return;
		
		// check if correct web page
		if (!/\d\d-\d\d_\d\d-\d\d/.test(doc.title)) 
			return;
		
		removeElements(doc, "p");
		var h2 = doc.getElementsByTagName("h2");
		removeElement(h2[4]);
		removeParent(h2[3]);
		removeParents(h2[2], "b");
		removeParent(h2[1]);
		removeElement(h2[0]);
		
		var tr = doc.getElementsByTagName("tr");
		if (!getPref("schonen")) {
			if (!tr || !tr[0]) 
				return;
			tr[0].appendChild(newParentElement("td", makeLoadStatsButton(doc)));
		}
		var link = WEB + "aufstellung/aufstellung-";
		var heim = doc.URL.substr(doc.URL.length-16, 2);
		var gast = doc.URL.substr(doc.URL.length-10, 2);
		var fonts = tr[2].getElementsByTagName("font");
		if (fonts && fonts[2]) {
			var	a0 = newElement(doc, "a", fonts[0].textContent, "href", link + heim + ".HTML"); 
			var	a1 = newElement(doc, "a", fonts[1].textContent, "href", link + gast + ".HTML"); 
			if (getIFrame(doc)) {
				a0.target = "_blank";
				a1.target = "_blank";
			}
			replaceChildren(fonts[0], a0);
			replaceChildren(fonts[1], a1);
			replaceChildren(fonts[2], linkToKlasse(doc, fonts[2].innerHTML, getIFrame(doc) ? "_blank" : null));
		}
	
		setElementAttributes(body, "table", "width", 820);
		setElementAttributes(body.getElementsByTagName("table")[2], "tr", "height", 24);
		setElementAttributes(body.getElementsByTagName("table")[2], "td", "style", "padding: 2");
		setElementAttributes(body, "table", "style", "border:0", /Spielbericht|Klasse und Staffel|kampflos verloren/);
		
		if (getPref("centering") && !getIFrame(doc)) {
			var div = newElement(doc, "div", null, "id", "centerstyle", "width", "300px");
			while (body.hasChildNodes())
				div.appendChild(body.firstChild);
			body.appendChild(div);
		}
		adjustIFrameHeight(doc);
	} catch(err) {
		error(err, "");
	}
}

/*
 * @target: link-target des erzeugten Links
 * @param klasse: Name einer Klasse als String, darf leerzeichen enthalten. 
 * @return  HTML-Link zu der Klasse
 */
function linkToKlasse(doc, klasse, target) {
	klasse = klasse.replace(/&nbsp;| /g, "").toLowerCase();
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
	}
	return newElement(doc, "a", name, "href", href);
}

function loadPlayerStats(doc) {
	try { 
		removeElement(doc.getElementById("loadStats"));
		var isBericht = /gegenueber\/gegenueber-/.test(doc.URL) || /\d\d-\d\d_\d\d-\d\d.HTML$/.test(doc.URL);
		var staemme = /(\d\d)-(\d\d)_(\d\d)-(\d\d).HTML$/.exec(doc.URL);
		
	
		var a = doc.body.getElementsByTagName("a");
		for (var i=0; i<a.length; i++) {
			if (a[i].href.indexOf("spielerstatistik/P-") >= 0) {
				var processLink = function(playerDoc, e) {
					var wins = getWinPercentage(playerDoc);
					var f = getFestgespielt(doc, playerDoc); // f = [stammmannschaft, festgespielt, vereinsnummer]
					if (!f)
						return;
					var stamm = f[0]>0 ? "Stammmannschaft " + romanize(f[0]) : "Ersatz";
					var fest = (f[1] > 0 && f[1] != f[0]) ? ", festgespielt in Mannschaft " + romanize(f[1]) : "";
					// mannschaft innerhalb des vereins vom aktuellen spieler, die gerade spielt
					if (isBericht && staemme) {
						var mannschaft = (parseInt(staemme[1], 10) == f[2]) ? parseInt(staemme[2], 10) : parseInt(staemme[4], 10);
					}
					var slash = (e.textContent.indexOf("/") >= 0) ? "  /" : "";
					if (isBericht && (f[0] != mannschaft && staemme || !staemme && f[0] == 0)) {
						if (f[1] == 0) {
							e.textContent = e.textContent.replace(/\s+\//, "") + " (E)" + slash;
							e.title = "Ersatz";
						} else {
							e.textContent = e.textContent.replace(/\s+\//, "") + (f[0]==0?" (E":" (") + f[1] + ")" + slash;
							e.title = stamm + fest;
						}
					}
					if (!isBericht && (f[1] != 0 && f[1] != f[0])) { 
						e.textContent = e.textContent.replace(/\s\(\d\)/, "") + (f[0]==0?" (E":" (") + f[1] + ")";
						e.title = stamm + fest;
					}
					 var tr = newElement(doc, "tr");
					 tr.appendChild(newElement(doc, "td", null, "bgcolor", WIN.col, "width", ""+wins+"%"));
					 tr.appendChild(newElement(doc, "td", null, "bgcolor", LOSE.col, "width", ""+(100-wins)+"%"));
					 e.parentNode.insertBefore(newParentElement("table", tr, "height", 5, "width", 100, "style", 
									"border-left: 1px solid #888; border-right: 1px solid #444; "+
									"border-bottom: 1px solid #444; border-top: 1px solid #888;"), e.nextSibling);
					 removeElements(e.parentNode, "br");
					 adjustFrameHeight(doc);
				};
				loadDocument(a[i].href, processLink, a[i]);
			}
		}			
		adjustIFrameHeight(doc);
	} catch(err) { 
		error(err);
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
	var iFrame = getIFrame(doc);
	// check if this is an iFrame and adjust parent's height
	if (iFrame) 
		iFrame.height = (doc.documentElement.scrollHeight+40); // leave some space for player stats
}

function makeSpieler(doc) {
	try {
		var highlight = function(doc_, that) {
			var j = that.j;
			var table = doc_.body.getElementsByTagName("table");
			var tr = table[1].getElementsByTagName("tr");
			var sp = [0,0], sa = [0,0], pu = [0,0];
			for (var i=2; i<tr.length; i++) {
				var td = tr[i].getElementsByTagName("td");
				if (!that.name || td[j].textContent.indexOf(that.name) >= 0) {
					if (!that.name) {
						td[j].removeAttribute("bgcolor"); 
					} else {
						td[j].setAttribute("bgcolor", that.col1); 
					}
					tr[i].setAttribute("bgcolor", that.col2);
					var spi = />(\d)</.exec(td[5].innerHTML);
					sp[1-parseInt(spi[1])]++;
					var sae = /(\d)\s:\s(\d)/.exec(td[6].innerHTML);
					sa = [sa[0] + parseInt(sae[1]), sa[1] + parseInt(sae[2])];
					var reg = /(\d\d):(\d\d)/g;
					var pun;
					var str = td[7].innerHTML;
					while ((pun = reg.exec(str)) !== null) {
						pu[0] += parseInt(pun[1],10); 
						pu[1] += parseInt(pun[2],10); 
					}
				}
			}
			var tr = table[4].getElementsByTagName("tr");
			var descr = tr[0].getElementsByTagName("td")[0]; 
			replaceChildren(descr, newElement(doc_, "div", (that.name?that.name:""), 
											  "align", "center", "style", "font-weight:bold"));
			var erg = [sp, , sa, , pu];
			for (var i=0; i<tr.length-1; i+=2) {
				var td = tr[i+1].getElementsByTagName("td");
				td[1].firstChild.textContent = (erg[i][0] + erg[i][1]);
				td[2].firstChild.textContent = erg[i][0];
				td[3].firstChild.textContent = Math.round(1000*erg[i][0]/(erg[i][0] + erg[i][1]))/10 + "%";
				td[4].firstChild.textContent = erg[i][1];
				td[5].firstChild.textContent = Math.round(1000*erg[i][1]/(erg[i][0] + erg[i][1]))/10 + "%";
				for (var j=0; j<td.length; j++) {
					if (td[j].getAttribute("bgcolor") == WIN.col){
						var w = Math.round(100*erg[i][0]/(erg[i][0] + erg[i][1]));
						td[j].setAttribute("width", " " + (w==0?1:w) + "%");
					}
				}
			}
		};

		var table = doc.body.getElementsByTagName("table");

		var stand = table[0].getElementsByTagName("td")[1];
		var tr = table[1].getElementsByTagName("tr");
		var name = "" + tr[1].getElementsByTagName("td")[0].textContent;
		// erste spalte "Name" löschen, und stand hinten anfügen.
		tr[0].removeChild(tr[0].getElementsByTagName("td")[0]);
		tr[1].removeChild(tr[1].getElementsByTagName("td")[0]);
		tr[0].appendChild(stand);
		setElementAttributes(tr[0], "td", "style", "font-size:10pt;font-weight:bold");
		setElementAttributes(tr[1], "td", "style", "font-size:10pt");
		setElementAttributes(table[1], "tr", "valign", "bottom");
		setElementAttributes(table[1], "td", "width", 0);
		// erste Tabelle durch Namen ersetzen
		table[0].parentNode.replaceChild(newElement(doc, "h1", name), table[0]);
		
		//Klasse verlinken
		var klasse = table[0].getElementsByTagName("div")[3];
		for (var i=0; i<NAMES.length; i++) {
			var name1 =  NAMES[i].toLowerCase().replace(/\s+/g, "");
			var name2 = klasse.textContent.toLowerCase().replace(/\s+/g, "");
			if (name1 == name2) {
				var a = newElement(doc, "a", klasse.textContent, "href", WEB + "tabellen/uebersicht-" + (i<9? "0":"")  + (i+1) + ".HTML");
				klasse.replaceChild(a, klasse.firstChild);
				break;
			}
		}
		
		// ergebnistabelle[4] ist in eine weitere Tabelle[2] geschachtelt -->
		// aeussere Tabelle durch innere ersetzen, und die ueberschrift neumachen.
		table[1].parentNode.replaceChild(table[3], table[1]);
		var t = newElement(doc, "tr", null, "bgcolor", LIGHT_ORANGE.col);
		t.appendChild(newElement(doc, "td", "H e i m m a n n s c h a f t", "colspan", 8, 
								 "style", "font-size:11pt; font-weight:bold"));
		t.appendChild(newElement(doc, "td", " ", "bgcolor", DARK_ORANGE.col, "style", "border:0"));
		t.appendChild(newElement(doc, "td", "G a s t m a n n s c h a f t", "colspan", 2, 
								 "style", "font-size:11pt; font-weight:bold"));
		table[1].insertBefore(t, table[1].firstChild);
		table[1].border = 5;
		table[1].width = 780;
		
		// Satzsiege/verluste farbig
		var td = table[1].getElementsByTagName("td");
		for (var i=0; i<td.length; i++) {
			var reg = /(\d) : (\d)/.exec(td[i].innerHTML);
			if (reg) {
				td[i].setAttribute("bgcolor", reg[1] > reg[2] ? WIN.col : LOSE.col);
				td[i].id = reg[1] > reg[2] ? "win" : "lose";
			}
		}
		tr = table[1].getElementsByTagName("tr");
		for (var i=2; i<tr.length; i++) {
			var td = tr[i].getElementsByTagName("td");
			for (var j=0; j<3; j++) {
				td[j].over = {j:j, name:td[j].textContent, col1:DARK_YELLOW.col, col2:MIX_YELLOW.col};
				td[j].out = {j:j, col1:YELLOW.col, col2:YELLOW.col};
				td[j].addEventListener("mouseover", function() { highlight(doc, this.over); });
				td[j].addEventListener("mouseout",  function() { highlight(doc, this.out); });
			}
			var reg = /(DE|GD|DD|HE|HD)/.exec(td[3].innerHTML);
			td[3].over = {j:3, name:reg[1], col1:DARK_YELLOW.col, col2:MIX_YELLOW.col};
			td[3].out = {j:3, col1:YELLOW.col, col2:YELLOW.col};
			td[3].addEventListener("mouseover", function(){ highlight(doc, this.over); });
			td[3].addEventListener("mouseout",  function(){ highlight(doc, this.out); });
		}

		// table[2], table[3] sind text, table[4] die aeussere Tabelle, table[5] ueberschrift					
		tr = table[5].getElementsByTagName("tr")[0];
		tr.setAttribute("bgcolor", DARK_YELLOW.col);
		var td = tr.getElementsByTagName("td");
		td[2].setAttribute("colspan", 2);
		td[3].setAttribute("colspan", 2);
		td[6].setAttribute("colspan", 4);

		var tbody = table[6].getElementsByTagName("tbody")[0];
		tbody.insertBefore(tr, tbody.firstChild);

		table[4].parentNode.replaceChild(table[6], table[4]);
		table[4].cellpadding = 3;
		table[4].setAttribute("bgcolor", "#999999");
		table[4].width = 780;
		table[4].removeAttribute("style");
		setElementAttributes(doc, "table", "style", "border:0", /Statistik|Ergebnisse je|Stamm-Mannschaft/);
		table[5].style = "border:1px solid #888";
		table[6].style = "border:1px solid #888";
		table[7].style = "border:1px solid #888";
	} catch (e) {
		error(e);
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
 * return: i>0: Stammspieler in Mannschaft i, i=0: Ersatz, nicht festgespielt, i<0: ersatzspieler, festgespielt in Mannsch. i.
 */
function getFestgespielt(doc1, doc) {
	if (!doc || !doc)
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
		error(err);
	}
}

function makePlayerLinks(doc) {
    loadDocument(WEB + "spielerstatistik/P-Drop-down-Spieler.HTML", makePlayerLinksCallback, doc); 
}

function makePlayerLinksCallback(playerDoc, doc) {
    try {
    	var d = doc.getElementsByTagName("b");
    	// load player links from options element and convert to array
    	var p = playerDoc.getElementsByTagName("option");
    	// convert entries to objects
        p = Array.map(p, function(e) { return { 
            name:   e.innerHTML.replace(/&nbsp;&nbsp;+\(.*\)/, ""), 
            link:   e.value
        };});
    	// loop over player names in the document
    	for (var i=0; d && i<d.length; i++) {
    		var name = d[i].innerHTML.replace(/^\s+|\s+$|(\s\(\d\))/g, "");
            var ext = RegExp.$1 ? RegExp.$1 : "";
            if (!name || name.length < 5 || name.indexOf("<") >= 0 || name.indexOf("Additionsregeln") >= 0)
    			continue;
    		for (var j=0; j<p.length; j++) {
    		    // does player name from players list match player name in document?
    			if (p[j].name == name) { 
    			    // is player name unique in list?
    				if ((!p[j-1] || p[j-1].name != p[j].name) && (!p[j+1] || p[j+1].name != p[j].name)) {
    					replaceChildren(d[i], newElement(doc, "a", name + ext, "href", WEB + "spielerstatistik/" + p[j].link));
    					break;
    				}
    				// name is not unique. Load player's page and check the team name
    				if (doc.URL.indexOf("aufstellung/aufstellung-") >= 0) {
    				    var callback = function(playerPage, doc_, name_ext, di, pj) {
    				        try {
        					    var ref = playerPage.body.getElementsByTagName("a")[0].href;
        						if (ref.substr(-7) == doc_.URL.substr(-7)) {
        							replaceChildren(di, newElement(doc_, "a", name_ext, "href", WEB + "spielerstatistik/" + pj.link));
        						}
    					    } catch(err) {
    					        error(err, "Fehler beim Verlinken von doppelt vorkommenden Spielernamen: " + playerPage.URL);
    					    }
    				    };
                        loadDocument(WEB + "spielerstatistik/" + p[j].link, callback, doc, name+ext, d[i], p[j]);
    				}
    			}
    		}
    	}
    } catch(err) {
        error(err, "Fehler beim Verlinken der Spielernamen.");
    }
}

/**
 * create the headline as h2 element.
 * 
 * @param links Array of links ("a" elements) which are placed to the right of the selection
 * @param selection A selection (drop down element) element 
 * @returns headline as H2 element.
 */
function newHeadLine(doc, links, selection, stand) {
	var form = newParentElement("form", selection, "name", "form1");

	var	td = doc.getElementsByTagName("td");
	var stand = doc.createTextNode(""); 
	for (var i = 0; i < td.length; i++) {
		if (td[i].innerHTML.indexOf("Stand:") > -1) {
			stand = td[i].firstChild;
			break;
		}
	}

	var h2 = doc.createElement("h2");
	h2.appendChild(form);
	// span would be nicer as a spacer, but i'll remove all unnecessary "spans" from the document later
	h2.appendChild(newElement(doc, "a", null, "style", "padding-left:30"));
	for (var i=0; i<links.length; i++) {
	    if (links[i].outerHTML && links[i].href.indexOf(doc.URL.substr(-20)) >= 0) {
	        h2.appendChild(doc.createTextNode(links[i].innerHTML));
	    } else {
	        h2.appendChild(links[i]);
	    }
	    h2.appendChild(newElement(doc, "a", null, "style", "padding-left:10"));
	}
	h2.appendChild(newElement(doc, "a", null, "style", "padding-left:30"));
	h2.appendChild(stand);
	return h2;
}

/**
 * Parse die Seite der Vereine als Objekte mit den Attributen 
 * { nr: int, link: html-<a>-Element, name: String }
 */
function parseVereine(vereine) {
    var td = vereine.getElementsByTagName("td");
    var data = new Array(100); // max 100 vereine, sonst auf drei ziffern testen
    var numSets = 0;
    for (var i=0; i<td.length; i++) {
        if (/>\d\d<|>\d\d\d<$/.test(td[i].innerHTML) && td[i].innerHTML.indexOf("<div") >= 0) {
            var el = td[i].getElementsByTagName("div")[0];
            var l = td[i+1].getElementsByTagName("a")[0];
            l.href = "http://bvbb.net/" + l.href.substring(l.href.lastIndexOf("fileadmin"));
            data[numSets] = { 
                              nr : el.innerHTML, 
                              link : l, 
                              name : td[i + 2].innerHTML 
                            };
            numSets++;
        }
    }
    data = data.filter(function(e) { return e; } );
    data.sort(function (a,b) { return a.name!=b.name ? a.name<b.name ? -1 : 1 : 0; });
    return data;
}


function makeTeamHeadLine(doc) {
    var teamNum = doc.URL.substr(-7, 2);
    
    // make new selection element, which is passed to "newTeamHeadLine". 
    // Contents are filled in the callback function.
    var selection = newElement(doc, "select", null, "id", "selection", "name", "jumpmenu", 
                               "onChange", "document.location.href = this.value;");

    var loadVereineCallback = function(loadedDoc, teamNum_, sel) {
        try {
            var vereine = parseVereine(loadedDoc);
            // Fill selection with the loaded team list. 
            var selectedIndex = 0;
        	for (var i=0; i<vereine.length; i++) {
        		if (!vereine[i])
        			continue;
        		var opt = newElement(doc, "option", vereine[i].name, "value", vereine[i].link.href);
        		sel.appendChild(opt);
                if (vereine[i]  && parseInt(vereine[i].nr, 10) == teamNum_) {  
                    selectedIndex = i;
                }
        	}
        	sel.selectedIndex = selectedIndex;
        } catch (err) {
            error(err);
        }
    }
    // load contents to fill team selection element
    loadDocument(WEB + "spielberichte-vereine/spielbericht-vereine.HTML", loadVereineCallback, teamNum, selection);

    // search "Stand" element
	var stand; 
	var	td = doc.getElementsByTagName("td");
	for (var i = 0; i < td.length; i++) {
		if (td[i].innerHTML.indexOf("Stand:") > -1) {
			stand = td[i].firstChild;
			break;
		}
	}
	
    var spiele = newElement(doc, "a", "Spielansetzungen", "class", "navigationUnselected", 
            "href", WEB + "spielberichte-vereine/verein-" + teamNum + ".HTML");
    var aufstellung = newElement(doc, "a", "Aufstellung", "class", "navigationUnselected", 
                "href", WEB + "aufstellung/aufstellung-" + teamNum + ".HTML");

	return newHeadLine(doc, [aufstellung, spiele], selection, stand);
}

function makeHeadLine(doc, groupNum) {
	var ansetzungen = newElement(doc, "a", "Ansetzungen", "class", "navigationUnselected", 
							"href", WEB + "staffel-" + SHORT_NAMES[groupNum] + ".HTML");
	var gegenueber = newElement(doc, "a", "Gegen\u00FCberstellung", "class", "navigationUnselected", 
							"href", WEB + "gegenueber/gegenueber-" + SHORT_NAMES[groupNum] + ".HTML");
	var tabelle = newElement(doc, "a", "Tabelle", "class", "navigationUnselected", 
							"href", WEB + "tabellen/uebersicht-" + (groupNum<9?"0":"") + (groupNum+1) + ".HTML");
	
    var sel = newElement(doc, "select", null, "id", "selection", "name", "jumpmenu", 
            "onChange", "document.location.href = this.value;");
	for (var i=0; i<NAMES.length; i++) {
		var l;
		if (doc.URL.indexOf("tabellen/uebersicht-") >= 0) 
			l = "tabellen/uebersicht-" + (i<9?"0":"") + (i+1);
		if (doc.URL.indexOf("meisterschaft/staffel-") >= 0) 
			l = "staffel-" + SHORT_NAMES[i];
		if (doc.URL.indexOf("gegenueber/gegenueber-") >= 0) 
			l = "gegenueber/gegenueber-" + SHORT_NAMES[i];

		sel.appendChild(newElement(doc, "option", NAMES[i], "value", WEB + l + ".HTML"));
	}
	sel.selectedIndex = groupNum;

	var stand; 
	var	td = doc.getElementsByTagName("td");
	for (var i = 0; i < td.length; i++) {
		if (td[i].innerHTML.indexOf("Stand:") > -1) {
			stand = td[i].firstChild;
			break;
		}
	}
	
	return newHeadLine(doc, [tabelle, ansetzungen, gegenueber], sel, stand);
}

function parseAnsetzung(tabelle, ansetzungen) {
    var tr = tabelle.getElementsByTagName("h2")[1].getElementsByTagName("tr");
	if (!ansetzungen)
		return;
	// team-Tabelle parsen und die Teamlinks speichern
	var	div = ansetzungen.body.getElementsByTagName("h2")[1].getElementsByTagName("div");
	var teamObj = new Array(20); // rank: nummer innerhalb des vereins (I,II, ...), verein: globale nummer, link: link zu ansetzungen   
	
	var teamNumber = 0;// kurznummer in dieser Tabelle
	for (var i=0; i<div.length; i++) {
		// leerzeichen alle entfernen, hier werden &nbsp; benutzt, in der Tabelle nur ' '.
		var nameI = div[i].innerHTML.replace(/<b>|<i>|&nbsp;|<\/b>|<\/i>/g, " ").replace(/^\s+|\s+$/g, "");
		if (nameI.length > 0 && nameI.length < 3) {
			teamNumber = parseInt(nameI);
			continue;
		}
		for (var j=2; j<tr.length; j++) {
			var a = tr[j].getElementsByTagName("a")[0];
			var nameJ = a.innerHTML.replace(/<b>|\s*<\/b>\s*$|\s+$/g, ""); 
			if (nameJ.length < 6)
				continue;
			if (nameJ == nameI) {
				var href = a.getAttribute("href");
				teamObj[teamNumber] = { 
					rank: deromanize(nameJ.substring(nameJ.lastIndexOf(" ") + 1)), 							
					link: "<a title='"+ nameJ + "' href='" + href + "'>" + teamNumber + "</a>",
				    verein: parseInt(href.substr(-7, 2), 10),
					tabellenPlatz: j-2
			  	};
			}
		}
	}
	teamObj = teamObj.filter(function(e) { return e;} );

	var num1;
	var num2;
	var ansetzung = new Array(200);
	var numAns = 0;
	var div = ansetzungen.body.getElementsByTagName("div"); 
	for (var j=0; j<div.length; j++) { 
		var ex = /^(\d+) \/ (\d+)$/.exec(div[j].innerHTML);
		if (ex) {
			num1 = ex[1];
			num2 = ex[2];
		}
		if (/\d\d.\d\d.\d\d\d\d/.test(div[j].innerHTML)) {
			// num1 und num2 sind noch von der letzten Zelle belegt
			ansetzung[numAns++] = {
				t1: teamObj[num1-1].tabellenPlatz,
				t2: teamObj[num2-1].tabellenPlatz,
				date: div[j].textContent,
				time: div[j+1].textContent,
				loc: div[j+2].textContent,
			};
		}
	}
	return ansetzung.filter(function(e) { return e;} );
}


function makeTabelle(doc) {
	var body = doc.body;
	var headLine = makeHeadLine(doc, parseInt(doc.URL.substr(-7, 2), 10)-1);
				
	var h2 = body.getElementsByTagName("h2")[0]; // uebersicht
	if (!h2) {
		alert("Kann die Tabelle nicht richtig laden.");
		return;
	}
	h2.parentNode.replaceChild(headLine, h2);

	removeElements(body, "p", /Vorheriger/);
	removeElements(body, "h2", /Aufsteiger|Ergebniss-Link|Fenster schlie/);

	var	table = body.getElementsByTagName("table");
	if (table[1] && table[1].getElementsByTagName("tr")[0]) {
		removeElement(table[1]);
	}

	var	td = body.getElementsByTagName("td");
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
	
	removeParents(doc, "b");

	// iFrame hinzufügen
	if (getPref("useIframe")) {
		var ifrm = newElement(doc, "iframe", null, 
							  "id", "ifrmErgebnis", "width", 885, "height", 10, "frameborder", 0, "marginwidth", 0,
							  "border", 1, "marginheight", 0, "name", "Ergebnis");
		doc.getElementById("centerstyle").appendChild(ifrm);

		// setze target der Links auf "Ergebnis", wenn sie auf ein Spielbericht zeigen.
		var	links = body.getElementsByTagName("a");
		for (var i=0; i<links.length; i++) {
			if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(links[i].href)) 
				links[i].target = "Ergebnis";
		}
	}
	var url = doc.URL.replace(/tabellen\/uebersicht-\d\d/, "staffel-" + SHORT_NAMES[(parseInt(doc.URL.substr(-7, 2), 10)-1)]);
    loadDocument(url, insertAnsetzungen, doc);
}

function insertAnsetzungen(ansetzungen, doc) {
	var spiele = parseAnsetzung(doc, ansetzungen);
	if (spiele) {
		var verein = new Array(10);
		var gespielt = [new Array(10), new Array(10), new Array(10), new Array(10), new Array(10),
						new Array(10), new Array(10), new Array(10), new Array(10), new Array(10)];
		//alert(doc, spiele.toSource());
		var	tr = doc.body.getElementsByTagName("tr");
		for (var i = 0; i < tr.length-2; i++) {
			var	td = tr[i+2].getElementsByTagName("td");
			verein[i] = td[1].textContent;
			for (var j = 0; j < td.length-6-1; j++) {
				var cell = td[j+6];
				var div = cell.getElementsByTagName("div")[0];
				if (cell.getAttribute("bgcolor") == ORANGE.col || /\d : \d.*\d : \d/.test(div.innerHTML)) { // fällt aus oder beide gespielt
					if (cell.getAttribute("bgcolor") == ORANGE.col) {
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
				
				var br = div.appendChild(newElement(doc, "br"));
				
				if (cell.getAttribute("valign") == "top" || /0 : 8\s*<br>|8 : 0\s*<br>/.test(div.innerHTML)) { // heimspiel gewesen
					gespielt[i][j] = cell.getElementsByTagName("a")[0];
					if (!gespielt[i][j])
						gespielt[i][j] = cell.getElementsByTagName("font")[0];
					var date = dateFromSpiele(doc, spiele, j, i);
					if (date) {
						removeParents(div, "br");
						div.appendChild(br);
						div.appendChild(date);
					}
					continue;
				}
				if (cell.getAttribute("valign") == "bottom" || /<br><font color="#FF6600"/.test(div.innerHTML)) { // auswaerts gewesen
					var date = dateFromSpiele(doc, spiele, i, j);
					if (date) {
						removeParents(div, "br");
						div.insertBefore(br, div.firstChild);
						div.insertBefore(date, div.firstChild);
					}
					continue;
				}
				// nix gewesen
				var hDate = dateFromSpiele(doc, spiele, i, j);
				var aDate = dateFromSpiele(doc, spiele, j, i);
				replaceChildren(div, hDate, br, aDate);
			}
		}
		spiele = spiele.sort(function(spiel1, spiel2) {return spiel1.date.replace(/(\d\d).(\d\d).(\d\d\d\d)/, "$3$2$1")+spiel1.time > 
															  spiel2.date.replace(/(\d\d).(\d\d).(\d\d\d\d)/, "$3$2$1")+spiel2.time; });
		var bald = spiele.filter(function(s) {return !gespielt[s.t1][s.t2]; });
		var vorbei = spiele.filter(function(s) {return gespielt[s.t1][s.t2] && gespielt[s.t1][s.t2] != -1; });
		var numLines = 4;
	
		var tbody = newElement(doc, "tbody");
		var hidden = "visibility:collapse";
		var shown = "font-size:11pt; font-weight:bold";
		
		var showHide = function(that) {
							var name = that.getAttribute("name");
							if (name == "show") {
								e = that.nextSibling;
								while(e) {
									e.setAttribute("style", shown);
									e = e.nextSibling;
								}
								that.ownerDocument.getElementById("mehr").innerHTML = "&#9660; ";
								that.setAttribute("name", "hide");
							}
							if (name == "hide") {
								e = that.nextSibling;
								while(e) {
									e.setAttribute("style", hidden);
									e = e.nextSibling;
								}
								that.ownerDocument.getElementById("mehr").innerHTML = "&#9658; ";
								that.setAttribute("name", "show");
							}
					   };
		
		var head = newElement(doc, "td", null, 			
									"colspan", 2,
									"style", "cursor: pointer; font-size:9pt; font-weight:bold",
									"bgcolor", DARK_YELLOW.col);
		
		var font = newElement(doc, "font", null, "id", "mehr");
		font.innerHTML = "&#9658; ";
		head.appendChild(font);
		head.appendChild(newElement(doc, "u", "Aktuelle Termine (laut Ansetzung)"));
		var tr = newParentElement("tr", head, "name", "show");
		tr.addEventListener("click", function(){showHide(this);}, false);
		tbody.appendChild(tr);
		tr = newParentElement("tr", newElement(doc, "td", "Kürzlich", "style", 
												   "font-size:11pt; font-weight:bold"), "bgcolor", DARK_YELLOW.col,
							  "style", hidden);
		tr.appendChild(newElement(doc, "td", "Demnächst", 
								  "style", "font-size:11pt; font-weight:bold"));
		tbody.appendChild(tr);
	
		// array of new lines
		tr = new Array(numLines);
		for (var i=0; i<numLines; i++) {
			tr[i] = newElement(doc, "tr", null, "style", hidden);
		}
	
	
		// kürzlich
		for (var i = Math.max(0, vorbei.length-numLines); i<vorbei.length; i++) {
			var s = vorbei[i];
			var a = gespielt[s.t1][s.t2].cloneNode(true);
			var td1 = newElement(doc, "td", null, "style", "padding-right:20; padding-bottom:0");
			a.textContent = a.textContent.replace(/\s+$/, "");
			td1.appendChild(doc.createTextNode(s.date.replace(/.20/,".") + ": "));
			td1.appendChild(newElement(doc, "b", verein[s.t1]));
			td1.appendChild(doc.createTextNode(" spielt "));
			td1.appendChild(a);
			td1.appendChild(doc.createTextNode(" gegen "));
			td1.appendChild(newElement(doc, "b", verein[s.t2]));
			tr[i - Math.max(0, vorbei.length-numLines)].appendChild(td1);
		}
		
		// demnächst
		for (var i=0; i < Math.min(numLines, bald.length); i++) {
			var s = bald[i];
			var td2 = newElement(doc, "td", null, "style", "padding-right:10; padding-bottom:0");
			td2.appendChild(doc.createTextNode(s.date.replace(/.20/,".") + ": "));
			td2.appendChild(newElement(doc, "b", verein[s.t2]));
			td2.appendChild(doc.createTextNode(" zu Gast bei "));
			td2.appendChild(newElement(doc, "b", verein[s.t1]));
			td2.appendChild(newElement(doc, "br"));
			tr[i].appendChild(td2);
		}
		var table = newParentElement("table", tbody, "cellpadding", 4, "style", "border:0; color:"+FRAME_TOP.col);
		for (var i=0; i<numLines; i++) {
			tbody.appendChild(tr[i]);
		}
		doc.body.firstChild.insertBefore(table, doc.body.getElementsByTagName("table")[0].parentNode);
	}
}

function dateFromSpiele(doc, spiele, i, j) {
	var spiel = spiele.filter(function(el) {return el.t1 == i && el.t2==j;})[0];
	if (!spiel) 
		return;
	var date = spiel.date.substr(0, spiel.date.length-4);
	return newElement(doc, "a", date, "style", "font-weight:normal; color:" + ORANGE.col);
}


/**
 * Change colors, set Stylesheet, 
 */
function makeStyle(doc) {
	// center page
	if (getPref("centering") && !/\d\d-\d\d_\d\d-\d\d.HTML$/.test(doc.URL)) {
        var div = newElement(doc, "div", null, "id", "centerstyle");
        while (doc.body.hasChildNodes())
            div.appendChild(doc.body.firstChild);
        doc.body.appendChild(div);
    }

	// insert style (with elements whose colors should be replaced)
	var style = doc.getElementsByTagName("style");
	if (style[0])
		style[0].parentNode.replaceChild(newElement(doc, "style", "<!--" + STYLE + "-->", "type", "text/css"), style[0]);

    // set colors in the COLORS array according to prefs.
    for (var i=0; i<COLORS.length; i++) {
        var newcol = getPref("newColors");
        COLORS[i].col = newcol ? COLORS[i].newcol : COLORS[i].old; 
    }

    // replace colors
    for (var i=0; i<COLORS.length; i++) {
        if (COLORS[i].old != COLORS[i].col) {
            doc.documentElement.innerHTML = doc.documentElement.innerHTML.replace(new RegExp(
                                                            COLORS[i].old.substring(1), "g"), 
                                                            COLORS[i].col.substring(1));
        }
    }

	var style = doc.getElementById("style");
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
	
	removeParents(doc, "i");
}

function run(evt) {
    if (!evt || !evt.target || !evt.target.URL)
        return;
    var doc = evt.target;
    var url = doc.URL;
    if (url.indexOf(WEB_SHORT) < 0)
        return;
    
    try {
    	if (doc.getElementById("bvbbBody"))
    		return;
    
    	if (doc.body) // avoid processing the same file twice (for example, when embedded in an iframe)
    		doc.body.id = "bvbbBody";
    
    	makeStyle(doc);
    	removeElements(doc.body, "h2", /Fenster schlie/);
    	removeElements(doc.body, "table", /Fenster schlie/);
    
    	if (!getPref("newWindow")) {
    		if (!getIFrame(doc)) {
    			setElementAttributes(doc.body, "a", "target", "_self", /_blank/);
    		}
    	}
    	
    	if (/meisterschaft\/staffel-/.test(url)) {
    		makeAnsetzung(doc);
    	}
    	if (/gegenueber\/gegenueber-/.test(url)) {
    		makeGegenueber(doc);
    	}
    	if (/aufstellung\/aufstellung-/.test(url)) {
    		makeAufstellung(doc);
    	}
    	if (/spielberichte-vereine\/verein-/.test(url)) { 
    		makeVerein(doc);
    	} 
    	if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(url)) {
    		makeSpielbericht(doc);
    	}
    	if (/uebersicht/.test(url)) {
    		makeTabelle(doc);
    	}
    	if (/spielerstatistik\/P-/.test(url)) {
    		makeSpieler(doc);
    	}
    } catch (err) {
        error(err);
    }
}

var windowListener = {
	onOpenWindow: function(aWindow) {
	    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    domWindow.addEventListener("DOMContentLoaded", run, false);
	},
	onCloseWindow: function(aWindow) {
	    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    domWindow.removeEventListener("DOMContentLoaded", run, false);
	},
	onWindowTitleChange: function(aWindow, aTitle) {}
};
 
function startup(aData, aReason) {
    Components.utils.import("chrome://bvbbpp/content/utils.jsm");
    
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
		Components.utils.unload("chrome://bvbbpp/content/utils.jsm");
}
 
function install(aData, aReason) {
	for (var i=0; i<PREFS.length; i++) {
		if (!prefManager.getBranch("extensions.bvbbpp.").prefHasUserValue(PREFS[i].name)) {
			prefManager.getBranch("extensions.bvbbpp.").setBoolPref(PREFS[i].name, PREFS[i].def);
		}
	}
}
function uninstall(aData, aReason) {
	shutdown(aData, aReason);
	for (var i=0; i<PREFS.length; i++) {
		prefManager.getBranch("extensions.bvbbpp.").clearUserPref(PREFS[i].name);
	}
}