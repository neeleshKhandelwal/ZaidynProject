import { api, LightningElement } from 'lwc';
import getQuestionNotes from '@salesforce/apex/ZEC_QuestionNotesController.getQuestionNotes';

export default class Zec_QuestionNotes extends LightningElement {

  @api projectId = "";
  questionNotes = [];
  error;

  connectedCallback() {
    console.log("In question notes component");
    this.getQuestionNotesList();
    console.log("QuestionNotes", this.questionNotes);
  }

  getQuestionNotesList() {
    console.log('projectId', this.projectId);
    getQuestionNotes({projectId: this.projectId})
      .then((data) => {
        console.log('data', data);
        this.questionNotes = data;

        console.log(this.questionNotes);
      })
      .catch((error) => {
        console.debug(error);
        this.error = error;
      });
  }

  downloadTable() {

  }

}