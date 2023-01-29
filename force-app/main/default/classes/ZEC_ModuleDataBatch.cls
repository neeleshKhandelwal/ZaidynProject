public class ZEC_ModuleDataBatch implements Database.Batchable<sObject>{
    
    public Project__c projectRecord;
    private Map<Id, Screen_Progress__c> screenProgressMap = new Map<Id, Screen_Progress__c>();
    
    public ZEC_ModuleDataBatch(Project__c projectRecord){
        this.projectRecord = projectRecord;
        List<Screen_Progress__c> screenProgressList = [Select Id, Screen__c From Screen_Progress__c where Project__c =: projectRecord.Id];
        for(Screen_Progress__c screenProgress : screenProgressList){
            screenProgressMap.put(screenProgress.Screen__c, screenProgress);
        }
    }
    
    public Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'Select Id, Screen__c, Name, RecordType.DeveloperName from Module__c';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext BC, List<Module__c> moduleList) {
        List<Screen_Progress__c> moduleProgressList = new List<Screen_Progress__c>();
        for(Module__c module : moduleList){
            Module_Progress__c moduleProgress = new Module_Progress__c();
            moduleProgress.Name = module.Name;
            moduleProgress.Screen_Progress__c = screenProgressMap.get(module.Screen__c).Id;
        }
        try {
            if(!moduleProgressList.isEmpty()){
            	insert moduleProgressList;   
            }
        } catch(Exception e) {
            System.debug(e);
            throw e;
        }
    }
    
    public void finish(Database.BatchableContext BC) {
        if(projectRecord != null){
            projectRecord.Data_Configured__c = projectRecord.Data_Configured__c+';Module';
        	update projectRecord;
            ZEC_QuestionDataBatch questionDataBatch = new ZEC_QuestionDataBatch(projectRecord);
            Database.executeBatch(questionDataBatch);
        }
    }

}