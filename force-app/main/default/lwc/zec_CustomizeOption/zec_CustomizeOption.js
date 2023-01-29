import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveCustomize from '@salesforce/apex/ZEC_ExperienceController.saveCustomize';
import questionRecord from '@salesforce/apex/ZEC_ExperienceController.questionRecord';


export default class Zec_CustomizeOption extends LightningElement {

    customizeData;
    @api question;
    @api isReadOnly;

    connectedCallback() {
        console.log('question Customize',JSON.parse(JSON.stringify(this.question)) )
        questionRecord({
            questionId : this.question.Id
        })
		.then(result => {
            console.log('result Customize',result)
            this.customizeData = result.Customize_Detail__c;
        })
		.catch(error => {
            console.error('Error',error)
		})
    }

    handleSave(event){
        saveCustomize({
            questionId : this.question.Id,
            customizeData : this.customizeData
        })
		.then(result => {
            this.showSuccessToast('Saved Successfully');
        })
		.catch(error => {
            console.error('Error',error)
		})
    }

    hideModalBox(event){
        this.dispatchEvent(new CustomEvent('closecustomize'));
    }

    handleCustomize(event){
        this.customizeData = event.detail.value;
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