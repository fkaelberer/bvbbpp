# BVBB++
Quellcode des BVBB++-Addons. Die aktuellste stabile Version ist hier herunterzuladen:

* Für Mozilla Firefox: 
https://addons.mozilla.org/de/firefox/addon/bvbbpp/
* Für Google Chrome: *demnächst* 

### Hinweise für Entwickler

#### Bauen mit gulp

1. [Node.js](https://nodejs.org) und [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) installieren.
2. Im Stammverzeichnis `gulp` ausführen. 
   Dabei werden die Verzeichnisse `dist-chrome` und `dist-firefox` angelegt, die die jeweiligen Erweiterungen enthalten.

#### Installation des Plugins für Entwickler unter Google Chrome

*Einstellungen* --> *Weitere Tools* --> *Erweiterungen* --> *Entpackte Erweiterung laden* auswählen, hier den Pfad `dist-chrome` angeben. Der Haken *Entwicklermodus* in den Erweiterungseinstellungen muss hierfür gesetzt sein.

#### Installation des Plugins für Entwickler unter Mozilla Firefox

1. Die Release-Version von Firefox akzeptiert nur signierte Addons, daher ist die Installation der [Firefox Developer Edition](https://www.mozilla.org/de/firefox/developer/) ratsam. 
2. Die Datei `dist-firefox/bvbbpp.xpi`-Datei mit Firefox öffnen
