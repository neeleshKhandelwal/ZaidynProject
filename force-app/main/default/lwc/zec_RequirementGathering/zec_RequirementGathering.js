import { LightningElement,track,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import ZEC_Resource from '@salesforce/resourceUrl/ZECResource';

import saveAnswers from '@salesforce/apex/ZEC_ExperienceController.saveAnswers';
import getScreenProgressData from '@salesforce/apex/ZEC_ScreenProgressController.getScreenProgressData';
import updateStatus from '@salesforce/apex/ZEC_ScreenProgressController.updateStatus';
import moduleTreeComponent from '@salesforce/apex/ZEC_ScreenProgressController.moduleTreeComponent';


export default class Zec_RequirementGathering extends LightningElement {
    
    value = '';
    showSpinner = false;
    @track pageName = 'Module Progress';
    @track accountList = [];
    @api projectid ;
    imageurl;
    @api categorylist = [];
    @api selectedItems;
    @track screens;
    @track currentScreen;
    showSignOff = false;
    @track recentlyAnsweredQuestions;
    @track actionItems;
    @track progressWrapper;
    isReadOnly = false;
    changeScreen = false;
    clickedScreenId;

    qustionContainerStyle;
    stepsContainerStyle;

    renderedCallback() {
        
        Promise.all([
            loadStyle( this, ZEC_Resource+'/styles/reviewRequirement.css')
            ]).then(() => {
                console.log( 'Files loaded' );
            })
            .catch(error => {
                console.log( error.body.message );
        });
        
        this.qustionContainerStyle = 'height: '+(window.innerHeight - 208)+'px';
        this.stepsContainerStyle = 'height: '+(window.innerHeight - 138)+'px';    

    }   

    get moduleProgress(){
        if(this.pageName == 'Module Progress' && this.currentScreen){
            return true;
        }
        return false;
    }

    

    handleChangePage(event){
        this.currentScreen.Status__c = 'In Progress';
        this.showSpinner = true;
        updateStatus({  
            screenProgressJSON: JSON.stringify(this.currentScreen)
        })
        .then(result => {
            this.showSpinner = false;
            this.pageName = this.currentScreen.Name;
            this.moduleTreeComponent(this.projectid);
        })
        .catch(error => {
            this.showSpinner = false;
            console.log(error);
        })       
    }

    handleResumePage(event){
        this.pageName = event.detail.pagename;
    }

    
    connectedCallback() {
        this.getScreensByProject(this.projectid);
        
        
    }

    moduleTreeComponent(projectid){
        this.showSpinner = true;
        moduleTreeComponent({  
            projectId: projectid 
        })
        .then(result => {
            this.moduleTree = result;
            this.showSpinner = false;
        })
        .catch(error => {
            this.showSpinner = false;
            //this.loaded = true;
            console.log(error);
        })
    }

    @api getScreensByProject(projectid){
        this.showSpinner = true;
        getScreenProgressData({  
            projectId: projectid 
        })
        .then(result => {
            console.log('getScreensByProject result',result);
            this.recentlyAnsweredQuestions = result.getRecentAnsweredQuestions;
            this.actionItems = result.getAlerts;
            this.currentScreen = result.currentScreen;
            this.progressWrapper = result.screenProgress;
            this.moduleTree = result.moduleTree;

            if(this.currentScreen.Show_Summary__c){
                this.pageName = 'Module Progress';
            }
            else{
                this.pageName = this.currentScreen.Screen__r.Name;
            }
            this.showSpinner = false;
            
        })
        .catch(error => {
            this.showSpinner = false;
            //this.loaded = true;
            console.log(error);
        })
    }

    

    handleCategory(event){
        console.log('CATEGORY',event.detail.category);
        this.categorylist = event.detail.category
    }

    handleSelect(event){
        
    }



    handleAnswers(event){
        console.log('Answer',event.detail.answer);
        let answer = event.detail.answer;

        if(answer.length == 0){
            this.showInfoToast('Nothing to save');
            return;
        }
        
        this.showSpinner = true;
        saveAnswers({
            Answer : JSON.stringify(answer),  
            ProjectId : this.projectid,
            PageName : event.detail.module
        })
		.then(result => {
            this.showSpinner = false;
            console.log('saveAnswers',result);
            this.showSuccessToast('Form Submitted Successfully');
       
        })
		.catch(error => {
            this.showSpinner = false;
            console.error('Error',error)
			this.error = error;
		})
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

    showInfoToast(message) {
        const event = new ShowToastEvent({
            title: 'Information',
            message: message,
            variant: 'warning',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

   
    handleSelectItem(event){
        console.log('EVENT',event.detail.item);
        this.selectedItems = event.detail.item
    }

    
    openSignOffPage(){
        this.showSignOff = true;
    }

    closeModal(){
        this.showSignOff = false;
        this.template.querySelector('c-zec_-module-progress').unToggle();
    }

    handleSignOff(event){
        this.currentScreen.Status__c = 'Completed';
        this.showSpinner = true;
        updateStatus({  
            screenProgressJSON: JSON.stringify(this.currentScreen)
        })
        .then(result => {
            this.showSignOff = false;
            this.getScreensByProject(this.projectid);
        })
        .catch(error => {
            this.showSpinner = false;
            console.log(error);
        })
    }

    handleScreenSelection(event){
        console.log('Screen Clicked', event.currentTarget.dataset.screenid);
        console.log('Tree Data', JSON.parse(JSON.stringify(this.moduleTree)) );
        console.log('Current Screen',JSON.parse(JSON.stringify(this.currentScreen)) );
        this.clickedScreenId = event.currentTarget.dataset.screenid;

        if(this.currentScreen.Status__c == 'In Progress' && this.pageName!='Module Progress'){
            this.changeScreen = true;
        }else{
            this.handleProceed();
        }

        
    }

    handleProceed(){
        let clickedScreenId = this.clickedScreenId;
        let screenData = JSON.parse(JSON.stringify(this.moduleTree)) ;
        let isChangeScreen = false;
        for(let i= 0 ;i<screenData.length;i++){
            if(screenData[i].screenProgress.Id == clickedScreenId){
                if(screenData[i].screenProgress.Status__c == 'Not-Started'){
                    this.showInfoToast('Not allowed')
                    return;
                }
                this.currentScreen = screenData[i].screenProgress;
                this.pageName = screenData[i].screenProgress.Screen__r.Name;
                screenData[i].activeStep = 'active-step';
                if(screenData[i].stepCompleted == 'success'){
                    this.isReadOnly = true;
                }else{
                    this.isReadOnly = false;
                }          
                this.categorylist = [];
                this.selectedItems = '';
                isChangeScreen = true;
            }else{
                screenData[i].activeStep = '';
            }
        }
        this.moduleTree = screenData;
        this.changeScreen = false;
        if(isChangeScreen){
            this.template.querySelector('c-zec_-questions').handleOnload(this.currentScreen,this.isReadOnly);
        }
        
    }

    handleCloseChangeScreen(){
        this.changeScreen = false;
        this.clickedScreenId = undefined;
    }
}