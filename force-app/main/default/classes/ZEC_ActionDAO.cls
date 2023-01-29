public class ZEC_ActionDAO {

    public static List<Action__c> getActionWithActionItems_By_Ques_Choice(List<Question_Choice__c> questionChoice){
       return [SELECT Id, Name,Question_Choice__r.name,Question_Choice__r.Question__r.Name, Next_Steps__c,
                      Project__r.name,(Select Id, Action__c, Details_to_capture__c, ETA__c, Response__c, Status__c,
                                       Criticality__c, Contact__c, New_Assignee__c  from Action_Items__r where Details_to_capture__c!= NULL)
                              FROM Action__c where Question_Choice__c in:questionChoice];
    }
}