public with sharing class ZEC_ScreenProgressDAO {
    public static List<Screen_Progress__c> getScreensByProject(String projectId){
        return [SELECT Id, Name, Get_Sign_Off__c, Project__c, Screen_Order__c, Show_Summary__c, 
                Status__c, Account__c, Screen__c, Show_Module_Progress__c, Show_Buttons__c,Screen__r.Name
                FROM Screen_Progress__c
                WHERE Project__c =: projectId ORDER BY Screen_Order__c ASC];
    }

    public static List<Screen_Progress__c> upsertRecord(List<Screen_Progress__c> listOfScreenProgress){
        upsert listOfScreenProgress;
        return listOfScreenProgress;
    }
}