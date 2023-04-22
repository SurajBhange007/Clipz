import { Injectable } from '@angular/core';

interface IModal{
  id:string;
  visible:boolean;
}
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals:IModal[]=[]
  constructor() { }

  isModalOpen(id:string):boolean{
    // Boolean(this.modals.find(element => element.id===id)?.visible);
    return !!this.modals.find(element => element.id===id)?.visible
  }
  toggleModal(id:string){
    // return this.visible= !this.visible;
    const modal = this.modals.find(element => element.id===id)
    if(modal){
      modal.visible=!modal.visible
    }
  }
  register(id:string){
    console.log(id)
    this.modals.push({
      id,
      visible:false
    })
  }

  unregister(id:string){
    console.log(id)
    this.modals = this.modals.filter(
      element => element.id!==id
    )
  }
}
