public class ZEC_QuestionChoiceDataBatch implements Database.Batchable<sObject>{
	public Project__c projectRecord;
    private Map<Id, Question__c> questionMap = new Map<Id, Question__c>();
    
    public ZEC_QuestionChoiceDataBatch(Project__c projectRecord){
        this.projectRecord = projectRecord;
        Set<Id> moduleIds = new Set<Id>();
        List<Module_Progress__c> moduleProgressList = [Select Id, Module__c From Module_Progress__c where Screen_Progress__r.Project__c =: projectRecord.Id];
        for(Module_Progress__c moduleProgress : moduleProgressList){
            moduleIds.add(moduleProgress.Id);
        }
        List<Question__c> questionList = [Select Id, Question_Master__c From Question__c Where Module_Progress__c in : moduleIds];
        for(Question__c question : questionList){
            questionMap.put(question.Question_Master__c, question);
        }
    }
    
    public Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'Select Id from Question_Choice_Master__c where Question_Master__c in :'+questionMap.keySet();
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext BC, List<Question_Choice_Master__c> questionChoiceMasterList) {
        List<Question_Choice__c> questionChoiceList = new List<Question_Choice__c>();
        for(Question_Choice_Master__c questionChoiceMaster: questionChoiceMasterList){
            Question_Choice__c questionChoice = new Question_Choice__c();
            questionChoice.Question__c = questionMap.get(questionChoiceMaster.Question_Master__c).Id;
            questionChoiceList.add(questionChoice);
        }
        try {
            if(!questionChoiceList.isEmpty()){
            	insert questionChoiceList;   
            }
        } catch(Exception e) {
            System.debug(e);
            throw e;
        }
    }
    
    public void finish(Database.BatchableContext BC) {
        
    }
}