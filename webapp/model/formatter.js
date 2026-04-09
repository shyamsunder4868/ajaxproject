sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";
    
    var oTableDateFormat = DateFormat.getDateInstance({
        pattern: "dd/MM/yyyy"
    });

    return {
        formatTableDate: function (vDate) {
            if (!vDate) {
                return "";
            }
            if (vDate instanceof Date && !isNaN(vDate.getTime())) {
                return oTableDateFormat.format(vDate);
            }
            if(typeof vDate === "string"){
                if (/^\d{4}-\d{2}-\d{2}$/.test(vDate)) {
                    var aParts = vDate.split("-");
                    var oDateFromPlain = new Date(
                        parseInt(aParts[0], 10),
                        parseInt(aParts[1], 10) - 1,
                        parseInt(aParts[2], 10)
                    );
                    if (!isNaN(oDateFromPlain.getTime())) {
                        return oTableDateFormat.format(oDateFromPlain);
                    }
                }
                if (vDate.indexOf("T") > -1) {
                    var sDatePart = vDate.split("T")[0];
                    if (/^\d{4}-\d{2}-\d{2}$/.test(sDatePart)) {
                        var aIsoParts = sDatePart.split("-");
                        var oDateFromIso = new Date(
                            parseInt(aIsoParts[0], 10),
                            parseInt(aIsoParts[1], 10) - 1,
                            parseInt(aIsoParts[2], 10)
                        );
                        if (!isNaN(oDateFromIso.getTime())) {
                            return oTableDateFormat.format(oDateFromIso);
                        }
                    }
                }
                var oParsedDate = new Date(vDate);
                if (!isNaN(oParsedDate.getTime())) {
                    return oTableDateFormat.format(oParsedDate);
                }
            }
            return vDate;
        }
    };
});