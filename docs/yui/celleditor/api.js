YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "DataTable",
        "DataTable.Base",
        "DataTable.BaseCellEditor",
        "DataTable.BaseCellEditor.KeyFiltering",
        "DataTable.BaseCellInlineEditor",
        "DataTable.BaseCellPopupEditor",
        "DataTable.BodyView",
        "DataTable.BodyView.Formatters",
        "DataTable.BodyView.InputFormatters",
        "DataTable.ColumnWidths",
        "DataTable.Core",
        "DataTable.Editable",
        "DataTable.Editors",
        "DataTable.HeaderView",
        "DataTable.Message",
        "DataTable.Mutable",
        "DataTable.Scrollable",
        "DataTable.Sortable",
        "DataTable.TableView",
        "Plugin.DataTableDataSource"
    ],
    "modules": [
        "datatable",
        "datatable-base",
        "datatable-body",
        "datatable-celleditor-base",
        "datatable-celleditor-inline",
        "datatable-celleditor-keyfiltering",
        "datatable-celleditor-popup",
        "datatable-column-widths",
        "datatable-core",
        "datatable-datasource",
        "datatable-editable",
        "datatable-formatters",
        "datatable-head",
        "datatable-input-formatters",
        "datatable-message",
        "datatable-mutable",
        "datatable-scroll",
        "datatable-sort",
        "datatable-table"
    ],
    "allModules": [
        {
            "displayName": "datatable",
            "name": "datatable",
            "description": "A Widget for displaying tabular data.  The base implementation of DataTable\nprovides the ability to dynamically generate an HTML table from a set of column\nconfigurations and row data.\n\nTwo classes are included in the `datatable-base` module: `Y.DataTable` and\n`Y.DataTable.Base`."
        },
        {
            "displayName": "datatable-base",
            "name": "datatable-base",
            "description": "A Widget for displaying tabular data.  The base implementation of DataTable\nprovides the ability to dynamically generate an HTML table from a set of column\nconfigurations and row data.\n\nTwo classes are included in the `datatable-base` module: `Y.DataTable` and\n`Y.DataTable.Base`."
        },
        {
            "displayName": "datatable-body",
            "name": "datatable-body",
            "description": "View class responsible for rendering the `<tbody>` section of a table. Used as\nthe default `bodyView` for `Y.DataTable.Base` and `Y.DataTable` classes."
        },
        {
            "displayName": "datatable-celleditor-base",
            "name": "datatable-celleditor-base",
            "description": "Provides the base services for cell editors. This class is meant to be subclassed\nby actual implementations of cell editors"
        },
        {
            "displayName": "datatable-celleditor-inline",
            "name": "datatable-celleditor-inline",
            "description": "Provides cell editors that appear to make the cell itself editable by occupying the same region."
        },
        {
            "displayName": "datatable-celleditor-keyfiltering",
            "name": "datatable-celleditor-keyfiltering",
            "description": "Extension to DataTable Cell Editors that does input validation as the entry is being\ntyped or pasted in.  It uses the `event-valuechange` module to check the on\ninput and textarea elements.\n\nThe built-in cell editors have key filters configured, when applicable, but they\nwill not be operative unless this module is loaded."
        },
        {
            "displayName": "datatable-celleditor-popup",
            "name": "datatable-celleditor-popup",
            "description": "Provides cell editors contained in an overlay that pops on top of the cell to be edited."
        },
        {
            "displayName": "datatable-column-widths",
            "name": "datatable-column-widths",
            "description": "Adds basic, programmatic column width support to DataTable via column\nconfiguration property `width` and method `table.setColumnWidth(id, width);`."
        },
        {
            "displayName": "datatable-core",
            "name": "datatable-core",
            "description": "The core implementation of the `DataTable` and `DataTable.Base` Widgets."
        },
        {
            "displayName": "datatable-datasource",
            "name": "datatable-datasource",
            "description": "Plugs DataTable with DataSource integration."
        },
        {
            "displayName": "datatable-editable",
            "name": "datatable-editable",
            "description": "Allows the cells on a DataTable to be edited. Requires either the inline or popup cell editors."
        },
        {
            "displayName": "datatable-formatters",
            "name": "datatable-formatters",
            "description": "Adds predefined cell formatters to `Y.DataTable.BodyView`."
        },
        {
            "displayName": "datatable-head",
            "name": "datatable-head",
            "description": "View class responsible for rendering the `<thead>` section of a table. Used as\nthe default `headerView` for `Y.DataTable.Base` and `Y.DataTable` classes."
        },
        {
            "displayName": "datatable-input-formatters",
            "name": "datatable-input-formatters",
            "description": "Adds predefined cell formatters to `Y.DataTable.BodyView`."
        },
        {
            "displayName": "datatable-message",
            "name": "datatable-message",
            "description": "Adds support for a message container to appear in the table.  This can be used\nto indicate loading progress, lack of records, or any other communication\nneeded."
        },
        {
            "displayName": "datatable-mutable",
            "name": "datatable-mutable",
            "description": "Adds mutation convenience methods such as `table.addRow(data)` to `Y.DataTable`. (or other built class)."
        },
        {
            "displayName": "datatable-scroll",
            "name": "datatable-scroll",
            "description": "Adds the ability to make the table rows scrollable while preserving the header\nplacement."
        },
        {
            "displayName": "datatable-sort",
            "name": "datatable-sort",
            "description": "Adds support for sorting the table data by API methods `table.sort(...)` or\n`table.toggleSort(...)` or by clicking on column headers in the rendered UI."
        },
        {
            "displayName": "datatable-table",
            "name": "datatable-table",
            "description": "View class responsible for rendering a `<table>` from provided data.  Used as\nthe default `view` for `Y.DataTable.Base` and `Y.DataTable` classes."
        }
    ]
} };
});