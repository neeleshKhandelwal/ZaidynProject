import { LightningElement, api,track } from 'lwc';


export default class zec_RadioButton extends LightningElement {

    @api value = '';
    @api radioLabel = '';
    @api options = [];
    @api image;
    @api radioDescription = '';
    @api otherField;
    openNotes = false;
    @api showOther = false;
    @track answers = [];
    @api questionRecord;
    @api counter;
    @track items=[];
    @api apiitems = [];
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
        const selectedOption = event.detail.value;
        this.value = selectedOption;
        /*let isOptionValue = this.isOption(this.value);
        if(isOptionValue && isOptionValue.length>0 && isOptionValue[0].label == 'Other'){
            this.showOther = true;
        }else{
            this.showOther = false;
            this.otherField = '';
        }*/

        this.updateAnswerToParent();
        console.log('Option selected with value: ' , selectedOption);
    }
  

    updateAnswerToParent(){

        if(this.value){
            let answersList = [];
            var answer = new Object();
            answer['answer'] = this.value;
            answer['answerResponse'] = this.isOption(this.value)[0].label;
            answer['questionId'] = this.questionRecord.Id;
            answer['isOther'] = this.showOther;
            answer['isOtherComment'] = this.otherField;
            answersList.push(answer);

            this.answers = answersList;

            console.log('answersList', JSON.stringify(answersList))
            console.log('this.questionRecord.Id ', this.questionRecord.Id)

            let selectedEvent = new CustomEvent('answers',  {detail: {
                answer : answersList, 
                questionId : this.questionRecord.Id,
                type : 'Radio', 
                value :  this.value
            }});
            this.dispatchEvent(selectedEvent);
        }
    }

    isOption(value){
        //console.log('This Option',JSON.parse(JSON.stringify(this.options)) )
        let newArray = this.options.filter(function (el) {
            return el.value == value;
        });
        return newArray;
    }


    handleNotes(event){
        console.log('handleNotes');
        this.openNotes = true;
        this.currentquestionid = this.questionRecord.Id;
        console.log('this.questionRecord.Id ', this.questionRecord.Id);
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