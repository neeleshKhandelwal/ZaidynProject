import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteFile from '@salesforce/apex/ZEC_ExperienceController.deleteFile';
export default class Zec_UploadComponent extends LightningElement {

    @api record;
    @api actionitemchoice;
    @api uploadedFileName;
    @api uploadedFileId;
    @api isReadOnly;

    get hideUpload(){
        if(this.uploadedFileName && this.uploadedFileId){
            return true;
        }
        return false;
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        console.log('uploadedFiles', JSON.parse(JSON.stringify(uploadedFiles)))
        this.showSuccessToast('File Uploaded Successfully');
        console.log('No. of files uploaded : ' , uploadedFiles.length);

        this.uploadedFileName = uploadedFiles[0].name;
        this.uploadedFileId = uploadedFiles[0].documentId;

        let selectedEvent = new CustomEvent('fileupload',  {detail: {
            fileName : uploadedFiles[0].name, 
            contentdocid : uploadedFiles[0].documentId, 
            recordId : this.actionitemchoice
        }});
        this.dispatchEvent(selectedEvent);

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

    handleDownload(){
        let url = '/sfc/servlet.shepherd/document/download/'+this.uploadedFileId;
        window.open(url);
    }

    handleDelete(){
        deleteFile({
            contentDoc : this.uploadedFileId
        })
		.then(result => {
            this.uploadedFileName = '';
            this.uploadedFileId = '';
            this.showSuccessToast('File deleted Successfully');

        })
		.catch(error => {
            console.error('Error',error)
			this.error = error;
		})
    }

    
}