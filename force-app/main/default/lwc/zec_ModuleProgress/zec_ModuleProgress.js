import { LightningElement, track ,api} from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import ZEC_Resource from '@salesforce/resourceUrl/ZECResource';

export default class Zec_ModuleProgress extends LightningElement {
    @api currentScreen;
    @api recentlyAnsweredQuestions;
    @api actionItems;
    @api progress;

    @track screens; 
    @track startBtnLabel;
    @track loaded = false;
    @track initialLoaded = false;
    @track signedOff;

    handleStarted(event){
        
        if(this.startBtnLabel == 'Get Started'){
            let selectedEvent = new CustomEvent('changepage',  {detail: {
                pagename : this.currentScreen.Name
            }});
            this.dispatchEvent(selectedEvent);
        }else{
            let selectedEvent = new CustomEvent('resumepage',  {detail: {
                pagename : this.currentScreen.Name
            }});
             this.dispatchEvent(selectedEvent);
        }
        console.log('PageName fired',JSON.stringify(selectedEvent))
    }

    connectedCallback(){
        Promise.all([
            loadStyle( this, ZEC_Resource+'/styles/moduleProgress.css')
            ]).then(() => {
                console.log( 'Files loaded' );
            })
            .catch(error => {
                console.log( error.body.message );
        });
       //this.getScreensByProject();

       if(this.currentScreen){
            this.loaded = true;
            this.initialLoaded = true;
            console.log('this.currentScreen',this.currentScreen.Name);
            if(this.currentScreen.Status__c == 'In Progress'){
                this.startBtnLabel = 'Resume';
            }
            else if(this.currentScreen.Status__c == 'Completed'){
                this.signedOff = true;
            }
            else{
                this.startBtnLabel = 'Get Started';
                this.signedOff = false;
            }
       }
    }

    /*getScreensByProject(){
        getScreens({  
            projectId: this.projectId 
        })
        .then(result => {
            this.loaded = true;
            this.initialLoaded = true;
            console.log('result',result);
            this.screens = result;
            this.setCurrentScreen(result);
            
        })
        .catch(error => {
            this.loaded = true;
            console.log(error);
        })
    }

    setCurrentScreen(screens){
        screens.every(screen => {
            console.log('Screen Status:',screen.Status__c);
            if(screen.Status__c == 'In Progress'){
                this.currentScreen = screen;
                this.startBtnLabel = 'Resume';
                return false;
            }
            else if(screen.Status__c == 'Not-Started'){
                this.currentScreen = screen;
                this.startBtnLabel = 'Get Started';
                return false;
            }
            return true;
        });
        if(this.currentScreen == null || this.currentScreen == undefined){
            this.currentScreen = this.screens[0];
            this.startBtnLabel = 'Resume';
        }

        if(this.currentScreen.Status__c == 'Completed'){
            this.signedOff = true;
        }
        else{
            this.signedOff = false;
        }
    }*/

    changeToggle(event){

        this.signedOff = !this.signedOff;
        console.log('event',event.detail.value,this.signedOff)
        let selectedEvent = new CustomEvent('signoff',  {detail: {
            pagename : this.currentScreen.Name
        }});
        this.dispatchEvent(selectedEvent);
        
        /*this.loaded = false;
        this.signedOff = !this.signedOff;
        console.log('signed off',this.signedOff);
        this.currentScreen.Status__c = 'In Progress';
        if(this.signedOff){
            this.currentScreen.Status__c = 'Completed';
        }
        
        updateStatus({  
            screenProgressJSON: JSON.stringify(this.currentScreen)
        })
        .then(result => {
            this.loaded = true;
            this.screens = result;
            this.setCurrentScreen(result);
        })
        .catch(error => {
            this.loaded = true;
            console.log(error);
        })*/
    }

    @api unToggle(){
        console.log('unToggle called')
        this.signedOff = false
    }
}