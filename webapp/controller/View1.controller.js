sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "project3/model/formatter"
], function (Controller, JSONModel, MessageToast, MessageBox, BusyDialog, Filter, FilterOperator, Sorter, formatter) {
    "use strict";

    return Controller.extend("project3.controller.View1", {
        formatter: formatter,

        // Controller initialization
        onInit: function () {
            this.View1_oBusyDialog = new BusyDialog({
                title: "Please wait",
                text: "Processing..."
            });
            this.getView().setModel(new JSONModel({
                data: [],
                startDateList: []
            }), "LocalModel");
        },

        // Get i18n text utility
        View1_getText: function (sKey) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey);
        },

        // Show busy dialog
        View1_showBusy: function (sText) {
            this.View1_oBusyDialog.setTitle(this.View1_getText("busy.title"));
            this.View1_oBusyDialog.setText(sText || this.View1_getText("busy.text"));
            this.View1_oBusyDialog.open();
        },

        // Hide busy dialog
        View1_hideBusy: function () {
            this.View1_oBusyDialog.close();
        },

        // Show success toast message
        View1_showSuccessToast: function (sMessage) {
            MessageToast.show(sMessage, {
                duration: 2000,
                width: "18em"
            });
        },

        // Live validation for Employee Name - block numbers
        View1_onEmpNameLiveChange: function (oEvent) {
            var sValue = oEvent.getParameter("newValue");
            var oInput = oEvent.getSource();

            if (/[0-9]/.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Employee Name cannot contain numbers");
                return;
            }

            oInput.setValueState("None");
            oInput.setValueStateText("");
        },

        // Live validation - clear errors when user types
        View1_onLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            oInput.setValueState("None");
            oInput.setValueStateText("");
        },

        // Date validation for DatePicker manual input
        View1_onDateChange: function (oEvent) {
            var oDatePicker = oEvent.getSource();
            var bValid = oEvent.getParameter("valid");
            var sValue = oEvent.getParameter("value");

            oDatePicker.setValueState("None");
            oDatePicker.setValueStateText("");

            if (!sValue) {
                return;
            }

            if (!bValid || !oDatePicker.getDateValue()) {
                oDatePicker.setValueState("Error");
                oDatePicker.setValueStateText(this.View1_getText("validation.date.invalid"));
                return;
            }

            var oStartDate = sap.ui.getCore().byId("fragment_id_startDate");
            var oEndDate = sap.ui.getCore().byId("fragment_id_endDate");
            var dStart = oStartDate ? oStartDate.getDateValue() : null;
            var dEnd = oEndDate ? oEndDate.getDateValue() : null;

            if (dStart && dEnd && dEnd < dStart) {
                oEndDate.setValueState("Error");
                oEndDate.setValueStateText(this.View1_getText("validation.end.before.start"));
            } else if (oEndDate) {
                if (oEndDate.getValueStateText() === this.View1_getText("validation.end.before.start")) {
                    oEndDate.setValueState("None");
                    oEndDate.setValueStateText("");
                }
            }
        },

        // Clear filter bar fields and restore default table data
        View1_onClearFilters: function () {
            this.byId("View1_id_searchField").setValue("");
            this.byId("View1_id_startDateFilter").setSelectedKey("");

            // var oTable = this.byId("View1_id_taskTable");
            // var oBinding = oTable.getBinding("items");

            // if (oBinding) {
            //     oBinding.filter([]);
            //     oBinding.sort(new Sorter("EmployeeID", false));
            // }
        },

        // Apply table filters and sorting
        View1_applyTableFiltersAndSort: function () {
            var oTable = this.byId("View1_id_taskTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            var sSearch = this.byId("View1_id_searchField").getValue().trim();
            var sStartDate = this.byId("View1_id_startDateFilter").getSelectedKey();
            var aFilters = [];

            if (sSearch) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("EmployeeName", FilterOperator.Contains, sSearch),
                        new Filter("EmployeeID", FilterOperator.Contains, sSearch)
                    ],
                    and: false
                }));
            }

            if (sStartDate) {
                aFilters.push(new Filter("StartDate", FilterOperator.Contains, sStartDate));
            }

            oBinding.filter(aFilters);
            oBinding.sort(new Sorter("EmployeeID", false));
        },

        // Search button handler
        View1_onSearch: function () {
            this.View1_applyTableFiltersAndSort();
        },

        // Start date filter change handler
        View1_onStartDateFilterChange: function () {
            this.View1_applyTableFiltersAndSort();
        },

        // Validate form inputs
        View1_validateForm: function () {
            var oEmpName = sap.ui.getCore().byId("fragment_id_empName");
            var oEmpId = sap.ui.getCore().byId("fragment_id_empId");
            var oTaskId = sap.ui.getCore().byId("fragment_id_taskId");
            var oTaskName = sap.ui.getCore().byId("fragment_id_taskName");
            var oStartDate = sap.ui.getCore().byId("fragment_id_startDate");
            var oEndDate = sap.ui.getCore().byId("fragment_id_endDate");
            var oHours = sap.ui.getCore().byId("fragment_id_hours");

            var bValid = true;
            var sEmpName = oEmpName.getValue().trim();
            var sEmpId = oEmpId.getValue().trim();
            var sTaskId = oTaskId.getValue().trim();
            var sTaskName = oTaskName.getValue().trim();
            var sStartDate = oStartDate.getValue().trim();
            var sEndDate = oEndDate.getValue().trim();
            var sHours = oHours.getValue().trim();

            var dStart = oStartDate.getDateValue();
            var dEnd = oEndDate.getDateValue();

            [oEmpName, oEmpId, oTaskId, oTaskName, oStartDate, oEndDate, oHours].forEach(function (oControl) {
                oControl.setValueState("None");
                oControl.setValueStateText("");
            });

            if (!sEmpName) {
                oEmpName.setValueState("Error");
                oEmpName.setValueStateText(this.View1_getText("validation.employee.name.required"));
                bValid = false;
            } else if (!/^[A-Za-z\s]+$/.test(sEmpName)) {
                oEmpName.setValueState("Error");
                oEmpName.setValueStateText("Employee Name should contain only letters and spaces");
                bValid = false;
            }

            if (!sEmpId) {
                oEmpId.setValueState("Error");
                oEmpId.setValueStateText(this.View1_getText("validation.employee.id.required"));
                bValid = false;
            } else if (!/^[A-Z0-9]{3,20}$/.test(sEmpId)) {
                oEmpId.setValueState("Error");
                oEmpId.setValueStateText(this.View1_getText("validation.employee.id.invalid"));
                bValid = false;
            }

            if (!sTaskId) {
                oTaskId.setValueState("Error");
                oTaskId.setValueStateText(this.View1_getText("validation.task.id.required"));
                bValid = false;
            } else if (!/^[A-Za-z0-9_-]{3,50}$/.test(sTaskId)) {
                oTaskId.setValueState("Error");
                oTaskId.setValueStateText(this.View1_getText("validation.task.id.invalid"));
                bValid = false;
            }

            if (!sTaskName) {
                oTaskName.setValueState("Error");
                oTaskName.setValueStateText(this.View1_getText("validation.task.name.required"));
                bValid = false;
            } else if (sTaskName.length < 3) {
                oTaskName.setValueState("Error");
                oTaskName.setValueStateText(this.View1_getText("validation.task.name.invalid"));
                bValid = false;
            }

            if (!sStartDate) {
                oStartDate.setValueState("Error");
                oStartDate.setValueStateText(this.View1_getText("validation.start.required"));
                bValid = false;
            } else if (!dStart) {
                oStartDate.setValueState("Error");
                oStartDate.setValueStateText(this.View1_getText("validation.date.invalid"));
                bValid = false;
            }

            if (!sEndDate) {
                oEndDate.setValueState("Error");
                oEndDate.setValueStateText(this.View1_getText("validation.end.required"));
                bValid = false;
            } else if (!dEnd) {
                oEndDate.setValueState("Error");
                oEndDate.setValueStateText(this.View1_getText("validation.date.invalid"));
                bValid = false;
            }

            if (dStart && dEnd && dEnd < dStart) {
                oEndDate.setValueState("Error");
                oEndDate.setValueStateText(this.View1_getText("validation.end.before.start"));
                bValid = false;
            }

            if (!sHours) {
                oHours.setValueState("Error");
                oHours.setValueStateText(this.View1_getText("validation.hours.required"));
                bValid = false;
            } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(sHours)) {
                oHours.setValueState("Error");
                oHours.setValueStateText(this.View1_getText("validation.hours.invalid"));
                bValid = false;
            }

            if (!bValid) {
                MessageBox.error(this.View1_getText("message.validation.failed"), {
                    styleClass: this.getOwnerComponent().getContentDensityClass()
                });
            }

            return bValid;
        },

        // Load initial data from API
        View1_onLoad: function () {
            this.View1_showBusy(this.View1_getText("busy.loading"));

            $.ajax({
                url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                method: "GET",
                headers: {
                    name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                    password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                    "Content-Type": "application/json"
                },
                success: function (rev) {
                    var aData = rev.data || [];
                    var oModel = this.getView().getModel("LocalModel");
                    var oDateMap = {};
                    var aStartDateList = [];

                    aData.forEach(function (oItem) {
                        if (oItem.StartDate && !oDateMap[oItem.StartDate]) {
                            oDateMap[oItem.StartDate] = true;
                            aStartDateList.push({
                                key: oItem.StartDate,
                                text: oItem.StartDate
                            });
                        }
                    });

                    oModel.setProperty("/data", aData);
                    oModel.setProperty("/startDateList", aStartDateList);
                    this.View1_hideBusy();
                    this.View1_showSuccessToast(this.View1_getText("message.data.loaded"));
                    this.View1_applyTableFiltersAndSort();
                }.bind(this),
                error: function (error) {
                    console.log(error);
                    this.View1_hideBusy();
                    MessageBox.error(this.View1_getText("message.load.failed"));
                }.bind(this)
            });
        },

        // Open task dialog in create or update mode
        View1_openTaskDialog: function (sMode) {
            if (!this.View1_oDialog) {
                this.View1_oDialog = sap.ui.xmlfragment("project3.fragment.fragment", this);
                this.getView().addDependent(this.View1_oDialog);
            }

            this.View1_oDialog.setModel(new JSONModel({ mode: sMode }), "params");

            if (sMode === "create") {
                this.View1_oDialog.setTitle(this.View1_getText("dialog.create.title"));
            } else {
                this.View1_oDialog.setTitle(this.View1_getText("dialog.update.title"));
            }

            var oTable = this.byId("View1_id_taskTable");
            var oSelectedItem = oTable.getSelectedItem();

            setTimeout(function () {
                var oEmpName = sap.ui.getCore().byId("fragment_id_empName");
                var oEmpId = sap.ui.getCore().byId("fragment_id_empId");
                var oTaskId = sap.ui.getCore().byId("fragment_id_taskId");
                var oTaskName = sap.ui.getCore().byId("fragment_id_taskName");
                var oStartDate = sap.ui.getCore().byId("fragment_id_startDate");
                var oEndDate = sap.ui.getCore().byId("fragment_id_endDate");
                var oHours = sap.ui.getCore().byId("fragment_id_hours");

                if (sMode === "create") {
                    oEmpName.setValue("");
                    oEmpId.setValue("");
                    oTaskId.setValue("");
                    oTaskId.setEditable(true);
                    oTaskName.setValue("");
                    oStartDate.setValue("");
                    oEndDate.setValue("");
                    oHours.setValue("");
                }

                if (sMode === "update" && oSelectedItem) {
                    var oData = oSelectedItem.getBindingContext("LocalModel").getObject();
                    oEmpName.setValue(oData.EmployeeName || "");
                    oEmpId.setValue(oData.EmployeeID || "");
                    oTaskId.setValue(oData.TaskID || "");
                    oTaskId.setEditable(false);
                    oTaskName.setValue(oData.TaskName || "");
                    oStartDate.setValue(oData.StartDate ? oData.StartDate.split("T")[0] : "");
                    oEndDate.setValue(oData.EndDate ? oData.EndDate.split("T")[0] : "");
                    oHours.setValue(oData.HoursWorked || "");
                }

                [oEmpName, oEmpId, oTaskId, oTaskName, oStartDate, oEndDate, oHours].forEach(function (oControl) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                });

            }.bind(this), 0);

            this.View1_oDialog.open();
        },

        // Open create dialog
        View1_openCreateDialog: function () {
            this.View1_openTaskDialog("create");
        },

        // Open update dialog
        View1_openUpdateDialog: function () {
            var oTable = this.byId("View1_id_taskTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this.View1_getText("message.select.row.update"));
                return;
            }

            this.View1_openTaskDialog("update");
        },

        // Save task (create or update)
        View1_onSaveTask: function () {
            if (!this.View1_validateForm()) {
                return;
            }

            var oFormData = {
                EmployeeName: sap.ui.getCore().byId("fragment_id_empName").getValue().trim(),
                EmployeeID: sap.ui.getCore().byId("fragment_id_empId").getValue().trim(),
                TaskID: sap.ui.getCore().byId("fragment_id_taskId").getValue().trim(),
                TaskName: sap.ui.getCore().byId("fragment_id_taskName").getValue().trim(),
                StartDate: sap.ui.getCore().byId("fragment_id_startDate").getValue(),
                EndDate: sap.ui.getCore().byId("fragment_id_endDate").getValue(),
                HoursWorked: sap.ui.getCore().byId("fragment_id_hours").getValue().trim()
            };

            var sMode = this.View1_oDialog.getModel("params").getProperty("/mode");

            if (sMode === "create") {
                this.View1_showBusy(this.View1_getText("busy.creating"));

                $.ajax({
                    url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                    method: "POST",
                    headers: {
                        name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                        password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        data: oFormData
                    }),
                    success: function () {
                        this.View1_hideBusy();
                        this.byId("View1_id_taskTable").removeSelections(true);
                        this.View1_oDialog.close();
                        this.View1_showSuccessToast(this.View1_getText("message.create.success"));
                        this.View1_onLoad();
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                        this.View1_hideBusy();
                        MessageBox.error(this.View1_getText("message.create.failed"));
                    }.bind(this)
                });
            } else if (sMode === "update") {
                var oTable = this.byId("View1_id_taskTable");
                var oSelectedItem = oTable.getSelectedItem();

                if (!oSelectedItem) {
                    MessageBox.warning(this.View1_getText("message.select.row.update"));
                    return;
                }

                var oSelectedData = oSelectedItem.getBindingContext("LocalModel").getObject();

                this.View1_showBusy(this.View1_getText("busy.updating"));

                $.ajax({
                    url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                    method: "PUT",
                    headers: {
                        name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                        password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        data: oFormData,
                        filters: {
                            TaskID: oSelectedData.TaskID
                        }
                    }),
                    success: function () {
                        this.View1_hideBusy();
                        this.byId("View1_id_taskTable").removeSelections(true);
                        this.View1_oDialog.close();
                        this.View1_showSuccessToast(this.View1_getText("message.update.success"));
                        this.View1_onLoad();
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                        this.View1_hideBusy();
                        MessageBox.error(this.View1_getText("message.update.failed"));
                    }.bind(this)
                });
            }
        },

        // Delete selected task
        View1_onDelete: function () {
            var oTable = this.byId("View1_id_taskTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this.View1_getText("message.select.row.delete"));
                return;
            }

            var oSelectedData = oSelectedItem.getBindingContext("LocalModel").getObject();

            MessageBox.confirm(this.View1_getText("dialog.confirm.delete"), {
                title: this.View1_getText("dialog.delete.title"),
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.View1_showBusy(this.View1_getText("busy.deleting"));

                        $.ajax({
                            url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                            method: "DELETE",
                            headers: {
                                name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                                password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                                "Content-Type": "application/json"
                            },
                            data: JSON.stringify({
                                data: oSelectedData,
                                filters: {
                                    TaskID: oSelectedData.TaskID
                                }
                            }),
                            success: function () {
                                this.View1_hideBusy();
                                this.byId("View1_id_taskTable").removeSelections(true);
                                this.View1_showSuccessToast(this.View1_getText("message.delete.success"));
                                this.View1_onLoad();
                            }.bind(this),
                            error: function (error) {
                                console.log(error);
                                this.View1_hideBusy();
                                MessageBox.error(this.View1_getText("message.delete.failed"));
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        // Close dialog
        View1_onCloseDialog: function () {
            if (this.View1_oDialog && this.View1_oDialog.isOpen()) {
                this.View1_oDialog.close();
            }
        }
    });
});