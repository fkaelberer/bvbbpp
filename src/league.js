// Copyright 2012-2018 Felix Kaelberer
//
// This work is licensed for reuse under an MIT license. Details are
// given in the LICENSE file included with this file.
//

/* 
 * The BvbbLeagueObject contains BVBB related properties and constants
 * which do not depend on the active document.
 */
var BvbbLeague = (function () {

    function getCurrentSeasonYear() {
        // lässt die neue Saison ab Juli starten
        var d = new Date();
        var year = d.getFullYear() - 2000;
        var july = 6;
        if (d.getMonth() < july) {
            year -= 1;
        }
        return year;
    }

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

    var divisions = [];
    // keine Gegenueberstellung 2006/07
    // DIVISIONS[ 6] = [BB, L1, L2, Z1, Z2, Z3, Z4, A1, A2, A3, A4, B1, B2, B3, C1, C2, C3];
    // keine Spieltermine 2007/08, 2008/09
    // DIVISIONS[ 7] = [BB, L1, L2, Z1, Z2, Z3, Z4, A1, A2, A3, A4, B1, B2, B3, B4, C1, C2, C3];
    // DIVISIONS[ 8] = [BB, L1, L2, Z1, Z2, Z3, Z4, A1, A2, A3, A4, B1, B2, B3, B4, C1, C2, C3];

    // Nur diejenigen Staffeln muessen angegeben werden, die sich von der Vorsaison unterscheiden.
    divisions[9] =  [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, F3];
    divisions[11] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2];
    divisions[13] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2, G3];
    divisions[14] = [BB, L1, L2, Z1, Z2, A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2];

    var firstSeason = 15; // 2009
    var seasons = [];
    var currentSeason = getCurrentSeasonYear();
    for (var i = firstSeason; i <= currentSeason; i++) {
        seasons.push(i);
        if (!divisions[i]) {
            divisions[i] = divisions[i - 1];
        }
    }

    var league = {
        DIVISIONS: divisions,
        CURRENT_SEASON: currentSeason,
        SEASONS: seasons
    };

    return league;
}());
