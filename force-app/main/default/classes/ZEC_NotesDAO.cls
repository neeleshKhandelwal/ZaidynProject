public class ZEC_NotesDAO {

    public static List<Notes__c> getNotes_By_QuestionId(String questionId){
       return [select id,Question__c,comment__c,CreatedDate,CreatedBy.Name from Notes__c where Question__c=:questionId];
    }
    public static List<Notes__c> getNotes_By_ActionId(String actionId){
       return [select id,Question__c,comment__c,CreatedDate,CreatedBy.Name from Notes__c where Action__c=:actionId];
    }
    public static void insert_notes(Notes__c record){
        insert record;
    }
}