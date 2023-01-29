import { LightningElement, track} from 'lwc';
import insertGP from '@salesforce/apex/ZEC_GlobalParameterController.insertGP'
import {ShowToastEvent} from "lightning/platformShowToastEvent";

export default class Zec_GlobalParameter extends LightningElement {
    @track listOfGP;

    connectedCallback() {
        this.initData();
    }

    initData() {
        let listOfGP = [];
        this.createRow(listOfGP);
        this.listOfGP = listOfGP;
    }

    createRow(listOfGP) {
        let gpObject = {};
        if(listOfGP.length > 0) {
            gpObject.index = listOfGP[listOfGP.length - 1].index + 1;
        } else {
            gpObject.index = 1;
        }
        gpObject.GPName = null;
        gpObject.GPType = null;
        gpObject.GPValue = null;
        listOfGP.push(gpObject);
    }

    /**
     * Adds a new row
     */
    addNewRow() {
        this.createRow(this.listOfGP);
    }

    /**
     * Removes the selected row
     */
    removeRow(event) {
        let toBeDeletedRowIndex = event.target.name;

        let listOfGP = [];
        for(let i = 0; i < this.listOfGP.length; i++) {
            let tempRecord = Object.assign({}, this.listOfGP[i]); //cloning object
            if(tempRecord.index !== toBeDeletedRowIndex) {
                listOfGP.push(tempRecord);
            }
        }

        for(let i = 0; i < listOfGP.length; i++) {
            listOfGP[i].index = i + 1;
        }

        this.listOfGP = listOfGP;
    }

    /**
     * Removes all rows
     */
    removeAllRows() {
        let listOfGP = [];
        this.createRow(listOfGP);
        this.listOfGP = listOfGP;
    }

    handleInputChange(event) {
        let index = event.target.dataset.id;
        let fieldName = event.target.name;
        let value = event.target.value;

        for(let i = 0; i < this.listOfGP.length; i++) {
            if(this.listOfGP[i].index === parseInt(index)) {
                this.listOfGP[i][fieldName] = value;
            }
        }
    }

    createGP() {
        insertGP({
            jsonOflistOfGP: JSON.stringify(this.listOfGP)
        })
            .then(data => {
                this.initData();
                let event = new ShowToastEvent({
                    message: "GPs successfully created!",
                    variant: "success",
                    duration: 2000
                });
                this.dispatchEvent(event);
            })
            .catch(error => {
                console.log(error);
            });
    }
}