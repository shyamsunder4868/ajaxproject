sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("project3.controller.View1", {
        onInit() {
        },

        onLoad: function () {
            $.ajax({
                url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                method: "GET",
                headers: {
                    name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                    password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                    "Content-Type": "application/json"
                },
                success: function (rev) {
                    var oModel = new JSONModel(rev);
                    this.getView().setModel(oModel, "LocalModel");
                }.bind(this),
                error: function (error) {
                    console.log(error);
                }
            });
        },

        _openTaskDialog: function (sMode) {
            if (!this._taskDialog) {
                this._taskDialog = sap.ui.xmlfragment("project3.fragment.fragment", this);
                this.getView().addDependent(this._taskDialog);
            }

            this._taskDialog.setModel(new JSONModel({ mode: sMode }), "params");

            var oTable = this.byId("taskTable");
            var oSelectedItem = oTable.getSelectedItem();

            setTimeout(function () {
                var oEmpName = sap.ui.getCore().byId("empName");
                var oEmpId = sap.ui.getCore().byId("empId");
                var oTaskId = sap.ui.getCore().byId("taskId");
                var oTaskName = sap.ui.getCore().byId("taskName");
                var oStartDate = sap.ui.getCore().byId("startDate");
                var oEndDate = sap.ui.getCore().byId("endDate");
                var oHours = sap.ui.getCore().byId("hours");

                if (sMode === "create") {
                    oEmpName.setValue("");
                    oEmpId.setValue("");
                    oTaskId.setValue("");
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
                    oTaskName.setValue(oData.TaskName || "");
                    oStartDate.setValue(oData.StartDate || "");
                    oEndDate.setValue(oData.EndDate || "");
                    oHours.setValue(oData.HoursWorked || "");
                }
            }, 100);

            this._taskDialog.open();
        },

        openCreateDialog: function () {
            this._openTaskDialog("create");
        },

        openUpdateDialog: function () {
            var oTable = this.byId("taskTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Please select one row to update");
                return;
            }

            this._openTaskDialog("update");
        },

        onSaveTask: function () {
            var oFormData = {
                EmployeeName: sap.ui.getCore().byId("empName").getValue(),
                EmployeeID: sap.ui.getCore().byId("empId").getValue(),
                TaskID: sap.ui.getCore().byId("taskId").getValue(),
                TaskName: sap.ui.getCore().byId("taskName").getValue(),
                StartDate: sap.ui.getCore().byId("startDate").getValue(),
                EndDate: sap.ui.getCore().byId("endDate").getValue(),
                HoursWorked: parseInt(sap.ui.getCore().byId("hours").getValue()) || 0
            };

            var sMode = this._taskDialog.getModel("params").getProperty("/mode");

            if (sMode === "create") {
                var Payload = {
                    data: oFormData
                };

                $.ajax({
                    url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                    method: "POST",
                    headers: {
                        name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                        password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(Payload),
                    success: function () {
                        MessageToast.show("Created successfully");
                        this._taskDialog.close();
                        this.onLoad();
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                    }
                });
            } else if (sMode === "update") {
                var oTable = this.byId("taskTable");
                var oSelectedItem = oTable.getSelectedItem();

                if (!oSelectedItem) {
                    MessageToast.show("Please select one row to update");
                    return;
                }

                var oSelectedData = oSelectedItem.getBindingContext("LocalModel").getObject();

                var Payload2 = {
                    data: oFormData,
                    filters: {
                        TaskID: oSelectedData.TaskID
                    }
                };

                $.ajax({
                    url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                    method: "PUT",
                    headers: {
                        name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                        password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(Payload2),
                    success: function () {
                        MessageToast.show("Updated successfully");
                        this._taskDialog.close();
                        this.onLoad();
                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                    }
                });
            }
        },

        onDelete: function () {
            var oTable = this.byId("taskTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Please select one row to delete");
                return;
            }

            var oSelectedData = oSelectedItem.getBindingContext("LocalModel").getObject();

            MessageBox.confirm("Do you want to delete this row?", {
                title: "Confirm Delete",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var Payload3 = {
                            data: {
                                EmployeeName: oSelectedData.EmployeeName,
                                EmployeeID: oSelectedData.EmployeeID,
                                TaskID: oSelectedData.TaskID,
                                TaskName: oSelectedData.TaskName,
                                StartDate: oSelectedData.StartDate,
                                EndDate: oSelectedData.EndDate,
                                HoursWorked: oSelectedData.HoursWorked
                            },
                            filters: {
                                TaskID: oSelectedData.TaskID
                            }
                        };

                        $.ajax({
                            url: "https://rest.kalpavrikshatechnologies.com/AssignedTask",
                            method: "DELETE",
                            headers: {
                                name: "$2a$12$LC.eHGIEwcbEWhpi9gEA.umh8Psgnlva2aGfFlZLuMtPFjrMDwSui",
                                password: "$2a$12$By8zKifvRcfxTbabZJ5ssOsheOLdAxA2p6/pdaNvv1xy1aHucPm0u",
                                "Content-Type": "application/json"
                            },
                            data: JSON.stringify(Payload3),
                            success: function () {
                                MessageToast.show("Deleted successfully");
                                this.onLoad();
                            }.bind(this),
                            error: function (error) {
                                console.log(error);
                            }
                        });
                    }
                }.bind(this)
            });
        },
        onCloseDialog: function () {
            this._taskDialog.close();
        }
    });
});