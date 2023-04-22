import { Component, OnInit, OnDestroy, Input , OnChanges, Output,
EventEmitter} from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges{

@Input() activeClip: IClip | null  = null

 
inSubmission = false
showAlert = false
alertColor = 'blue'
alertMsg = 'Please wait!!! Updating the clip.'
@Output() update = new EventEmitter()




clipID = new FormControl('',{
  nonNullable: true
})

title = new FormControl('',{
  validators:[
    Validators.required,
    Validators.minLength(3)
  ],
  nonNullable: true
})

editForm = new FormGroup({
  title: this.title,
  id: this.clipID
})

constructor( private modal : ModalService,
              private clipService: ClipService){}

ngOnInit(): void {
    this.modal.register('editClip');
}

ngOnDestroy(): void {
    this.modal.unregister('editClip');
}

ngOnChanges(): void {
    if(!this.activeClip){
      return
    }
    if(this.activeClip.docID== undefined)return

    this.inSubmission = false
    this.showAlert = false
    this.clipID.setValue(this.activeClip.docID)
    this.title.setValue(this.activeClip.title)
}

async submit(){
  if(!this.activeClip){
    return
  }
  this.inSubmission = true 
  this.showAlert = true
  this.alertColor ='blue'
  this.alertMsg = 'Please Wait!! Updating the clip.'

  try {
    await this.clipService.updateClip(
      this.clipID.value, this.title.value
    )
  } catch (e) {
    this.inSubmission = false
    this.alertColor ='red'
    this.alertMsg = 'Something went wrong. Try again later'
    return
  }

  this.activeClip.title = this.title.value
  this.update.emit(this.activeClip)

  this.inSubmission = false
  this.alertColor = 'green'
  this.alertMsg = 'Clip has been updated.'

}
}