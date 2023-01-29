import { LightningElement,track,wire } from 'lwc';
import getQuestionMaster from '@salesforce/apex/ZEC_QuestionBankController.getQuestionMaster';
import getModules from '@salesforce/apex/ZEC_QuestionBankController.getModules';
import getScreens from '@salesforce/apex/ZEC_QuestionBankController.getScreens';
import saveQuestion from '@salesforce/apex/ZEC_QuestionBankController.saveQuestion';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Question_Master_OBJECT from '@salesforce/schema/Question_Master__c';
import Question_Type_FIELD from '@salesforce/schema/Question_Master__c.Question_Type__c';

export default class Zec_QuestionBank extends LightningElement {
    @track moduleList = []; //this will hold key, value pair
    @track screenList = []; //this will hold key, value pair
    @track selectedModule = ''; //initialize combo box value
    @track chosenValue = '';
	error;
	@track isQuestionBankTable = true;
	@track isAddQuestion = false;
	@track isAddQuestionWithOptions = false;
    isShowGP = false;
	@track selectedQuestionModule = '';
	@track questionLabel= '';
	records = []; //All records available in the table
	optionItems = [];
	info = JSON.stringify(this.items);
	isAddOptionClicked = false;
	checkBoxFieldValue = false;
    connectedCallback(){
		this.fetchQuestionMasterList();
    }
	
	@wire(getObjectInfo, { objectApiName: Question_Master_OBJECT })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Question_Type_FIELD})
    TypePicklistValues;
	
    @wire(getModules,{})
    wiredBrd({ error, data }) {
		
        if (data) {
			this.moduleList = [{value: '' , label: '--None--'}];
            for(let i=0; i<data.length; i++) {     
                this.moduleList = [...this.moduleList ,{value: data[i].Id , label: data[i].Name}];                                   
            }                
            
        } else if (error) {
            console.log(error);
            
        }
    }
	 @wire(getScreens,{})
    wiredscr({ error, data }) {
		
        if (data) {
			this.screenList = [{value: '' , label: '--None--'}];
            for(let i=0; i<data.length; i++) {     
                this.screenList = [...this.screenList ,{value: data[i].Id , label: data[i].Name}];                                   
            }                
            
        } else if (error) {
            console.log(error);
            
        }
    }
	fetchQuestionMasterList(){
		
		getQuestionMaster()
            .then((data) =>{
                this.records = data;
                //this.totalRecords = data.length; // update total records count                 
				//this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
				//this.paginationHelper(); // call helper menthod to update pagination logic 
            })
            .catch((error)=>{
                this.error = error;
            });
	}
	get categoryOptions() {
		return this.moduleList;
	}
	get screenOptions() {
		return this.screenList;
	}

	handleChangeCategory(event) {
	 // Get the string of the "value" attribute on the selected option
		let selectedOption = event.detail.value;
		console.log('selected value=' + selectedOption);
	}
	handleQuestionCategory(event) {
	 // Get the string of the "value" attribute on the selected option
		let selectedOption = event.detail.value;
		console.log('selected value=' + selectedOption);
		this.selectedQuestionModule = selectedOption;
	}

	handleAddQuestion(){
		this.isAddQuestion = true;
		this.isQuestionBankTable = false;
		this.questionLabel = '';
		this.selectedQuestionModule = '';
	}
	hideModalBox(){
		this.isAddQuestion = false;
		this.isQuestionBankTable = true;
		this.questionLabel = '';
		this.selectedQuestionModule = '';
	}
	handleQuestionLabel(event){
		let selectedOption = event.detail.value;
        this.questionLabel = selectedOption;
	}
	createQuestion(){
		//let QuestionVal = this.template.querySelector('.inputQuestionLabel');
		console.log('QuestionLabel ',this.questionLabel);
		console.log('selectedQuestionModule ',this.selectedQuestionModule);
		let questionName = this.questionLabel.substring(0, 79);
		console.log('questionName ',questionName);
		saveQuestion({
                    questionLabel: this.questionLabel, module: this.selectedQuestionModule, questionName: questionName})
                    .then(() => {
                        
							this.questionLabel = '';
							this.selectedQuestionModule = '';
							
							const evt = new ShowToastEvent({
								title: 'Success!',
								message: 'Question added successfully!!',
								variant: 'success',

							});
							this.dispatchEvent(evt);
							this.isAddQuestion = false;
                    })
                    .catch(error => {
                        console.log('error ', error);

                    })
		
		
	}
	handleSaveAndNext(){
		this.isAddQuestionWithOptions = true;
		this.isQuestionBankTable = false;
		this.isAddQuestion = false;
	}
	hideAddQuestionOptions(){
		this.isAddQuestionWithOptions = false;
		this.isAddQuestion = true;
	}
	handleSelectionTypeChange(event){
		let selectedOption = event.detail.value;
		console.log(selectedOption);
        //this.SelectionType = selectedOption;
	}
    showGP(){
        this.isShowGP =  true;
    }
	 handleCheckBoxChange(event){
        this.checkBoxFieldValue = event.target.checked;
		console.log('=> ',this.optionItems)
		this.optionItems[event.currentTarget.dataset.id][event.target.name] = event.target.checked;
		
    }
	HandleAddOption(event) {
		//let isChecked = false;
		this.optionItems[event.currentTarget.dataset.id][event.target.name] = event.target.value;
		//console.log('=> ',this.optionItems[event.currentTarget.dataset.id][event.target.name])
		/* if(this.optionItems[event.currentTarget.dataset.id][event.target.name] == 'inputCheckbox'){
			this.optionItems[event.currentTarget.dataset.id][event.target.name] = 'true';
			//this.isChecked = !isChecked;
		}else{
			this.optionItems[event.currentTarget.dataset.id][event.target.name] = 'false';
		} */
		this.info = JSON.stringify(this.optionItems);
		this.isAddOptionClicked = true;
	}
	handleCreateOption() {
		this.optionItems = [...this.optionItems, { id: this.optionItems.length, optionLabel: '', optionDescription: '', optionNextStep: '',optionDetailToCapture: '',optionIntNxtStep: '', optionNextActnItmScreen: '', optionBrdRule: '',inputCheckbox: ''}];
		this.info = JSON.stringify(this.optionItems);
	}
}