({
    doInit : function(component, event, helper) {
    
    },
    handleHome: function (component, event, helper) {
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                pageName: "home"
            }
        };
        navService.navigate(pageReference);
    },
    handleLogout: function (component, event, helper) {
        $A.get("e.force:logout").fire();
    },
    handleAlerts: function (component, event, helper) {
        event.preventDefault(); 
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                pageName: "alerts"
            }
        };
        navService.navigate(pageReference);
    },
    handleGeneration: function (component, event, helper) {
        event.preventDefault(); 
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                pageName: "generation"
            }
        };
        navService.navigate(pageReference);
    },
    handleSettings: function (component, event, helper) {
        event.preventDefault(); 
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                pageName: "settings"
            }
        };
        navService.navigate(pageReference);
    },
    handleRefinement: function (component, event, helper) {
        event.preventDefault(); 
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                pageName: "refinement"
            }
        };
        navService.navigate(pageReference);
    },
    handleMessage: function (component, event, helper) {
        //slds-incoming-notification slds-show-notification
        //
        // Read the message argument to get the values in the message payload
        if (event != null && event.getParams() != null) {
            let params = event.getParams();
            console.log(JSON.stringify(params, null, "\t"));
            let alertsCount = component.get("v.alertsCount");
            alertsCount = alertsCount + 1;
            component.set("v.alertsCount", alertsCount);
            //cmp.set("v.recordValue", JSON.stringify(params, null, "\t"));
        }
    }
})