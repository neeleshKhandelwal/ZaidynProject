public class ZEC_ContentDocumentDAO {

    public static void delete_ContentDocument_By_Id(String contentDocId){
        Delete [select id from ContentDocument where id =: contentDocId];
    }
}