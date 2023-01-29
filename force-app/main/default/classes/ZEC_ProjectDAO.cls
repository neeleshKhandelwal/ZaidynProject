public class ZEC_ProjectDAO {

    public static List<Project__c> getProject_By_Client(String accountId){
        return [Select id,name from Project__c where Client__c=:accountId];
    }
}