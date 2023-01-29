public with sharing class ZEC_ActionItemDAO {
    public static List<Action_Item__c> getActionItemsByScreen(String projectId, String screenName){
        System.debug('projectId'+projectId);
        System.debug('screenName'+screenName);
        return [SELECT Id, Name, /*Action__r.Question_Choice__r.Question__r.Screen__c,*/ Action__r.RecordType.Name, 
                Action__r.Project__c 
                FROM Action_Item__c
                WHERE /* Action__r.Question_Choice__r.Question__r.Screen__c =: screenName
                AND*/ Action__r.Project__c =: projectId];
    }
}