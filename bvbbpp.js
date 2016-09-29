// Copyright 2012-2014 Felix Kaelberer <bvbbpp@gmx-topmail.de>
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.
//
"use strict";

var CALENDAR_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACS0l" +
    "EQVR42q2TS2gTURSGO4mZvBNJyDu4KQhdhIS6sEbBWpRusywuXLhTNwqV2p0KRSjdiBs3iopLcavdhChYW0F8Ia4l7" +
    "xfk1cyQSTJ+N0RJumrBgcM957/n/vec/56RZg58iUTiG8tcuVw+VywWP03gv1n8hUJhvlKp/PqLSw6HQ45Go6uyLJ9" +
    "pt9sbbrf7DfjxVquVYu8yvgP8Dvh3cQB8EXy11+t9zOfzW1IsFntiNBqvik0SU06n85kgOOBfwE+LC/EX8TMifzAYP" +
    "JUoTcG3CKDf798bDodtbBbSlyaT6T2wEfwWmBPzg78GT487UAWBPiHBgKRtXddbJC6Jnse4Bv4WXAG/SOz5p4EgYHN" +
    "HUZSdmSN8Vqs1aTAYkiMCVF1CnD2bzRZjr0v8gwQjvc4T6+x9VlVV9/v9CWJzt9v9ipDJYDCYHhGUSiUhzLLdbl8XB" +
    "3K53BwEp71e73NxW61WS6F6KRwO747FXsP2iDOTBCkIbooEnicBwYLH43k8JlgZE4zU73Q6d6kqM0WAQA1IVlj3GaB" +
    "Ns9nso4Lr5A8heMhLKIFA4LYkSTKHRWXBKQLsHcPihkAjoStuInSKlprNZkfELpfLDsEx4iZ6nJ8iQJSz2AZ5PTQ4S" +
    "QunqOCVOFitVi/RQiUSiXwRc0H/N7Cf/02DATcs86YSJYqe97PZ7DWLxXLC5/PdFxrwY61pmtbmn3lELDcajS1atdH" +
    "GthSPxz8QqPV6/QGzrR1miJhGE+2to4dFgmU2FAq9IFhgz3DIQRxy6S6tX/kDUgliRvSSn2IAAAAASUVORK5CYII=";



var MOBILE = false;

// TODO store defaults (relict from old firefox extension)
// preferences and defaults
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


var BB = "BB";
var L1 = "LL-1", L2 = "LL-2", L3 = "LL-3", L4 = "LL-4";
var Z1 = "BZ-1", Z2 = "BZ-2", Z3 = "BZ-3", Z4 = "BZ-4";
var A1 = "AK-1", A2 = "AK-2", A3 = "AK-3", A4 = "AK-4";
var B1 = "BK-1", B2 = "BK-2", B3 = "BK-3", B4 = "BK-4";
var C1 = "CK-1", C2 = "CK-2", C3 = "CK-3", C4 = "CK-4";
var D1 = "DK-1", D2 = "DK-2", D3 = "DK-3", D4 = "DK-4";
var E1 = "EK-1", E2 = "EK-2", E3 = "EK-3", E4 = "EK-4";
var F1 = "FK-1", F2 = "FK-2", F3 = "FK-3", F4 = "FK-4";
var G1 = "GK-1", G2 = "GK-2", G3 = "GK-3", G4 = "GK-4";

var DIVISIONS = [];
// keine Gegenueberstellung 2006/07
// DIVISIONS[ 6] = [BB, L1, L2, Z1, Z2, Z3, Z4, A1, A2, A3, A4, B1, B2, B3, C1, C2, C3];
// keine Spieltermine 2007/08, 2008/09
// DIVISIONS[ 7] = [BB, L1, L2, Z1, Z2, Z3, Z4, A1, A2, A3, A4, B1, B2, B3, B4, C1, C2, C3];
// DIVISIONS[ 8] = [BB, L1, L2, Z1, Z2, Z3, Z4, A1, A2, A3, A4, B1, B2, B3, B4, C1, C2, C3];

// Nur diejenigen Staffeln müssen angegeben werden, die sich von der Vorsaison unterscheiden.
DIVISIONS[ 9] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, F3];
DIVISIONS[11] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2];
DIVISIONS[13] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2, G3];
DIVISIONS[14] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2];

var FIRST_SEASON = 9
var CURRENT_SEASON = getCurrentSeasonYear();
var SEASONS = [];
for (var i = FIRST_SEASON; i <= CURRENT_SEASON; i++ ) {
	SEASONS.push(i);
	if (!DIVISIONS[i]) {
		DIVISIONS[i] = DIVISIONS[i - 1];
	}
}

function toColorObject(color) {
  return { css: "#" + color, bg: "bg" + color, fg: "col" + color };
}

var LIGHT_YELLOW = toColorObject("FFFFCC");
var YELLOW       = toColorObject("FFFF66");
var MIX_YELLOW   = toColorObject("FAFA44");
var DARK_YELLOW  = toColorObject("F0F000");
var LIGHT_ORANGE = toColorObject("FFCC33");
var ORANGE       = toColorObject("FF9900");
var DARK_ORANGE  = toColorObject("CC9933");
var AUFSTEIGER   = toColorObject("00CC00");
var ABSTEIGER    = toColorObject("FF6633");
var ZURUECK      = toColorObject("FF0022");
var WIN          = toColorObject("33FF00");
var LOSE         = toColorObject("FF0000");
var FRAME_TOP    = toColorObject("D8D8D8");
var FRAME_BOTTOM = toColorObject("474747");
var KAMPFLOS     = toColorObject("FF6600");

var COLORS = [YELLOW, LIGHT_YELLOW, MIX_YELLOW, DARK_YELLOW, LIGHT_ORANGE, ORANGE, DARK_ORANGE,
              AUFSTEIGER, ABSTEIGER, ZURUECK, WIN, LOSE, FRAME_TOP, FRAME_BOTTOM];

var BODY = null;
var BVBBPP;
var URL_TEST = /bvbb\.net\/fileadmin\/user_upload\/(schuch|saison\d\d\d\d)\/meisterschaft/;


addEventListener("DOMContentLoaded", function(event) {
  var doc = event.originalTarget;
  if (doc.nodeName === "#document" && URL_TEST.test(doc.URL)) {
    new Bvbbpp(doc).run();
  }
});


function Bvbbpp(document) {
  this.URL = document.URL;
  this.valid = true;
  if (!this.valid) {
    return;
  }
  this.doc = document;
  this.body = document.body;
  this.year = getYear(this.URL);
  this.season = {
    webName: toWebName(this.year),
    name: toSeasonName(this.year)
  };
  this.divisions = {
    shortNames: DIVISIONS[this.year],
    names: DIVISIONS[this.year].map(toLongName)
  };
  this.web = "http://bvbb.net/fileadmin/user_upload/" + this.season.webName + "/meisterschaft/";
  this.webSpielberichteVereine = this.web + "spielberichte-vereine/";
  this.webAufstellung = this.web + "aufstellung/";
  this.webHallen = this.web + "Hallen.HTML";
  this.this_ = {
    bvbbpp : this
  };
}

Bvbbpp.prototype = {
  otherYearURL: function bvbbpp_otherYearURL(otherYear) {
    return this.URL.replace(this.season.webName, toWebName(otherYear));
  },

  getGroupNum: function bvbbpp_getGroupNum() {
    var groupName = this.URL.substr(-9, 4);
    for (var i = 0; i < this.divisions.shortNames.length; i++) {
      if (this.divisions.shortNames[i] == groupName) {
        return i;
      }
    }
    // wenn nix trifft, dann wars wohl BB (hat nur 2 Buchstaben)
    return 0;
  },

  run: function bvbbpp_run() {
    BVBBPP = this;
    BODY = document.body;

    if (!this.body.firstChild || this.doc.getElementById("bvbbBody")) {
      return;
    }

    // avoid processing the same file twice (for example, when embedded in an iframe)
    BODY.id = "bvbbBody";

    var url = document.URL;
    makeStyle();

    if (!getIFrame()) {
      setElementAttributes(BODY, "a", "target", "_self", /_blank/);
    }

    if (/meisterschaft\/staffel-/.test(url)) {
      makeAnsetzung();
    }
    if (/gegenueber\/gegenueber-/.test(url)) {
      makeGegenueber();
    }
    if (/aufstellung-\d{2,3}.HTML/i.test(url)) {
      makeAufstellung();
    }
    if (/verein-\d{2,3}.HTML/i.test(url)) {
      makeVerein();
    }
    if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(url)) {
      makeSpielbericht();
    }
    if (/uebersicht/.test(url)) {
      makeTabelle();
    }
    if (/spielerstatistik\/P-/.test(url)) {
      makeSpieler();
    }
    if (/meisterschaft\/Hallen.HTML/.test(url)) {
      ensureHallenschluessel().then(replaceHallenschluessel);
    }
  }
};

function getYear(url) {
  var seasonString = /user_upload\/(\w*)\//.exec(url)[1];
  if (seasonString === "schuch") {
    return CURRENT_SEASON;
  }
  if (seasonString.indexOf("saison") >= 0) {
    return parseInt(seasonString.substr("saison".length, 2), 10);
  }
  return CURRENT_SEASON;
}

function getCurrentSeasonYear() {
	// lässt die neue Saison ab August starten
	var d = new Date();
	var year = d.getFullYear() - 2000;
	var august = 7
	if (d.getMonth() < august) {
	  year -= 1
	}
	return year
}

function toSeasonName(year) {
  return "20" + twoDigits(year) + "/" + twoDigits(year + 1);
}

function toWebName(year) {
  if (year === CURRENT_SEASON) {
    return "schuch";
  }
  return "saison" + twoDigits(year) + twoDigits(year + 1);
}

function toLongName(shortName) {
  return shortName.replace("BB", "Berlin-Brandenburg-Liga")
                  .replace("LL-", "Landesliga ")
                  .replace("BZ-", "Bezirksklasse ")
                  .replace("K-", "-Klasse ")
                  .replace("1", "I").replace("2", "II").replace("3", "III").replace("4", "IV");
}

function getNotFoundElement() {
  var h1 = document.body.getElementsByTagName("h1");
  for (var i = 0; i < h1.length; i++) {
    if (h1[i].textContent === "Not Found") {
      return h1[i];
    }
  }
  return undefined;
}

function isDue() { // Websites should be online by now.
  var date = new Date();
  date.setFullYear(2000 + BVBBPP.year, 10 /* = November */, 0);
  return Date.now() > date;
}

/**
 * create(type, textContent, arg2, arg3) is a shortcut for
 * newElement(document, type, textContent, arg2, arg3, ...)
 */
function create() {
  return newElement.apply(this, [document].concat([].slice.call(arguments)));
}

function errorMsg(e, msg) {
  return e ? "BVBB++: Fehler in Zeile " + e.lineNumber + ": " + e.message + " " + (msg ? msg : "")
           : "BVBB++: " + msg;
}

/**
 * Get a preference from the branch "extensions.bvbbpp.". If it doesn't exist, create the preference
 * with default setting.
 * 
 * TODO https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Implement_a_settings_page
 *
 * @param name
 *            pref name
 * @returns pref value
 */
function getPref(name, callback) {
	return false;
	return chrome.storage.local.set(name, callback);
}

function setPref(name, value) {
		var pref = {};
		pref[name] = value;
		chrome.storage.local.set(pref);
}

function makeAufstellung() {
  var teamNum = parseInt(BVBBPP.URL.substr(-7, 2), 10);
  makeHeadLine(-1, teamNum);

  var dueText = "Eventuell spielt der Verein in der Saison " + BVBBPP.season.name + " nicht.";
  var futureText = "Eventuell ist diese Webseite f\u00FCr die Saison " +
                   BVBBPP.season.name + " noch nicht online.";
  if (onNotFound(dueText, futureText)) {
    return;
  }

  var h2 = BODY.getElementsByTagName("h2");
  if (!h2[0]) {
    return;
  }
  var td = BODY.getElementsByTagName("td");

  var title = "Aufstellung " + td[1].textContent + " " + td[3].textContent;
  var titleNode = create("h1", title, "class", "title");
  h2[0].parentNode.replaceChild(titleNode, h2[0]);
  var favoriteStar = makeFavoriteStar(BVBBPP, -1, teamNum);
  titleNode.appendChild(favoriteStar);
  BVBBPP.doc.title = title.replace(" (R\u00FCckrunde)", "").replace(" (Hinrunde)", "");
  var button = makeLoadStatsButton(BVBBPP);
  button.setAttribute("style", "margin: auto 320px"); // wie geht's besser?
  h2[0].parentNode.appendChild(button);

  var playerListURL = BVBBPP.web + "spielerstatistik/P-Drop-down-Spieler.HTML";
  getDocument(playerListURL).then(makePlayerLinksCallback.bind(BVBBPP.this_));

  var f = BODY.getElementsByTagName("font");
  for (var i = 0; i < f.length; i++) {
    var link = linkToKlasse(f[i].textContent);
    if (link) {
      f[i].replaceChild(link, f[i].firstChild);
      link.textContent = link.textContent.toUpperCase();
      if (link.textContent.length < 20) {
        link.setAttribute("style", "letter-spacing:2px; font-weight:600");
      }
    }
  }
}

function makeFavoriteStar(bvbbpp, groupNum, teamNum) {
  var OFF = "#fffff5";
  var ON =  "#ffff00";
  var OFF_SHADOW = "0px 1px 4px rgba(0, 0, 0, 0.3)";
  var ON_SHADOW =  "0px 1px 4px rgba(0, 0, 0, 0.3), #000 0px 0px 0px";


  function toggle() {
    var doc = this.bvbbpp.doc;
    if (getPref(this.storage + this.num)) {
      setPref(this.storage + this.num, false);
      this.node.style.color = OFF;
      this.node.style.textShadow = OFF_SHADOW;
      doc.getElementById("menuAufstellung" + this.num).setAttribute("class", "");
      doc.getElementById("menuVerein" + this.num).setAttribute("class", "");
    } else {
      setPref(this.storage + this.num, true);
      this.node.style.color = ON;
      this.node.style.textShadow = ON_SHADOW;
      doc.getElementById("menuAufstellung" + this.num).setAttribute("class", "favorite");
      doc.getElementById("menuVerein" + this.num).setAttribute("class", "favorite");
    }
  }

  var doc = bvbbpp.doc;
  if ((groupNum < 0) === (teamNum < 0)) {
    return null;
  }

  var star = newElement(doc,
                        "b", "\u2605",
                        "id", "favorite",
                        "title", "Diesen Verein als Favoriten w\u00E4hlen");
  star.style.fontWeight = 600;
  star.style.cursor = "pointer";
  star.style.verticalAlign = "4pt";
  star.style.textOutline = "1pt";

  if (teamNum >= 0) {
    star.onclick = toggle.bind({
      bvbbpp: bvbbpp,
      node: star,
      num: teamNum,
      storage: "verein"
    });
    star.style.color = getPref("verein" + teamNum) ? ON : OFF;
    star.style.textShadow = getPref("verein" + teamNum) ? ON_SHADOW : OFF_SHADOW;
  }
  if (groupNum >= 0) {
    star.onclick = toggle.bind({
      bvbbpp: bvbbpp,
      node: star,
      num: groupNum,
      storage: "gruppe"
    });
    star.style.color = getPref("gruppe" + teamNum) ? ON : OFF;
    star.style.textShadow = getPref("verein" + teamNum) ? ON_SHADOW : OFF_SHADOW;
  }
  return star;
}

// Spieltermine
function makeVerein() {
  var teamNum = parseInt(BVBBPP.URL.substr(-7, 2), 10);
  makeHeadLine(-1, teamNum);

  var dueText = "Eventuell spielt der Verein in der Saison " + BVBBPP.season.name + " nicht.";
  var futureText = "Eventuell ist diese Webseite f\u00FCr die Saison " +
  BVBBPP.season.name + " noch nicht online.";
  if (onNotFound(dueText, futureText)) {
    return;
  }

  var h2 = BODY.getElementsByTagName("h2");
  if (h2[0]) {
    var title = "Spieltermine " + BODY.getElementsByTagName("tr")[1].textContent;
    BVBBPP.doc.title = title.replace("Spieltermine", "Termine");
    var titleNode = create("h1", title, "class", "title");
    h2[0].parentNode.replaceChild(titleNode, h2[0]);
    var favoriteStar = makeFavoriteStar(BVBBPP, -1, teamNum);
    titleNode.appendChild(favoriteStar);
  }

  var span = BODY.getElementsByTagName("span");
  var i;
  for (i = span.length - 1; i >= 0; i--) {
    if (span[i].id == "headline") {
      continue;
    }
    var font = create("font", null, "size", 2);
    font.appendChild(span[i].firstChild);
    span[i].parentNode.replaceChild(font, span[i]);
  }

  setElementAttributes(BODY, "table", "style", "border:0", /Mannschaft/);

  // trim links to klasse
  var b = BODY.getElementsByTagName("b");
  for (i = 0; i < b.length; i++) {
    b[i].textContent = b[i].textContent.replace(/^\s+|\s+$/g, "");
  }

  // Vereine Verlinken
  var vereineVerlinken = function(vereine) {
    var doc = this.bvbbpp.doc;
    var tds = doc.body.getElementsByTagName("td");
    for (var i = 0; i < tds.length; i++) {
      var td = tds[i];
      var HTML = td.innerHTML;
      var text = td.textContent;
      if (/\d\d.\d\d.\d\d\d\d/.test(text) && /<a/.test(HTML)) {
        removeParents(td, "b");
      }
      if (!/<|\d\d:\d\d|^\w$/.test(HTML)) {
        for (var j = 0; j < vereine.length; j++) {
          var v = vereine[j];
          var shortName = v.shortName;
          if (text.indexOf(shortName) >= 0) {
            var num = / [IVX]+$/.exec(text)[0];
            var href = v.href;
            var l = create("a", shortName + num, "href", href, "title", v.name + num);
            replaceChildren(td, l);
            break;
          }
        }
      }
    }
  }.bind(BVBBPP.this_);


  var vereineURL = BVBBPP.webSpielberichteVereine + "spielbericht-vereine.HTML";

  Promise.all([ensureHallenschluessel(), parseVereine(vereineURL)]).then(function(loadedDocs) {
    var doc = this.bvbbpp.doc;
    var hallen = loadedDocs[0];
    var vereine = loadedDocs[1];

    replaceHallenschluessel(hallen);
    vereineVerlinken(vereine);
    // Spieltermine erst einfuegen, wenn Vereine verlinkt
    var spiele = parseSpieltermine(doc, vereine);
    if (!getPref("hideDoodle") && BVBBPP.year === CURRENT_SEASON) {
      (makeDoodleLinks.bind(this))(doc, spiele);
    }
    if (!getPref("hideICS") && BVBBPP.year === CURRENT_SEASON) {
      (makeICalendar.bind(this))(doc, spiele);
    }
    makeCurrentSpieltermine(doc, spiele);
    makeHallenbelegung(doc, spiele, hallen);
//  disable catch because it doesn't compile in eclipse
//  }).catch(function(error) {
  }.bind(BVBBPP.this_));

  var tables = BODY.getElementsByTagName("table");
  for (var i = 0; i < tables.length; i++) {
    tables[i].setAttribute("width", "600px");
  }
  var cols = BODY.getElementsByTagName("col");
  for (var i = 8; i < cols.length; i += 14) {
    cols[i].setAttribute("width", "20px");
  }
}


function makeHallenbelegung(doc, spiele, hallen) {
  var timeLists = [];
  var dateLists = [];
  var locList = [];
  var numLocations = 0;
  var spiel, key;

  // we are only interested in matches in our home location
  var homeLoc = getHomeLocKey(spiele);
  spiele = spiele.filter(spiel => {
    return spiel.locKey == homeLoc;
  });

  for (var s in spiele) {
    spiel = spiele[s];
    var loc = spiel.locKey;
    if (!timeLists[loc]) {
      timeLists[loc] = [];
      dateLists[loc] = [];
      locList[loc] = spiel.locNode;
      numLocations++;
    }
    timeLists[loc][spiel.time] = 123456;
    dateLists[loc][spiel.date] = 123456;
  }

  var currLocation = 0;
  for (var loc in timeLists) {
    var times = timeLists[loc];
    var dates = dateLists[loc];
    times = Object.keys(times); // convert keys to array;
    dates = Object.keys(dates); // convert keys to array;
    times.sort(function(a, b) {
      if (a.length < "00:00".length) {
        a = "0" + a;
      }
      if (b.length < "00:00".length) {
        b = "0" + b;
      }
      return a != b ? (a < b ? -1 : 1) : 0;
    });
    // dates sind schon sortiert

    var td, tr;
    var tds = [];
    var tbody = newElement(doc, "tbody", null, "style", "text-align: center; padding: 30 30");
    var table = newParentElement("table", tbody, "class", YELLOW.bg , "style", "max-width: 860px");

    // first row: Date
    tbody.appendChild(tr = newElement(doc, "tr", null, "class", DARK_YELLOW.bg));
    td = newElement(doc, "td", loc, "class", DARK_YELLOW.bg, "style", "font-weight:bold");
    tr.appendChild(td); // upper left
    for (var i = 0; i < dates.length; i++) {
      var day = new Date(dates[i].substr(6,4),
                         dates[i].substr(3,2) - 1,
                         dates[i].substr(0,2)).getDay();
      day = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][day];
      var date;
      if (dates.length > 20) {
        date = day + " " + dates[i].substring(0, 5);
        tr.appendChild(tds[dates[i]] = newElement(doc, "td", date, "style", "padding: 2 0"));
      } else {
        date = day + " " + dates[i].substring(0, 6);
        tr.appendChild(tds[dates[i]] = newElement(doc, "td", date, "style", "padding: 2 2"));
      }
    }

    // table
    for (var j = 0; j < times.length; j++) {
      tbody.appendChild(tr = newElement(doc, "tr"));
      tds[times[j]] = newElement(doc, "td", times[j], "class", ORANGE.bg, "style", "padding: 2 3");
      tr.appendChild(tds[times[j]]); // left
      for (var i = 0; i < dates.length; i++) {
        key = loc + dates[i] + times[j];
		var date = new Date(dates[i].substr(6,4), dates[i].substr(3,2) - 1, dates[i].substr(0,2));
		if (date < new Date(new Date().getYear() + 1900, new Date().getMonth(), new Date().getDate()))
		  tds[key] = newElement(doc, "td", null, "style", "padding: 0 0; color: #aaa");
		else
		  tds[key] = newElement(doc, "td", null, "style", "padding: 0 0");
        tr.appendChild(tds[key]); // left
      }
    }

    for (var s in spiele) {
      spiel = spiele[s];
      if (spiel.locKey != loc) {
        continue;
      }
      key = loc + spiel.date + spiel.time;
      if (tds[key]) {
        var textContent = tds[key].textContent;
        if (textContent !== "") {
          textContent += ", " + spiel.teamNumber1;
        } else {
          textContent = spiel.teamNumber1;
        }
        tds[key].textContent = textContent;
      } else {
//      console.log("miss " + key);
      }
    }

    var mainDiv = doc.getElementById("centerstyle");
    var p = newElement(doc, "p");
    p.innerHTML = "&nbsp;";
    mainDiv.appendChild(p);
    var h2 = newElement(doc, "h2", "Hallenbelegung", "style", "width: 420px; margin: 2px auto 2px;");
    mainDiv.appendChild(h2);

    var h6 = newElement(doc, "h6", hallen[loc].shortStreet, "style", "margin-top: 0px");
    h2.appendChild(h6);
    var div = newElement(doc, "div");
    div.appendChild(table);
    var warntext = newElement(doc, "small",
                              "ohne Ber\u00FCcksichtigung von Verlegungen und Fremdvereinen",
                              "style", "font-size: 8pt; font-weight: 400; ");
    if (++currLocation === numLocations) {
      div.style = "text-align: center; margin-bottom: 20px";
    } else {
      div.style = "text-align: center; margin-bottom: -10px";
    }


    div.appendChild(warntext);
    mainDiv.appendChild(div);
  }
}

function getHomeLocKey(spiele) {
  var someHomeMatch = spiele.find(spiel => {
    return spiel.heimspiel;
  });
  return someHomeMatch.locKey;
}

function toDate(spiel) {
  var d = spiel.date;
  var t = spiel.time;
  // new Date(year, month(0-11) [, day, hour, minute,   second, millisecond]);
  return new Date(d.substr(6,4), d.substr(3,2) - 1, d.substr(0,2), t.substr(0, 2), t.substr(3, 2));
}

function parseSpieltermine(doc, vereine) {
  var spiele = [];
  var tables = doc.getElementsByTagName("table");
  for (var i=0; i<tables.length; i += 2) {
    var zurueckgezogen = /ckgezogen/.test(tables[i].textContent);
    // even table contains the number of the team "x. Mannschaft"
    var teamName = tables[i].textContent.match(/\d+/);
    var verein = vereine.filter( function (v) {
      return v.href.substr(-14) == BVBBPP.URL.substr(-14);
    } );
    var shortName = verein[0].shortName;
    var teamNumber = romanize(teamName);
    teamName = shortName + " " + teamNumber;

    // odd tables contains game dates
    var table = tables[i + 1];
    var trs = table.getElementsByTagName("tr");
    for (var t = 0; t < trs.length; t++) {
      var tds = trs[t].getElementsByTagName("td");
      // left and right side of table
      for (var offset = 0; offset < 7; offset += 6) {
        var heimspiel = tds[offset].textContent === "H";
        var heimSpieler = create("b", teamName);
        var gast = tds[offset + 2].firstChild.cloneNode(true);
        if (tds[offset].textContent == 'A') {
          heimSpieler = gast;
          gast = create("b", teamName);
        }

        spiele.push({
          heimspiel: heimspiel,
          tableIndex: i,
          teamNumber1: teamNumber,
          name1: heimSpieler,
          name2: gast,
          date: tds[offset + 1].textContent,
          dateNode: tds[offset + 1].firstChild.cloneNode(true),
          time: tds[offset + 3].textContent,
          locKey: tds[offset + 4].firstChild.textContent,
          locNode: tds[offset + 4].firstChild.cloneNode(true),
          zurueck: zurueckgezogen
        });
      }
    }
  }

  spiele.sort(function(spiel1, spiel2) {
    return toDate(spiel1).getTime() - toDate(spiel2).getTime();
  });
  return spiele;
}

function makeDoodleLinks(doc, spiele) {
  var tables = doc.getElementsByTagName("table");
  for (var i = 0; i < tables.length; i += 2) {
    var href = "http://doodle.com/create?";
    href += "locale=de";
    href += "&type=text";
    var title = "Spieltermine der " + tables[i].getElementsByTagName("div")[1].textContent;
    href += "&title=" + encodeURIComponent(title);
    href += "&levels=3"; // ja-nein-vielleicht
    var description = escape("Ausw\u00E4rtige Spielst\u00E4tten:\n");
    var numOptions = 0;
    for (var j = 0; j < spiele.length; j++) {
      if (spiele[j].tableIndex !== i) {
        continue;
      }
      var spiel = spiele[j];
      var d = spiel.date;
      var t = spiel.time;
      // new Date(year, month [, day, hour, minute, second, millisecond]);
      var opponent = spiel.heimspiel ? spiel.name2.textContent : spiel.name1.textContent;
      var option = encodeURIComponent(d + " " + t + " " + spiel.locKey + " " + opponent);
      href += "&option" + (++numOptions) + "=" + option;
      var key = spiel.locKey;
      var halle = BVBBPP.hallenschluessel[key];
      var descr = key + ": " + unescape(halle.shortStreet + ", " + halle.PLZ) + "\n";
      if (!spiel.heimspiel) {
        description += encodeURIComponent(descr);
      }
    }
    var doodleStyle = "font-weight: 800; font-size: 14pt; text-align: center;" +
                      "font-family: arial,'sans serif'; color: #006DDE;" +
                      "text-shadow: 1px 1px 1px #DDD";
    href += "&description=" + description;
    var a = newElement(doc, "a", null, "href", href, "target", "_blank", "class", "icon");
    a.title = "Eine Umfrage mit diesen Terminen bei Doodle.com erstellen";
    a.appendChild(newElement(doc, "span", "d", "style", doodleStyle));
    getIconBar(i / 2, tables[i+1], doc).appendChild(a);
  }
}


function hashCode(str) {
  var hash = 0, i, char, len = str.length;
  if (len === 0) {
    return hash;
  }
  for (i = 0; i < len; i++) {
    char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash >>> 0;
}


function ICal() {
  //BEGIN:VCALENDAR
  //VERSION:2.0
  //PRODID:http://www.example.com/calendarapplication/
  //METHOD:PUBLISH

  //BEGIN:VEVENT
  //UID:461092315540@example.com
  //ORGANIZER;CN="Alice Balder, Example Inc.":MAILTO:alice@example.com
  //LOCATION:Somewhere
  //SUMMARY:Eine Kurzinfo
  //DESCRIPTION:Beschreibung des Termines
  //CLASS:PUBLIC
  //DTSTART:20060910T220000Z
  //DTEND:20060919T215900Z
  //DTSTAMP:20060812T125900Z
  //END:VEVENT

  //END:VCALENDAR

  this.events = [];
}

ICal.prototype = {
  toString: function ICal_toString() {
    var str = [];
    str.push("BEGIN:VCALENDAR");
    str.push("VERSION:2.0");
    str.push("PRODID:https://addons.mozilla.org/de/firefox/addon/bvbbpp/");
    str.push("METHOD:PUBLISH");

    for (var i = 0; i < this.events.length; i++) {
      var event = this.events[i];

      str.push("BEGIN:VEVENT");
      for (var prop in event) {
        str.push(prop.toUpperCase() + ":" + event[prop]);
      }
      str.push("END:VEVENT");
    }

    str.push("END:VCALENDAR");

    return str.join("\r\n");
  },

  addEvent: function ICal_addEvent(e) {
    this.events.push(e);
  }
};

function getIconBar(i, table, doc) {
  var h5 = doc.getElementById("iconBar" + i);
  if (!h5) {
    h5 = newElement(doc, "h5", null, "style", "width: 600px; margin: auto; text-align: right",
                    "id", "iconBar" + i);
    table.parentNode.appendChild(h5, table.nextSibling);
  }
  return h5;
}

function makeICalendar(doc, spiele) {
  var tables = doc.getElementsByTagName("table");
  for (var i = 0; i < tables.length; i += 2) {
    var iCal = new ICal();

    var homeTeam = "";
    for (var j = 0; j < spiele.length; j++) {
      if (spiele[j].tableIndex !== i) {
        continue;
      }
      var spiel = spiele[j];
      var halle = BVBBPP.hallenschluessel[spiel.locKey];
      var start = toDate(spiel);
      var end = toDate(spiel);
      homeTeam = spiel.heimspiel ? spiel.name1.textContent : spiel.name2.textContent;
      end.setHours(end.getHours() + 2);
      var event = {};
//    event.organizer = "";
      event.location = unescape(halle.shortStreet + ", " + halle.PLZ);
      event.summary = spiel.heimspiel ? spiel.name2.title : spiel.name1.title;
      event.description = spiel.heimspiel ? spiel.name1.textContent + " gegen " + spiel.name2.title
                                          : spiel.name1.title + " gegen " + spiel.name2.textContent;
      event.dtstart = start.toISOString().replace(/-|:|\.\d*/g, "");
      event.dtend = end.toISOString().replace(/-|:|\.\d*/g, "");
      event.dtstamp = (new Date()).toISOString().replace(/-|:|\.\d*/g, "");
      event.uid = hashCode(event.description + event.dtstart) + "" +
                  hashCode((new Date()).toISOString()) + "@BVBB++";
      iCal.addEvent(event);
    }

    var href = "data:text/calendar;charset=utf-8," + encodeURIComponent(iCal.toString());
    var a = newElement(doc, "a", null, "href", href, "target", "_blank", "class", "icon",
                       "download", "Spieltermine " + homeTeam + ".ics",
                       "title", "Termine als .ics-Datei f\u00FCr Outlook, Thunderbird/Lightning, " +
                                "Google- oder Apple-Kalender herunterladen");
    a.appendChild(newElement(doc, "img", "c", "style", "margin-top: 2px", "src", CALENDAR_ICON));

    getIconBar(i / 2, tables[i+1], doc).appendChild(a);
  }
}

function makeCurrentSpieltermine(doc, spiele) {
  var tables = doc.getElementsByTagName("table");

  var sixHoursAgo = new Date();
  sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

  var soon = spiele.filter(function(spiel) {
    var href = spiel.dateNode.firstChild.href;
    if (href && href.indexOf("zurueckgezogen") >= 0) {
      return false;
    }
    // doesn't contain link and is in the future
    return !href && !spiel.zurueck && (toDate(spiel) > sixHoursAgo);
  });

  var past = spiele.filter(function(spiel) {
    var href = spiel.dateNode.firstChild.href;
    if (href && href.indexOf("zurueckgezogen") >= 0) {
      return false;
    }
    // contains link or is in the past
    return !spiel.zurueck && (href || (toDate(spiel) < sixHoursAgo));
  });
  var numLines = Math.max(4, tables.length / 2 + 1);

  var tbody = create("tbody");
  var td = create("td", "K\u00FCrzlich",
                  "colspan", "2",
                  "style", "font-size:11pt; font-weight:bold; padding: 3 8");
  var tr = newParentElement("tr", td,
                            "class", DARK_YELLOW.bg,
                            "style", "font-size:11pt; font-weight:bold");
  tr.appendChild(create("td", "Demn\u00E4chst",
                        "colspan", "4",
                        "style", "font-size:11pt; font-weight:bold; padding: 3 160 3 8"));
  tbody.appendChild(tr);

  // array of new lines
  tr = new Array(numLines);
  for (var i = 0; i < numLines; i++) {
    tr[i] = create("tr", null, "style", "font-size:11pt; font-weight:bold");
  }

  // kuerzlich
  var resultsToLoad = [], currTr, s, b;
  for (var i = Math.max(0, past.length - numLines); i < past.length; i++) {
    currTr = tr[i - Math.max(0, past.length - numLines)];
    s = past[i];

    td = create("td", null, "style", "padding: 3 8");
    td.appendChild(s.dateNode);
    currTr.appendChild(td);

    td = create("td", null, "style", "padding: 3 50 3 8");
    td.appendChild(s.name1);
    td.appendChild(create("b", " / "));
    td.appendChild(s.name2);
    b = create("b", "\u00A0\u00A0\u00A0---");
    td.appendChild(b);
    currTr.appendChild(td);
    var url = s.dateNode.firstChild;
    if (/\.HTML/.test(url)) {
      b.id = "result" + ("" + url).substr(-16);
      resultsToLoad.push("" + s.dateNode.firstChild);
    }
  }
  // fill empty cells
  for (; i < numLines; i++) {
    currTr = tr[i];
    td = create("td", null, "style", "padding: 3 8");
    td.appendChild(create("b", null));
    currTr.appendChild(td);
    td = create("td", null, "style", "padding: 3 8");
    td.appendChild(create("b", null));
    currTr.appendChild(td);
  }

  // demnaechst
  for (i = 0; i < Math.min(numLines, soon.length); i++) {
    currTr = tr[i];
    s = soon[i];

    td = create("td", null, "style", "padding: 3 8");
    td.appendChild(s.dateNode);
    currTr.appendChild(td);

    td = create("td", null, "style", "padding: 3 14 3 8");
    td.appendChild(s.name1);
    td.appendChild(create("b", " / "));
    td.appendChild(s.name2);
    currTr.appendChild(td);

    td = create("td", null, "style", "padding: 3 8");
    td.appendChild(doc.createTextNode(s.time));
    currTr.appendChild(td);

    td = create("td", null, "style", "padding: 3 8");
    td.appendChild(s.locNode);
    currTr.appendChild(td);
  }
  var table = newParentElement("table", tbody, "cellpadding", 4,
                               "style", "background-color: #FFFFFF;");
  for (i = 0; i < numLines; i++) {
    tbody.appendChild(tr[i]);
  }
  var p = create("br", null);
  var centerDiv = doc.getElementById("centerstyle");
  centerDiv.insertBefore(p, doc.body.getElementsByTagName("table")[0].parentNode);
  centerDiv.insertBefore(newParentElement("p", table), p);
  var h2 = create("h2", "Aktuelle Termine", "style", "width:420px; margin: 25px auto 2px;");
  centerDiv.insertBefore(h2, doc.body.getElementsByTagName("table")[0].parentNode);

  function fillResults(result) {
    var doc = this.bvbbpp.doc;
    var resultCell = doc.getElementById("result" + result.url.substr(-16));
    var resultLink = resultCell.parentNode.parentNode.firstChild;
    var heimspiel = result.teamNr1 === this.bvbbpp.URL.substr(-7, 2);
    var points = result.spielErgebnisText.substr(0, 1) | 0;
    var colorClass = points === 4 ? ORANGE.bg : (heimspiel == (points > 4) ? WIN.bg : LOSE.bg);
    resultLink.setAttribute("class", colorClass);
    resultCell.textContent = "\u00A0\u00A0\u00A0(" + result.spielErgebnisText + ")";
  }

  for (i = 0; i<resultsToLoad.length; i++) {
    loadSpielbericht(resultsToLoad[i]).then(fillResults.bind(BVBBPP.this_));
  }

}


/**
 * Get HTML-String to a loadStats button
 */
function makeLoadStatsButton(bvbbpp) {
  var input = document.createElement("input");
  input.type = "button";
  input.id = "loadStats";
  input.value = "Spielerstatistik laden";
  input.onclick = loadPlayerStats.bind({ bvbbpp: bvbbpp });
  return input;
}

function onNotFound(dueText, futureText) {
  var notFound = getNotFoundElement();
  if (notFound) {
    var parent = notFound.parentNode;
    notFound.textContent = "Webseite nicht gefunden.";
    parent.insertBefore(create("h2", isDue() ? dueText : futureText), notFound.nextSibling);
    return notFound;

  }
}

function makeGegenueber() {
  var groupNum = BVBBPP.getGroupNum();
  makeHeadLine(groupNum, -1);

  var dueText = "Eventuell gibt es diese Spielklasse in der Saison " +
                BVBBPP.season.name + " nicht.";
  var futureText = "Eventuell ist diese Webseite f\u00FCr die Saison " +
                   BVBBPP.season.name + " noch nicht online.";
  if (onNotFound(dueText, futureText)) {
    return;
  }

  var h2 = BODY.getElementsByTagName("h2");
  removeElement(h2[1]);
  var groupTitle = makeGroupTitle("Gegen\u00FCberstellung " + BVBBPP.divisions.names[groupNum]);
  h2[0].parentNode.replaceChild(groupTitle, h2[0]);


  var tr = BODY.getElementsByTagName("tr");
  for (var i = 1; i < tr.length; i++) {
    var td = tr[i].getElementsByTagName("td");
    for (var j = 0; j < td.length - 1; j++) {
      var reg = /(\d+):(\d+)/.exec(td[j].textContent);
      if (reg) {
        var a = create("a", reg[1] + ":" + reg[2],
                       "style", "cursor:pointer; text-decoration:underline");
        a.onclick = makeGegenueberStats.bind( {
          bvbbpp: BVBBPP,
          teamRow: i - 1,
          game: (j - 2),
          sum: parseInt(reg[1], 10) + parseInt(reg[2], 10)
        } );
        td[j].replaceChild(a, td[j].firstChild);
        td[j].align = "center";
      }
    }
  }
}

function makeGegenueberStats() {
  var teamRow = this.teamRow;
  var game = this.game;
  var bvbbpp = this.bvbbpp;
  var doc = bvbbpp.doc;

  // schon vorhandene Elemente aufraeumen
  removeElement(doc.getElementById("h2stats"));
  var div = doc.getElementById('centerstyle');

  var tr = doc.getElementsByTagName("table")[0].getElementsByTagName("tr");
  var teamNameElem = tr[(teamRow + 1)].getElementsByTagName("td")[1].getElementsByTagName("a")[0];
  var globalRefTeam = getGlobalTeamRefFromAElement(teamNameElem);


  // there's a left-over h2 element that we will fill with stats
  var h2 = div.getElementsByTagName("h2")[2] || div.appendChild(newElement(doc, "h2"));
  h2.id = "h2stats";

  var tr1 = newElement(doc, "tr");
  var b = newElement(doc, "b", null, "id", "linkAndType");
  var linkAndType = newParentElement("div", newParentElement("h4", b));
  tr1.appendChild(newParentElement("td", linkAndType, "width", 300));
  tr1.appendChild(newParentElement("td", makeLoadStatsButton(bvbbpp)));
  var tbody1 = newParentElement("tbody", tr1);
  var table1 = newParentElement("table", tbody1, "class", "borderless", "style", "border:0");
  h2.appendChild(table1);

  var tr2 = newElement(doc, "tr", null, "class", LIGHT_ORANGE.bg, "align", "center");
  tr2.appendChild(newElement(doc, "td", "Gegnerischer Verein", "style", "font-size: 10pt"));
  tr2.appendChild(newElement(doc, "td", "Datum", "style", "font-size: 10pt"));
  tr2.appendChild(newElement(doc, "td", "Ort", "style", "font-size: 10pt"));
  tr2.appendChild(newElement(doc, "td", "Spieler", "style", "font-size: 10pt"));
  tr2.appendChild(newElement(doc, "td", "Gegner", "style", "font-size: 10pt"));
  tr2.appendChild(newElement(doc, "td", "S\u00E4tze", "style", "font-size: 10pt"));
  tr2.appendChild(newElement(doc, "td", "Punkte", "style", "font-size: 10pt", "colspan", 3));
  var tbody = newParentElement("tbody", tr2, "id", "gegenueberstats");
  var table = newParentElement("table", tbody, "class", YELLOW.bg, "border", 1, "cellpadding", 6);
  h2.appendChild(table);

  h2.appendChild(newElement(doc,
                            "span", "Klick auf den Vereinsnamen f\u00FChrt zum Spielbericht.",
                            "style", "font-weight:normal;font-size:8pt"));
  h2.appendChild(newElement(doc, "br"));

  for (var opponentRow = 0; opponentRow < tr.length - 1; opponentRow++) {
    var opponentNameElem = tr[(opponentRow + 1)].getElementsByTagName("td")[1]
                                                .getElementsByTagName("a")[0];
    var opponentName = opponentNameElem.textContent;
    var globalRefOpponent = getGlobalTeamRefFromAElement(opponentNameElem);
    if (opponentRow !== teamRow) {
      addRowToGegenueberStats(bvbbpp, tbody, globalRefTeam, globalRefOpponent, 0, opponentName, game);
      addRowToGegenueberStats(bvbbpp, tbody, globalRefOpponent, globalRefTeam, 1, opponentName, game);
    }
  }
  var type = ["1. HE", "2. HE", "3. HE", "DE", "1. HD", "2. HD", "DD", "GD"][game];
  linkAndType = doc.getElementById('linkAndType');
  var textNode = doc.createTextNode(teamNameElem.textContent.trim() + ", " + type);
  linkAndType.appendChild(textNode);
}

function getGlobalClubNumberFromHref(href) {
  return href.substr(-7, 2);
}

function getTeamRankFromTeamName(teamName) {
  return deromanize(/.*\s([X|V|I]+$)/.exec(teamName.trim())[1]);
}

function getGlobalTeamRefFromAElement(a) {
  var teamRank = getTeamRankFromTeamName(a.textContent);
  var teamRef = getGlobalClubNumberFromHref(a.href) + "-" + twoDigits(teamRank);
  return teamRef;
}

function addRowToGegenueberStats(bvbbpp, tbody, globaTeamRefI, globalTeamRefJ, homeGame, teamNameJ,
                                 gameType) {
  var webSpielberichte = bvbbpp.webSpielberichteVereine;
  var link = webSpielberichte + globaTeamRefI + "_" + globalTeamRefJ + ".HTML";
  var row = newElement(bvbbpp.doc, "tr");
  var args = {
      bvbbpp: bvbbpp,
      row: row,
      heim: homeGame,
      typ: gameType,
      teamLink: teamNameJ
  };
  loadSpielbericht(link).then(makeTrForGegenueberStats.bind(args));
  tbody.appendChild(row);
}


function makeTrForGegenueberStats(bericht) {
  if (!bericht) {
    return;
  }
  var doc = this.bvbbpp.doc;
  var row = this.row;
  // Reihenfolge Gegenueberstellung: 1HE, 2HE, 3HE, DE, 1HD, 2HD, DD, MIX
  // Reihenfolge im Spielbericht:    1HD, DD, 2HD, DE, MIX, 1HE, 2HE, 3HE
  var reihenfolge = [ 5, 6, 7, 3, 0, 2, 1, 4 ]; // uebersetzung gegenueber-->bericht

  var spiel = bericht.spiele[reihenfolge[this.typ]];
  if (!spiel) {
    return;
  }
  var wir = this.heim; // 0 bei heimspiel, 1 bei gast
  var die = 1 - wir;
  var sieg = spiel.sieg[wir];
  var hclass = (sieg ? WIN.bg : LOSE.bg);

  var tl = doc.createTextNode(this.teamLink);
  var berichtLink = newParentElement("a", newParentElement("b", tl), "href", bericht.url);

  row.appendChild(newParentElement("td", berichtLink, "width", "152px", "class", DARK_YELLOW.bg));
  row.appendChild(newElement(doc, "td", bericht.datum));
  row.appendChild(newElement(doc, "td", (wir ? "Ausw." : "Heim"),
                             "align", "center", "width", "38px"));
  var spiWi = spiel.spielerNodes[wir];
  var spiDi = spiel.spielerNodes[die];
  spiWi.removeAttribute("width");
  spiDi.removeAttribute("width");
  row.appendChild(spiWi);
  row.appendChild(spiDi);
  row.appendChild(newElement(doc, "td", spiel.saetze[wir] + " : " + spiel.saetze[die],
                             "align", "center", "width", "38px", "class", hclass));
  row.appendChild(newElement(doc, "td", spiel.p[wir][0] + " : " + spiel.p[die][0],
                             "align", "center", "width", "38px"));
  row.appendChild(newElement(doc, "td", spiel.p[wir][1] + " : " + spiel.p[die][1],
                             "align", "center", "width", "38px"));
  row.appendChild(newElement(doc, "td",
                             (spiel.p[wir][2] ? (spiel.p[wir][2] + " : " + spiel.p[die][2]) : " "),
                             "align", "center", "width", "38px"));
}


function loadSpielbericht(url) {
  return getDocument(url).then(function(doc) {
    if (!doc) {
        Cu.reportError("Konnte Dokument " + url + " nicht laden.");
        return;
      }
      var h2 = doc.body.getElementsByTagName("h2")[2];
      if (!h2) {
        Cu.reportError("Fehler beim Lesen des Dokuments " + url +
                       ": Konnte kein h2-Element finden.");
        return;
      }
      var datum = /(\d\d.\d\d.\d\d\d\d)/.exec(doc.body.textContent)[1];
      var tr = h2.getElementsByTagName("tr");
      var spiele = new Array(8);
      for (var i = 0; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName("td");

        var bheim = td[1].getElementsByTagName("b");
        var bgast = td[3].getElementsByTagName("b");
        var invalid = /Mannschaft|hat|verloren/;
        var validHeim = bheim[0] && !invalid.test(bheim[0]);
        var validGast = bgast[0] && !invalid.test(bgast[0]);
        var spieler = validHeim ? (bheim[1] ? [ bheim[0].textContent, bheim[1].textContent ]
                                            : [ bheim[0].textContent ])
                                : "<<<< kampflos >>>>";
        var gegner = validGast ? (bgast[1] ? [ bgast[0].textContent, bgast[1].textContent ]
                                           : [ bgast[0].textContent ])
                               : "<<<< kampflos >>>>";
        var spielerNode = validHeim ? td[1].cloneNode(true)
                                    : newElement(doc, "td", "\u003C\u003C kampflos \u003E\u003E");
        var gegnerNode = validGast ? td[3].cloneNode(true)
                                   : newElement(doc, "td", "\u003C\u003C kampflos \u003E\u003E");
        var p1 = /^(\d\d) : (\d\d)/.exec(td[5].textContent);
        var p2 = /^(\d\d) : (\d\d)/.exec(td[6].textContent);
        var p3 = /^(\d\d) : (\d\d)/.exec(td[7].textContent);
        var hSaetze = (p1[1] > p1[2] ? 1 : 0) + (p2[1] > p2[2] ? 1 : 0)
            + (p3 ? (p3[1] > p3[2] ? 1 : 0) : 0);
        var gSaetze = (p1[1] < p1[2] ? 1 : 0) + (p2[1] < p2[2] ? 1 : 0)
            + (p3 ? (p3[1] < p3[2] ? 1 : 0) : 0);
        spiele[i] = {
          type: ["1.HD", "DD", "2.HD", "DE", "GD", "1.HE", "2.HE", "3.HE"][i],
          typeNum: i,
          spielerNodes: [spielerNode, gegnerNode],
          spieler1: [spieler[0], gegner[0]],
          spieler2: [spieler[1], gegner[1]],
          saetze: [hSaetze, gSaetze],
          sieg: (hSaetze > gSaetze ? [1, 0] : [0, 1]),
          p: [(p3 ? [p1[1], p2[1], p3[1]] : [p1[1], p2[1]]),
              (p3 ? [p1[2], p2[2], p3[2]] : [p1[2], p2[2]])]
        };
      }

      tr = doc.body.getElementsByTagName("tr");
      var lastTr = tr[tr.length - 1].getElementsByTagName("td");
      if (!(lastTr[6] && lastTr[4] && lastTr[2])) {
        // console.log("undef: " + url);
      } else {
      var spielErgebnisText = lastTr[6].textContent;
      var satzErgebnisText = lastTr[4].textContent;
      var punktErgebnisText = lastTr[2].textContent;
      }

      var bericht = {
        teamNr1: url.substr(-16, 2),
        teamNr2: url.substr(-13, 2),
        spielErgebnisText: spielErgebnisText,
        satzErgebnisText: satzErgebnisText,
        punktErgebnisText: punktErgebnisText,
        spiele: spiele,
        url: url,
        datum: datum
      };

      return bericht;
  });
}

function makeGroupTitle(title, isTabelle) {
  var titleLine = create("h1", title, "class", "title");
  var urlBack;
  var urlForth;
  var url = BVBBPP.URL;
  var num;
  if (!isTabelle) {
    num = BVBBPP.getGroupNum(url);
    urlBack = url.substr(0, url.length - 9) + BVBBPP.divisions.shortNames[num - 1] + ".HTML";
    urlForth = url.substr(0, url.length - (num === 0 ? 7 : 9))
        + BVBBPP.divisions.shortNames[num + 1] + ".HTML";
  } else {
    num = parseInt(url.substr(-7, 2), 10) - 1;
    urlBack = url.substr(0, url.length - 7) + twoDigits(num) + ".HTML";
    urlForth = url.substr(0, url.length - 7) + twoDigits(num + 2) + ".HTML";
  }
  var style = "text-decoration: none; color: #ccc";
  if (num > 0) {
    titleLine.insertBefore(create("a", "\u25C0 ", "href", urlBack, "style", style),
                           titleLine.firstChild);
  }
  if (num < BVBBPP.divisions.names.length - 1) {
    titleLine.appendChild(create("a", " \u25B6", "href", urlForth, "style", style));
  }
  return titleLine;
}

// Gruppenansetzung
function makeAnsetzung() {
  var groupNum = BVBBPP.getGroupNum();
  makeHeadLine(groupNum, -1);

  var due = "Eventuell gibt es diese Spielklasse in der Saison " + BVBBPP.season.name + " nicht.";
  var future = "Eventuell ist diese Webseite f\u00FCr die Saison " + BVBBPP.season.name +
               " noch nicht online.";
  if (onNotFound(due, future)) {
    return;
  }

  // erstes unnuetzes h2 loeschen
  var h2_0 = BODY.getElementsByTagName("h2")[0];
  var groupTitle = makeGroupTitle("Ansetzungen " + BVBBPP.divisions.names[groupNum]);
  h2_0.parentNode.replaceChild(groupTitle, h2_0);

  ensureHallenschluessel().then(replaceHallenschluessel);

  var staffelURL = BVBBPP.URL.replace("staffel-", "gegenueber/gegenueber-");
  getDocument(staffelURL).then(replaceTeamLinks.bind(BVBBPP.this_));
}

function replaceTeamLinks(tabelle) {
  function highlight() {
    var locA = this.bvbbpp.doc.getElementById("centerstyle").getElementsByTagName("a");
    for (var i = 0; i < locA.length; i++) {
      if (locA[i].getAttribute("href") === this.el.firstChild.href) {
        locA[i].parentNode.parentNode.setAttribute("style", "background:" + this.col);
      }
    }
  }

  function makeGameLinks(directoryListingDoc) {
    var doc = this.bvbbpp.doc;
    var div = doc.getElementById("centerstyle").getElementsByTagName("div");
    var directory = directoryListingDoc.body.textContent;
    var found = 0;
    for (var j = 2; j < div.length; j++) { // start counting at 2 to skip body centering div
      if (/\d\d.\d\d.\d\d\d\d/.test(div[j].textContent)) {
        var t = div[j].textContent;
        var o1 = this.nums1[found];
        var o2 = this.nums2[found++];
        var spiel1 = twoDigits(o1.verein) + "-" + twoDigits(o1.rank);
        var spiel2 = twoDigits(o2.verein) + "-" + twoDigits(o2.rank);
        var link = spiel1 + "_" + spiel2 + ".HTML";
        if (directory && directory.indexOf(link) >= 0) {
          var a = newElement(doc, "a", t, "href", this.bvbbpp.webSpielberichteVereine + link);
          replaceChildren(div[j], a);
        }
      }
    }
  }

  var doc = this.bvbbpp.doc;
  // teams durch links ersetzen und die Teamlinks speichern
  var team = doc.body.getElementsByTagName("table")[0].getElementsByTagName("div");
  var teamObj = []; // rank: nummer innerhalb des vereins (I,II, ...),
                    // verein: globale nummer,
                    // link: link zu ansetzungen
  var a = tabelle.getElementsByTagName("a");

  var teamNumber = 0;// kurznummer in dieser Tabelle
  for (var i = 0; i < team.length; i++) {
    // leerzeichen alle entfernen, hier werden &nbsp; benutzt, in der Tabelle nur ' '.
    var teamname = team[i].innerHTML.replace(/<b>|&nbsp;|\s*<\/b>\s*/g, " ")
    .replace(/^\s+|\s+$/g, "");
    if (teamname.length > 0 && teamname.length < 3) {
      teamNumber = parseInt(teamname, 10);
    }

    for (var j = 0; j < a.length; j++) {
      var name = a[j].innerHTML.replace(/<b>|\s*<\/b>\s*$|\s+$/g, "").replace(/^\s+/, "");
      if (name.length < 6) {
        continue;
      }
      if (name == teamname) {
        var href = a[j].href;
        var newA = create("a", name, "href", href);
        team[i].replaceChild(newA, team[i].firstChild);

        team[i].onmouseover = highlight.bind({
          bvbbpp: this.bvbbpp,
          col: "#ddedf5", // DARK_YELLOW.css * 0.3 opacity
          el: team[i]
        });
        team[i].onmouseout = highlight.bind({
          bvbbpp: this.bvbbpp,
          col: "#ffffff", // yellow.css
          el: team[i]
        });

        teamObj[teamNumber] = {
          rank: deromanize(name.substring(name.lastIndexOf(" ") + 1)),
          link: create("a", teamNumber, "href", href, "title", name),
          verein: parseInt(href.substr(-7, 2), 10)
        };
      }
    }
  }

  // TeamNummern durch links ersetzen und dabei Teamnummern speichern.
  var div = doc.getElementById("centerstyle").getElementsByTagName("div");
  var nums1 = [];
  var nums2 = [];
  // start counting at 2 to skip body centering div and headline
  for (var j = 2; j < div.length; j++) {
    if (/\d+\s*\/\s*\d+/.test(div[j].textContent)) {
      // Ausdruck durch irgendwas ersetzen. Die ersetzen Werte in den klammern () werden
      // dann in $1 und $2 gespeichert
      div[j].textContent.replace(/(\d+)\s*\/\s*(\d+)/, "");
      var num1 = RegExp.$1;
      var num2 = RegExp.$2;
      replaceChildren(div[j], teamObj[num1].link.cloneNode(true), doc.createTextNode(" / "),
                      teamObj[num2].link.cloneNode(true));
      nums1.push(teamObj[num1]);
      nums2.push(teamObj[num2]);
    }
  }


  // get directory listing, Format=0; Pattern=*-??_??-??.HTML
  var link = this.bvbbpp.webSpielberichteVereine + "?F=0;P=*-??_??-??.HTML";
  getDocument(link).then(makeGameLinks.bind({
    bvbbpp: this.bvbbpp,
    nums1: nums1,
    nums2: nums2
  }));
}

function ensureHallenschluessel() {
  if (BVBBPP.hallenschluessel) {
    return new Promise(function(resolve, reject) {
      resolve(this.bvbbpp.hallenschluessel);
    }.bind(BVBBPP.this_));
  }

 return new Promise(function(resolve, reject) {
  getDocument(this.bvbbpp.webHallen).then(function(hallenDoc) {
    var tr = hallenDoc.getElementsByTagName("tr");
    var hallenschluessel;
    hallenschluessel = [];

    // speichere hallenschluessel in arrays
    for (var i = 0; i < tr.length; i++) {
      var f = tr[i].getElementsByTagName("font")[0];
      var d = tr[i].getElementsByTagName("div");
      if (f && d[1] && d[2] && d[3]) {
        var key = f.textContent;
        if (key.length !== 2) {
          continue;
        }
        var street = d[3].textContent.replace(/^\n|<br>|^\s+|\s+$/g, "")
                                     .replace(/(&nbsp;){2,}/g, " ")
                                     .replace(/str\./, "stra\u00DFe")
                                     .replace(/Str\./, "Stra\u00DFe");
        var shortStreet = street.replace(/\s*\n.+/g, "");
        var PLZ = d[1].textContent.replace(/^\s+/, "")
            + d[2].textContent.replace("(", " ").replace(")", "");

        // street corrections
        if (/-Nydal-/.test(street)) {
          street = street.replace("-Nydal-", "-Nydahl-");
          shortStreet = street.replace(/\s*\n.+/g, "");
        }
        if (/Sportcenter\sPreu.enpark/.test(street)) {
          shortStreet = "Kamenzer Damm 34";
        }
        if (/Pfalzburger\sStr/.test(street)) {
          shortStreet = "G\u00FCntzelstra\u00DFe 34-35";
        }
        if (/Gr.ner\sWeg/.test(street)) {
          shortStreet = "Gr\u00FCner Weg";
        }
        if (/Neuendorfer\sSand/.test(street)) {
          shortStreet = shortStreet.replace(/Ecke\s/, "");
        }
        if (/Schwyzer.Stra.e/.test(street)) {
          shortStreet = shortStreet.replace(/,\suntere\sHalle/, "");
        }
        if (/Sporthalle.Dabendorf/.test(street)) {
          shortStreet += ", J\u00E4gerstra\u00DFe";
        }
        if (/Sporthalle\s+Saarlandstr/.test(street)) {
          shortStreet = "Saarlandstra\u00DFe 14";
        }
        if (/Hausburgstr/.test(street) && !/Hausburgstra.e\s20/.test(street)) {
          street = street.replace(/Hausburgstra.e/, "Hausburgstra\u00DFe 20");
          shortStreet = street.replace(/\s*\n.+/g, "");
        }
        if (/Immanuel-Kant-Gesamtschule/.test(street)) {
          shortStreet = "Kantstra\u00DFe 17";
        }
        if (/Kuno-Fischer-Stra.e\s27/.test(shortStreet)) {
          shortStreet = "Kuno-Fischer-Stra\u00DFe 27";
        }
        if (/L.tzowstra.e.83-85/.test(shortStreet)) {
          shortStreet = shortStreet.replace(/,..ber.Parkplatzeinf./, "");
        }
        var url = "http://maps.google.de/maps?q=" + shortStreet + ", " + PLZ;

        // url corrections
        if (street.indexOf("Giebelseehalle") >= 0) {
          url = "https://www.google.com/maps/place/Elbestra%C3%9Fe+1,+"
            + "15370+Petershagen/@52.5288403,13.7847762,17z/"
            + "data=!4m2!3m1!1s0x47a833882c65fac3:0xea675402231f8b28?hl=en-US";
        }

        hallenschluessel[key] = {
          street: street,
          PLZ: PLZ,
          shortStreet: shortStreet,
          URL: url
        };
      }
    }
    this.bvbbpp.hallenschluessel = hallenschluessel;
    resolve(this.bvbbpp.hallenschluessel);
  }.bind(this.bvbbpp.this_));
}.bind(BVBBPP.this_));
}

function replaceHallenschluessel(halle) {
  var div = BODY.getElementsByTagName("div");
  for (var j = 0; j < div.length; j++) {
    var key = div[j].textContent;
    if (halle[key]) {
      div[j].title = (halle[key].street + "\n" + halle[key].PLZ);
      var a = create("a", key, "href", halle[key].URL, "target", "_blank");
      div[j].replaceChild(a, div[j].firstChild);
    }
  }
}

function makeSpielbericht() {
  var hasFrame = getIFrame();
  if (!hasFrame) {
    makeHeadLine(-1, -1);
  }

  // check if correct web page
  if (!/\d\d-\d\d_\d\d-\d\d/.test(document.title)) {
    return;
  }

  removeElements(document, "p");
  var h2 = document.getElementsByTagName("h2");
  if (h2[5] && h2[5].textContent === "") {
    removeElement(h2[5]);
  }
  if (h2[4] && h2[4].textContent === "") {
    removeElement(h2[4]);
  }
  removeParent(h2[3]);
  removeParents(h2[2], "b");
  removeParent(h2[1]);
  removeElement(h2[0]);

  var tr = document.getElementsByTagName("tr");
  if (!tr || !tr[0]) {
    return;
  }
  tr[0].appendChild(newParentElement("td", makeLoadStatsButton(BVBBPP)));
  var link = BVBBPP.webAufstellung + "aufstellung-";
  var heim = BVBBPP.URL.substr(BVBBPP.URL.length - 16, 2);
  var gast = BVBBPP.URL.substr(BVBBPP.URL.length - 10, 2);
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
    replaceChildren(fonts[2], linkToKlasse(fonts[2].textContent, hasFrame ? "_blank" : null));
  }

  setElementAttributes(BODY, "table", "width", 820);
  setElementAttributes(BODY.getElementsByTagName("table")[2], "tr", "height", 24);
  setElementAttributes(BODY.getElementsByTagName("table")[2], "td", "style", "padding: 2");
  setElementAttributes(BODY, "table", "style", "border:0",
                       /Spielbericht|Klasse und Staffel|kampflos verloren/);

  if (!hasFrame) {
    var div = create("div", null, "id", "centerstyle", "width", "300px");
    while (BODY.hasChildNodes()) {
      div.appendChild(BODY.firstChild);
    }
    BODY.appendChild(div);
  }
  adjustIFrameHeight();
}

/**
 * @target: link-target des erzeugten Links
 * @param klasse:
 *          Name einer Klasse als String, darf leerzeichen enthalten.
 * @return HTML-Link zu der Klasse
 */
function linkToKlasse(klasse, target) {
  klasse = klasse.replace(/\s/g, "").toLowerCase();
  var name, href;
  for (var i = 0; i < BVBBPP.divisions.names.length; i++) {
    var name_i = BVBBPP.divisions.names[i];
    if (klasse === name_i.replace(/\s/g, "").toLowerCase()) {
      name = name_i;
      href = BVBBPP.web + "tabellen/uebersicht-" + twoDigits(i + 1) + ".HTML";
      break;
    }
  }
  if (!name) {
    return false;
  }
  if (target) {
    return create("a", name, "href", href, "target", target);
  }
  return create("a", name, "href", href);
}

function loadPlayerStats() {
  function processLink(playerDoc, e) {
    var doc = this.bvbbpp.doc;
    var e = this.element;
    var wins = getWinPercentage(playerDoc);
    var f = getFestgespielt(doc, playerDoc);
    // f = [stammmannschaft, festgespielt, vereinsnummer]
    if (!f) {
      return;
    }
    var stamm = f[0] > 0 ? "Stammmannschaft " + romanize(f[0]) : "Ersatz";
    var fest = (f[1] > 0 && f[1] != f[0]) ? ", festgespielt in Mannschaft " + romanize(f[1]) : "";
    // mannschaft innerhalb des vereins vom aktuellen spieler, die gerade spielt
    if (isBericht && staemme) {
      var mannschaft = (parseInt(staemme[1], 10) == f[2]) ? parseInt(staemme[2], 10)
                                                          : parseInt(staemme[4], 10);
    }
    var slash = (/\//.test(e.textContent)) ? "  /" : "";
    if (isBericht && (f[0] != mannschaft && staemme || !staemme && f[0] === 0)) {
      if (f[1] === 0) {
        e.textContent = e.textContent.replace(/\s+\//, "") + " (E)" + slash;
        e.title = "Ersatz";
      } else {
        e.textContent = e.textContent.replace(/\s+\//, "") +
                        (f[0] === 0 ? " (E" : " (") + f[1] + ")" + slash;
        e.title = stamm + fest;
      }
    }
    if (!isBericht && (f[1] != 0 && f[1] != f[0])) {
      e.textContent = e.textContent.replace(/\s\(\d\)/, "") +
                      (f[0] === 0 ? " (E" : " (") + f[1] + ")";
      e.title = stamm + fest;
    }
    var tr = newElement(doc, "tr");
    tr.appendChild(newElement(doc, "td", null, "class", WIN.bg, "width", "" + wins + "%"));
    tr.appendChild(newElement(doc, "td", null, "class", LOSE.bg, "width", "" + (100 - wins) + "%"));
    var table = newParentElement("table", tr, "height", 5, "width", 100, "class", "stats");
    e.parentNode.insertBefore(table, e.nextSibling);
    removeElements(e.parentNode, "br");
    adjustIFrameHeight(doc);
  }

  var doc = this.bvbbpp.doc;
  removeElement(doc.getElementById("loadStats"));
  var isBericht = /gegenueber\/gegenueber-/.test(doc.URL) ||
  /\d\d-\d\d_\d\d-\d\d.HTML$/.test(doc.URL);
  var staemme = /(\d\d)-(\d\d)_(\d\d)-(\d\d).HTML$/.exec(doc.URL);

  var as = doc.body.getElementsByTagName("a");
  for (var i = 0; i < as.length; i++) {
    var a = as[i];
    if (/spielerstatistik\/P-/.test(a.href)) {
      getDocument(a.href).then(processLink.bind( { bvbbpp: this.bvbbpp, element: a } ));
    }
  }
  adjustIFrameHeight(doc);
}

function getIFrame() {
  if (document.defaultView && document.defaultView.parent && document.defaultView.parent.document) {
    var parent = document.defaultView.parent.document;
    var iFrame = parent.getElementById("ifrmErgebnis");
    return iFrame;
  }
  return false;
}

function adjustIFrameHeight() {
  var iFrame = getIFrame();
  // check if this is an iFrame and adjust parent's height
  if (iFrame) {
    iFrame.height = (document.documentElement.scrollHeight + 40); // leave some space for player stats
  }
}


function highlightPlayerStats() {
  var doc = this.doc;
  var j = this.j;
  var name = this.name;
  var table = doc.body.getElementsByTagName("table");
  var tr = table[1].getElementsByTagName("tr");
  var saetze, punkte, spiele;
  spiele = [0, 0];
  punkte = [0, 0];
  saetze = [0, 0];
  for (var i = 2; i < tr.length; i++) {
    var td = tr[i].getElementsByTagName("td");
    if (!name || td[j].textContent.indexOf(name) >= 0) {
      if (!name) {
        td[j].removeAttribute("style");
      } else {
        td[j].setAttribute("style", this.col1);
      }
      tr[i].setAttribute("style", this.col2);
      var spi = /(\d)/.exec(td[5].textContent);
      spiele[1 - parseInt(spi[1])]++;
      var sae = /(\d)\s:\s(\d)/.exec(td[6].textContent);
      saetze = [saetze[0] + parseInt(sae[1]), saetze[1] + parseInt(sae[2])];
      var reg = /(\d\d):(\d\d)/g;
      var pun;
      var str = td[7].textContent;
      while ((pun = reg.exec(str)) !== null) {
        punkte[0] += parseInt(pun[1], 10);
        punkte[1] += parseInt(pun[2], 10);
      }
    }
  }
  var tr = table[2].getElementsByTagName("tr");
  var descr = tr[0].getElementsByTagName("td")[0];
  var div = newElement(doc, "div", (name ? name : ""),
                       "align", "center", "style", "font-weight:bold; font-size:12");
  replaceChildren(descr, div);
  var erg = [spiele, , saetze, , punkte];
  for (var i = 0; i < tr.length - 1; i += 2) {
    var td = tr[i + 1].getElementsByTagName("td");
    var win = erg[i][0];
    var lose = erg[i][1];
    var sum = win + lose;
    td[1].firstChild.textContent = sum;
    td[2].firstChild.textContent = win;
    td[3].firstChild.textContent = (100 * win / sum).toFixed(1).replace(".", ",") + "%";
    td[4].firstChild.textContent = lose;
    td[5].firstChild.textContent = (100 * lose / sum).toFixed(1).replace(".", ",") + "%";
    for (var j = 0; j < td.length; j++) {
      if (td[j].getAttribute("bgcolor") == WIN.css) {
        var w = Math.round(100 * win / sum);
        td[j].setAttribute("width", " " + (w === 0 ? 1 : w) + "%");
      }
    }
  }
}



function makeSpieler() {
  makeHeadLine(-1, -1);

  var dueText = "Eventuell hat dieser Spieler in Saison " + BVBBPP.season.name
      + " (noch) nicht gespielt.";
  var futureText = dueText;
  if (onNotFound(dueText, futureText)) {
    return;
  }

  var h2 = BODY.getElementsByTagName("h2");
  for (var i = 0; i < h2.length; i++) {
    var h2i = h2[i];
    if (/vor dem Namen/.test(h2i.textContent)) {
      var newH2 = create("h2", "Statistik",
                         "style", "margin:20px auto 10px auto; width:780px");
      h2i.replaceChild(newH2, h2i.getElementsByTagName("table")[1]);
      var newDiv = create("div", "vor dem Namen steht immer die Stamm-Mannschaft (E = Ersatz)",
                          "style", "margin:-10px auto 0 auto; width:780px; font-size: 12");
      h2i.replaceChild(newDiv, h2i.getElementsByTagName("table")[0]);
    }
  }


  var table = BODY.getElementsByTagName("table");

  var stand = table[0].getElementsByTagName("td")[1];
  var tr = table[1].getElementsByTagName("tr");
  var name = "" + tr[1].getElementsByTagName("td")[0].textContent;
  BVBBPP.doc.title = name;
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
  for (var i = 0; i < BVBBPP.divisions.names.length; i++) {
    var name1 = BVBBPP.divisions.names[i].toLowerCase().replace(/\s+/g, "");
    var name2 = klasse.textContent.toLowerCase().replace(/\s+/g, "");
    if (name1 == name2) {
      var a = create("a", klasse.textContent, "href", BVBBPP.web + "tabellen/uebersicht-"
                     + twoDigits(i + 1) + ".HTML");
      klasse.replaceChild(a, klasse.firstChild);
      break;
    }
  }

  // ergebnistabelle[4] ist in eine weitere Tabelle[2] geschachtelt -->
  // aeussere Tabelle durch innere ersetzen, und die ueberschrift neumachen.
  table[1].parentNode.replaceChild(table[3], table[1]);
  var t = create("tr", null, "class", LIGHT_ORANGE.bg);
  t.appendChild(create("td", "H e i m m a n n s c h a f t", "colspan", 8,
                       "style", "font-size:11pt; font-weight:bold"));
  t.appendChild(create("td", " ", "class", DARK_ORANGE.bg, "style", "border:0"));
  t.appendChild(create("td", "G a s t m a n n s c h a f t", "colspan", 2,
                       "style", "font-size:11pt; font-weight:bold"));
  table[1].insertBefore(t, table[1].firstChild);
  table[1].border = 5;
  table[1].width = 780;

  // Satzsiege/verluste farbig
  var td = table[1].getElementsByTagName("td");
  for (var i = 0; i < td.length; i++) {
    var reg = /(\d) : (\d)/.exec(td[i].textContent);
    if (reg) {
      td[i].setAttribute("class", (reg[1] > reg[2] ? WIN.bg : LOSE.bg));
      td[i].id = reg[1] > reg[2] ? "win" : "lose";
    }
  }
  tr = table[1].getElementsByTagName("tr");
  if (BVBBPP.year >= 11) { // different site layout before 2011
    for (var i = 2; i < tr.length; i++) {
      var overArgs, outArgs;
      var td = tr[i].getElementsByTagName("td");

      for (var j = 0; j < 3; j++) {
        overArgs = {
          doc: document,
          j: j,
          name: td[j].textContent,
          col1: "background-color:rgba(15, 70, 95, 0.12)",
          col2: "background-color:rgba(15, 70, 95, 0.06)"
        };
        outArgs = {
          doc: document,
          j: j,
          col1: "",
          col2: ""
        };
        td[j].onmouseover = highlightPlayerStats.bind(overArgs);
        td[j].onmouseout = highlightPlayerStats.bind(outArgs);
      }

      overArgs = {
        doc: document,
        j: 3,
        name: /(DE|GD|DD|HE|HD)/.exec(td[3].textContent)[1],
        col1: "background-color:rgba(15, 70, 95, 0.12)",
        col2: "background-color:rgba(15, 70, 95, 0.06)"
      };
      outArgs = {
        doc: document,
        j: 3,
        col1: "",
        col2: ""
      };
      td[3].onmouseover = highlightPlayerStats.bind(overArgs);
      td[3].onmouseout = highlightPlayerStats.bind(outArgs);
    }
  }

  // table[2], table[3] sind text, table[4] die aeussere Tabelle, table[5] ueberschrift
  tr = table[3].getElementsByTagName("tr")[0];
  tr.setAttribute("class", DARK_YELLOW.bg);
  var td = tr.getElementsByTagName("td");
  td[2].setAttribute("colspan", 2);
  td[3].setAttribute("colspan", 2);
  td[6].setAttribute("colspan", 4);

  var tbody = table[4].getElementsByTagName("tbody")[0];
  tbody.insertBefore(tr, tbody.firstChild);

  table[2].parentNode.replaceChild(table[4], table[2]);
  table[2].cellpadding = 3;
  table[2].setAttribute("color.bg", "#999999");
  table[2].width = 780;
  table[2].removeAttribute("style");
  setElementAttributes(document, "table", "style",
                       "border:0", /Statistik|Ergebnisse je|Stamm-Mannschaft/);
  table[3].setAttribute("style", "border:1px solid #888");
  table[4].setAttribute("style", "border:1px solid #888");
  table[5].setAttribute("style", "border:1px solid #888");
}

function getWinPercentage(doc) {
  if (!doc) {
    return -1;
  }
  var table = doc.getElementsByTagName("table");
  if (!table[10] || !table[11] || !table[12]) {
    return;
  }
  var td = table[10].getElementsByTagName("td");
  var width = /(\d+)%/.exec(td[0].width);
  if (width) {
    return width[1];
  }
  return 0;
}

/**
 * return: i>0: Stammspieler in Mannschaft i, i=0: Ersatz, nicht festgespielt, i<0: ersatzspieler,
 * festgespielt in Mannsch. i.
 */
function getFestgespielt(doc1, doc) {
  if (!doc1 || !doc) {
    return;
  }
  var a = doc.getElementsByTagName("a");
  if (!a || !a[0]) {
    return;
  }
  var verein = a[0].href.substr(-7, 2);
  var stamm = doc.getElementsByTagName("table")[1].getElementsByTagName("div")[3].textContent;
  if (stamm === "Ersatz") {
    stamm = 0;
  }

  var s = doc.getElementsByTagName("span");
  var mannschaft = [];
  for (var i = 0; i < s.length - 2; i++) {
    if (/^\d\d\.\d\d\.\d\d$/.test(s[i].innerHTML) && /^\d\d$|^\d$/.test(s[i + 2].innerHTML)) {
      var d = s[i].innerHTML;
      var m = parseInt(s[i + 2].innerHTML, 10);
      var len = mannschaft.length;
      if (len === 0 || mannschaft[len - 1].day !== d || mannschaft[len - 1].mann !== m) {
        mannschaft.push({
          day: d,
          mann: m
        });
      }
    }
  }
  if (mannschaft.length < 3) {
    return [stamm, 0, verein];
  }
  var playedInTeams = mannschaft.map(function(e) { return e.mann; });
  playedInTeams.sort();
  var fest = playedInTeams[2];
  if (stamm !== 0 && fest !== 0 && stamm < fest) {
    fest = 0;
  }
  return [stamm, fest, verein];
}

function makePlayerLinksCallback(playerDoc) {
  var doc = this.bvbbpp.doc;
  var td = doc.getElementsByTagName("td");
  // load player links from options element and convert to array
  var p = playerDoc.getElementsByTagName("option");
  // convert entries to objects
  p = Array.prototype.map.call(p, function(e) {
    return {
      name : e.innerHTML.replace(/&nbsp;&nbsp;+\(.*\)/, ""),
      link : e.value
    };
  });

  // loop over player names in the document
  for (var i = 0; td && i < td.length; i++) {
    var name = td[i].textContent.replace(/^\s+|\s+$|(\s\(\d\))/g, "");
    var ext = RegExp.$1 ? RegExp.$1 : "";
    if (!name || name.length < 5 || /</.test(name) || /Additionsregeln/.test(name)) {
      continue;
    }
    for (var j = 0; j < p.length; j++) {
      // does player name from players list match player name in document?
      if (p[j].name == name) {
        // is player name unique in list?
        var link = this.bvbbpp.web + "spielerstatistik/" + p[j].link;
        if ((!p[j - 1] || p[j - 1].name != p[j].name) &&
            (!p[j + 1] || p[j + 1].name != p[j].name)) {
          replaceChildren(td[i], newElement(doc, "a", name + ext, "href", link));
          break;
        }
        // name is not unique. Load player's page and check the team name
        if (/aufstellung-\d{2,3}/.test(doc.URL)) {
          getDocument(link).then(function(playerPage) {
            try {
              var ref = playerPage.body.getElementsByTagName("a")[0].href;
              if (ref.substr(-7) == this.doc.URL.substr(-7)) {
                var a = newElement(this.doc, "a", this.name_ext, "href", this.link);
                replaceChildren(this.di, a);
              }
            } catch (err) {
              var msg = "Fehler beim Verlinken von doppelt vorkommenden Spielernamen: ";
              Cu.reportError(errorMsg(err, msg + playerPage.URL));
            }
          }.bind( {doc: doc, name_ext: name + ext, di: td[i], link: link} ));
        }
      }
    }
  }
}

/**
 * Parse die Seite der Vereine als Objekte mit den Attributen
 *  {
 *    nr: integer,
 *    href: ,
 *    shortName: ,
 *    name: String
 *  }
 */
function parseVereine(vereineURL) {
  return getDocument(vereineURL).then(function(vereineDoc) {
    var td = vereineDoc.getElementsByTagName("td");
    var vereine; vereine = []; // eclipse compiler is confused if arrays are initialized immediately
    for (var i = 0; i < td.length; i++) {
      var textContent = td[i].textContent;
      if (/^\d{2,3}$/.test(textContent)) {
        var a = td[i + 1].getElementsByTagName("a")[0];
        vereine.push({
          nr: parseInt(textContent, 10),
          href: "http://bvbb.net/" + a.href.substring(a.href.lastIndexOf("fileadmin")),
          shortName: a.textContent,
          name: td[i + 2].textContent
        });
      }
    }
    vereine = vereine.filter(function(e) {
      return e;
    });
    vereine.sort(function(v, w) {
      return v.name != w.name ? v.name < w.name ? -1 : 1 : 0;
    });
    return vereine;
  });
}

function fillMenuWithTeams(vereine) {
  var bvbbpp = this.bvbbpp;
  var doc = bvbbpp.doc;
  // Fill menu with the loaded team list.
  for (var i = 0; i < vereine.length; i++) {
    var verein = vereine[i];
    if (!verein) {
      continue;
    }
    var a = newElement(doc, "a", verein.name, "id", "menuAufstellung" + verein.nr,
                       "href",
                       bvbbpp.webAufstellung + "aufstellung-" + twoDigits(verein.nr) + ".HTML");
    this.ulAuf.appendChild(newParentElement("li", a));
    if (getPref("verein" + verein.nr)) {
      a.setAttribute("class", "favorite");
    }

    a = newElement(doc, "a", verein.name, "id", "menuVerein" + verein.nr,
                   "href",
                   bvbbpp.webSpielberichteVereine + "verein-" + twoDigits(verein.nr) + ".HTML");
    if (getPref("verein" + verein.nr)) {
      a.setAttribute("class", "favorite");
    }
    this.ulSpi.appendChild(newParentElement("li", a));
  }
}

function makeHeadLine(groupNum, teamNum) {
  var year = BVBBPP.year;
  var web = BVBBPP.web;
  var webAufstellung = BVBBPP.webAufstellung;
  var webVereine = BVBBPP.webSpielberichteVereine;
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

  var aSeason = create("a", BVBBPP.season.name, "class", "navigationSelected", "style",
                       "font-weight:600");
  for (var i = SEASONS.length - 1; i >= 0; i--) {
    var target = BVBBPP.otherYearURL(SEASONS[i]);
    var link = create("a", "Saison " + toSeasonName(SEASONS[i]), "href", target);
    ulSeason.appendChild(newParentElement("li", link));
  }

  // fill group menues;
  for (var i = 0; i < BVBBPP.divisions.names.length; i++) {
    var a = create("a", BVBBPP.divisions.names[i],
                   "href", web + "tabellen/uebersicht-" + twoDigits(i + 1) + ".HTML");
    ulTab.appendChild(newParentElement("li", a));
    a = create("a", BVBBPP.divisions.names[i],
               "href", web + "staffel-" + BVBBPP.divisions.shortNames[i] + ".HTML");
    ulAns.appendChild(newParentElement("li", a));
    a = create("a", BVBBPP.divisions.names[i],
               "href", web + "gegenueber/gegenueber-" + BVBBPP.divisions.shortNames[i] + ".HTML");
    ulGeg.appendChild(newParentElement("li", a));
  }

  // load teams and fill team menues
  var args = {bvbbpp: BVBBPP, teamNum: teamNum, ulAuf: ulAuf, ulSpi: ulSpi};
  parseVereine(webVereine + "spielbericht-vereine.HTML").then(fillMenuWithTeams.bind(args));

  var aTab = create("a", "Tabelle", "class", "navigationUnselected");
  var aAns = create("a", "Ansetzungen", "class", "navigationUnselected");
  var aGeg = create("a", "Gegen\u00FCberstellung", "class", "navigationUnselected");
  var aSpi = create("a", "Spieltermine", "class", "navigationUnselected");
  var aAuf = create("a", "Aufstellung", "class", "navigationUnselected");
  if (groupNum >= 0) {
    aTab.setAttribute("href", web + "tabellen/uebersicht-" + twoDigits(1 + groupNum) + ".HTML");
    aTab.setAttribute("style", "text-decoration: underline");
    aAns.setAttribute("href", web + "staffel-" + BVBBPP.divisions.shortNames[groupNum] + ".HTML");
    aAns.setAttribute("style", "text-decoration: underline");
    aGeg.setAttribute("href", web + "gegenueber/gegenueber-" +
                              BVBBPP.divisions.shortNames[groupNum] + ".HTML");
    aGeg.setAttribute("style", "text-decoration: underline");
  }
  if (teamNum >= 0) {
    aSpi.setAttribute("href", webVereine + "verein-" + (twoDigits(teamNum)) + ".HTML");
    aSpi.setAttribute("style", "text-decoration: underline");
    var aufRef = webAufstellung + "aufstellung-" + (twoDigits(teamNum)) + ".HTML";
    aAuf.setAttribute("href", aufRef);
    aAuf.setAttribute("style", "text-decoration: underline");
  }

  var as = [ aSeason, aTab, aAns, aGeg, aAuf, aSpi ];
  var uls = [ ulSeason, ulTab, ulAns, ulGeg, ulAuf, ulSpi ];

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

  var td = document.getElementsByTagName("td");

  var header = newParentElement("header", menu, "id", "headline");
  header.setAttribute("class", MOBILE ? "mobile" : "desktop");
  for (var i = 0; i < as.length; i++) {
    if (as[i].outerHTML && as[i].href.indexOf(BVBBPP.URL.substr(-20)) >= 0) {
      as[i].setAttribute("class", "navigationSelected");
    }
  }

  for (var i = 0; i < td.length; i++) {
    if (/Stand:/.test(td[i].textContent)) {
      var stand = td[i].firstChild;
      stand.setAttribute("class", MOBILE ? "standMobile" : "stand");
      if (MOBILE) {
        stand = newParentElement("div", stand, "class", "standMobile");
        BODY.insertBefore(stand, BODY.firstChild);
      } else {
        header.appendChild(create("font", stand.textContent, "class", "stand"));
      }
      break;
    }
  }

  if (year !== CURRENT_SEASON) {
    var centerDiv = document.getElementById("centerstyle");
    if (centerDiv) {
      var h1 = newElement(document, "h1", "Saison " + toSeasonName(year), "class", "title",
                          "style", "color:#C55");
      centerDiv.insertBefore(h1, centerDiv.firstChild);
    }
  }
  BODY.insertBefore(header, BODY.firstChild);
  return header;
}

function parseAnsetzungen(doc, ansetzungen) {
  var tr = doc.getElementsByTagName("h2")[0].getElementsByTagName("tr");
  if (!ansetzungen)
    return;
  // team-Tabelle parsen und die Teamlinks speichern
  var div = ansetzungen.body.getElementsByTagName("h2")[1].getElementsByTagName("div");

  // rank: nummer innerhalb des vereins (I,II, ...), verein: globale nummer, link: link zu
  // ansetzungen
  var teamObj = new Array(20);

  var teamNumber = 0;// kurznummer in dieser Tabelle
  for (var i = 0; i < div.length; i++) {
    // leerzeichen alle entfernen, hier werden &nbsp; benutzt, in der Tabelle nur ' '.
    var nameI = div[i].innerHTML.replace(/<b>|<i>|&nbsp;|<\/b>|<\/i>/g, " ")
                                .replace(/^\s+|\s+$/g, "");
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
    var text = div[j].textContent;
    var ex = /\s*(\d+)\s*\/\s*(\d+)\s*/.exec(text);
    if (ex) {
      num1 = parseInt(ex[1], 10);
      num2 = parseInt(ex[2], 10);
    }
    if (/\d\d.\d\d.\d\d\d\d/.test(text)) {
      // num1 und num2 sind noch von der letzten Zelle belegt
      ansetzung[numAns++] = {
        t1: teamObj[num1 - 1].tabellenPlatz,
        t2: teamObj[num2 - 1].tabellenPlatz,
        date: div[j].textContent,
        time: div[j + 1].textContent,
        loc: div[j + 2].textContent
      };
    }
  }
  return ansetzung.filter(function(e) {
    return e;
  });
}

function makeTabelle() {
  var groupNum = parseInt(BVBBPP.URL.substr(-7, 2), 10) - 1;
  makeHeadLine(groupNum, -1);

  var dueText = "Eventuell gibt es diese Spielklasse in der Saison " + BVBBPP.season.name +
                " nicht.";
  var futureText = "Eventuell ist diese Webseite f\u00FCr die Saison " + BVBBPP.season.name +
                   " noch nicht online.";
  if (onNotFound(dueText, futureText)) {
    return;
  }

  var h2 = BODY.getElementsByTagName("h2")[0]; // uebersicht
  var groupTitle = makeGroupTitle("Spielstand " + BVBBPP.divisions.names[groupNum], true);
  h2.parentNode.replaceChild(groupTitle, h2);

  removeElements(BODY, "p", /Vorheriger/);
  removeElements(BODY, "h2", /Aufsteiger|Ergebniss-Link|Fenster schlie/);

  var table = BODY.getElementsByTagName("table");
  if (table[1] && table[1].getElementsByTagName("tr")[0]) {
    removeElement(table[1]);
  }

  var td = BODY.getElementsByTagName("td");
  var kampflos = false; // erschien "kampflos" schon in einer Zelle?
  for (var i = 0; i < td.length; i++) {
    if (td[i].width && td[i].width == 30) {
      td[i].width = 40;
    }
    if (kampflos) {
      td[i].height = 30;
    }
    kampflos |= /kampflos/.test(td[i].textContent);
  }

  removeParents(document, "b");

  // iFrame hinzufuegen
  if (getPref("useIframe")) {
    var ifrm = create("iframe", null, "id", "ifrmErgebnis", "class", "ifrmErgebnis", "name",
                      "Ergebnis", "seamless", "true");
    document.getElementById("centerstyle").appendChild(ifrm);

    // setze target der Links auf "Ergebnis", wenn sie auf ein Spielbericht zeigen.
    var links = BODY.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
      if (/\d\d-\d\d_\d\d-\d\d.HTML$/.test(links[i].href)) {
        links[i].target = "Ergebnis";
      }
    }
  }
  var urlAns = BVBBPP.URL.replace(/tabellen\/uebersicht-\d\d/,
                                  "staffel-" + BVBBPP.divisions.shortNames[groupNum]);
  getDocument(urlAns).then(parseAnsetzungAndInsert.bind(BVBBPP.this_));
}

function getCurrentSpiele(doc, spiele, numCurrentSpiele) {
  var verein = new Array(10);
  var gespielt = [ new Array(10), new Array(10), new Array(10), new Array(10), new Array(10),
                   new Array(10), new Array(10), new Array(10), new Array(10), new Array(10) ];
  var tr = doc.body.getElementsByTagName("tr");
  var i, td, date;
  for (i = 0; i < tr.length - 2; i++) {
    td = tr[i + 2].getElementsByTagName("td");
    verein[i] = td[1].textContent;
    for (var j = 0; j < td.length - 6 - 1; j++) {
      var cell = td[j + 6];
      var div = cell.getElementsByTagName("div")[0];
      // faellt aus oder beide gespielt
      if (cell.getAttribute("bgcolor") === ORANGE.css) {
        gespielt[i][j] = -1;
        continue;
      }
      if (/\d : \d.*\d : \d/.test(div.innerHTML)) {
        gespielt[i][j] = cell.getElementsByTagName("a")[0] || cell.getElementsByTagName("font")[0];
        continue;
      }

      var br = div.appendChild(create("br"));

      if (cell.getAttribute("valign") === "top" ||
          /0 : 8\s*<br>|8 : 0\s*<br>/.test(div.innerHTML)) {
        // Heimspiel gewesen
        gespielt[i][j] = cell.getElementsByTagName("a")[0] || cell.getElementsByTagName("font")[0];
        date = dateFromSpiele(spiele, j, i);
        if (date) {
          removeParents(div, "br");
          div.appendChild(br);
          div.appendChild(date);
        }
        continue;
      }
      if (cell.getAttribute("valign") === "bottom" ||
          /<br><font color="#FF6600"/.test(div.innerHTML)) {
        // auswaerts gewesen
        date = dateFromSpiele(spiele, i, j);
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
    return spiel1.date.replace(/(\d\d).(\d\d).(\d\d\d\d)/, "$3$2$1") + spiel1.time >
           spiel2.date.replace(/(\d\d).(\d\d).(\d\d\d\d)/, "$3$2$1") + spiel2.time;
  });

  var bald = spiele.filter(function(spiel) {
    return !gespielt[spiel.t1][spiel.t2];
  });

  var vorbei = spiele.filter(function(spiel) {
    return gespielt[spiel.t1][spiel.t2] && gespielt[spiel.t1][spiel.t2] !== -1;
  });

  return {
    bald: bald,
    vorbei: vorbei,
    gespielt: gespielt,
    verein: verein
  };
}

function filterCurrentSpiele(currentSpiele) {
  currentSpiele.vorbei = currentSpiele.vorbei.slice(-5, currentSpiele.vorbei.length);
  currentSpiele.bald = currentSpiele.bald.slice(0, 5);
}

function parseAnsetzungAndInsert(ansetzungen) {
  var doc = this.bvbbpp.doc;
  var spiele = parseAnsetzungen(doc, ansetzungen);
  var currentSpiele = getCurrentSpiele(doc, spiele, 5);
  filterCurrentSpiele(currentSpiele);
  insertAnsetzungen(doc, currentSpiele);
}



function insertAnsetzungen(doc, currentSpiele) {
  var bald = currentSpiele.bald;
  var vorbei = currentSpiele.vorbei;
  var gespielt = currentSpiele.gespielt;
  var verein = currentSpiele.verein;

  var numLines = Math.max(bald.length, vorbei.length);

  var tbody = create("tbody");

  var head = create("td", "Aktuelle Termine (laut Ansetzung)", "colspan", 2,
                    "style", "font-size: 11pt; font-weight: bold", "class", DARK_YELLOW.bg);

  tbody.appendChild(newParentElement("tr", head));
  var tr = create("tr", null, "class", DARK_YELLOW.bg);
  tbody.appendChild(tr);
  tr.appendChild(create("td", "K\u00FCrzlich", "style", "font-size: 9pt; font-weight: bold"));
  tr.appendChild(create("td", "Demn\u00E4chst", "style", "font-size: 9pt; font-weight: bold"));

  // array of new lines
  tr = new Array(numLines);
  for (var i = 0; i < numLines; i++) {
    tr[i] = create("tr", null);
  }

  var s, td;
  // kuerzlich
  for (i = Math.max(0, vorbei.length - numLines); i < vorbei.length; i++) {
    s = vorbei[i];
    var link = gespielt[s.t1][s.t2].cloneNode(true);
    td = create("td", null, "style", "padding-right: 20; padding-bottom: 0");
    link.textContent = link.textContent.replace(/\s+$/, "");
    td.appendChild(doc.createTextNode(s.date.replace(/.20/, ".") + ": "));
    td.appendChild(create("b", verein[s.t1]));
    td.appendChild(doc.createTextNode(" spielt "));
    td.appendChild(link);
    td.appendChild(doc.createTextNode(" gegen "));
    td.appendChild(create("b", verein[s.t2]));
    tr[i - Math.max(0, vorbei.length - numLines)].appendChild(td);
  }

  // demnaechst
  for (i = 0; i < Math.min(numLines, bald.length); i++) {
    s = bald[i];
    td = create("td", null, "style", "padding-right: 10; padding-bottom: 0");
    td.appendChild(doc.createTextNode(s.date.replace(/.20/, ".") + ": "));
    td.appendChild(create("b", verein[s.t1]));
    td.appendChild(doc.createTextNode(" empf\u00E4ngt "));
    td.appendChild(create("b", verein[s.t2]));
    td.appendChild(create("br"));
    tr[i].appendChild(td);
  }
  var table = newParentElement("table", tbody, "cellpadding", 4, "class", "borderless");
  for (i = 0; i < numLines; i++) {
    tbody.appendChild(tr[i]);
  }
  var first = doc.body.getElementsByTagName("table")[0];
  doc.getElementById("centerstyle").insertBefore(newParentElement("p", table), first.parentNode);
}

function dateFromSpiele(spiele, i, j) {
  var spiel = spiele.filter(function(el) {
    return el.t1 == i && el.t2 == j;
  })[0];
  if (!spiel) {
    return;
  }
  var date = spiel.date.substr(0, spiel.date.length - 4);
  return create("a", date, "class", ORANGE.fg);
}

/**
 * Change colors, set style sheet,
 */
function makeStyle() {
  // center page
  if (!/\d\d-\d\d_\d\d-\d\d.HTML$/.test(BVBBPP.URL)) {
    var div = create("div", null, "id", "centerstyle");
    while (BODY.hasChildNodes()) {
      div.appendChild(BODY.firstChild);
    }
    BODY.appendChild(div);
  }

  removeParents(document, "i");
  removeElements(document, "style");
  removeElements(BODY, "h2", /Fenster schlie/);
  removeElements(BODY, "table", /Fenster schlie/);

  // set css class when color attributes are present
  var elem = BODY.getElementsByTagName("*");
  for (var j = 0; j < elem.length; j++) {
    var e = elem[j];
    if (e.getAttribute("border") == "0" || e.getAttribute("style") == "border: 0") {
      e.setAttribute("class", "borderless");
    }
    var bgcol = e.getAttribute("bgcolor");
    var fgcol = e.getAttribute("color");
    for (var i = 0; i < COLORS.length; i++) {
      if (bgcol == COLORS[i].css) {
        e.setAttribute("class", COLORS[i].bg);
      }
      if (fgcol == COLORS[i].css) {
        e.setAttribute("class", e.getAttribute("class") + " " + COLORS[i].col);
      }
    }
  }

  var icon = document.createElement("link");
  icon.id = "icon";
  icon.rel = "shortcut icon";
  icon.href = "http://www.bvbb.net/fileadmin/user_upload/pics/logo.jpg";
  document.head.appendChild(icon);
}

new Bvbbpp(document).run();
