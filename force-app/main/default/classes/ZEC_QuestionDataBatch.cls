public class ZEC_QuestionDataBatch implements Database.Batchable<sObject>{
    public Project__c projectRecord;
    private Map<Id, Module_Progress__c> moduleProgressMap = new Map<Id, Module_Progress__c>();
    
    public ZEC_QuestionDataBatch(Project__c projectRecord){
        this.projectRecord = projectRecord;
        List<Module_Progress__c> moduleProgressList = [Select Id, Module__c From Module_Progress__c where Screen_Progress__r.Project__c =: projectRecord.Id];
        for(Module_Progress__c moduleProgress : moduleProgressList){
            moduleProgressMap.put(moduleProgress.Module__c, moduleProgress);
        }
    }
    
    public Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'select Id, Question_Title__c, Module__c from Question_Master__c';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext BC, List<Question_Master__c> questionMasterList) {
        List<Question__c> questionList = new List<Question__c>();
        for(Question_Master__c questionMaster: questionMasterList){
            Question__c question = new Question__c();
            question.Module_Progress__c = moduleProgressMap.get(questionMaster.Module__c).Id;
            question.Question_Title__c = questionMaster.Question_Title__c;
            question.Question_Master__c = questionMaster.Id;
            question.Question_Number__c = questionMaster.Question_Number__c;
            question.Question_Type__c = questionMaster.Question_Type__c;
            questionList.add(question);
        }
        try {
            if(!questionList.isEmpty()){
            	insert questionList;   
            }
        } catch(Exception e) {
            System.debug(e);
            throw e;
        }
    }
    
    public void finish(Database.BatchableContext BC) {
        if(projectRecord != null){
            projectRecord.Data_Configured__c = projectRecord.Data_Configured__c+';Question';
        	update projectRecord;
            ZEC_QuestionChoiceDataBatch questionChoiceDataBatch = new ZEC_QuestionChoiceDataBatch(projectRecord);
            Database.executeBatch(questionChoiceDataBatch);
        }
    }
}