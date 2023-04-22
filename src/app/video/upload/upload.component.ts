import { Component , OnDestroy} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage'
import { v4 as uuid } from 'uuid';
import { last , switchMap} from 'rxjs/operators'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import firebase from 'firebase/compat/app'
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragover= false
  file: File | null  = null
  nextStep = false
  showAlert = false
  alertMsg = 'Please wait! Your video is being uploaded.'
  alertColor = 'blue'
  inSubmission= false
  percentage = 0
  showPercentage = false
  user: firebase.User | null = null
  task?: AngularFireUploadTask
  screenshotTask?: AngularFireUploadTask
  selectedScreenshot: File | null = null
  thumbnail = false
  imgSrc:string=''

  constructor(
    private storage : AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService:ClipService,
    private router:Router
  ){
    auth.user.subscribe(user=>this.user = user)
  }


  ngOnDestroy(): void {
      this.task?.cancel()
  }

  title = new FormControl('',{
    validators:[
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable:true
  })

  uploadForm = new FormGroup({
    title:this.title
  })


  storeFile($event: Event){
    this.isDragover=false

    this.file =  ($event as DragEvent).dataTransfer ?
    ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
    ($event.target as HTMLInputElement).files?.item(0) ?? null

    if(!this.file || this.file.type !== 'video/mp4'){
      return
    }
    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/,'')
    )
    this.nextStep = true
    console.log(this.file)
  }


  uploadFile(){
    this.uploadForm.disable()
    console.log('file uplaoding')
    this.showAlert = true
    this.alertMsg = 'Please wait! Your video is being uploaded.'
    this.alertColor = 'blue'
    this.inSubmission= true
    this.showPercentage= true

    const clipFileName = uuid()
    const clipPath =`clips/${clipFileName}.mp4`

    const screenshotPath = `screenshots/${clipFileName}.png`


    this.task  = this.storage.upload(clipPath , this.file)
    const clipRef = this.storage.ref(clipPath)

    this.screenshotTask = this.storage.upload(screenshotPath, this.selectedScreenshot)
    const screenshotRef = this.storage.ref(screenshotPath)

    combineLatest([
    this.task.percentageChanges(),
    this.screenshotTask.percentageChanges()
    ]).subscribe((progress)=> {
      const [clipProgress, screenshotProgress] = progress
      if(!clipProgress || !screenshotProgress){
        return
      }
      this.percentage = (clipProgress + screenshotProgress) as number / 200
    }
    )


    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ])
   .pipe(
      switchMap(()=> forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls)=>{
        const [clipUrl , screenshotURL] = urls
        const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url:clipUrl,
            screenshotURL, 
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const  clipDocRef = await this.clipsService.createClip(clip)

        this.alertColor = 'green'
        this.alertMsg = 'Success! Your video is ready to share with the world.'
        this.showPercentage = false

        setTimeout(() => {
          this.thumbnail = false
          this.router.navigate([
            'clip',clipDocRef.id
          ])
        }, 1000);
      },
      error: (error)=>{
        this.uploadForm.enable()
        this.alertColor = 'red'
        this.alertMsg = 'Upload Failed ! Please Try again.'
        this.inSubmission= true
        this.showPercentage = false
         console.log(error)
      }
    })
  }

  storeScreenShot($event: Event){
    this.thumbnail= true
    this.selectedScreenshot = ( $event as DragEvent).dataTransfer ?
                              ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
                              ($event.target as HTMLInputElement).files?.item(0) ?? null
    if(this.selectedScreenshot){
    let reader = new FileReader();
    reader.onload = (e)=> {
      this.imgSrc = reader.result as string
      console.log(reader.result)
    };
    reader.readAsDataURL(this.selectedScreenshot);
   }
  }

}
