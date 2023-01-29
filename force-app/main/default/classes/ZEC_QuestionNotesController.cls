public with sharing class ZEC_QuestionNotesController {

    public ZEC_QuestionNotesController() {}

    @AuraEnabled
    public static List<Notes__c> getQuestionNotes(String projectId) {
        return ZEC_QuestionNotesDAO.getQuestionNotes(projectId);
    }
}