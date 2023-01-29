public class ZEC_ContentDocumentLinkDAO {

    public static List<ContentDocumentLink> getCDL_By_LinkedEntityId(List<id> parentIds){
        return [Select Id, ContentDocumentId, LinkedEntityId From ContentDocumentLink Where LinkedEntityId IN :parentIds];
    }
}