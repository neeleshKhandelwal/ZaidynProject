public with sharing class ZEC_QuestionNotesDAO {
    public static List<Notes__c> getQuestionNotes(String projectId) {
        if (projectId == null || projectId == '') {projectId = 'a0ADO0000006Q4X2AU';} //TODO: To be removed
        return [ SELECT Question__r.Name, Question__r.Id, CreatedBy.Name, CreatedDate, Comment__c from Notes__c
                where RecordType.DeveloperName = 'Question_Notes'
                AND Project__c =: projectId
                WITH SECURITY_ENFORCED ];
    }
}