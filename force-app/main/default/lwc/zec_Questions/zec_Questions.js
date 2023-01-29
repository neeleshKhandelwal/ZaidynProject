import { LightningElement,track,api } from 'lwc';
import getQuestions from '@salesforce/apex/ZEC_ExperienceController.getQuestions';

export default class Zec_Questions extends LightningElement {
    
    error;
    @api projectId;
    //generic
    label = '';
    @track options = [];
    image = '';
    description = '';
    questionRecord ;
    @track originalList = [];
    finalAnswers = [];
    //actionItems;
    //reponseItems ;
    category = [];
    moduleList = [];
    modQuestion ;
    moduleLabel  ;
    currentModule;
    questionList = [];
    categorylist = [];
    @api currentScreen;
    showButton = false;
    @api isReadOnly = false;
    showSpinner = false;

    connectedCallback() {
        console.log('Connected')
        this.getQuestions();
    }

    @api handleOnload(currentScreen,isReadOnly){
        this.currentScreen = currentScreen;
        this.isReadOnly = isReadOnly;
        this.getQuestions();
    }


    generateQuestionList(currentModule){
        let questions = this.modQuestion;
        if(questions)
            this.questionList = questions[currentModule];
        else
            this.questionList = []; 
    }

    questionAnswerStructure(result){
        let originalList = result.Questions
        let actionItems = result.actionMap;
        let responseWithQuestions = result.QuestionWithResponses;
        

        for(let i =0 ;i<originalList.length;i++){
            let questionRecord = originalList[i]
            questionRecord['counter'] = (i+1);
            questionRecord['isRadio'] = questionRecord.Question_Type__c == 'Radio'?true:false;
            questionRecord['isMultiSelect'] = questionRecord.Question_Type__c == 'MultiSelect'?true:false;
            questionRecord['isCombo'] = questionRecord.Question_Type__c == 'Combobox'?true:false;
            questionRecord['isText'] = questionRecord.Question_Type__c == 'Text'?true:false;
            let arr = [];
            let choices = questionRecord.Question_Choices__r;
            if(choices){
                for(let i= 0; i<choices.length;i++){
                    let obj = new Object();
                    obj.label = choices[i].Name,
                    obj.value = choices[i].Id 
                    arr.push(obj) ; 
                }
            }
            questionRecord['options'] = arr;

            ////Answers array - Start
            let actionArr = [];
            let responseArr = [];
            let answerArray = responseWithQuestions.hasOwnProperty(questionRecord.Id)?responseWithQuestions[questionRecord.Id]:[];
            for(let i = 0;i <answerArray.length;i++){
                let answerCustom = new Object();
                answerCustom['answer'] = answerArray[i].Id;
                answerCustom['answerResponse'] = questionRecord.Question_Type__c == 'Text'?answerArray[i].Comment__c:answerArray[i].Question_Choice__r.Name;
                answerCustom['questionId'] = answerArray[i].Question_Choice__r.Question__c;
                answerCustom['isOther'] = answerArray[i].Question_Choice__r.Name == 'Other'?true:false;
                answerCustom['isOtherComment'] = (answerArray[i].Question_Choice__r.Name == 'Other'||answerArray[i].Question_Choice__r.Name == 'FreeText')?answerArray[i].Comment__c:'';

                if(actionItems.hasOwnProperty(answerArray[i].Question_Choice__r.Id)){
                    let items = actionItems[answerArray[i].Question_Choice__r.Id]
                    for(let i = 0;i<items.length;i++){
                        actionArr.push(items[i]);
                    }
                }
        
                if(answerCustom['isOther']){
                    questionRecord['showother'] = answerCustom['isOther'];
                    questionRecord['othercomment'] = answerCustom['isOtherComment'];
                }
                responseArr.push(answerCustom);
            }
            questionRecord['answers'] = responseArr;

            questionRecord['actionItems'] = actionArr;
            ////Answers array - End
            ////Answers Selection - Start
            if(questionRecord['isRadio']){
                questionRecord['value'] = answerArray.length>0?answerArray[0].Question_Choice__c:'';
            }
            if(questionRecord['isMultiSelect']){
                let ansArr = [];
                for(let i = 0;i <answerArray.length;i++){
                    ansArr.push(answerArray[i].Question_Choice__c);
                }
                questionRecord['value'] = ansArr;
            }
            if(questionRecord['isCombo']){
                let ansArr = [];
                for(let i = 0;i <answerArray.length;i++){
                    var answervalue = new Object();
                    answervalue.value = answerArray[i].Question_Choice__c;
                    answervalue.label = answerArray[i].Question_Choice__r.Name;
                    answervalue.selected = true
                    ansArr.push(answervalue);
                }
                questionRecord['value'] = ansArr;
            }

            if(questionRecord['isText']){
                questionRecord['value'] = answerArray.length>0?answerArray[0].Comment__c:'';
            }
            ////Answers Selection - End

        }

        return originalList;
    }

    singlePageQuestions(result){
        
        let originalList= this.questionAnswerStructure(result)
        console.log('originalList',originalList);
        this.originalList = originalList
        this.questionList = originalList;
    }

    multiPageQuestions(questions){
        let category = [];
        let module = [];
        let questionMod = new Object();
        let moduleLabel= new Object();
        let categorylabel = new Object();
        let categorylist = []
        let mod = new Object();
        console.log('multiPageQuestions questions',questions)
        for(let i = 0;i<questions.length;i++){
  
            if(questions[i].Module_Progress__r?.Module__r?.Category__c){
                if(!mod.hasOwnProperty(questions[i].Module_Progress__r.Module__r.Category__c)){
                    mod[questions[i].Module_Progress__r.Module__r.Category__c]= new Set();
                }
                mod[questions[i].Module_Progress__r.Module__r.Category__c].add(questions[i].Module_Progress__r.Module__c)


                if(!questionMod.hasOwnProperty(questions[i].Module_Progress__r.Module__c)){               
                    questionMod[questions[i].Module_Progress__r.Module__c] = [];
                }
                questionMod[questions[i].Module_Progress__r.Module__c].push(questions[i]);
                moduleLabel[questions[i].Module_Progress__r.Module__c] = questions[i].Module_Progress__r.Module__r.Name;
                categorylabel[questions[i].Module_Progress__r.Module__r.Category__c] = questions[i].Module_Progress__r.Module__r.Category__r.Name;
            }
        }
        console.log('questionMod Beofre',questionMod)
        for (var key in mod) {
            let newObj = new Object();
            newObj.label = categorylabel[key];
            newObj.name = key;
            newObj.expanded = true;
            let items = [];
            let arr = [...mod[key]]
            for(let i=0;i<arr.length;i++){
                let itemObj = new Object();
                itemObj.label = moduleLabel[arr[i]];
                itemObj.name = arr[i];
                module.push(itemObj)
                items.push(itemObj);
            }
            newObj.items = items;
            categorylist.push(key)
            category.push(newObj);
        }

        for (var key in questionMod) {
            let arr = [...questionMod[key]]
            for(let i=0;i<arr.length;i++){
                arr[i]['counter'] = (i+1);
            }
            questionMod[key] = arr;
        }
        console.log('questionMod aftewr',questionMod)
        
        this.category = category;
        this.moduleList = module;
        this.categorylist = categorylist;
        this.modQuestion = questionMod;
        this.moduleLabel = moduleLabel;

        let selectedEvent = new CustomEvent('category',  {detail: {
            category : category
        }});
        this.dispatchEvent(selectedEvent);
    }

    getQuestions(){
        this.showSpinner = true;
        getQuestions({screenId : this.currentScreen.Screen__r.Id, projectId :this.projectId})
		.then(result => {
			console.log('Configure Zaidyn result',result);
            this.showButton = result.showButton
            if(result.showButton && result.showProgress){
                let originalList = this.questionAnswerStructure(result);
                this.multiPageQuestions(originalList);          
                console.log('originalList',originalList)
                this.originalList = originalList;


                var firstModule = this.moduleList[0];
                this.currentModule = firstModule.name;
                this.generateQuestionList(this.currentModule);
                this.selectLightningTreeCZ(this.currentModule);
                this.error = undefined;
            }else{
                this.singlePageQuestions(result);
            }
            this.showSpinner = false;
		})
		.catch(error => {
            this.showSpinner = false;
			this.error = error;
		})
    }

    handleSave(event){

        let answers = this.finalAnswers;
        console.log('answers',JSON.parse(JSON.stringify(answers)));
        //console.log('reponseItems',JSON.parse(JSON.stringify(this.reponseItems)) )
        let selectedEvent = new CustomEvent('answers',  {detail: {
            answer : answers,
            reponseItems:this.reponseItems,
            module : this.currentScreen.Screen__r.Name
        }});
        this.dispatchEvent(selectedEvent);
       
    }

    handlePrevious(event){
        for(let i=0;i<this.moduleList.length;i++){
            if(this.moduleList[i].name == this.currentModule){
                if(i!=0){
                    this.currentModule = this.moduleList[i-1].name;
                    this.generateQuestionList(this.currentModule);
                    this.selectLightningTreeCZ(this.currentModule);
                }
                else{
                    console.log('NO PREVIOUS QUESTION')
                }
            }
        }
    }

    handleNext(event){

        for(let i=0;i<this.moduleList.length;i++){
            
            if(this.moduleList[i].name == this.currentModule){
                if(i!=this.moduleList.length-1){
                    this.currentModule = this.moduleList[i+1].name;
                    this.generateQuestionList(this.currentModule);
                    this.selectLightningTreeCZ(this.currentModule);
                }
                else{
                    console.log('NO NEXT QUESTION')
                }
            }
        }
        
    }

    selectLightningTreeCZ(item){
        let selectedEvent = new CustomEvent('treeitem',  {detail: {
            item : item
        }});
        this.dispatchEvent(selectedEvent);
    }


    handleChange(e) {
        this.value = e.detail.value;
    }

    handleChangeMultiSelect(event){
         this.selectedOptions = event.detail;
    }

    handlesaveAnswers(event){
        console.log('Parent Answer',event.detail.answer)
        console.log('Parent questionId',event.detail.questionId)
        console.log('Parent type',event.detail.type)
        console.log('Parent Value',event.detail.value);
        
        let answerComponent = event.detail.answer;
        let questionId = event.detail.questionId;
        let selectedValue = event.detail.value
        
        let answers = this.finalAnswers;
        let isFound = false;
        let newArray = answers.filter(function (el) {
            if(el.questionId == questionId){
                isFound = true;
                el.answer = answerComponent;
            }
            return el;
        });

        if(!isFound){
            var obj = new Object()
            obj.questionId = questionId;
            obj.answer = answerComponent;
            //obj.notesValue = event.detail.notesValue;
            obj.type = event.detail.type;
            newArray.push(obj);
        }

        console.log('finalAnswers', JSON.parse(JSON.stringify(newArray)) )
        this.finalAnswers = newArray;

        // to peserve multiple module answers when traversing from Next and Prev Button
        if(this.showButton){
            console.log('SHOW BUTTON', this.showButton);
            console.log('currentModule',this.currentModule);
            console.log('mod question',this.modQuestion);
            let questionsList = this.modQuestion[this.currentModule];
            for(let i = 0;i<questionsList.length;i++){
                if(questionsList[i].Id == questionId){
                    questionsList[i]['answers'] = answerComponent;
                    questionsList[i]['value'] = selectedValue;
                }
            }
            this.modQuestion[this.currentModule] = questionsList;
            console.log('FINAL modQuestion', JSON.parse(JSON.stringify(this.modQuestion)) )
        }
       
    }

    handleSignOff(event){
        let selectedEvent = new CustomEvent('signoff',  {detail: {
            module : this.currentScreen.Screen__r.Name
        }});
        this.dispatchEvent(selectedEvent);
    }

}