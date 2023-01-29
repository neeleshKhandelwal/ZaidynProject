public with sharing class ZEC_ActionItemController {
	
	//public static final string BRD_RULE_TYPE = 'Rule Category';
	public static final string TOGGLE_ICON = 'utility:chevronright';
    
	@AuraEnabled( cacheable = true )
    public static List<ActionItemWrapper> fetchActionItems(string projectId) {
        system.debug('projectId '+projectId);
        List< ActionItemWrapper > actionItemWrap = new List< ActionItemWrapper >();
         
		for ( Action_Item__c actionItem : [ SELECT Id, OwnerId, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, 
									   SystemModstamp, LastActivityDate, Contact__c,Action__c,Action__r.Project__c, Details_to_capture__c, ETA__c, Response__c, 
									   Status__c,Contact__r.Name,Criticality__c,Action__r.Question_Choice__r.Question__r.Module_Progress__r.Module__r.Name,(SELECT Id, OwnerId, IsDeleted, Name, CreatedDate, CreatedById, CreatedBy.Name, LastModifiedDate, LastModifiedById, SystemModstamp, Action_Item__c, ETA__c, Status__c, Comments__c, Response__c 
										FROM Action_Item_Responses__r) FROM Action_Item__c WHERE Action__r.Project__c =:projectId AND Name != NULL ] ) {
																					 
										 //ActionItemWrapper objWrap = new ActionItemWrapper( true, actionItem, actionItem.Contacts.size() > 0 ? true : false );
										 ActionItemWrapper objWrap = new ActionItemWrapper( true, false, actionItem, true ,TOGGLE_ICON);
										 actionItemWrap.add( objWrap );
																					 
		}
        
        return actionItemWrap;
        
    }
    @AuraEnabled( cacheable = true )
    public static List<Contact> getContacts(string projectId) {
		Set<Id> conIds = new Set<Id>();
		List<Contact> conList = new List<Contact>();
		if(projectId != null && projectId != ''){
			for(Action_Item__c objAct :[SELECT id, Contact__c from Action_Item__c WHERE Action__r.Project__c =:projectId AND Contact__c != null]){
				conIds.add(objAct.Contact__c);
			}
		}
		if(!conIds.isEmpty()){
			conList = [SELECT Id, Name from Contact where Id IN: conIds];
		}
        
		return conList;
    }
    @AuraEnabled( cacheable = true )
    public static List<AggregateResult> getBrdRules(string projectId) {
        system.debug('getBRD_Ruless');
        
        
        AggregateResult[] brdList = [SELECT count(Id),Module_Progress__r.Module__r.name FROM Question__c where /*Project__c =: projectId and*/ RecordType.name = 'Module' group by Module_Progress__r.Module__r.name];
        system.debug('brdList'+brdList.size());
        return brdList;
        
    }
	
	@AuraEnabled
    public static List<ActionItemWrapper> updateActionItemRec(string recordId, string newAssignee) {
		Action_Item__c actItm = [Select id, Contact__c,Action__r.Project__c from Action_Item__c where id =:recordId];
		actItm.Contact__c = newAssignee;
		system.debug('recordId '+recordId +'==> + ' +' newAssignee '+newAssignee);
		system.debug('actItm '+actItm);
		update actItm;
		
		 
		return fetchActionItems(actItm.Action__r.Project__c);
		
	}
	@AuraEnabled
    public static List<ActionItemWrapper> createContact(string projectId, string firstNameVal,string lastNameVal,string recordId) {
		String accId = [SELECT Client__c from project__c where id=:projectId ].Client__c;
		
		Contact con =  new Contact();
		con.FirstName = firstNameVal;
		con.LastName = lastNameVal;
		con.AccountId = accId;
		insert con;
		
		return updateActionItemRec(recordId,con.Id);
	}
	
    @AuraEnabled
    public static List<ActionItemWrapper> createActionItemResp(string projectId, string inputCommentVal,string recordId) {
		String accId = [SELECT Client__c from project__c where id=:projectId ].Client__c;
		
		Action_Item_Response__c actnItemResp =  new Action_Item_Response__c();
		actnItemResp.Action_Item__c = recordId;
		actnItemResp.Comments__c = inputCommentVal;
		
		insert actnItemResp;
		
		return fetchActionItems(projectId);
	}
	
    
    
    public class ActionItemWrapper {
        
        @AuraEnabled
        public Boolean hideBool;
		@AuraEnabled
        public string iconClicked;
        @AuraEnabled
        public Boolean contactBool;
		@AuraEnabled
        public Boolean toogleBool;
        @AuraEnabled
        public Action_Item__c actionItemObj;

        public ActionItemWrapper( Boolean hideBool, Boolean toogleBool, Action_Item__c actionItemObj, Boolean contactBool, string iconClicked ) {
            
            this.hideBool = hideBool;
            this.actionItemObj = actionItemObj;
            this.contactBool = contactBool;
			this.iconClicked = iconClicked;
			this.toogleBool = toogleBool;
            
        }
        
    }
}