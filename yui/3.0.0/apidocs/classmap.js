YAHOO.env.classMap = {"ButtonGroup": "button-group", "AccordionPanel": "Accordion", "Accordion": "Accordion", "Button": "button", "ButtonToggle": "button", "Spinner": "spinner", "ButtonSeparator": "button-group", "MakeNode": "makenode"};

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
