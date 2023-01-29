public class ZEC_ContentversionDAO {

    public static List<ContentVersion> getContentVersion_By_ContentDocumentId_ActionItem(List<String> contentDocumentids){
        return [SELECT Id, Title, VersionData, ContentDocumentId,Action_Item_fileupload__c 
                FROM ContentVersion 
                WHERE ContentDocumentId IN :contentDocumentids AND IsLatest = True and Action_Item_fileupload__c!=null];
    }
}