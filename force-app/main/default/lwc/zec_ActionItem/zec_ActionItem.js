import { LightningElement,api,track } from 'lwc';
import saveActionComment from '@salesforce/apex/ZEC_ExperienceController.saveActionComment';
import saveActionItemResp from '@salesforce/apex/ZEC_ExperienceController.saveActionItemResp';
import actionItemsAndResponse from '@salesforce/apex/ZEC_ExperienceController.actionItemsAndResponse';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Zec_ActionItem extends LightningElement {

    @api actionItems = [];
    showSteps = false;
    @track itemList = [];
    action;
    nextSteps = '';
    comments = '';
    actionList = [];
    @api isReadOnly = false;

    handlenextStep(event){
        let action = event.currentTarget.dataset.value;
        console.log('action',action)

        actionItemsAndResponse({actionId :action })
        .then(result => {
            console.log('actionItemsAndResponse result',result);
            this.itemList = result;
            for(let i = 0;i<this.actionItems.length;i++){
                if(this.actionItems[i].Id == action){
                    this.nextSteps =this.actionItems[i].Next_Steps__c;
                    this.action = action
                    this.showSteps = true;
                }
            }
            console.log('actionItemsAndResponse nextSteps',this.nextSteps);
        })
        .catch(error => {
            this.error = error;
        })
     
    }

    closeModal(){
        this.showSteps = false; 
    }

    handleSave() {
        
        if(this.comments != null && this.comments != ''){
            console.log( ' this.textareavalue', this.comments);
            saveActionComment({currentactionid :this.action, comments: this.comments})
            .then(result => {
                console.log('result',result);
                if(result != null && result != ''){
                    this.actionList =  result;
                    console.log('result->',this.actionList);
                    this.template.querySelector("c-zec_-comment-history").showCommentList();
                    this.comments = '';
                }else{
                    
                }
                
            })
            .catch(error => {
                this.error = error;
            })
        }
    }

    handleComments(event){
        this.comments = event.detail.value;
    }


    handleResponse(event) {
        
        let listValue = JSON.parse(JSON.stringify(this.itemList)) ;
        let itemList = listValue.filter(function (el) {
            if(el.actionItem.Id == event.target.dataset.value){
                el.response = event.detail.value;
            }
            return el;
        });

        console.log('itemList',itemList)
        this.itemList = itemList;
       
       
    }
    handleSaveActionItems(){
        let actionItemList = JSON.parse(JSON.stringify(this.itemList));

        console.log('actionItemList before',actionItemList);
        // Action_Item_Responses__r needs to be deleted as it gives error in apex while deserializing
        for(let i= 0;i<actionItemList.length;i++){
             delete actionItemList[i].actionItem.Action_Item_Responses__r
        }
        console.log('actionItemList after',actionItemList)

        saveActionItemResp({actionResponse : JSON.stringify(actionItemList)})
        .then(result => {
            console.log('result',result);
            this.showSuccessToast('Saved Successfully!');
        })
        .catch(error => {
            console.log('error',error);
            
        })

    }

    handleUpdateTableName(event){
         
        let listValue = JSON.parse(JSON.stringify(this.itemList)) ;
        let itemList = listValue.filter(function (el) {
            if(el.actionItem.Id == event.detail.recordId){
                el.response = event.detail.value;
                el.fileName = event.detail.fileName;
                el.contentRecId = event.detail.contentdocid;
            }
            return el;
        });

        console.log('itemList after fileUpload',itemList)
        this.itemList = itemList;
      
    }

    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

}