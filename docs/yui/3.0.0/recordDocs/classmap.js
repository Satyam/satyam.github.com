YAHOO.env.classMap = {"FieldDefSet": "recordset", "DataType.Converters": "recordset", "Form": "recordset", "RecordSet": "recordset", "FieldDef": "recordset", "Form.BaseField": "recordset", "Record": "recordset", "Record.Field": "recordset", "DataType.Types": "recordset"};

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
