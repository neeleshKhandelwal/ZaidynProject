import { LightningElement,api,track } from 'lwc';
export default class Zec_ProjectSelection extends LightningElement {


    @api clientlist = [];
    @api projectList = [];
    chooseAccount = false;
    @api clientValue = '';
    @api projectValue = '';
    @api imageUrl;

    handleChangeClient(event){
        this.chooseAccount = true
    }

    clientChanged(event){

        var newArray = this.clientlist.filter(function (el){
            if(el.value == event.detail.value){
                return el;
            }
            
        });
        console.log('Image url',newArray[0].image)
        this.imageUrl = newArray[0].image
        this.clientValue = event.detail.value;
        let selectedEvent = new CustomEvent('clientselected',  {detail: {
            clientid : this.clientValue
        }});
        this.dispatchEvent(selectedEvent);
    }

    projectChanged(event){
        this.projectValue = event.detail.value
    }

    cancel(event){
        this.chooseAccount = false;
        let selectedEvent = new CustomEvent('projectselected',  {detail: {
            projectid : this.projectValue,
            clientid : this.clientValue
        }});
        this.dispatchEvent(selectedEvent);
    }

    generatePicklist(picklistValues){
        let arr = [];
        arr.push({
            label: '--None--',
            value: ''
        });
        console.log('arr',arr)
        for(let i= 0; i<picklistValues.length;i++){
            let obj = new Object();
            obj.label = picklistValues[i].Name,
            obj.value = picklistValues[i].Id 
            arr.push(obj) ; 
        }
        console.log('arr after',arr)
        return arr;
    }
}