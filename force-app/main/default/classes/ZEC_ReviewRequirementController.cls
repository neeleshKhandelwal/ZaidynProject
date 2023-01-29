public with sharing class ZEC_ReviewRequirementController {

	public static final string TOGGLE_ICON = 'utility:chevronright';

    private static List<String> getCategoryIds(string projectId) {
        system.debug('Get Category Ids List');

        // Get the list of unique categryIds
        AggregateResult[] results = [
            SELECT Question_Choice__r.category__c FROM Question_Response__c
            WHERE Question_Choice__r.category__c != null AND project__c = :projectId
            WITH SECURITY_ENFORCED
            Group By Question_Choice__r.category__c
        ];

        List<String> categoryIds = new List<String>();

        // Convert list of aggregate results to list of strings
        for (AggregateResult result : results ) {
            categoryIds.add(String.valueOf(result.get('category__c')));
        }

        return categoryIds;
    }

    @AuraEnabled( cacheable = true )
    public static List<Map<String,String>> getCategoryNames(string projectId) {
        system.debug('Get Category Names List');

        // Get the list of unique categryIds
        AggregateResult[] results = [
            SELECT Question_Choice__r.category__r.Id, Question_Choice__r.category__r.Name FROM Question_Response__c
            WHERE Question_Choice__r.category__c != null AND project__c = :projectId
            WITH SECURITY_ENFORCED
            Group By Question_Choice__r.category__r.Id, Question_Choice__r.category__r.Name
        ];

        List<Map<String,String>> categoryNames = new List<Map<String,String>>();

        // Convert list of aggregate results to list of strings
        for (AggregateResult result : results ) {
            categoryNames.add(new Map<String,String> {
                'Id' => String.valueOf(result.get('Id')),
                'Name' => String.valueOf(result.get('Name'))
            });
        }

        // return categoryIds;
        System.debug(categoryNames);
        return categoryNames;
    }

    @AuraEnabled( cacheable = true )
    public static List<ReviewRequirementWrapper> getRecords(String projectId) {
        system.debug('get Records from Question Responses');
        List<String> categoryIds = getCategoryIds(projectId);
        List <Question_Response__c> responses = [
            SELECT
                Name,
                LastModifiedDate,
                LastModifiedBy.Name,
                Question_Choice__r.Question__r.Id,
                Question_Choice__r.category__r.Name,
                Question_Choice__r.category__r.Id,
                Question_Choice__r.BRD_rule__r.Name,
                Question_Choice__r.Sub_Category__r.Name,
                Question_Choice__r.Name
            FROM Question_Response__c
            where Question_Choice__r.category__c IN :categoryIds
            WITH SECURITY_ENFORCED
        ];

        SubRecord subRecord = new SubRecord();

        List<ReviewRequirementWrapper> reviewRequirementRecords = new List<ReviewRequirementWrapper>();
        List<CategoryRecord> categoryRecords = new List<CategoryRecord>();
        for ( Question_Response__c response: responses ) {
            subRecord = new SubRecord(
                String.valueOf(response.Question_Choice__r.Sub_Category__r.Name),
                String.valueOf(response.Question_Choice__r.BRD_rule__r.Name),
                String.valueOf(response.Question_Choice__r.Question__r.Id),
                Date.valueOf(response.LastModifiedDate),
                String.valueOf(response.lastModifiedBy.Name)
            );

            System.debug(subRecord);
            String categoryId = response.Question_Choice__r.category__r.Id;
            String categoryName = response.Question_Choice__r.category__r.Name;

            // if (!categoryRecords.isEmpty()) {
            //     for (CategoryRecord rec : categoryRecords) {
            //         if (rec.categoryId.equals(categoryId)) {
            //             rec.subRecords.add(subRecord);
            //             break;
            //         }
            //     }
            // } else {
            //     categoryRecords.add();
            // }

            if (!reviewRequirementRecords.isEmpty()) {
                Boolean found = false;
                for (ReviewRequirementWrapper r : reviewRequirementRecords) {
                    if (r.record.categoryId.equals(categoryId)) {
                        r.record.subRecords.add(subRecord);
                        found = true;
                        break;
                    }
                }
                if (found == false) {
                    reviewRequirementRecords.add(
                        new ReviewRequirementWrapper(true, TOGGLE_ICON, false, new CategoryRecord(categoryId, categoryName, new List<SubRecord> {subRecord})));

                }
            } else {
                reviewRequirementRecords.add(
                    new ReviewRequirementWrapper(true, TOGGLE_ICON, false, new CategoryRecord(categoryId, categoryName, new List<SubRecord> {subRecord})));
            }
        }
        System.debug(reviewRequirementRecords);
        return reviewRequirementRecords;
    }


    public class ReviewRequirementWrapper {

        @AuraEnabled
        public Boolean hideBool;
		@AuraEnabled
        public String iconClicked;
        @AuraEnabled
        public Boolean toggleBool;
        @AuraEnabled
        public CategoryRecord record;

        public ReviewRequirementWrapper() {}

        public ReviewRequirementWrapper(Boolean hideBool, String iconClicked, Boolean toggleBool, CategoryRecord record)
        {
            this.hideBool = hideBool;
            this.record = record;
			this.iconClicked = iconClicked;
			this.toggleBool = toggleBool;
        }
    }

    public class CategoryRecord {
        @AuraEnabled
        public String categoryId;
        @AuraEnabled
        public String categoryName;
        @AuraEnabled
        public List<SubRecord> subRecords;

        public CategoryRecord() {}

        public CategoryRecord(String categoryId, String categoryName, List<SubRecord> subRecords) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.subRecords = subRecords;
        }
    }

    public class SubRecord {
        @AuraEnabled
        public String subCategory;
        @AuraEnabled
        public String brdRule;
        @AuraEnabled
        public String questionId;
        @AuraEnabled
        public Date lastModifiedByDate;
        @AuraEnabled
        public String lastModifiedByName;

        public SubRecord() {}

        public SubRecord(String subCategory, String brdRule, String questionId, Date lastModifiedByDate, string lastModifiedByName) {
            this.subCategory = subCategory;
            this.brdRule = brdRule;
            this.questionId = questionId;
            this.lastModifiedByDate = lastModifiedByDate;
            this.lastModifiedByName = lastModifiedByName;
        }
    }
}