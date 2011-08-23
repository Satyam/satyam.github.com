YAHOO.env.classMap = {"ButtonGroup": "gallery-md-button-group", "AccordionPanel": "gallery-md-accordion", "Accordion": "gallery-md-accordion", "Button": "gallery-md-button", "ButtonToggle": "gallery-md-button", "Spinner": "gallery-md-spinner", "ButtonSeparator": "gallery-md-button-group", "MakeNode": "gallery-md-makenode", "TimeSpinner": "gallery-md-timespinner"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
