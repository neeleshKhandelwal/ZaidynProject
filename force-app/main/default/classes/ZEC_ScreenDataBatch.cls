public class ZEC_ScreenDataBatch implements Database.Batchable<sObject>{
    
    private Project__c projectRecord;
    private Boolean isError;
    
    public ZEC_ScreenDataBatch(String projectId){
        isError = false;
        List<Project__c> projectList = [Select Id, Client__c From Project__c where Id =: projectId];
        if(projectList != null && !projectList.isEmpty()){
            projectRecord = projectList[0];
        }
        System.debug('projectRecord'+projectRecord);
		/*
		listOfScreen = [select Id, Name, Get_Sign_Off__c, Show_Summary__c, Screen_Order__c from Screen__c];  
        listOfModule = [select Id, Screen__c, Name, RecordType.DeveloperName from Module__c];
        listOfQuestionMaster = [select Id, Question_Title__c, Module__c from Question_Master__c];
*/
        
    }
    
    public Database.QueryLocator start(Database.BatchableContext BC) {
        System.debug('Start');
        if(projectRecord == null) {
            return null;
        }
        String query = 'Select Id, Name, Get_Sign_Off__c, Show_Summary__c, Screen_Order__c from Screen__c';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext BC, List<Screen__c> screenList) {
        System.debug('screenList:'+screenList);
        List<Screen_Progress__c> screenProgressList = new List<Screen_Progress__c>();
        for(Screen__c screen : screenList){
            Screen_Progress__c screenProgress = new Screen_Progress__c();
            screenProgress.Name = screen.Name;
            screenProgress.Get_Sign_Off__c = screen.Get_Sign_Off__c;
            screenProgress.Show_Summary__c = screen.Show_Summary__c;
            screenProgress.Screen_Order__c = screen.Screen_Order__c;
            screenProgress.Screen__c = screen.Id;
            screenProgress.Account__c = projectRecord.Client__c;
            screenProgress.Project__c = projectRecord.Id;
            screenProgressList.add(screenProgress);
        }
        try {
            System.debug('screenProgressList:'+screenProgressList);
            if(!screenProgressList.isEmpty() && !isError){
            	insert screenProgressList;   
            }
        } catch(Exception e) {
            isError = true;
            System.debug(e);
            throw e;
        }
        
    }   
    
    public void finish(Database.BatchableContext BC) {
        if(projectRecord != null){
            if(isError){
                //Create a delete batch for this
				delete [Select Id, Screen__c From Screen_Progress__c where Project__c =: projectRecord.Id];                
            }
            else{
				projectRecord.Data_Configured__c = projectRecord.Data_Configured__c+';Screen';
        		update projectRecord;
                ZEC_ModuleDataBatch moduleDataBatch = new ZEC_ModuleDataBatch(projectRecord);
                Database.executeBatch(moduleDataBatch);
            }
        }
  	}
}