import { LightningElement,api,track } from 'lwc';

export default class Zec_MultiCheckbox extends LightningElement {

    @api value = [];
    @api options = [];
    @api multiChecboxLabel;
    @api multiChecboxDesc;
    @api image;
    @api otherField;
    openNotes = false;
    @api showOther= false;
    @track answers = [];
    @api questionRecord;
    @api counter;
    @track items=[];
    @api apiitems = [];
    responseitems;
    currentquestionid;
    previewImage = false;
    @api showCustomize = false;
    @api isReadOnly = false;

  

    get showitems(){
        if(this.items && this.items.length>0){
            return true;
        }
        return false;
    }

    connectedCallback() {
        this.items = this.apiitems;
        //show Customize
        if(this.questionRecord && this.questionRecord.Customize_Detail__c){
            this.showCustomize = true;
        }
    }

  

    handleChange(event) {
        this.value = event.detail.value;
       
         
        this.updateAnswerToParent();
    }

   
   

    updateAnswerToParent(){ 
        console.log('this.items',JSON.parse(JSON.stringify(this.items)) )

        let answersList = [];
        
        for( let i = 0 ;i <this.value.length;i++){
            var answer = new Object();
            answer['answer'] = this.value[i];
            answer['answerResponse'] = this.valueLabel(this.value[i])[0].label;
            answer['questionId'] = this.questionRecord.Id;
            answer['isOther'] = this.showOther;
            answer['isOtherComment'] = this.otherField;
            answersList.push(answer);
        }
        
        this.answers = answersList;

        let selectedEvent = new CustomEvent('answers',  {detail: {
            answer : answersList, 
            questionId : this.questionRecord.Id,
            type : 'multiCheckbox', 
            value: this.value
        }});
        this.dispatchEvent(selectedEvent);
    }

    valueLabel(value){
        //console.log('This Option',JSON.parse(JSON.stringify(this.options)) )
        let newArray = this.options.filter(function (el) {
            return el.value == value;
        });
        return newArray;
    }
    

    isOption(){
        //console.log('This Option',JSON.parse(JSON.stringify(this.options)) )
        let newArray = this.options.filter(function (el) {
            return el.label == 'Other';
        });
        return newArray;
    }

    handleNextActionItem(event){
        console.log('handleNextActionItem')
    }
 
    handleNotes(event){
        console.log('handleNotes');
        this.currentquestionid = this.questionRecord.Id;
        console.log('this.questionRecord.Id ', this.questionRecord.Id);
        this.openNotes = true;
    }

    handleCloseNotes(event){
        this.openNotes = false;
        //console.log('Notes',event.detail.textAreaDetail);
        //this.notesValue= event.detail.textAreaDetail;
        //this.updateAnswerToParent();
    }

    handleOtherField(event){
        this.otherField = event.detail.value;
    }

    handleBlur(event){
        this.updateAnswerToParent();
    }


    openImage(event){
        this.previewImage = true;
    }

    handleCloseImage(event){
        this.previewImage = false;
    }

    handleCustomize(event){
        this.showCustomize = true;
    }

    closeCustomize(event){
        this.showCustomize = false;
    }
}