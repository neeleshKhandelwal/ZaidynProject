import { LightningElement,api } from 'lwc';
export default class Zec_PreviewImage extends LightningElement {

    @api image;

    hideModalBox(event){
        this.dispatchEvent(new CustomEvent('closeimage'));
    }
}