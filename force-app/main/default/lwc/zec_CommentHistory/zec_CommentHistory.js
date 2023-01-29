import { LightningElement,api,track } from 'lwc';
import getComments from '@salesforce/apex/ZEC_ExperienceController.getComments';
import getActionItemsComment from '@salesforce/apex/ZEC_ExperienceController.getActionItemsComment';
export default class Zec_CommentHistory extends LightningElement {
   
    error;
    @api currentquestionid;
    @api actionitem;
    @track commentList = [];
    actionList = [];
    isComment= false;
    isaction = false;
    noCommentAvailable=false;
    @api showCommentList(){
        
        if(this.currentquestionid != null && this.currentquestionid != ''){
            
            getComments({currentquestionid :this.currentquestionid})
                .then(result => {
                    console.log('result',result);
                    if(result != null && result != ''){
                        this.commentList =  result;
                        console.log('result->',this.commentList);
                        this.isComment = true;
                        this.isaction = false;
                        this.noCommentAvailable=false;
                    }else{
                        this.isComment = false;
                        this.noCommentAvailable=true;
                    }
                    
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                })
            
        }else if(this.actionitem != null && this.actionitem != ''){
            console.log('Connected actionitem->> ',this.actionitem);
                getActionItemsComment({currentactionid :this.actionitem})
                .then(result => {
                    console.log('result',result);
                    if(result != null && result != ''){
                        this.actionList =  result;
                        console.log('result->',this.actionList);
                        this.isaction = true;
                        this.noCommentAvailable = false;
                    }else{
                        this.isComment = false;
                        this.noCommentAvailable = true;
                    }
                    
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                })
        }else{
            this.noCommentAvailable = true;
        }
    }
    connectedCallback() {
        if(this.currentquestionid != null && this.currentquestionid != ''){
        
        getComments({currentquestionid :this.currentquestionid})
            .then(result => {
                console.log('result',result);
                if(result != null && result != ''){
                    this.commentList =  result;
                    console.log('result->',this.commentList);
                    this.isComment = true;
                    this.isaction = false;
                }else{
                    this.isComment = false;
                    this.noCommentAvailable=true;
                }
                
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
            })
        
        }else if(this.actionitem != null && this.actionitem != ''){
            console.log('Connected actionitem->> ',this.actionitem);
                getActionItemsComment({currentactionid :this.actionitem})
                .then(result => {
                    console.log('result',result);
                    if(result != null && result != ''){
                        this.actionList =  result;
                        console.log('result->',this.actionList);
                        this.isaction = true;
                        this.isComment = false;
                    }else{
                        this.isComment = false;
                        this.noCommentAvailable=true;
                    }
                    
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                })
        }else{
            this.noCommentAvailable = true;
        }
       
        
    }
}