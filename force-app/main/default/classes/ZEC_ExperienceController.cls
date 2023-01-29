public class ZEC_ExperienceController {
    
        
    public class answers{
        @AuraEnabled public List<answerClass> answer;
        @AuraEnabled public String notesValue;
        @AuraEnabled public String questionId;
        @AuraEnabled public String type;
    }
    
    public class answerClass{
        @AuraEnabled public String answer;
        @AuraEnabled public String answerResponse;
        @AuraEnabled public boolean isOther;
        @AuraEnabled public String isOtherComment;
        @AuraEnabled public String questionId;
    }
    
    public class ActionItemResponse{
        @AuraEnabled public string fieldName='';
        @AuraEnabled public String fieldType='';
        @AuraEnabled public String contentRecId='';
        @AuraEnabled public String fileName='';
        @AuraEnabled public String response='';
        @AuraEnabled public Boolean isUpload = false;
        @AuraEnabled public Boolean isComment = false;
        @AuraEnabled public Action_Item__c actionItem;
        @AuraEnabled public Action_Item_Response__c actionItemResponse;
    }
    
    @AuraEnabled
    public static Map<String,Object> getQuestions(String screenId,String projectId){
        System.debug('screenName'+screenId);
        System.debug('projectId'+projectId);
        List<id> questionIds = new List<Id>();
        List<Question_Choice__c> questionChoice = new List<Question_Choice__c>();
        Map<String,Object> questionAndVisibility = new Map<String,Object>();
        List<Question__c> questions = new List<Question__c>();
        
        questions = ZEC_QuestionDAO.Question_By_Active_Screen_Project(true,screenId,projectId);
        for(Question__c record : questions){
            questionIds.add(record.Id);
            questionChoice.addAll(record.Question_Choices__r);
        }
        
        List<Action__c> actionAndItem = new List<Action__c>();
        actionAndItem = ZEC_ActionDAO.getActionWithActionItems_By_Ques_Choice(questionChoice);
        
        Map<String,List<Question_Response__c>> quetionWithResponses = new Map<String,List<Question_Response__c>>();
        List<Question_Response__c> questionResponse = new List<Question_Response__c>();
        questionResponse = ZEC_QuestionResponseDAO.getQuesResponses_By_Question(questions);
        
        for(Question_Response__c record : questionResponse){
            if(!quetionWithResponses.containsKey(record.Question_Choice__r.Question__c)){
                quetionWithResponses.put(record.Question_Choice__r.Question__c,new List<Question_Response__c>());
            }
            quetionWithResponses.get(record.Question_Choice__r.Question__c).add(record);
        }
        
        
        
        Map<String,list<Action__c>> actionItemsWithresponses = new Map<String,List<Action__c>>();
        for(Action__c record : actionAndItem){
            if(!actionItemsWithresponses.containsKey(record.Question_Choice__c)){
                actionItemsWithresponses.put(record.Question_Choice__c, new list<Action__c>());
            }
            actionItemsWithresponses.get(record.Question_Choice__c).add(record);
        }
        
        Boolean showButton = false;
        Boolean showProgress = false;
        
        for(Question__c record : questions){
            if(record.Module_Progress__r.Screen_Progress__r.Show_Buttons__c){
                showButton = true;
            }
            if(record.Module_Progress__r.Screen_Progress__r.Show_Module_Progress__c){
                showProgress = true;
            }
        }
        
        questionAndVisibility.put('showButton',showButton);
        questionAndVisibility.put('showProgress',showProgress);
        questionAndVisibility.put('Questions',questions);
        //questionAndVisibility.put('Responses',questionResponse);
        questionAndVisibility.put('QuestionWithResponses',quetionWithResponses);
        //questionAndVisibility.put('QuestionActionsWithNotes',questionNotes);
        questionAndVisibility.put('QuestionWithFiles',getRelatedFiles(questionIds));
        //questionAndVisibility.put('Notes',notesList);
        //questionAndVisibility.put('action',actionAndItem);
        questionAndVisibility.put('actionMap',actionItemsWithresponses);
        
        
        return questionAndVisibility;
        
    }
    
    public static Map<String,ContentVersion> getRelatedFiles(list<Id> lstParentIds) {
        
        Map<String,ContentVersion> mapParentIdAndFiles = new Map<String,ContentVersion>();
        map<String, String> mapCntIdParentId = new map<String, String>();
        
        for(ContentDocumentLink cntLink : ZEC_ContentDocumentLinkDAO.getCDL_By_LinkedEntityId(lstParentIds)) {
            mapCntIdParentId.put(cntLink.ContentDocumentId, cntLink.LinkedEntityId);
        }
        
        if(!mapCntIdParentId.isEmpty()) {
            List<String> contentDocIds = new List<String>();
            contentDocIds.addAll(mapCntIdParentId.keySet());
            for(ContentVersion cv : ZEC_ContentversionDAO.getContentVersion_By_ContentDocumentId_ActionItem(contentDocIds)){               
                mapParentIdAndFiles.put(cv.Action_Item_fileupload__c,cv);
                
            }
        }
        
        return mapParentIdAndFiles;
    } 
    
    
    @AuraEnabled
    public static Map<String,Object> getClient(){
        Map<String,Object> onloadData = new Map<String,Object>();
        onloadData.put('UserRecord',ZEC_UserDAO.getUsers_By_Id(UserInfo.getUserId()));
        onloadData.put('AccountData',ZEC_AccountDAO.getAllAccounts());
        return onloadData;
    }
    
    @AuraEnabled
    public static List<Project__c> getProject(String accountId){
        return ZEC_ProjectDAO.getProject_By_Client(accountId);
    }
    
    @AuraEnabled
    public static List<Question_Response__c> saveAnswers(String Answer,String ProjectId,String PageName){
        System.debug('Answer'+Answer);
        List<answers> answerList = (List<answers>)JSON.deserialize(Answer, List<answers>.class);
        List<String> questionIds = new list<String>();
        for(answers record : answerList){
            for(answerClass answerRecord : record.answer){ 
                questionIds.add(answerRecord.questionId);
            }
        }
        
        ZEC_QuestionResponseDAO.delete_QuestionResponses_By_QuestionIds(questionIds);
        
        List<Question_Response__c> responses = new List<Question_Response__c>();
        for(answers record : answerList){
            for(answerClass answerRecord : record.answer){ 
                Question_Response__c quesResp = new Question_Response__c();
                quesResp.Project__c = ProjectId;
                quesResp.Question_Choice__c = answerRecord.answer;
                quesResp.Question__c = answerRecord.questionId;
                
                responses.add(quesResp);
            }
        }
        
        System.debug('responses Size'+responses.size());
        System.debug('responses '+responses);
        return ZEC_QuestionResponseDAO.insert_Responses(responses);
        
    }
    
    @AuraEnabled
    public static void deleteFile(String contentDoc){
        System.debug('contentDoc'+contentDoc);
        ZEC_ContentDocumentDAO.delete_ContentDocument_By_Id(contentDoc);
    }
    
    @AuraEnabled
    public static void updateProject(String accountId,String projectId){
        ZEC_UserDAO.update_AccountClientOnUser(UserInfo.getUserId(),accountId,projectId);
    }
    
    @AuraEnabled
    public static List<Notes__c> getComments(String currentquestionid){
        if(String.isNotBlank(currentquestionid)){
            return ZEC_NotesDAO.getNotes_By_QuestionId(currentquestionid);
        }else{
            return null;
        }
    }
    
    @AuraEnabled
    public static List<Notes__c> getActionItemsComment(String currentactionid){
        if(String.isNotBlank(currentactionid)){
            return ZEC_NotesDAO.getNotes_By_ActionId(currentactionid);
        }else{
            return null;
        }
    }
    
    @AuraEnabled
    public static List<Notes__c> saveComment(String currentquestionid, string comments){
        system.debug('currentquestionid'+currentquestionid);   
        system.debug('comments'+comments);  
        if(String.isNotBlank(currentquestionid)){
            Notes__c notesRecord = new Notes__c();
            notesRecord.RecordTypeId = Schema.SObjectType.Notes__c.getRecordTypeInfosByDeveloperName().get('Question_Notes').getRecordTypeId();
            notesRecord.Question__c = currentquestionid;
            notesRecord.Comment__c = comments; 
            ZEC_NotesDAO.insert_notes(notesRecord);
            return ZEC_NotesDAO.getNotes_By_QuestionId(currentquestionid);
            
        }
        return null;
    }
    
    @AuraEnabled
    public static List<Notes__c> saveActionComment(String currentactionid, string comments){
        system.debug('currentactionid'+currentactionid);   
        system.debug('comments'+comments);  
        if(String.isNotBlank(currentactionid)){ 
            Notes__c notesRecord = new Notes__c();
            notesRecord.RecordTypeId = Schema.SObjectType.Notes__c.getRecordTypeInfosByDeveloperName().get('Action_Comments').getRecordTypeId();
            notesRecord.Action__c = currentactionid;
            notesRecord.Comment__c = comments; 
            ZEC_NotesDAO.insert_notes(notesRecord);
            return ZEC_NotesDAO.getNotes_By_ActionId(currentactionid);
            
        }
        return null;
    }
    
    @AuraEnabled
    public static void saveActionItemResp(String actionResponse){
        System.debug('actionResponse'+actionResponse);
        List<ActionItemResponse> responseList = (List<ActionItemResponse>)JSON.deserialize(actionResponse, List<ActionItemResponse>.class);
        List<Action_Item_Response__c> responseRecieved = new List<Action_Item_Response__c>();
        for(ActionItemResponse record : responseList){
            System.debug(record);
            if(record.fieldType == 'File Upload'){
                
            }else{
                Action_Item_Response__c rec = new Action_Item_Response__c();
                if(record.actionItemResponse!=null){
                    rec.Id = record.actionItemResponse.Id;
                }
                rec.Action_Item__c = record.actionItem.Id;
                rec.Response__c = record.response;
                responseRecieved.add(rec);
            }
        }
        
        System.debug('responseRecieved'+responseRecieved);
        if(!responseRecieved.isEmpty()){
            ZEC_ActionItemResponseDAO.upsert_ActionItems(responseRecieved);
        }
    }
    
    @AuraEnabled
    public static void saveCustomize(String questionId,String customizeData){
        Question__c record = new Question__c();
        record.Id = questionId;
        record.Customize_Detail__c = customizeData;
        ZEC_QuestionDAO.update_Question(record);
    }
    
    @AuraEnabled
    public static Question__c questionRecord(String questionId){
        return ZEC_QuestionDAO.getQuestion_By_Id(questionId);
    }

    @AuraEnabled
    public static List<ActionItemResponse> actionItemsAndResponse(String actionId){
        
        List<Id> filesId = new List<Id>();
        List<ActionItemResponse> actionItemandResponses = new List<ActionItemResponse>();
        List<Action_Item__c> actionItemsList = new List<Action_Item__c>([Select id,Details_to_capture__c,Type__c,(Select id,Response__c from Action_Item_Responses__r) from Action_Item__c where Action__c =:actionId]);
        for(Action_Item__c record : actionItemsList){
            filesId.add(record.Id);
        }
        Map<String, ContentVersion> relatedFiles = getRelatedFiles(filesId);
        System.debug('relatedFiles'+relatedFiles);
        for(Action_Item__c record : actionItemsList){
            System.debug('relatedFiles.containskey(record.Id)'+relatedFiles.containskey(record.Id));
            ActionItemResponse rec= new ActionItemResponse();
            rec.fieldName = record.Details_to_capture__c;
            rec.fieldType = record.Type__c;
            rec.contentRecId = relatedFiles.containskey(record.Id)?relatedFiles.get(record.Id).ContentDocumentId:null;
            rec.fileName = relatedFiles.containskey(record.Id)?relatedFiles.get(record.Id).Title:'';
            rec.response = !record.Action_Item_Responses__r.isEmpty()?record.Action_Item_Responses__r[0].Response__c:'';
            rec.actionItem = record;
            rec.actionItemResponse = !record.Action_Item_Responses__r.isEmpty()?record.Action_Item_Responses__r[0]:null;
            if(record.Type__c == 'File Upload'){
                rec.isUpload = true;
            }else if(record.Type__c == 'Comment'){
                rec.isComment = true;
            }
            actionItemandResponses.add(rec);
        }
        return actionItemandResponses;
    }
}