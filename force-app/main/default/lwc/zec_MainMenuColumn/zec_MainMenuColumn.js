import { LightningElement,track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import ZEC_Resource from '@salesforce/resourceUrl/ZECResource';
import getClient from '@salesforce/apex/ZEC_ExperienceController.getClient';
import getProject from '@salesforce/apex/ZEC_ExperienceController.getProject';
import updateProject from '@salesforce/apex/ZEC_ExperienceController.updateProject';


export default class zec_MainMenuColumn extends LightningElement {
    @track currentContent = 'tutorial';
    reqGatheringValue = false;
    @track actionTrackerValue = false;
    @track uatValue = false;
    @track milestonesValue = false;
    @track dataValue = false;
    @track auditLogsValue = false;
    @track settingsValue = false;
    @track reviewReqValue =  false;
    @track zdmConfigValue = false;
    //@track showUseCaseSel = false;
    chooseAccount = false;
    @track accountList = [];
    clientValue = '';
    @track projectList = [];
    projectValue = '';
    showSpinner = false;
    @track pageName = '';
    projectid;
    clientid;

    ZECResource = ZEC_Resource + '/images/zaidyn_logo.png';
    HomeIcon = ZEC_Resource + '/images/zs-icon-home-fill.png';
    RequirementGatheringIcon = ZEC_Resource + '/images/zs-icon-data-list.png';
    ActionTrackerIcon = ZEC_Resource + '/images/action_tracker.png';
    UATIcon = ZEC_Resource + '/images/uat.png';
    MilestoneIcon = ZEC_Resource + '/images/milestone.png';
    DataIcon = ZEC_Resource + '/images/zs-icon-data-publish-done.png';
    AuditLogIcon = ZEC_Resource + '/images/zs-icon-report-template.png';
    SettingIcon = ZEC_Resource + '/images/settings.png';
    UserIcon = ZEC_Resource + '/images/user.png';
    HelpIcon = ZEC_Resource + '/images/zs-icon-help-fill.png';
    SqaureIcon = ZEC_Resource + '/images/square.png';

    connectedCallback() {
        getClient()
		.then(result => {
            this.accountList =  this.generatePicklist(result.AccountData);
            this.projectid = result.UserRecord[0].Project__c;
            this.clientid = result.UserRecord[0].Client__c;

            if(this.clientid){
                for(let i =0 ;i<this.accountList.length;i++){
                    if(this.accountList[i].value == this.clientid){
                        this.imageurl = this.accountList[i].image
                    }
                }
                this.getProject(this.clientid);
            }

        })
		.catch(error => {
			this.error = error;
		})
    }

    handleGetProject(event){
        this.getProject(event.detail.clientid)
    }

    getProject(clientid){
        this.showSpinner = true;
        getProject({accountId : clientid})
        .then(result => {
            this.projectList =  this.generatePicklist(result);
            this.showSpinner = false;
        })
        .catch(error => {
            this.showSpinner = false;
            this.error = error;
        })
    }

    handleprojectchange(event){
        console.log('projectid',event.detail.projectid);
        this.projectid = event.detail.projectid;
        this.clientid = event.detail.clientid;
        this.showSpinner = true;
        updateProject({
            accountId : this.clientid,
            projectId : this.projectid
        })
		.then(result => {
            let requirementGath = this.template.querySelector('c-zec_-requirement-gathering');
            if(requirementGath){
                requirementGath.getScreensByProject(this.projectid);
            }
            this.showSpinner = false;
        })
		.catch(error => {
            this.showSpinner = false;
            console.error('Error',error)
			this.error = error;
		})
    }




    generatePicklist(picklistValues){
        let arr = [];
        arr.push({
            label: '--None--',
            value: ''
        });
        console.log('arr',arr)
        for(let i= 0; i<picklistValues.length;i++){
            let obj = new Object();
            obj.label = picklistValues[i].Name;
            obj.value = picklistValues[i].Id ;
            obj.image =  picklistValues[i].Logo__c ;
            arr.push(obj) ;
        }
        console.log('arr after',arr)
        return arr;
    }


    renderedCallback() {

        Promise.all([
            loadStyle( this, ZEC_Resource+'/styles/puremin.css'),
            loadStyle( this, ZEC_Resource+'/styles/mainmenu.css')
            ]).then(() => {
                console.log( 'Files loaded' );
            })
            .catch(error => {
                console.log( error.body.message );
        });

    }

    showActionTracker(event){
        this.actionTrackerValue = true;
        this.reqGatheringValue = false;
        this.settingsValue =  false;
        this.reviewReqValue = false;
    }
	showReqGathering(event){
        this.reqGatheringValue = true;
        this.actionTrackerValue = false;
        this.settingsValue =  false;
        this.reviewReqValue = false;
    }
    showSetting(event){
        this.settingsValue =  true;
        this.actionTrackerValue = false;
        this.reqGatheringValue = false;
        this.reviewReqValue = false;
    }
    showReviewReq(event){
        this.settingsValue =  false;
        this.actionTrackerValue = false;
        this.reqGatheringValue = false;
        this.reviewReqValue = true;
    }
    showZdmConfig(event){
        this.settingsValue =  false;
        this.actionTrackerValue = false;
        this.reqGatheringValue = false;
        this.reviewReqValue = false;
        this.zdmConfigValue = true;
    }

}