public class ZEC_UserDAO {

    public static List<User> getUsers_By_Id(String userId){
        return [Select id,Client__c,Project__c from User where id=:userId];
    }
    
    public static void update_AccountClientOnUser(String userId,String accountId,String projectId){
        User userRecord = new User();
        userRecord.Id = userId;
        userRecord.Client__c = accountId;
        userRecord.Project__c = projectId;
        update userRecord;
    }
}