import { api, LightningElement } from 'lwc';

export default class Zec_ZdmConfiguration extends LightningElement {

  @api projectId = "";

  connectedCallback() {
    console.log("In zdm config component");
  }

}