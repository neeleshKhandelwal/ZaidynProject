import { LightningElement,api,track } from 'lwc';
import saveComment from '@salesforce/apex/ZEC_ExperienceController.saveComment';
export default class Zec_NotesModal extends LightningElement {

    textareavalue = '';
    @api currentquestionid;
    commentList = [];
    @api isReadOnly;
    
    hideModalBox(){
        this.dispatchEvent(new CustomEvent('closenotes',  {detail: {textAreaDetail : this.textareavalue}}));
    }
    handleSave() {
        //this.dispatchEvent(new CustomEvent('closenotes',  {detail: {textAreaDetail : this.textareavalue}}));
        if(this.textareavalue != null && this.textareavalue != ''){
            console.log( ' this.textareavalue', this.textareavalue);
            saveComment({currentquestionid :this.currentquestionid, comments: this.textareavalue})
                .then(result => {
                    console.log('result',result);
                    if(result != null && result != ''){
                        this.commentList =  result;
                        console.log('result->',this.commentList);
                        this.template.querySelector("c-zec_-comment-history").showCommentList();
                        this.textareavalue = '';
                    }else{
                        
                    }
                    
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                })
        }
    }

    handleTextArea(event){
        console.log('questionrecordid!@#^^',this.currentquestionid);
        this.textareavalue = event.detail.value;
    }
}