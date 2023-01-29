import { LightningElement,track,wire,api } from 'lwc';
import fetchActionItems from '@salesforce/apex/ZEC_ActionItemController.fetchActionItems';
import getValues from '@salesforce/apex/ZEC_ActionItemController.getBrdRules';
import getContacts from '@salesforce/apex/ZEC_ActionItemController.getContacts';
import updateActionItemRec from '@salesforce/apex/ZEC_ActionItemController.updateActionItemRec';
import createContact from '@salesforce/apex/ZEC_ActionItemController.createContact';
import createActionItemResp from '@salesforce/apex/ZEC_ActionItemController.createActionItemResp';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class zec_ActionTracker extends LightningElement {
    //records;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedColumn;
    sortedBy;
    error;
	tempRec = [];
	//value = 'all';
	//@api projectId;
	@api projectId ;
    pageSizeOptions = [5, 10, 25, 50, 75, 100]; //Page size options
    records = []; //All records available in the table
    totalRecords = 0; //Total no.of records
    pageSize; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1; //Page number    
    recordsToDisplay = []; //Records to be displayed on the page
	areDetailsVisible = false;
	@track isShowModal = false;
	queryTerm = null;
	assignedToValue=null;
	selectedCategory=null;
	
	@track newAssignee="";
    totalrecordscount = 0;
    pageList =[] ;
    startforShift= 8;
    index = 0;
    clickedPage = 1;
    allowedshiftno=[];
	

	
    connectedCallback(){
		console.log('projectId=> ' +this.projectId);
        this.fetchActionItemsList();
        /*if(this.totalrecordscount && this.pageSize){
            this.totalpages = Math.ceil(Number(this.totalrecordscount)/Number(this.pageSize));
            console.log(this.totalpages);
            let default_list=[];
            if(this.totalpages<=10){
                for(let i=1;i<=this.totalpages;i++){
                    default_list.push(i);
                }
            }
            let pgl_default = this.totalpages >10 ? [1,2,3,4,5,6,7,8,'...',this.totalpages] : default_list;
            this.pageList = pgl_default;
        }*/
    }

    renderedCallback(){
        //this.changeColorOnClick();
    }
	
	createContact(event){
		var firstNameVal = this.template.querySelector('.inputFirstName');
		var lastNameVal = this.template.querySelector('.inputLastName');
		
		
		console.log( 'Current Id ' + this.indxActnId );
			
		if(lastNameVal.value == ''){
			alert('Please enter Last Name'); 
			 
		} else{
			createContact({projectId: this.projectId,firstNameVal: firstNameVal.value,lastNameVal: lastNameVal.value,recordId: this.indxActnId })
				.then((data) =>{
					this.records = data;
					this.totalRecords = data.length; // update total records count                 
					this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
					this.paginationHelper(); // call helper menthod to update pagination logic
					this.isShowModal = false;
					this.isNewContact = false;
					 const evt = new ShowToastEvent({
							title: 'Success!',
							message: 'Record created successfully!!',
							variant: 'success',
						   
						});
						this.dispatchEvent(evt);
				})
				.catch((error)=>{
					this.error = error;
				});
				
			
			
		}
		//alert(firstNameVal.value);
		//alert(lastNameVal.value);
		
		
	}

    /* changeColorOnClick(){
        this.template.querySelectorAll('lightning-button').forEach(e=>{
            if(Number(e.label) === this.clickedPage){
                e.classList.add('currentpage');
                e.blur();
            }else{
                e.classList.remove('currentpage');
            }
        });
    } */
    fetchActionItemsList(){
		
		fetchActionItems({projectId: this.projectId})
            .then((data) =>{
                this.records = data;
                this.totalRecords = data.length; // update total records count                 
				this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
				this.paginationHelper(); // call helper menthod to update pagination logic 
            })
            .catch((error)=>{
                this.error = error;
            });
	}
     
    get totalrecords(){
        return this.totalrecordscount;
    }
    
    set totalrecords(value){
        this.totalrecordscount = value;
        this.connectedCallback();
    }

    get startrange(){
        return (((this.clickedPage-1)*this.pageSize)+1);
    }

    get endrange(){
        return ((this.pageSize*this.clickedPage));
    }
    
    get disableleftarrow(){
        return (this.clickedPage === 1)
    }

    get disablerightarrow(){
        return (this.clickedPage === this.totalpages);
    }

    get rightshift(){
        return Number(this.index)===2;
    }

    get leftshift(){
        return (Number(this.index)===7 || Number(this.index)===8);
    }

    get isStartNoClicked(){
        return (this.clickedPage - 1 === 4 || this.clickedPage<8 );
    }

    get isLastNoClcked (){  
        return (this.totalpages - this.clickedPage >=4 &&  this.totalpages - this.clickedPage <8);
    }

    get isLastPageClicked(){
        let last8array = [];
        for(let i=this.totalpages-6;i<=this.totalpages;i++){
            last8array.push(i);
        }
        console.log(last8array);
        return (last8array.includes(this.clickedPage));
        //return (this.clickedPage === this.totalpages);
    }

    getallowedshiftno(){
        if(this.allowedshiftno){
            if(!this.allowedshiftno.includes(8)){
                this.allowedshiftno.push(8);
            }
            if(!this.allowedshiftno.includes(this.totalpages)){
                this.allowedshiftno.push(this.totalpages);
            }
        }
        console.log('Allowed nos are->');
        console.log(this.allowedshiftno);
    }

    handlePrevious(event){
        console.log('------------------START--------------------');
        this.clickedPage = this.clickedPage-1;
        this.dispatchPaginationevent();
        this.getallowedshiftno();
        if(this.clickedPage !== '...' && this.totalpages >10) this.displayePages(this.clickedPage);
		this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
        console.log('-------------------END--------------------');
    }

    handleNext(event){
        console.log('------------------START--------------------');
        this.clickedPage = this.clickedPage+1;
        this.dispatchPaginationevent();
        this.getallowedshiftno();
        if(this.clickedPage !== '...' && this.totalpages >10) this.displayePages(this.clickedPage);
		this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
        console.log('-------------------END--------------------');
    }
	isNewContact = false;
	indxActnId;
     createNewContact(event){
        console.log('--');
		this.isNewContact = true;
        let indx = event.target.dataset.recordId;
		
		
			let recs =  JSON.parse( JSON.stringify( this.recordsToDisplay ) );
			let actionItemId = recs[ indx ].actionItemObj.Id;
			this.indxActnId = actionItemId;
			console.log( 'Current Id ' + actionItemId );
    } 

    displayePages(clickedPage){
        if(clickedPage === this.startforShift){
            this.pageList[1] = '...';
        }
        
        if(this.allowedshiftno && !this.isStartNoClicked && !this.isLastPageClicked && (this.allowedshiftno.includes(clickedPage) || this.isLastNoClcked)){
            console.log('IN HERE 1');
            this.pageList[2] = clickedPage-3;
            this.pageList[3] = clickedPage-2;
            this.pageList[4] = clickedPage-1;
            this.pageList[5] = clickedPage;
            this.pageList[6] = clickedPage+1;
            this.pageList[7] = clickedPage+2;
            this.pageList[8] = clickedPage+3;
            if(this.isLastNoClcked){
                this.pageList[9] = this.pageList[9] !== '...' ? this.totalpages : '...';
                if(this.pageList[9] && this.pageList[9] === this.totalpages){
                    this.pageList.pop();
                }
            }
            this.allowedshiftno = [];
            this.allowedshiftno.push(this.pageList[2],this.pageList[8]);
        }
        
        if((!this.isLastNoClcked || this.rightshift) && !this.isLastPageClicked && !this.isStartNoClicked){
            console.log('IN HERE 2');
            this.pageList[9] = '...';
            this.pageList[10] = this.totalpages;
        }
        
        if((this.isStartNoClicked && this.allowedshiftno.includes(this.clickedPage)) || this.clickedPage === 1){
            console.log('IN HERE 3');
            this.pageList = this.totalpages <= 8 ? [1,2,3,4,5,6,7,8] : [1,2,3,4,5,6,7,8,'...',this.totalpages];
        }

        if(this.isLastPageClicked && this.allowedshiftno.includes(this.clickedPage)){
            console.log('IN HERE 4');
            this.pageList[1] = '...';
            this.pageList[2] = this.totalpages-7;
            this.pageList[3] = this.totalpages-6;
            this.pageList[4] = this.totalpages-5;
            this.pageList[5] = this.totalpages-4;
            this.pageList[6] = this.totalpages-3;
            this.pageList[7] = this.totalpages-2;
            this.pageList[8] = this.totalpages-1;
            this.pageList[9] = this.totalpages;
            if(this.pageList[10]){
                this.pageList.pop();
            }
            this.allowedshiftno = [];
            this.allowedshiftno.push(this.pageList[2]);
        }
        this.pageList = [...this.pageList];
        console.log('***Final display arra***');
        console.log(this.pageList);
    }

    dispatchPaginationevent(){
        this.dispatchEvent(new CustomEvent('pagination', {
                "detail": this.clickedPage,
                bubbles: true,
                composed: true
            }));
    }










    handleKeyUp(evt) {
		
		this.queryTerm = evt.target.value;
		console.log('this.queryTerm=> '+this.queryTerm);
		if(this.queryTerm == null || this.queryTerm == ''){
			this.recordsToDisplay = this.records;
			this.totalRecords = this.records.length;
			this.paginationHelper();
		}else{
			this.tempRec = this.records
				.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase());
            
			 this.totalRecords = this.tempRec.length; // update total records count                 
			
			this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
			
			if (this.pageNumber <= 1) {
				this.pageNumber = 1;
			} else if (this.pageNumber >= this.totalPages) {
				this.pageNumber = this.totalPages;
			}
			// set records to display on current page 
			this.recordsToDisplay = [];
			for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
				if (i === this.totalRecords) {
					break;
				}
				this.recordsToDisplay.push(this.tempRec[i]);
				
			}			
			
		}
       
    }
	
    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
        this.isNewContact = false;
        this.isNewComment = false;
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
			
			if(this.queryTerm != null && this.queryTerm != ''){
				this.recordsToDisplay.push(this.tempRec[i]);
			}else{
				 this.recordsToDisplay.push(this.records[i]);
			}
           
			
        }
		
    }
	
    /* @wire( fetchActionItems , { searchString: '$queryTerm',assignedToValue: '$assignedToValue',selectedCategory: '$selectedCategory' } )  
    wiredAccount( { error, data } ) {


        if (data) {

            //console.log( 'Fetched Data ' + JSON.stringify( data ) );
            this.records = data;
			this.totalRecords = data.length; // update total records count                 
			this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
			this.paginationHelper(); // call helper menthod to update pagination logic 

        } else if ( error ) {

            this.error = error;
            this.records = undefined;

        }

    } */
	
	@track items = []; 
	@track itemContact = []; 
	get options() {
        return this.itemContact;
    }
	get categoryOptions() {
         return this.items;
    }
	
	 @wire(getValues,{projectId: '$projectId'})
    wiredBrd({ error, data }) {
		
        if (data) {
			this.items = [{value: '' , label: '--None--'}];
            for(let i=0; i<data.length; i++) {
                console.log('id=' + data[i].expr0);
                                                   
                this.items = [...this.items ,{value: data[i].Name , label: data[i].Name}];                                   
            }                
            
        } else if (error) {
            console.log(error);
            
        }
    } 
	 @wire(getContacts,{projectId: '$projectId'})
    wiredContacts({ error, data }) {
		
        if (data) {
			this.itemContact = [{value: '' , label: '--None--'}];
            for(let i=0; i<data.length; i++) {
                console.log('id=' + data[i].Id);
                this.itemContact = [...this.itemContact ,{value: data[i].Id , label: data[i].Name}];                                   
            }                
            
        } else if (error) {
            console.log(error);
            
        }
    } 
	
   /*
   getPickListValues(){
	   getContacts({})
		.then(data => {
               if (data) {
					this.itemContact = [{value: '' , label: '--None--'}];
					for(let i=0; i<data.length; i++) {
						console.log('id=' + data[i].Id);
						this.itemContact = [...this.itemContact ,{value: data[i].Id , label: data[i].Name}];                                   
					}                
					
				} else if (error) {
					console.log(error);
					
				}
           })
           .catch(error => {
               console.log('Error: ', error);
           })
		   
		/* getValues({projectId: this.projectId})
		.then(data => {
               if (data) {
					this.items = [{value: '' , label: '--None--'}];
					for(let i=0; i<data.length; i++) {
						console.log('id=' + data[i].expr0);
														   
						this.items = [...this.items ,{value: data[i].Name , label: data[i].Name}];                                   
					}                
					
				} else if (error) {
					console.log(error);
					
				}
           })
           .catch(error => {
               console.log('Error: ', error);
           }) 
   } */
	
	handleChangeCategory(event) {
        // Get the string of the "value" attribute on the selected option
        this.selectedCategory = event.detail.value;
        //alert('selectedOption=' + selectedOption);
		
		//this.queryTerm = evt.target.value;
		console.log('this.selectedCategory=> '+this.selectedCategory);
		if(this.selectedCategory == null || this.selectedCategory == ''){
			if(this.queryTerm != null && this.queryTerm != ''){
				if(this.assignedToValue != null && this.assignedToValue != ''){
					this.tempRec = this.records
						.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase())
						.filter( r => r.actionItemObj.Contact__c == this.assignedToValue);
				}else{
					this.tempRec = this.records
						.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase())
				}
				this.recordsToDisplay = this.tempRec;
				this.totalRecords = this.tempRec.length;
				this.paginationHelper();
			}else if(this.assignedToValue != null && this.assignedToValue != ''){
				this.tempRec = this.records
					.filter( r => r.actionItemObj.Contact__c == this.assignedToValue);
			}else{
				this.tempRec = this.records;
			}
				
				this.recordsToDisplay = this.tempRec;
				this.totalRecords = this.tempRec.length;
				this.paginationHelper();
			
			
		}else{
			if(this.queryTerm != null && this.queryTerm != ''){
			this.tempRec = this.records
				.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase())
				.filter( r => r.actionItemObj.Action__r.Question_Choice__r.Question__r.BRD_Rule__r.Name == this.selectedCategory);
			}else{
				this.tempRec = this.records
					.filter( r => r.actionItemObj.Action__r.Question_Choice__r.Question__r.BRD_Rule__r.Name == this.selectedCategory);
			}
            
			 this.totalRecords = this.tempRec.length; // update total records count                 
			
			this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
			
			if (this.pageNumber <= 1) {
				this.pageNumber = 1;
			} else if (this.pageNumber >= this.totalPages) {
				this.pageNumber = this.totalPages;
			}
			// set records to display on current page 
			this.recordsToDisplay = [];
			for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
				if (i === this.totalRecords) {
					break;
				}
				this.recordsToDisplay.push(this.tempRec[i]);
				
			}			
			
		}

        
        
        
    }
	handleChange(event) {
        // Get the string of the "value" attribute on the selected option
        this.assignedToValue = event.detail.value;
        console.log('this.assignedToValue=> '+this.assignedToValue);
		if(this.assignedToValue == null || this.assignedToValue == ''){
			if(this.queryTerm != null && this.queryTerm != ''){
				if(this.selectedCategory != null && this.selectedCategory != ''){
					this.tempRec = this.records
						.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase())
						.filter( r => r.actionItemObj.Action__r.Question_Choice__r.Question__r.BRD_Rule__r.Name == this.selectedCategory);
				}else{
					this.tempRec = this.records
						.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase());
				}
			}else if(this.selectedCategory != null && this.selectedCategory != ''){
				this.tempRec = this.records
					.filter( r => r.actionItemObj.Action__r.Question_Choice__r.Question__r.BRD_Rule__r.Name == this.selectedCategory)
			}else{
				this.tempRec = this.records;
			}
			this.recordsToDisplay = this.tempRec;
			this.totalRecords = this.tempRec.length;
			this.paginationHelper();
		}else{
			if(this.queryTerm != null && this.queryTerm != ''){
				if(this.selectedCategory != null && this.selectedCategory != ''){
					this.tempRec = this.records
						.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase())
						.filter( r => r.actionItemObj.Action__r.Question_Choice__r.Question__r.BRD_Rule__r.Name == this.selectedCategory)
						.filter( r => r.actionItemObj.Contact__c == this.assignedToValue);
				}else{
					this.tempRec = this.records
						.filter( r => r.actionItemObj.Name.toLowerCase().includes(this.queryTerm.toLowerCase()) || r.actionItemObj.Criticality__c == this.queryTerm.toUpperCase())
						.filter( r => r.actionItemObj.Contact__c == this.assignedToValue);
				}
			}else if(this.selectedCategory != null && this.selectedCategory != ''){
				this.tempRec = this.records
					.filter( r => r.actionItemObj.Action__r.Question_Choice__r.Question__r.BRD_Rule__r.Name == this.selectedCategory)
					.filter( r => r.actionItemObj.Contact__c == this.assignedToValue);
			}else{
				this.tempRec = this.records
					.filter( r => r.actionItemObj.Contact__c == this.assignedToValue);
			}
            
			 this.totalRecords = this.tempRec.length; // update total records count                 
			
			this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
			
			if (this.pageNumber <= 1) {
				this.pageNumber = 1;
			} else if (this.pageNumber >= this.totalPages) {
				this.pageNumber = this.totalPages;
			}
			// set records to display on current page 
			this.recordsToDisplay = [];
			for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
				if (i === this.totalRecords) {
					break;
				}
				this.recordsToDisplay.push(this.tempRec[i]);
				
			}			
			
		}
        
        
    }
	
	isToggleChecked(event){
		let indx = event.target.dataset.recordId;
		if ( this.recordsToDisplay ) {
			let recs =  JSON.parse( JSON.stringify( this.recordsToDisplay ) );
			let actionItemId = recs[ indx ].actionItemObj.Id;
			let toogleBool = recs[ indx ].toogleBool;
			recs[ indx ].toogleBool = !toogleBool;
			this.recordsToDisplay = recs;
			
        }
		
	}
	
	handleAssigneeChange(event){
		this.newAssignee = event.detail;
	}
	updateActionItem(event){
		let indx = event.target.dataset.recordId;
		
		if ( this.recordsToDisplay ) {
			let recs =  JSON.parse( JSON.stringify( this.recordsToDisplay ) );
			let actionItemId = recs[ indx ].actionItemObj.Id;
			let toogleBool = recs[ indx ].toogleBool;
			console.log( 'Current Id ' + actionItemId );
			console.log( 'newAssignee ' + this.newAssignee);
			
			
			
			updateActionItemRec({recordId: actionItemId, newAssignee: this.newAssignee})
            .then((data) =>{
				console.log(data);
				this.records = data;
				this.totalRecords = data.length; // update total records count                 
				this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
				this.paginationHelper(); // call helper menthod to update pagination logic 
				  
				
				//recs[ indx ].toogleBool = !toogleBool;
				this.newAssignee = "";
				//this.recordsToDisplay = recs;
               
                //this.error = undefined;
            })
            .catch((error)=>{
                console.log('error'+error);
                //this.error = error;
            });
			
		}
	}
    hideAndShow( event ) {

        let indx = event.target.dataset.recordId;
        console.log( 'Index is ' + indx );

        if ( this.recordsToDisplay ) {

            let recs =  JSON.parse( JSON.stringify( this.recordsToDisplay ) );
            let currVal = recs[ indx ].hideBool;
			let isOpen = recs[ indx ].iconClicked;
            console.log( 'Current Val ' + currVal );
            console.log( 'Current isOpen ' + isOpen );
            recs[ indx ].hideBool = !currVal;
			if(isOpen === 'utility:chevrondown'){
				recs[ indx ].iconClicked = 'utility:chevronright';
			}
			if(isOpen === 'utility:chevronright'){
				recs[ indx ].iconClicked = 'utility:chevrondown';
			}
			
            this.recordsToDisplay = recs;
            console.log( 'After Change '+ this.recordsToDisplay[ indx ].hideBool );
            console.log( 'After Change '+ this.recordsToDisplay[ indx ].iconClicked );
        }
		
		 
		
    }
	handleSubmit(event) {
        var e = event.detail.fields;
        this.isShowModal = false;
        this.isNewContact = false;
         const evt = new ShowToastEvent({
                title: 'Success!',
                message: 'Record created successfully!!',
				variant: 'success',
               
            });
            this.dispatchEvent(evt);
    }
	
	
	isNewComment = false;
	
	addCommentsButton(event){
		console.log('--');
		this.isNewComment = true;	
        let indx = event.target.dataset.recordId;
		
		let recs =  JSON.parse( JSON.stringify( this.recordsToDisplay ) );
		let actionItemId = recs[ indx ].actionItemObj.Id;
		this.indxActnId = actionItemId;
		console.log( 'Current Id ' + actionItemId );
		
		
		
		
	}
	addNewComment(event){
		var inputCommentVal = this.template.querySelector('.inputComment');
		
		console.log( 'Current Id ' + this.indxActnId );
			
		if(inputCommentVal.value == ''){
			alert('Please enter comment'); 
			 
		} else{
			createActionItemResp({projectId: this.projectId,inputCommentVal: inputCommentVal.value,recordId: this.indxActnId })
				.then((data) =>{
					this.records = data;
					this.totalRecords = data.length; // update total records count                 
					this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
					this.paginationHelper(); // call helper menthod to update pagination logic
					this.isNewComment = false;
					 const evt = new ShowToastEvent({
							title: 'Success!',
							message: 'Comment added successfully!!',
							variant: 'success',
						   
						});
						this.dispatchEvent(evt);
				})
				.catch((error)=>{
					this.error = error;
				});
				
			
			
		}
		//alert(firstNameVal.value);
		//alert(lastNameVal.value);
	}
    sort(e) {
        if (this.sortedColumn === e.currentTarget.dataset.id) {
            this.sortedDirection = this.sortedDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortedDirection = 'asc';
        }
        var reverse = this.sortedDirection === 'asc' ? 1 : -1;
        let table = JSON.parse(JSON.stringify(this.records));
        console.log('sortTable',table);
        table.sort((a, b) => { return a[e.currentTarget.dataset.id] > b[e.currentTarget.dataset.id] ? 1 * reverse : -1 * reverse });
        this.sortedColumn = e.currentTarget.dataset.id;
        this.recordsToDisplay = table;
        //this.paginationHelper(); // call helper menthod to update pagination logic
    }
}