public class ZEC_AccountDAO {

    public static List<Account> getAllAccounts(){
        return [Select id,name,Logo__c from Account];
    }
}