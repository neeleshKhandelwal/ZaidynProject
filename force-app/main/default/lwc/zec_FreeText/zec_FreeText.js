import { LightningElement, api,track } from 'lwc';

export default class Zec_FreeText extends LightningElement {

    @api value = '';
    @api radioLabel = '';
    @api options = [];
    @api image;
    @api radioDescription = '';
    @api otherField = '';
    openNotes = false;
    @api showOther = false;
    @track answers = [];
    @api questionRecord;
    @api counter;
    currentquestionid;
    previewImage = false;
    @api isReadOnly = false;


    connectedCallback() {
    }

    handleChange(event) {
        let selectedOption = event.detail.value;
        this.value = selectedOption;
        this.updateAnswerToParent();
        
    }

    updateAnswerToParent(){

        if(this.value){
            let answersList = [];
            var answer = new Object();
            answer['answer'] = this.options[0].value;
            answer['answerResponse'] = this.value;
            answer['questionId'] = this.questionRecord.Id;
            answer['isOther'] = this.showOther;
            answer['isOtherComment'] = this.otherField;
            answersList.push(answer);

            this.answers = answersList;

            console.log('answersList', JSON.stringify(answersList))

            let selectedEvent = new CustomEvent('answers',  {detail: {
                answer : answersList, 
                questionId : this.questionRecord.Id,
                type : 'FreeText'
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

    handleUpload(event){
        this.updateAnswerToParent();
       // this.dispatchEvent(new CustomEvent('saveanswer'));
        console.log('handleUpload')
    }
    handleNotes(event){
        console.log('handleNotes');
        this.openNotes = true;
        this.currentquestionid = this.questionRecord.Id;
        console.log('this.questionRecord.Id ', this.questionRecord.Id);
    }

    handleCloseNotes(event){
        this.openNotes = false;
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
}