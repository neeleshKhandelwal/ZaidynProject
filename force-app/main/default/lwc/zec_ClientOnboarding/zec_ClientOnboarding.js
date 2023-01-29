import { LightningElement, api, track, wire } from 'lwc';
import getResults from '@salesforce/apex/ZEC_ClientOnboardingController.getResults';
import getModules from '@salesforce/apex/ZEC_ClientOnboardingController.getModules';
import retrieveAccounts from '@salesforce/apex/ZEC_ClientOnboardingController.retrieveAccounts';
import saveProject from '@salesforce/apex/ZEC_ClientOnboardingController.saveProject';
import deleteProject from '@salesforce/apex/ZEC_ClientOnboardingController.deleteProject';
import updateProject from '@salesforce/apex/ZEC_ClientOnboardingController.updateProject';
import showProject from '@salesforce/apex/ZEC_ClientOnboardingController.showProject';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

const actions = [
    { label: 'Edit details', name: 'show_details' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    { label: 'Project', fieldName: 'prName', wrapText: true, hideDefaultActions: true, sortable: true, type: 'url', typeAttributes: { label: { fieldName: 'projectName' }, target: '_blank' } },
    { label: 'Client', fieldName: 'clientName', wrapText: true, hideDefaultActions: true, sortable: true },
    { label: 'Modules', fieldName: 'modules', wrapText: true, hideDefaultActions: true, sortable: true },
    { label: 'Users', fieldName: 'users', wrapText: true, hideDefaultActions: true, sortable: true,/* cellAttributes: { class: 'slds-badge slds-theme_success'} */ },
    { label: 'Last Modified', fieldName: 'lastModified', wrapText: true, hideDefaultActions: true, sortable: true },
    { label: 'Actions', type: 'button-icon', fixedWidth: 70, typeAttributes: { iconName: 'utility:edit', name: 'edit', variant: 'container' } },
    { label: '', type: 'button-icon', fixedWidth: 40, typeAttributes: { iconName: 'utility:delete', name: 'delete', variant: 'bare-inverse', iconClass: 'slds-icon-text-error' } },

];

export default class Zec_ClientOnboarding extends NavigationMixin(LightningElement) {

    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedColumn;
    sortedBy;

    @track projectId = '';
    objectName = 'User';
    fieldName = 'Name';
    Label;
    @track searchRecords = [];
    @track selectedRecords = []; // contains all the selected users 
    @api required = false;
    @api iconName = 'action:new_account'
    @api LoadingText = false;
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;
    addClient;
    @track newAssignee;
    @api selectedItems = [];

    @track projectName;
    @track competitorBrand;
    @track focusedHco;
    @track focusedHcp;
    @track clientBrand;
    @track fromDateValue;
    //module picklist variables starts//

    options;
    //@api selectedValue;
    @api selectedValues = [];
    @api label;
    @api minChar = 2;
    //@api disabled = false;
    multiSelect = true;
    @track value;
    @track values = [];
    @track optionData;
    @track searchString;
    @track message;
    @track showDropdown = false;

    // module picklist variables ends
    // datatable variables start
    fileRecordId;
    @track data;
    @track error;
    @track columns = columns;
    @track searchString;
    @track initialRecords;
    record = {};

    pageSizeOptions = [5, 10, 25, 50, 75, 100]; //Page size options
    records = []; //All records available in the data table
    totalRecords = 0; //Total no.of records
    pageSize; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1; //Page number    
    recordsToDisplay = []; //Records to be displayed on the page

    // datatable variable ends

    //edit project variables starts//
    editProject = false;
    @track newProjectName = '';

    @wire(retrieveAccounts)
    wiredAccount({ error, data }) {
        if (data) {
            let tempConList = [];

            data.forEach((record) => {
                let tempConRec = Object.assign({}, record);
                tempConRec.prName = '/' + tempConRec.prId;
                tempConList.push(tempConRec);

            });
            console.log(data);
            //this.consData = tempConList;
            this.data = tempConList;
            this.initialRecords = tempConList;
            this.error = undefined;

            this.records = tempConList;
            this.totalRecords = tempConList.length; // update total records count                 
            //this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
            this.pageSize = 50; //set pageSize with default value as first option
            this.paginationHelper(); // call helper menthod to update pagination logic 
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
    navigateToQuestionViewPage(event) {
        // View a custom object record.
        const questionId = event.target.dataset.recordId;
        console.log('event', event.target.dataset);
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: questionId,
                objectApiName: 'Project__c', // objectApiName is optional
                actionName: 'view'
            }
        }).then(url => {
            window.open(url, "_blank");
        });
    }
    navigateToUserViewPage(event) {
        // View a custom object record.
        const userId = event.target.dataset.recordId;
        console.log('event', event.target.dataset.recordId);
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: userId,
                objectApiName: 'User', // objectApiName is optional
                actionName: 'view'
            }
        }).then(url => {
            window.open(url, "_blank");
        });
    }
    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }
    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }
    // JS function to handel pagination logic 
    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.records[i]);
        }
    }
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }
    sort(e) {
        if (this.sortedColumn === e.currentTarget.dataset.id) {
            this.sortedDirection = this.sortedDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortedDirection = 'asc';
        }
        var reverse = this.sortedDirection === 'asc' ? 1 : -1;
        let table = JSON.parse(JSON.stringify(this.recordsToDisplay));
        table.sort((a, b) => { return a[e.currentTarget.dataset.id] > b[e.currentTarget.dataset.id] ? 1 * reverse : -1 * reverse });
        this.sortedColumn = e.currentTarget.dataset.id;
        this.recordsToDisplay = table;
    }
    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.recordsToDisplay];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.recordsToDisplay = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    handleAccountSearch(event) {
        const searchKey = event.target.value.toLowerCase();

        if (searchKey) {
            this.data = this.initialRecords;

            if (this.data) {
                let searchRecords = [];

                for (let record of this.data) {
                    let valuesArray = Object.values(record);

                    for (let val of valuesArray) {
                        console.log('val is ' + val);
                        let strVal = String(val);

                        if (strVal) {

                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }

                console.log('Matched Accounts are ' + JSON.stringify(searchRecords));
                this.recordsToDisplay = searchRecords;
            }
        } else {
            this.recordsToDisplay = this.initialRecords;
        }
    }
    handleFromDate(event) {
        
        var startDate = new Date("2022-08-04");
        var endDate = event.target.value;
        this.fromDateValue = `${event.target.value}T00:00:00.000Z`;


        
    }
    handleToDate(event) {
        
        var endDate = `${event.target.value}T00:00:00.000Z`;
        var startdate = this.fromDateValue;
        let allDateValues = [];
        let allUpdatedDateValues = [];
        if (endDate) {

            let resultProductData = this.initialRecords.filter(item => item.lastModifiedDate >= `${this.fromDateValue}T00:00:00.000Z` &&
                item.lastModifiedDate <= `${event.target.value}T00:00:00.000Z`);


            console.log(resultProductData);
            //till here
            this.recordsToDisplay = resultProductData;
        } else {
            this.recordsToDisplay = this.initialRecords;
        }
    }
    deleteRowHandle(event) {
        console.log('editRow=' + event.target.dataset.recordId);
        deleteProject({ projectId: event.target.dataset.recordId })
            .then(data => {
                if (data) {
                    let tempConList = [];

                    data.forEach((record) => {
                        let tempConRec = Object.assign({}, record);
                        tempConRec.prName = '/' + tempConRec.prId;
                        tempConList.push(tempConRec);

                    });
                    console.log(data);
                    //this.consData = tempConList;
                    this.data = tempConList;
                    this.initialRecords = tempConList;
                    this.error = undefined;

                    this.records = tempConList;
                    this.totalRecords = tempConList.length; // update total records count                 
                    //this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                    this.pageSize = 50; //set pageSize with default value as first option
                    this.paginationHelper(); // call helper menthod to update pagination logic 
                } else if (error) {
                    this.error = error;
                    this.data = undefined;
                }
                const evt = new ShowToastEvent({
                    title: 'Success!',
                    message: 'Project deleted successfully!!',
                    variant: 'success',

                });
                this.dispatchEvent(evt);
            })
            .catch(error => {
                console.log('-------error-------------' + error);
                console.log(error);
            });
    }
    editRowHandle(event) {
        console.log('editRow=' + event.target.dataset.recordId);
        this.projectId = event.target.dataset.recordId;
        getModules()
            .then((data) => {
                try {
                    //this.l_All_Types = data; 
                    let option = [];

                    for (var key in data) {
                        // Here key will have index of list of records starting from 0,1,2,....
                        option.push({ label: data[key].Name, value: data[key].Id });

                        // Here Name and Id are fields from sObject list.
                    }

                    this.options = option;
                    //alert(this.options); 
                } catch (error) {
                    console.error('check error here', error);
                }
            })
            .catch((error) => {
                this.error = error;
            });
        showProject({ projectId: event.target.dataset.recordId })
            .then(result => {
                this.newProjectName = result[0].Name;
                //console.log('result',result[0].Project_Module__r);
                let data = result[0].Project_Module__r;
                let dataUserList = result[0].Project_User__r;
                this.editProject = true;
                let selectedValues = [];
                let selectedOption = [];
                let selectedUserValues = [];
                let selectedUserOption = [];
                var count = 0;
                let newsObject;
                for (var key in data) {

                    selectedOption.push({ label: data[key].Module__r.Name, value: data[key].Id });
                    selectedValues.push(data[key].Module__c);

                }
                for (var key in dataUserList) {

                    selectedUserOption.push({ 'recName': dataUserList[key].User__r.Name, 'recId': dataUserList[key].User__c });
                    selectedUserValues.push(dataUserList[key].User__c);
                    console.log('selectedUserOption', selectedUserOption);
                    //newsObject = { 'recId' : recId ,'recName' : selectName };

                }

                this.selectedRecords = [...selectedUserOption];
                for (let i = 0; i < this.selectedRecords.length; i++) {
                    console.log('print', this.selectedRecords[i].recId);
                    console.log('printname', this.selectedRecords[i].recName);

                }
                //this.optionData = selectedOption; // gets the already present list modules

                var optionData = this.options; /* ? (JSON.parse(JSON.stringify(this.options))) : null; */
                //var value = this.selectedValue ? (JSON.parse(JSON.stringify(this.selectedValue))) : null;
                var values = selectedOption ? (JSON.parse(JSON.stringify(selectedOption))) : null;
                var options = this.optionData;
                //console.log('#values$%',values);

                for (var j = 0; j < optionData.length; j++) {
                    //console.log('inside ',optionData[j].value)
                    if (selectedValues.includes(optionData[j].value)) {
                        optionData[j].selected = true;
                        count++;
                    }

                }
                console.log(optionData);
                console.log('TEST', selectedValues);
                this.searchString = count + ' Option(s) Selected';

                this.optionData = optionData;
                this.values = selectedValues;
                if (this.multiSelect) {
                    this.searchString = count + ' Option(s) Selected';
                }
            })
            .catch(error => {
                console.log('error', error);

            })
        this.editProject = false;
    }
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                this.deleteRow(row);
                break;
            case 'edit':
                this.showRowDetails(row);
                break;
            default:
        }
        /* let fileList  = this.uploadedFile;
        console.log('actionName',actionName)
        console.log('row',row);
        if(actionName == 'download'){
            for(let i =0 ; i<fileList.length;i++){
                if(fileList[i].answer == row.answer){
                    console.log(fileList[i].contentdocid);
                    let url = '/sfc/servlet.shepherd/document/download/'+fileList[i].contentdocid;
                    window.open(url);
                }
            }
        }
        if(actionName == 'delete'){
            for(let i =0 ; i<fileList.length;i++){
                if(fileList[i].answer == row.answer){
                    console.log(fileList[i].contentdocid);
                    this.deleteContentDoc(fileList[i].contentdocid)
                }
            }
        } */
    }
    showRowDetails(row) {
        this.record = row;
        getModules()
            .then((data) => {
                try {
                    //this.l_All_Types = data; 
                    let option = [];

                    for (var key in data) {
                        // Here key will have index of list of records starting from 0,1,2,....
                        option.push({ label: data[key].Name, value: data[key].Id });

                        // Here Name and Id are fields from sObject list.
                    }

                    this.options = option;
                    //alert(this.options); 
                } catch (error) {
                    console.error('check error here', error);
                }
            })
            .catch((error) => {
                this.error = error;
            });

        this.showDropdown = false;
        var optionData = this.options; /* ? (JSON.parse(JSON.stringify(this.options))) : null; */
        console.log('optionData!@#$', optionData);
        //var value = this.selectedValue ? (JSON.parse(JSON.stringify(this.selectedValue))) : null;
        var values = this.selectedValues ? (JSON.parse(JSON.stringify(this.selectedValues))) : null;
        if (optionData) {
            var searchString;
            var count = 0;
            for (var i = 0; i < optionData.length; i++) {
                if (this.multiSelect) {
                    if (values.includes(optionData[i].value)) {
                        optionData[i].selected = true;
                        count++;
                    }
                } else {
                    if (optionData[i].value == value) {
                        searchString = optionData[i].label;
                    }
                }
            }
            if (this.multiSelect)
                this.searchString = count + ' Option(s) Selected';
            else
                this.searchString = searchString;
        }
        //this.value = value;
        this.values = values;
        this.optionData = optionData;


        //alert(JSON.stringify(this.record.projectName));
        //alert(JSON.stringify(this.record.prName));
        //alert(JSON.stringify(this.record.modules));
        this.editProject = true;
        this.newProjectName = this.record.projectName;

    }
	
    addNewComment() {
        //alert('projectName'+this.newProjectName);
        //alert('Modules'+JSON.stringify(this.values));
        //alert('Modules'+this.values);
        //alert('users'+JSON.stringify(this.selectedRecords));

		let userList = JSON.stringify(this.selectedRecords);
        //alert(this.record.prName);
        //var s1 = this.record.prName;
        //s1 = s1.substring(1);
        //alert(s1); // shows "oobar"
        updateProject({ projectName: this.newProjectName, modules: this.values, users: userList, projectId: this.projectId })
            .then(data => {
				 if (data) {
                    let tempConList = [];

                    data.forEach((record) => {
                        let tempConRec = Object.assign({}, record);
                        tempConRec.prName = '/' + tempConRec.prId;
                        tempConList.push(tempConRec);

                    });
                    console.log(data);
                    //this.consData = tempConList;
                    this.data = tempConList;
                    this.initialRecords = tempConList;
                    this.error = undefined;

                    this.records = tempConList;
                    this.totalRecords = tempConList.length; // update total records count                 
                    //this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                    this.pageSize = 50; //set pageSize with default value as first option
                    this.paginationHelper(); // call helper menthod to update pagination logic 
                } else if (error) {
                    this.error = error;
                    this.data = undefined;
                }
                //console.log('result',result);
                this.template.querySelectorAll('lightning-input').forEach(each => {
                    each.value = '';
                });
                this.newProjectName = '';
                this.values = '';
                this.selectedRecords = '';
                this.optionData = '';
                //this.selectedValues = '';
                const evt = new ShowToastEvent({
                    title: 'Success!',
                    message: 'Project updated successfully!!',
                    variant: 'success',

                });
                this.dispatchEvent(evt);

            })
            .catch(error => {
                console.log('error', error);

            })
        this.editProject = false;
    }

    hideModalBox() {
        this.editProject = false;
        getModules()
            .then((data) => {
                try {
                    //this.l_All_Types = data; 
                    let option = [];

                    for (var key in data) {
                        // Here key will have index of list of records starting from 0,1,2,....
                        option.push({ label: data[key].Name, value: data[key].Id });

                        // Here Name and Id are fields from sObject list.
                    }

                    this.options = option;
                    //alert(this.options); 
                } catch (error) {
                    console.error('check error here', error);
                }
            })
            .catch((error) => {
                this.error = error;
            });

        this.showDropdown = false;
        var optionData = this.options; /* ? (JSON.parse(JSON.stringify(this.options))) : null; */
        console.log('optionData!@#$', optionData);
        //var value = this.selectedValue ? (JSON.parse(JSON.stringify(this.selectedValue))) : null;
        var values = this.selectedValues ? (JSON.parse(JSON.stringify(this.selectedValues))) : null;
        if (optionData) {
            var searchString;
            var count = 0;
            for (var i = 0; i < optionData.length; i++) {
                if (this.multiSelect) {
                    if (values.includes(optionData[i].value)) {
                        optionData[i].selected = true;
                        count++;
                    }
                } else {
                    if (optionData[i].value == value) {
                        searchString = optionData[i].label;
                    }
                }
            }
            if (this.multiSelect)
                this.searchString = count + ' Option(s) Selected';
            else
                this.searchString = searchString;
        }
        //this.value = value;
        this.values = values;
        this.optionData = optionData;

    }
    @wire(getModules, {})
    WiredgetModules({ error, data }) {

        if (data) {
            try {
                //this.l_All_Types = data; 
                let option = [];

                for (var key in data) {
                    // Here key will have index of list of records starting from 0,1,2,....
                    option.push({ label: data[key].Name, value: data[key].Id });

                    // Here Name and Id are fields from sObject list.
                }
                this.options = option;

            } catch (error) {
                console.error('check error here', error);
            }
        } else if (error) {
            console.error('check error here', error);
        }

    }
    handleProjectChange(event) {
        this.projectName = event.target.value;
    }
    handleAddClient(event) {
        this.addClient = !this.addClient;
        //alert(JSON.stringify(this.newAssignee));

        getModules()
            .then((data) => {
                try {
                    //this.l_All_Types = data; 
                    let option = [];

                    for (var key in data) {
                        // Here key will have index of list of records starting from 0,1,2,....
                        option.push({ label: data[key].Name, value: data[key].Id });

                        // Here Name and Id are fields from sObject list.
                    }

                    this.options = option;
                    //alert(this.options); 
                } catch (error) {
                    console.error('check error here', error);
                }
            })
            .catch((error) => {
                this.error = error;
            });

        this.showDropdown = false;
        var optionData = this.options; /* ? (JSON.parse(JSON.stringify(this.options))) : null; */
        console.log('optionData!@#$', optionData);
        //var value = this.selectedValue ? (JSON.parse(JSON.stringify(this.selectedValue))) : null;
        var values = this.selectedValues ? (JSON.parse(JSON.stringify(this.selectedValues))) : null;
        if (optionData) {
            var searchString;
            var count = 0;
            for (var i = 0; i < optionData.length; i++) {
                if (this.multiSelect) {
                    if (values.includes(optionData[i].value)) {
                        optionData[i].selected = true;
                        count++;
                    }
                } else {
                    if (optionData[i].value == value) {
                        searchString = optionData[i].label;
                    }
                }
            }
            if (this.multiSelect)
                this.searchString = count + ' Option(s) Selected';
            else
                this.searchString = searchString;
        }
        //this.value = value;
        this.values = values;
        this.optionData = optionData;
    }
    handleAssigneeChange(event) {
        this.newAssignee = event.detail;
    }
    handleNewProjChange(event) {
        this.newProjectName = event.target.value;
    }
    handleCompetitorChange(event) {
        this.competitorBrand = event.target.value;
    }
    handleHcoChange(event) {
        this.focusedHco = event.target.value;
    }
    handleHcpChange(event) {
        this.focusedHcp = event.target.value;
    }
    handleClientBrandChange(event) {
        this.clientBrand = event.target.value;
    }

    searchField(event) {

        var currentText = event.target.value;
        var selectRecId = [];
        for (let i = 0; i < this.selectedRecords.length; i++) {
            selectRecId.push(this.selectedRecords[i].recId);
        }
        this.LoadingText = true;
        getResults({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText, selectedRecId: selectRecId })
            .then(result => {
                this.searchRecords = result;
                this.LoadingText = false;

                this.txtclassname = result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
                if (currentText.length > 0 && result.length == 0) {
                    this.messageFlag = true;
                }
                else {
                    this.messageFlag = false;
                }

                if (this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false;
                    this.clearIconFlag = true;
                }
                else {
                    this.iconFlag = true;
                    this.clearIconFlag = false;
                }
            })
            .catch(error => {
                console.log('-------error-------------' + error);
                console.log(error);
            });

    }

    setSelectedRecord(event) {
        var recId = event.currentTarget.dataset.id;
        var selectName = event.currentTarget.dataset.name;
        let newsObject = { 'recId': recId, 'recName': selectName };
        this.selectedRecords.push(newsObject);
        this.txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        let selRecords = this.selectedRecords;
        /*this.template.querySelectorAll('lightning-input').forEach(each => {
            each.value = '';
        });
         const selectedEvent = new CustomEvent('selected', { detail: {selRecords}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent); */
    }

    removeRecord(event) {
        let selectRecId = [];
        for (let i = 0; i < this.selectedRecords.length; i++) {
            if (event.detail.name !== this.selectedRecords[i].recId)
                selectRecId.push(this.selectedRecords[i]);
        }
        this.selectedRecords = [...selectRecId];
        let selRecords = this.selectedRecords;
        /* const selectedEvent = new CustomEvent('selected', { detail: {selRecords}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent); */
    }

    // module multi-select picklist logic starts//



    filterOptions(event) {
        this.searchString = event.target.value;
        if (this.searchString && this.searchString.length > 0) {
            this.message = '';
            if (this.searchString.length >= this.minChar) {
                var flag = true;
                for (var i = 0; i < this.optionData.length; i++) {
                    if (this.optionData[i].label.toLowerCase().trim().startsWith(this.searchString.toLowerCase().trim())) {
                        this.optionData[i].isVisible = true;
                        flag = false;
                    } else {
                        this.optionData[i].isVisible = false;
                    }
                }
                if (flag) {
                    this.message = "No results found for '" + this.searchString + "'";
                }
            }
            this.showDropdown = true;
        } else {
            this.showDropdown = false;
        }
    }

    selectItem(event) {
        var selectedVal = event.currentTarget.dataset.id;
        if (selectedVal) {
            var count = 0;
            var options = JSON.parse(JSON.stringify(this.optionData));
            for (var i = 0; i < options.length; i++) {
                if (options[i].value === selectedVal) {
                    if (this.multiSelect) {
                        if (this.values.includes(options[i].value)) {
                            this.values.splice(this.values.indexOf(options[i].value), 1);
                        } else {
                            this.values.push(options[i].value);
                        }
                        options[i].selected = options[i].selected ? false : true;
                    } else {
                        this.value = options[i].value;
                        this.searchString = options[i].label;
                    }
                }
                if (options[i].selected) {
                    count++;
                }
            }
            this.optionData = options;
            if (this.multiSelect)
                this.searchString = count + ' Option(s) Selected';
            if (this.multiSelect)
                event.preventDefault();
            else
                this.showDropdown = false;
        }
    }

    showOptions() {
        if (this.options) {
            this.message = '';
            this.searchString = '';
            var options = JSON.parse(JSON.stringify(this.optionData));
            for (var i = 0; i < options.length; i++) {
                options[i].isVisible = true;
            }
            if (options.length > 0) {
                this.showDropdown = true;
            }
            this.optionData = options;
        }
    }

    removePill(event) {
        var value = event.currentTarget.name;
        var count = 0;
        var options = JSON.parse(JSON.stringify(this.optionData));
        for (var i = 0; i < options.length; i++) {
            if (options[i].value === value) {
                options[i].selected = false;
                this.values.splice(this.values.indexOf(options[i].value), 1);
            }
            if (options[i].selected) {
                count++;
            }
        }
        this.optionData = options;
        if (this.multiSelect)
            this.searchString = count + ' Option(s) Selected';
    }

    blurEvent() {
        var previousLabel;
        var count = 0;
        for (var i = 0; i < this.optionData.length; i++) {
            if (this.optionData[i].value === this.value) {
                previousLabel = this.optionData[i].label;
            }
            if (this.optionData[i].selected) {
                count++;
            }
        }
        if (this.multiSelect)
            this.searchString = count + ' Option(s) Selected';
        else
            this.searchString = previousLabel;

        this.showDropdown = false;

        /* this.dispatchEvent(new CustomEvent('select', {
            detail: {
                'payloadType' : 'multi-select',
                'payload' : {
                    'value' : this.value,
                    'values' : this.values
                }
            }
        })); */
    }
    // module multi-select picklist logic end//

    handleSave(event) {
        if (this.fileRecordId != undefined && this.fileRecordId != null && this.fileRecordId != '') {
            if (this.projectName != undefined && this.projectName != null && this.projectName != '') {
                //alert('ClientId-> '+this.newAssignee);
                //alert('projectname-> '+this.projectName);
                //alert('Modules-> '+this.values);
                //alert('Users-> '+this.selectedRecords);
                //alert('JSON.parse(JSON.stringify(this.optionData))'+JSON.stringify(this.selectedRecords));
                var userList = JSON.stringify(this.selectedRecords);
                //alert('competitorBrand-> '+this.competitorBrand);
                //alert('focusedHco-> '+this.focusedHco);
                //alert('focusedHcp-> '+this.focusedHcp);
                // alert('clientBrand-> '+this.clientBrand);
                // alert('fileRecordId-> '+this.fileRecordId);
                saveProject({
                    clientId: this.newAssignee, projectName: this.projectName, modules: this.values, users: userList,
                    competitorBrand: this.competitorBrand, focusedHco: this.focusedHco, focusedHcp: this.focusedHcp,
                    clientBrand: this.clientBrand, fileRecordId: this.fileRecordId
                })
                    .then(data => {
                        if (data) {
                            let tempConList = [];
        
                            data.forEach((record) => {
                                let tempConRec = Object.assign({}, record);
                                tempConRec.prName = '/' + tempConRec.prId;
                                tempConList.push(tempConRec);
        
                            });
                            console.log(data);
                            //this.consData = tempConList;
                            this.data = tempConList;
                            this.initialRecords = tempConList;
                            this.error = undefined;
        
                            this.records = tempConList;
                            this.totalRecords = tempConList.length; // update total records count                 
                            //this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                            this.pageSize = 50; //set pageSize with default value as first option
                            this.paginationHelper(); // call helper menthod to update pagination logic 
                        } else if (error) {
                            this.error = error;
                            this.data = undefined;
                        }
                        //console.log('result',result);
                        this.template.querySelectorAll('lightning-input').forEach(each => {
                            each.value = '';
                        });
                        this.newAssignee = '';
                        this.fileRecordId = '';
                        this.projectName = '';
                        this.optionData = '';
                        const evt = new ShowToastEvent({
                            title: 'Success!',
                            message: 'Project added successfully!!',
                            variant: 'success',

                        });
                        this.dispatchEvent(evt);

                    })
                    .catch(error => {
                        console.log('error', error);

                    })
            } else {
                alert('Please provide Project Name');
            }

        } else if (this.newAssignee != undefined && this.newAssignee != null && this.newAssignee != '') {
            alert('Please upload logo');
        } else {
            alert('Please select the client');
        }


    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        console.log('fileName', uploadedFiles[0].name);
        console.log('fileContntID', uploadedFiles[0].documentId);
        this.fileRecordId = uploadedFiles[0].documentId;
    }
    get acceptedFormats() {
        return ['.jgp', '.jpeg', '.png'];
    }
    get isClientSelected() {
        if (this.newAssignee != undefined && this.newAssignee != null && this.newAssignee != '') {
            return true;
        }
        return false;
    }
}