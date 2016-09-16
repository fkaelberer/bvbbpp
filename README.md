# BVBB++
Quellcode des BVBB++-Addons. Die aktuellste stabile Version ist hier herunterzuladen:

* Für Mozilla Firefox: 
https://addons.mozilla.org/de/firefox/addon/bvbbpp/
* Für Google Chrome: *demnächst* 

### Hinweise für Entwickler

Haupt-Entwicklungszweig dieses Projekts ist derzeit `feature/webextension`.

#### Einrichtung des Plugins für Entwickler unter Google Chrome

*Einstellungen* --> *Erweiterungen* --> *Entpackte Erweiterung laden* auswählen, hier den Pfad zum git-Repository angeben. Der Haken *Entwicklermodus* in den Erweiterungseinstellungen muss hierfür gesetzt sein.

#### Einrichtung für des Plugins Entwickler unter Mozilla Firefox

1. Die Release-Version von Firefox akzeptiert nur signierte Addons, daher ist die Installation der [Firefox Developer Edition](https://www.mozilla.org/de/firefox/developer/) ratsam. 
2. Die Dateien `LICENSE`, `manifest.json` sowie alle `.js`- und `.css`- Quellcode-Dateien in eine Zip-Datei packen und deren Dateiendung von `.zip` nach `.xpi` ändern.
3. Die `.xpi`-Datei mit Firefox öffnen



