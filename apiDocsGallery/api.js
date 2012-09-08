YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Accordion",
        "AccordionPanel",
        "Button",
        "ButtonGroup",
        "ButtonPlugin",
        "ButtonSeparator",
        "ButtonToggle",
        "IButton",
        "MakeNode",
        "Node",
        "Spinner",
        "StdMod",
        "TimeSpinner",
        "Y.FWTreeNode",
        "Y.FWTreeView",
        "Y.FlyweightTreeManager",
        "Y.FlyweightTreeNode",
        "Y.GalleryModel",
        "Y.GalleryModelChronologicalUndo",
        "Y.GalleryModelMultiRecord",
        "Y.GalleryModelPrimaryKeyIndex",
        "Y.GalleryModelSimpleUndo",
        "Y.GalleryModelSortedMultiRecord",
        "Y.Timeline"
    ],
    "modules": [
        "gallery-button-plugin",
        "gallery-flyweight-tree",
        "gallery-fwt-treeview",
        "gallery-makenode",
        "gallery-md-accordion",
        "gallery-md-button",
        "gallery-md-button-group",
        "gallery-md-ibutton",
        "gallery-md-model",
        "gallery-md-spinner",
        "gallery-md-timespinner",
        "gallery-stdmod",
        "timeline"
    ],
    "allModules": [
        {
            "displayName": "gallery-button-plugin",
            "name": "gallery-button-plugin",
            "description": "Node plugin to handle toggle buttons and groups of mutually exclusive toggle buttons.\nSearches a given container for buttons marked with the `yui3-button-toggle` className\nand turns them into toggle buttons and also any HTML element with the `yui3-button-group-exclusive`\nclassName and makes the toggle buttons within it mutually exclussive.\nAdds the `selected` attribute, for toggle buttons it tells whether the button is in the pressed state,\nfor groups of toggles points to the button currently presssed.\nRelies on the cssbutton module for styling."
        },
        {
            "displayName": "gallery-flyweight-tree",
            "name": "gallery-flyweight-tree"
        },
        {
            "displayName": "gallery-fwt-treeview",
            "name": "gallery-fwt-treeview",
            "description": "Instances of it will be provided by Y.FWTreeView as required.\n\nSubclasses might be defined based on it.  \nUsually, they will add further attributes and redefine the TEMPLATE to \nshow those extra attributes."
        },
        {
            "displayName": "gallery-makenode",
            "name": "gallery-makenode",
            "description": "An extension for Widget to create markup from templates, \ncreate CSS classNames, locating elements,\nassist in attaching events to UI elements and to reflect attribute changes into the UI.\nAll of its members are either protected or private.  \nDevelopers using MakeNode should use only those marked protected.  \n<b>Enable the Show Protected checkbox to see them</b>."
        },
        {
            "displayName": "gallery-md-accordion",
            "name": "gallery-md-accordion",
            "description": "The accordion module creates a control with titles and expandable sections for each"
        },
        {
            "displayName": "gallery-md-button",
            "name": "gallery-md-button",
            "description": "Provides a better button object"
        },
        {
            "displayName": "gallery-md-button-group",
            "name": "gallery-md-button-group",
            "description": "Provides a container to group buttons.\nIt can hold instances of Y.Button, Y.ButtonToggle or Y.ButtonSeparator."
        },
        {
            "displayName": "gallery-md-ibutton",
            "name": "gallery-md-ibutton",
            "description": "Provides an iPhone-style toggle button (checkbox) object"
        },
        {
            "displayName": "gallery-md-model",
            "name": "gallery-md-model",
            "description": "Record-based data model with APIs for getting, setting, validating, and\nsyncing attribute values, as well as events for being notified of model changes."
        },
        {
            "displayName": "gallery-md-spinner",
            "name": "gallery-md-spinner",
            "description": "Shows an input box with a set of up/down buttons to change its value."
        },
        {
            "displayName": "gallery-md-timespinner",
            "name": "gallery-md-timespinner",
            "description": "Shows and accepts a time via a set of spinners.  \nIt can run showing the current time."
        },
        {
            "displayName": "gallery-stdmod",
            "name": "gallery-stdmod",
            "description": "A version of Widget-StdMod that uses the ContentBox of the Widget as its Body section and adds\nthe Header and Footer sections on each side of it instead of having the three of them under the contentBox.\nThis turns quite handy when used along WidgetParent since the later assumes children will be added in the contentBox\nand thus conflicts with the StdMod sections. (this can also be solved using the property <a href=\"http://yuilibrary.com/yui/docs/api/classes/WidgetParent.html#property__childrenContainer\">_childrenContainer</a>)<br/><br/>\nFor further documentation see <a href=\"http://yuilibrary.com/yui/docs/api/classes/WidgetStdMod.html\">WidgetStdMod</a>"
        },
        {
            "displayName": "timeline",
            "name": "timeline",
            "description": "Shows in the browser timeline files produced by the program from <a href=\"http://thetimelineproj.sourceforge.net/\">The Timeline Project</a>."
        }
    ]
} };
});