public class ZEC_QuestionBankController {
	
	public static final string TOGGLE_ICON = 'utility:chevronright';
	
	@AuraEnabled (cacheable=true)
    public static List<Module__c> getModules(){
        return [SELECT Id, Name FROM Module__c ];
    }
    @AuraEnabled (cacheable=true)
    public static List<Screen__c> getScreens(){
        return [SELECT Id, Name FROM Screen__c];
    }
    @AuraEnabled
    public static void saveQuestion(string questionLabel, string module, string questionName){
        Question_Master__c qm = new Question_Master__c();
        qm.Question_Title__c = questionLabel;
        qm.Name = questionName;
        qm.Module__c = module;
        insert qm;
    }
    @AuraEnabled
    public static List<QuestionBankWrapper> getQuestionMaster(){
        //return [select id, name, module__r.Screen__r.Name, module__r.Name, Module__r.Category__c, Question_Type__c, Question_Title__c from Question_Master__c];
		
		
        List<QuestionBankWrapper> questnBnkWrap = new List< QuestionBankWrapper >();
         
		for ( Question_Master__c qm : [select id, name, module__r.Screen__r.Name, module__r.Name, Module__r.Category__r.Name, Question_Type__c, Question_Title__c from 								Question_Master__c order by lastModifiedDate desc ] ) {
																					 
										 //QuestionBankWrapper objWrap = new QuestionBankWrapper( true, actionItem, actionItem.Contacts.size() > 0 ? true : false );
										 QuestionBankWrapper objWrap = new QuestionBankWrapper( true, false, qm, /* true , */TOGGLE_ICON);
										 questnBnkWrap.add( objWrap );
																					 
		}
        
        return questnBnkWrap;
		
    }
	public class QuestionBankWrapper {
        
        @AuraEnabled
        public Boolean hideBool;
		@AuraEnabled
        public string iconClicked;
        /* @AuraEnabled
        public Boolean contactBool; */
		@AuraEnabled
        public Boolean toogleBool;
        @AuraEnabled
        public Question_Master__c questObj;

        public QuestionBankWrapper( Boolean hideBool, Boolean toogleBool, Question_Master__c questObj, /* Boolean contactBool, */ string iconClicked ) {
            
            this.hideBool = hideBool;
            this.questObj = questObj;
            //this.contactBool = contactBool;
			this.iconClicked = iconClicked;
			this.toogleBool = toogleBool;
            
        }
        
    }
}