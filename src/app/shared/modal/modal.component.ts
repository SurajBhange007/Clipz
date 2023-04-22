import { Component , OnInit, Input, ElementRef, asNativeElements, OnDestroy} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
//  providers:[ModalService]
})
export class ModalComponent implements OnInit, OnDestroy{

  @Input() modalID=''

  constructor( public modal:ModalService,
    public el :ElementRef){}
  ngOnInit(): void {
    //to get componenet css property if it is under other component or section
    document.body.appendChild(this.el.nativeElement)
  }
  closeModal(){
    this.modal.toggleModal(this.modalID)
  }
  ngOnDestroy(): void {
      document.body.removeChild(this.el.nativeElement)
  }
}
