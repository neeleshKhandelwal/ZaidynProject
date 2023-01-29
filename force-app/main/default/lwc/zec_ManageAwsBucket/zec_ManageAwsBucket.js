import { LightningElement,track  } from 'lwc';

export default class Zec_ManageAwsBucket extends LightningElement {
    @track newAccessKey = '';
    @track newBucketName = '';
    @track newSecretKey = '';
    @track newRegion = '';

    handleAccessKeyChange(event) {
        this.newAccessKey = event.target.value;
    }
    handleBucketNameChange(event) {
        this.newBucketName = event.target.value;
    }
    handleSecretKeyChange(event) {
        this.newSecretKey = event.target.value;
    }
    handleRegionChange(event) {
        this.newRegion = event.target.value;
    }
    handleCancel(){
        this.newAccessKey = '';
        this.newBucketName = '';
        this.newSecretKey = '';
        this.newRegion = '';
    }
    handleSave(){
        console.log('accessKey',this.newAccessKey);
        console.log('BucketName',this.newBucketName);
        console.log('SecretKey',this.newSecretKey);
        console.log('Region',this.newRegion);
    }
}