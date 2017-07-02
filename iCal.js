class ICal {
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
    constructor() {
        this.events = [];
    }

    toString() {
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
    }

    addEvent(e) {
        this.events.push(e);
    }
};
