public with sharing class ZEC_QuestionResponseDAO {
    public static List<Question_Response__c> getQuestionResponseByScreen(String projectId, String screenName, Integer recordLimit){
        return [SELECT Id, Name, Question__c, Question__r.Question_Title__c,Question__r.Description__c, Question_Choice__r.Name 
                FROM Question_Response__c 
                /*WHERE Question__r.Screen__c =: screenName and Question__r.Project__c =: projectId*/ 
                ORDER BY CreatedDate,Question__c desc LIMIT :recordLimit];
    }
    
    public static List<Question_Response__c> getQuesResponses_By_Question(List<Question__c> questions){
       return [Select Id,Question_Choice__r.Question__c, Question_Choice__r.Name,Question_Choice__c, Project__c, Comment__c 
               FROM Question_Response__c WHERE Question_Choice__r.Question__c in:questions];
    }
    
    public static void delete_QuestionResponses_By_QuestionIds(List<Id> questionIds ){
        delete [Select id from Question_Response__c where Question__c in :questionIds];
    }
    
    public static List<Question_Response__c> insert_Responses(List<Question_Response__c> questionResponses){
        insert questionResponses;
        return questionResponses;
    }
}