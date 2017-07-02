var MOBILE = false;

// TODO store defaults (relict from old Firefox extension)
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


/**
 * @param name
 *            name of the preference
 * @returns the default value of the preference if it exists, 'undefined' otherwise.
 */
function getDefaultPrefValue(name) {
    var defaultPreference = PREFS.find(element => (element.name === name));
    return defaultPreference ? defaultPreference.def : undefined;
}

/**
 * Get a preference from the branch "extensions.bvbbpp.". If it doesn't exist, return the preference's
 * default setting. If the default setting doesn't exist either, return undefined.
 *
 * TODO https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Implement_a_settings_page
 *
 * @param name
 *            pref name
 * @param callback
 *            callback function which is called with pref value as argument
 */
function getPref(name, callback) {
    if (!callback) return false;
    return chrome.storage.local.get(name, value => {
        var prefValue = (value[name] !== undefined) ? value[name] : getDefaultPrefValue(name);
        callback(prefValue);
    });
}

function setPref(name, value) {
    var pref = {};
    pref[name] = value;
    chrome.storage.local.set(pref);
}
