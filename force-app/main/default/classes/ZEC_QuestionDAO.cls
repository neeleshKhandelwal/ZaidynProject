public class ZEC_QuestionDAO {
    
    public static List<Question__c> Question_By_Active_Screen_Project(Boolean isActive,String screenId,String projectId){
        return [SELECT Id, Description__c, Name, Module_Progress__r.Module__r.Name,Module_Progress__c,
         Module_Progress__r.Module__r.Category__r.Name,Customize_Detail__c
         ,Module_Progress__r.Screen_Progress__r.Screen__r.Name, Is_Active__c, Question_Number__c, 
         Question_Title__c, Question_Type__c, Image__c,Module_Progress__r.Screen_Progress__r.Show_Buttons__c,Module_Progress__r.Screen_Progress__r.Show_Module_Progress__c,
         (SELECT Id, Question__c, Global_Parameter__c, Default__c, Description__c, Name from Question_Choices__r)
         FROM Question__c where Module_Progress__r.Screen_Progress__r.Screen__c=:screenId and Is_Active__c =:isActive and Module_Progress__r.Screen_Progress__r.Project__c =:projectId order by question_Number__c];
    }
    
    public static Question__c getQuestion_By_Id(String questionId){
        return [Select id,Customize_Detail__c from Question__c where id=:questionId];
    }

    
    public static void update_Question(Question__c questionRecord){
        update questionRecord;
    }
}