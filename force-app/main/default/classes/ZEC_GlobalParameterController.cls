public class ZEC_GlobalParameterController {
	@AuraEnabled
    public static void insertGP(String jsonOfListOfGP) {
        List<Account> listOfAccounts = (List<Account>) JSON.deserialize(jsonOfListOfGP, List<Account>.class);
        insert listOfAccounts;
    }
}