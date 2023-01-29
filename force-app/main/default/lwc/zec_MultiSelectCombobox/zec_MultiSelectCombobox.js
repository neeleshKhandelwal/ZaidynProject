import { api, LightningElement, track } from 'lwc';

export default class Zec_MultiSelectCombobox extends LightningElement {
  @api disabled = false;
  @api label = '';
  @api name;
  @api options = [];
  @api placeholder = 'Select an Option';
  @api required = false;
  @api singleSelect = false;
  @api showPills = false;
  @track currentOptions = [];
  @api comboboxDesc ;
  @api comboboxImage;
  @api selectedItems = [];
  @track selectedOptions =[];
  @api apiSelectedOptions ;
  @api otherField;
  isInitialized = false;
  isLoaded = false;
  isVisible = false;
  isDisabled = false;
  openNotes = false;
  @api showOther = false;
  @track answers = [];
  @api questionRecord;
  @api counter;
  @track items=[];
  @api apiitems = [];
  currentquestionid;
  previewImage = false;
  @api showCustomize = false;
  @api isReadOnly = false;



  get showitems(){
    if(this.items && this.items.length>0){
        return true;
    }
    return false;
  }

  
  
  connectedCallback() {
    this.selectedOptions = this.apiSelectedOptions
    this.items = this.apiitems;
    console.log('selectedOptions connectedCallback',JSON.parse(JSON.stringify(this.selectedOptions)) )
    this.isDisabled = this.disabled || this.isReadOnly;
    this.hasPillsEnabled = this.showPills && !this.singleSelect;
    if(this.questionRecord && this.questionRecord.Customize_Detail__c){
      this.showCustomize = true;
    }
  }
  renderedCallback() {
    if (!this.isInitialized) {

      let selectedArr = [];
      for(let i=0;i<this.selectedOptions.length;i++){
        selectedArr.push(this.selectedOptions[i].value)
      }

      let options = JSON.parse(JSON.stringify(this.options)) ;
      for(let i =0 ;i<options.length;i++){
        if(selectedArr.includes(options[i].value))
          options[i].selected = true;
        else
          options[i].selected = false;
      }
      
      this.options = options;
      this.currentOptions = JSON.parse(JSON.stringify(this.options));
      console.log('selectedArr', JSON.parse(JSON.stringify(selectedArr)), JSON.parse(JSON.stringify(options))  )

      this.template.querySelector('.multi-select-combobox__input').addEventListener('click', (event) => {
        console.log('Inside listnere')
        this.handleClick(event.target);
        event.stopPropagation();
      });
      this.template.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      document.addEventListener('click', () => {
        this.close();
      });
      this.isInitialized = true;
      this.setSelection(true);
    }
  }
  handleChange(event) {
    this.change(event);
  }
  handleRemove(event) {
    if(this.isReadOnly){
      return;
    }
    this.selectedOptions.splice(event.detail.index, 1);
    this.change(event);
  }
  handleClick() {
    // initialize picklist options on first click to make them editable
    if (this.isLoaded === false) {
      
      this.currentOptions = JSON.parse(JSON.stringify(this.options));
      console.log('this.currentOptions onload',this.currentOptions)
      this.isLoaded = true;
    }
    if (this.template.querySelector('.slds-is-open')) {
      this.close();
    } else {
      this.template.querySelectorAll('.multi-select-combobox__dropdown').forEach((node) => {
        node.classList.add('slds-is-open');
      });
    }
  }
  change(event) {
    // remove previous selection for single select picklist
    if (this.singleSelect) {
      this.currentOptions.forEach((item) => (item.selected = false));
    }
    // set selected items
    this.currentOptions
      .filter((item) => item.value === event.detail.item.value)
      .forEach((item) => (item.selected = event.detail.selected));
    this.setSelection(false);
    const selection = this.getSelectedItems();
    
    // Option Field logic Start
    /*let isOptionValue = this.isOption();
    if(isOptionValue && isOptionValue.length>0 ){

      let isOptionVal = selection.filter(function (el) {
        return el.value == isOptionValue[0].value;
      });
      if(isOptionVal && isOptionVal.length>0){
          this.showOther = true;
      }else{
          this.showOther = false;
          this.otherField = '';
      }
    }else{
      this.showOther = false
    }*/
    // Option Field logic End
    

    this.updateAnswerToParent();

    this.dispatchEvent(new CustomEvent('change', { detail: this.singleSelect ? selection[0] : selection }));

    // for single select picklist close dropdown after selection is made
    if (this.singleSelect) {
      this.close();
    }
  }

  isOption(){
      console.log('This Option',JSON.stringify(this.selectedOptions) )
      let newArray = this.selectedOptions.filter(function (el) {
          return el.label == 'Other';
      });
     
      return newArray;
  }

  close() {
    this.template.querySelectorAll('.multi-select-combobox__dropdown').forEach((node) => {
      node.classList.remove('slds-is-open');
    });
    this.dispatchEvent(new CustomEvent('close'));
  }
  setSelection(isInitialized) {
    const selectedItems = this.getSelectedItems();
    let selection = '';
    console.log('selectedItems',selectedItems,selectedItems.length)
    if (selectedItems.length < 1) {
      selection = this.placeholder;
      this.selectedOptions = [];
    } else if (selectedItems.length > 2) {
      selection = `${selectedItems.length} Options Selected`;
      this.selectedOptions = this.getSelectedItems();
    } else {
      selection = selectedItems.map((selected) => selected.label).join(', ');
      this.selectedOptions = this.getSelectedItems();
    }
    this.selectedItems = selection;
    this.isVisible = this.selectedOptions && this.selectedOptions.length > 0;
  }

  getSelectedItems() {
    return this.currentOptions.filter((item) => item.selected);
  }


  handleNotes(event){
      console.log('handleNotes');
      this.openNotes = true;
      this.currentquestionid = this.questionRecord.Id;
      console.log('multiSelect.questionRecord.Id ', this.questionRecord.Id);
  }

  handleCloseNotes(event){
    this.openNotes = false;
    
  }
  
  handleOtherField(event){
    this.otherField = event.detail.value;
  }
  

  updateAnswerToParent(){
    console.log('this.selectedOptions',JSON.parse(JSON.stringify(this.selectedOptions)) )
    let answersList = [];
    
    for( let i = 0 ;i <this.selectedOptions.length;i++){
        var answer = new Object();
        answer['answer'] = this.selectedOptions[i].value;
        answer['answerResponse'] = this.valueLabel(this.selectedOptions[i].value)[0].label;
        answer['questionId'] = this.questionRecord.Id;
        answer['isOther'] = this.showOther;
        answer['isOtherComment'] = this.otherField;
        answersList.push(answer);
    }
    console.log('answersList',answersList)
     this.answers = answersList;

    let selectedEvent = new CustomEvent('answers',  {detail: {
        answer : answersList, 
        questionId : this.questionRecord.Id,
        type : 'multiSelectCombobox', 
        value: this.selectedOptions
    }});
    this.dispatchEvent(selectedEvent);
  }

  valueLabel(value){
    console.log('This Option',JSON.parse(JSON.stringify(this.options)) )
    let newArray = this.currentOptions.filter(function (el) {
        return el.value == value;
    });
    return newArray;
  }
  handleBlur(event){
    this.updateAnswerToParent();
  }
  openImage(event){
    this.previewImage = true;
  }

  handleCloseImage(event){
    this.previewImage = false;
  }
  handleCustomize(event){
    this.showCustomize = true;
  }

  closeCustomize(event){
    this.showCustomize = false;
  }
}