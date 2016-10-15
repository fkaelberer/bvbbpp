// Copyright 2012-2016 Felix Kaelberer
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.
//

/* 
 * The parsers.js file contains methods which load and parse documents from
 * given urls and return javascript objects. Methods should be implemented as
 * Promises.
 */


function loadSpielbericht(url) {
    return getDocument(url).then(parseSpielbericht);
}

function parseSpielbericht(doc) {
    if (!doc) {
        console.log("Konnte Dokument " + url + " nicht laden.");
        return;
    }
    var h2 = doc.body.getElementsByTagName("h2")[2];
    if (!h2) {
        console.log("Fehler beim Lesen des Dokuments " + url +
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
        var spieler = validHeim ? (bheim[1] ? [bheim[0].textContent, bheim[1].textContent]
                : [bheim[0].textContent])
                : "<<<< kampflos >>>>";
        var gegner = validGast ? (bgast[1] ? [bgast[0].textContent, bgast[1].textContent]
                : [bgast[0].textContent])
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
    var url = doc.URL;

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
}

function loadHallenschluessel(url) {
    return getDocument(url).then(parseHallenschluessel);
}


function parseHallenschluessel(hallenDoc) {
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
    return hallenschluessel;
}


function loadVereine(vereineURL) {
    return getDocument(vereineURL).then(parseVereine);
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
function parseVereine(doc) {
    var td = doc.getElementsByTagName("td");
    var vereine = [];
    for (var i = 0; i < td.length; i++) {
        var textContent = td[i].textContent;
        if (/^\d{2,3}$/.test(textContent)) {
            var a = td[i + 1].getElementsByTagName("a")[0];
            vereine.push({
                nr: parseInt(textContent, 10),
                href: getProtocolAndDomain(doc.URL) + "/" + a.href.substring(a.href.lastIndexOf("fileadmin")),
                shortName: a.textContent,
                name: td[i + 2].textContent
            });
        }
    }
    vereine = vereine.filter(e => e);
    vereine.sort((v, w) => v.name !== w.name ? (v.name < w.name ? -1 : 1) : 0);
    return vereine;
}

function loadListOfPlayers(url) {
    return getDocument(url).then(parseListOfPlayers);
}

function parseListOfPlayers(playerDoc) {
  // Load player links from options element and convert it to an array of objects.
  return [].map.call(playerDoc.getElementsByTagName("option"),
      e => {
        var captures = /(.*)\s\s\((.*)\)/.exec(e.textContent);
        return {
          name : captures[1],
          club : captures[2],
          link : BVBBPP.webSpielerstatistik + e.value
        };
      }
  );
}

