import { Component , OnInit, OnDestroy, Input, OnChanges, Output,EventEmitter} from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { FormControl, FormGroup , Validators} from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';




@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit , OnDestroy, OnChanges{
  @Input()
  activeClip : IClip | null = null
  @Output()
  update = new EventEmitter()


  showAlert = false
  alertMsg = 'Please wait! Your request is being updated.'
  alertColor = 'blue'
  inSubmission= false



  clipID = new FormControl('',{
    nonNullable:true
  })

  title = new FormControl('',{
    validators:[
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable:true
  })

  editForm = new FormGroup({
    title:this.title,
    id: this.clipID
  })


  constructor(
   private modalService: ModalService,
   private clipService: ClipService
  ){}

  async submit(){
    if(!this.activeClip){
      return
    }
      this.showAlert = true
      this.alertMsg = 'Please wait! Your video is being updated.'
      this.alertColor = 'blue'
      this.inSubmission= true

    try{
      await this.clipService.updateClip(
          this.clipID.value ,this.title.value
        )
     }catch(e){
      this.inSubmission = false
      this.alertColor= 'red'
      this.alertMsg='Something went wront! Try again.'
      return
     }

     this.activeClip.title =  this.title.value
     this.update.emit(this.activeClip)

     this.inSubmission= false
     this.alertColor='green'
     this.alertMsg='Success!'

     setTimeout(() => {
      this.modalService.toggleModal('editClip')
     }, 3000);
      
    }


  ngOnInit(): void {
    console.log('inside onit edit')
      this.modalService.register('editClip')
  }
  ngOnDestroy(): void {
      this.modalService.unregister('editClip')
  }

  ngOnChanges(): void {
      if(!this.activeClip){
        return
      }
      this.inSubmission= false 
      this.showAlert = false
      this.clipID.setValue(this.activeClip.docID as string)
      this.title.setValue(this.activeClip.title)
  }

}
