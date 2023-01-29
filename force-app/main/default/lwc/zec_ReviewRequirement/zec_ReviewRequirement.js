import { LightningElement,track,wire,api } from 'lwc';
import getRecords from '@salesforce/apex/ZEC_ReviewRequirementController.getRecords';
import getCategoryNames from '@salesforce/apex/ZEC_ReviewRequirementController.getCategoryNames';
import { NavigationMixin } from 'lightning/navigation';

export default class zec_ReviewRequirement extends NavigationMixin(LightningElement) {
	//records;
    error;
	// @api projectId;
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
	selectedCategory=null;
    categorySortAsc = false;

    totalRecordsCount = 0;
    pageList =[] ;
    startforShift= 8;
    index = 0;
    clickedPage = 1;
    allowedshiftno=[];


    connectedCallback(){
        this.getRecordList();
    }

    navigateToQuestionViewPage(event) {
    // View a custom object record.
        const questionId = event.target.dataset.recordId;
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: questionId,
                objectApiName: 'Question__c', // objectApiName is optional
                actionName: 'view'
            }
        }).then(url => {
            window.open(url, "_blank");
        });
    }

    @wire(getCategoryNames,{projectId: '$projectId'})
    wiredCategoryNames({ error, data }) {
        if (data) {
            this.items = [{value: '' , label: '--None--'}];
            for(let i=0; i<data.length; i++) {
                this.items = [...this.items ,{value: data[i].Name , label: data[i].Name}];
            }
        } else if (error) {
            console.log(error);
        }
    }

    getRecordList() {
        getRecords({projectId: this.projectId})
            .then((data) => {
                this.records = data;
                this.totalRecords = this.records.length; // update total records count
                this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
                this.paginationHelper(); // call helper menthod to update pagination logic
            })
            .catch((error)=>{
                console.debug(error);
                this.error = error;
            });
    }

    renderedCallback(){
        this.changeColorOnClick();
    }

    changeColorOnClick(){
        this.template.querySelectorAll('lightning-button').forEach(e=>{
            if(Number(e.label) === this.clickedPage){
                e.classList.add('currentpage');
                e.blur();
            }else{
                e.classList.remove('currentpage');
            }
        });
    }

    get totalRecords(){
        return this.totalRecordsCount;
    }

    set totalRecords(value){
        this.totalRecordsCount = value;
        this.connectedCallback();
    }

    get startRange(){
        console.log(this.totalRecordsCount);
        //return this.totalRecordsCount > 0 ? (((this.clickedPage-1)*this.pageSize)+1): 0;
        return (((this.clickedPage-1)*this.pageSize)+1);
    }

    get endRange(){
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
				.filter( r => r.record.categoryName.toLowerCase().includes(this.queryTerm.toLowerCase()));

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
            this.recordsToDisplay.push(this.records[i]);

        }

        console.log(this.recordsToDisplay);

    }

	@track items = [];
	get categoryOptions() {
         return this.items;
    }

	handleChangeCategory(event) {
        // Get the string of the "value" attribute on the selected option
        this.selectedCategory = event.detail.value;

        if(this.selectedCategory == null || this.selectedCategory == ''){
			if(this.queryTerm != null && this.queryTerm != ''){
					this.tempRec = this.records
						.filter( r => r.record.categoryName.toLowerCase().includes(this.queryTerm.toLowerCase()))
				this.recordsToDisplay = this.tempRec;
				this.totalRecords = this.tempRec.length;
				this.paginationHelper();
			}else{
				this.tempRec = this.records;
				this.recordsToDisplay = this.tempRec;
				this.totalRecords = this.tempRec.length;
				this.paginationHelper();

            }
		} else {
			if(this.queryTerm != null && this.queryTerm != ''){
			this.tempRec = this.records
				.filter( r => r.record.categoryName.toLowerCase().includes(this.queryTerm.toLowerCase()))
				.filter( r => r.record.categoryName == this.selectedCategory);
			}else{
				this.tempRec = this.records
					.filter( r => r.record.categoryName == this.selectedCategory);

                console.log("temp", this.tempRec);
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

    handleCategorySort() {
        try {
            console.log("Handle category sort");
            const temp = [...this.records];
            if (!!temp && temp.length > 1) {
                if (!this.categorySortAsc) {
                    temp.sort((a, b) => {
                        return (a.record.categoryName > b.record.categoryName) ? 1 : ((b.record.categoryName > a.record.categoryName) ? -1 : 0);

                    });
                } else {
                    temp.sort((a, b) => {
                        return (a.record.categoryName < b.record.categoryName) ? 1 : ((b.record.categoryName < a.record.categoryName) ? -1 : 0);
                    });
                }
                this.categorySortAsc = !this.categorySortAsc;
                this.records = temp;
                console.log("records", this.records);
                this.paginationHelper(); // call helper menthod to update pagination logic
            }
        } catch(e) {
            console.debug(e);
            this.error = e;
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

}