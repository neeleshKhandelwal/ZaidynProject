public class ZEC_ClientOnboardingController {
public ZEC_ClientOnboardingController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<SObJectResult> getResults(String ObjectName, String fieldName, String value, List<String> selectedRecId) {
        List<SObJectResult> sObjectResultList = new List<SObJectResult>();
        system.debug(fieldName+'-------------'+ObjectName+'---++----------'+value+'====='+selectedRecId);
        if(selectedRecId == null)
            selectedRecId = new List<String>();

        if(String.isNotEmpty(value)) {
            String query = 'Select Id,'+fieldName+' FROM '+ObjectName+' WHERE '+fieldName+' LIKE \'%' + value.trim() + '%\' and ID NOT IN: selectedRecId';
            system.debug(query);
            for(sObject so : Database.Query(query)) {
                String fieldvalue = (String)so.get(fieldName);
                sObjectResultList.add(new SObjectResult(fieldvalue, so.Id));
            }
        }
        return sObjectResultList;
    }
    
    public class SObjectResult {
        @AuraEnabled
        public String recName;
        @AuraEnabled
        public Id recId;
        
        public SObJectResult(String recNameTemp, Id recIdTemp) {
            recName = recNameTemp;
            recId = recIdTemp;
        }
        public SObJectResult() {
          
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<sObject> getModules(){
        try {
            List<sObject> m_Types = new List<sObject>();
             
            m_Types = [Select id, Name from Module__c]; 
             
            return m_Types;
        } catch (Exception e) {
            System.debug('Exception: '+e.getMessage());
            return null;
        }
    }
	@AuraEnabled
    public static List<ProjectWrapper> deleteProject(string projectId){
		delete [SELECT id from Project_User__c where Project__c =:projectId];
		delete [SELECT id from Project_Module__c where Project__c =:projectId];
		delete [SELECT id from Project__c where id =:projectId];
		return retrieveAccounts();
	}
	@AuraEnabled
    public static List<Project__c> showProject(string projectId){
		List<Project__c> projList = [SELECT id, Name,LastModifiedDate, LastModifiedBy.Name, Client__r.Name,(select id, Module__r.Name from Project_Module__r),(select id, User__r.Id,User__r.Name from Project_User__r) from Project__c where id=:projectId];
		return projList;
	}
	@AuraEnabled
    public static void updateProject(string projectName, List<string> modules,string users, string projectId){
		delete [SELECT id from Project_User__c where Project__c =:projectId];
		delete [SELECT id from Project_Module__c where Project__c =:projectId];
       List<object> userMap = (List<object>)JSON.deserializeUntyped(users);
	   List<Project_Module__c> pmList = new List<Project_Module__c>();
		List<Module__c> mList = [Select id, Name from Module__c where id IN : modules]; 
		for(Module__c m : mList){
			Project_Module__c pm = new Project_Module__c();
			pm.Module__c = m.Id;
			pm.Name = m.Name;
			pm.Project__c = projectId;
			pmList.add(pm);
		}
		
	   List<Project_User__c> puList =  new List<Project_User__c>();
	   for(object o : userMap){
            Map<string, object> newUserMap = new Map<string,object>();
            newUserMap=(Map<string,object>)o;
			Project_User__c pu =  new Project_User__c();
			pu.User__c = (String)newUserMap.get('recId');
			pu.Project__c = projectId;
			pu.Name = (String)newUserMap.get('recName');
			puList.add(pu);
		}
		insert pmList;
		insert puList;
    }
	
	@AuraEnabled
    public static void saveProject(string clientId, string projectName, List<string> modules, string users, string competitorBrand,string focusedHco, string focusedHcp, string clientBrand, string fileRecordId){
		
        List<object> userMap = (List<object>)JSON.deserializeUntyped(users);
		
        
        Project__c pr = new Project__c();
		pr.Client__c = clientId; // accountId
		pr.Name = projectName;
		pr.Competitor_brands__c = competitorBrand;
		pr.Focused_HCO__c = focusedHco;
		pr.Focused_HCP__c = focusedHcp;
		pr.Client_brands__c = clientBrand;
		pr.Logo__c = fileRecordId;
        system.debug('modules'+modules);
        system.debug('users'+users);
		insert pr;
        
        
        List<Screen__c> screenList = [Select Id, Name, Get_Sign_Off__c, Show_Summary__c, Screen_Order__c from Screen__c];
        List<Screen_Progress__c> screenProgressList = createScreenProgress(screenList, pr);
        insert screenProgressList;
        Map<Id, Screen_Progress__c> screenProgressMap = new Map<Id, Screen_Progress__c>();
        for(Screen_Progress__c screenProgress : screenProgressList){
            screenProgressMap.put(screenProgress.Screen__c, screenProgress);
        }
        List<Module__c> moduleList = [Select id, Name, Screen__c from Module__c where id IN : modules];
        List<Module_Progress__c> moduleProgressList = createModuleProgress(moduleList, screenProgressMap);
        insert moduleProgressList;
		// creating Project_modules for each selected modules
		/*List<Project_Module__c> pmList = new List<Project_Module__c>();
		List<Module__c> mList = [Select id, Name, Screen__c from Module__c where id IN : modules]; 
        
        
		for(Module__c m : mList){
			Project_Module__c pm = new Project_Module__c();
			pm.Module__c = m.Id;
			pm.Name = m.Name;
			pm.Project__c = pr.Id;
			pmList.add(pm);
		}*/
		//creating Project_User__c for each selected users
		List<Project_User__c> puList =  new List<Project_User__c>();
		for(object o : userMap){
            Map<string, object> newUserMap = new Map<string,object>();
            newUserMap=(Map<string,object>)o;
			Project_User__c pu =  new Project_User__c();
			pu.User__c = (String)newUserMap.get('recId');
			pu.Project__c = pr.Id;
			pu.Name = (String)newUserMap.get('recName');
			puList.add(pu);
		}
       
		//insert pmList;
		insert puList;
		
    }
    
    private static List<Screen_Progress__c> createScreenProgress(List<Screen__c> screenList, Project__c projectRecord){
        List<Screen_Progress__c> screenProgressList = new List<Screen_Progress__c>();
        for(Screen__c screen : screenList){
            Screen_Progress__c screenProgress = new Screen_Progress__c();
            screenProgress.Name = screen.Name;
            screenProgress.Get_Sign_Off__c = screen.Get_Sign_Off__c;
            screenProgress.Show_Summary__c = screen.Show_Summary__c;
            screenProgress.Screen_Order__c = screen.Screen_Order__c;
            screenProgress.Screen__c = screen.Id;
            screenProgress.Account__c = projectRecord.Client__c;
            screenProgress.Project__c = projectRecord.Id;
            screenProgressList.add(screenProgress);
        }
        return screenProgressList;
    }
    
    private static List<Module_Progress__c> createModuleProgress(List<Module__c> moduleList, Map<Id, Screen_Progress__c> screenProgressMap){
        List<Module_Progress__c> moduleProgressList = new List<Module_Progress__c>();
        for(Module__c module : moduleList){
            Module_Progress__c moduleProgress = new Module_Progress__c();
            moduleProgress.Name = module.Name;
            moduleProgress.Screen_Progress__c = screenProgressMap.get(module.Screen__c).Id;
            moduleProgressList.add(moduleProgress);
        }
        return moduleProgressList;
    }
    
    @AuraEnabled (cacheable=true)
    public static List<ProjectWrapper> retrieveAccounts(){
        List<ProjectWrapper> prWrapperList = new List<ProjectWrapper>();
		List<Project__c> projList = [SELECT id, Name,LastModifiedDate, LastModifiedBy.Name, Client__r.Name,(select id, Module__r.Name from Project_Module__r),(select id, User__r.Id,User__r.Name from Project_User__r) from Project__c order by LastModifiedDate desc];
		ProjectWrapper prWrap;
		Map<Id,List<Project_User__c>> projUserMap = new Map<Id,List<Project_User__c>>();
		for(Project__c p: projList){
			List<Project_User__c> prjUser = new List<Project_User__c>();
			for(Project_User__c pu: p.Project_User__r){
				prjUser.add(pu);
				projUserMap.put(p.id,prjUser);
			}
		}
		for(Project__c p: projList){
			prWrap = new ProjectWrapper();
			List<string> prjMod = new List<String>();
			List<string> prjUser = new List<String>();
			for(Project_Module__c pm : p.Project_Module__r){
				if(!prjMod.contains(pm.Module__r.Name)){
					prjMod.add(pm.Module__r.Name);
				}
			}
			for(Project_User__c pu: p.Project_User__r){
				if(!prjUser.contains(pu.User__r.Name)){
					prjUser.add(pu.User__r.Name);
				}
			}
			string prModule = string.join(prjMod,',');
			string prUser = string.join(prjUser,',');
			//String myDate = p.LastModifiedDate.format('d MMM yyyy hh:mm aaa'); 
			//string lastModifiedColumn = myDate + ' by '+ p.LastModifiedBy.Name;
			prWrap.prModuleList = prjMod; 
			prWrap.usersList = projUserMap.get(p.Id); 
			prWrap.projectName = p.Name; 
            prWrap.prId = p.Id;
            prWrap.clientName = p.Client__r.Name;
            prWrap.modules = prModule;
            prWrap.users = prUser;
            //prWrap.lastModified = lastModifiedColumn;
            prWrap.lastModifiedDate = p.LastModifiedDate;
            prWrap.lastModifiedName = p.LastModifiedBy.Name;
			prWrapperList.add(prWrap);
		}
        return prWrapperList;
    }
    public class ProjectWrapper {
        @AuraEnabled
        public String projectName;
        @AuraEnabled
        public Id prId;
		@AuraEnabled
        public String clientName;
        @AuraEnabled
        public String modules;
		@AuraEnabled
        public List<String> prModuleList;
		@AuraEnabled
        public String users;
		@AuraEnabled
        public List<Project_User__c> usersList;
		@AuraEnabled
        public DateTime lastModifiedDate;
        @AuraEnabled
        public String lastModifiedName;
        
       
        public ProjectWrapper() {
          
        }
    }

}