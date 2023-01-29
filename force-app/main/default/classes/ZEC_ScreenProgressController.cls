public with sharing class ZEC_ScreenProgressController {
    public ZEC_ScreenProgressController() {

    }

    @AuraEnabled
    public static Map<String, Object> getScreenProgressData(String projectId){
        System.debug('projectId'+projectId);
        List<Screen_Progress__c> listOfScreens = getScreens(projectId);
        Screen_Progress__c currentScreen;
        Integer count= 0;
        for(Screen_Progress__c screen : listOfScreens){
            if(screen.Status__c == 'In Progress' && screen.Show_Summary__c){
                currentScreen = screen;
                break;
            }
            else if(screen.Status__c == 'Not-Started' && screen.Show_Summary__c){
                currentScreen = screen;
                break;
            }
            else if(screen.Status__c == 'Completed' && screen.Show_Summary__c){
                count +=1;
            }
        }

        if(currentScreen == null){
            currentScreen = listOfScreens[count - 1];
        }

        Map<String, Object> mapOfData = new Map<String, Object>();
        mapOfData.put('currentScreen', currentScreen);
        mapOfData.put('moduleTree', moduleTree(listOfScreens));
        mapOfData.put('screenProgress',screenProgress(projectId, currentScreen.Name));
        mapOfData.put('getAlerts',getAlerts(projectId, currentScreen.Name));
        mapOfData.put('getRecentAnsweredQuestions',getRecentAnsweredQuestions(projectId, currentScreen.Name));
        return mapOfData;
    } 
    
    @AuraEnabled
    public static List<moduleProgressTreeData> moduleTreeComponent(String projectId){
        return moduleTree(getScreens(projectId));
    }
    
    public static List<moduleProgressTreeData> moduleTree(List<Screen_Progress__c> screens){
        List<moduleProgressTreeData> moduleProgress =  new List<moduleProgressTreeData>();
        for(Screen_Progress__c rec : screens){
            moduleProgressTreeData record = new moduleProgressTreeData();
            record.stepName = 'Step '+rec.Screen_Order__c;
            record.screenName = rec.Name;
            if(rec.Status__c == 'In Progress'){
                record.activeStep = 'active-step';
            }
            if(rec.Status__c == 'Completed'){
                record.stepCompleted = 'success';
            }
            if(rec.Show_Module_Progress__c){
                record.showModuleProgress = true;
            }
            record.screenProgress = rec;
            moduleProgress.add(Record);
        }
        return moduleProgress;
    }
    
    public class moduleProgressTreeData{
        @AuraEnabled public String stepName;
        @AuraEnabled public String screenName;
        @AuraEnabled public String activeStep = '';
        @AuraEnabled public String stepCompleted = '';
        @AuraEnabled public boolean showModuleProgress = false;
        @AuraEnabled public Screen_Progress__c screenProgress ;
    }

    @AuraEnabled
    public static List<Screen_Progress__c> getScreens(String projectId){
        if(projectId == null) { projectId ='a012w00000yncTfAAI'; }
        return ZEC_ScreenProgressDAO.getScreensByProject(projectId);
    }

    @AuraEnabled
    public static List<Screen_Progress__c> updateStatus(String screenProgressJSON){
        Screen_Progress__c screenProgressRecord = (Screen_Progress__c)JSON.deserialize(screenProgressJSON, Screen_Progress__c.class);
        List<Screen_Progress__c> listOfScreenProgress = ZEC_ScreenProgressDAO.upsertRecord(new List<Screen_Progress__c>{screenProgressRecord});
        return getScreens(null);
    }
    
    @AuraEnabled
    public static ProgressRateWrapper screenProgress(String projectId, String screenName){
        List<Question__c> questions = new List<Question__c>();
        questions = [SELECT Id, Description__c, Name, Module_Progress__c,Module_Progress__r.Module__r.Name, Is_Active__c, Question_Number__c, Question_Title__c, Question_Type__c, Image__c,
                (SELECT Id, Question__c, Global_Parameter__c, Default__c, Description__c, Name from Question_Choices__r)
                FROM Question__c where Module_Progress__r.Screen_Progress__r.Screen__r.Name=:screenName and Is_Active__c = true and Module_Progress__r.Screen_Progress__r.Project__c =:projectId order by question_Number__C];
        List<AggregateResult> responses = [SELECT Question__c FROM Question_Response__c where Question__c in:questions group by Question__c ];

        ProgressRateWrapper record = new ProgressRateWrapper();
        record.NumberOfQuestions = questions.Size();
        record.NumberOfResponses = responses.Size();
        record.CompletionRate = questions.Size()>0?((responses.Size()*100)/questions.Size()):0;
       
        return record;
    }

    public static List<Action_Item__c> getAlerts(String projectId, String screenName){
        return ZEC_ActionItemDAO.getActionItemsByScreen(projectId, screenName);
    }

    public static List<RecentlyAnsweredQuestionWrapper> getRecentAnsweredQuestions(String projectId, String screenName){
        List<Question_Response__c> listOfQuestionResponses = ZEC_QuestionResponseDAO.getQuestionResponseByScreen(projectId, screenName, 5);

        Map<Id, List<Question_Response__c>> mapOfQuestionResponse = new Map<Id, List<Question_Response__c>>();
        for(Question_Response__c questionResponse : listOfQuestionResponses){
            If(mapOfQuestionResponse.containsKey(questionResponse.Question__c)){
                List<Question_Response__c> listOfQuestionResponse = (List<Question_Response__c>)mapOfQuestionResponse.get(questionResponse.Question__c);
                listOfQuestionResponse.add(questionResponse);
            }
            else{
                mapOfQuestionResponse.put(questionResponse.Question__c, new List<Question_Response__c>{questionResponse});
            }
        }

        List<RecentlyAnsweredQuestionWrapper> listOfRecentlyAnsweredQuestion = new List<RecentlyAnsweredQuestionWrapper>();
        for(Id questionId : mapOfQuestionResponse.keySet()){
            List<Question_Response__c> listOfQuestionResponse = mapOfQuestionResponse.get(questionId);
            RecentlyAnsweredQuestionWrapper recentAnsweredRecord = new RecentlyAnsweredQuestionWrapper();
            recentAnsweredRecord.questionId = questionId;
            List<String> listOfAnswers = new List<String>();
            for(Question_Response__c questionResponse : listOfQuestionResponse){
                listOfAnswers.add(questionResponse.Question_Choice__r.Name);
                recentAnsweredRecord.question = questionResponse.Question__r.Question_Title__c;
            }
            recentAnsweredRecord.answer = String.join(listOfAnswers, ',');
            listOfRecentlyAnsweredQuestion.add(recentAnsweredRecord);
        }
        return listOfRecentlyAnsweredQuestion;
    }

    public class RecentlyAnsweredQuestionWrapper{
        @AuraEnabled public Id questionId { get; set; }
        @AuraEnabled public String question { get; set; }
        @AuraEnabled public String answer { get; set; }
    }
    
    public class ProgressRateWrapper{
        @AuraEnabled public Integer NumberOfQuestions { get; set; }
        @AuraEnabled public Integer NumberOfResponses { get; set; }
        @AuraEnabled public Decimal CompletionRate { get; set; }
    }
}