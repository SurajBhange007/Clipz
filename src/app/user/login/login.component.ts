import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private auth: AngularFireAuth) { }
  credentials = {
    email: '',
    password: ''
  }
  inSubmission = false;
  showAlert = false
  alertMsg = 'Please wait! Your account is being created.'
  alertColor = 'blue'



  async login() {
    this.inSubmission = true
    // console.log("registeration started")
    this.showAlert = true
    this.alertMsg = 'Logging you In.....'
    this.alertColor = 'blue';
    console.log(this.credentials)
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email, this.credentials.password
      )
    } catch (e) {
      console.log((e as Error).message);
      this.alertMsg = (e as Error).message + 'An Unexpected error occured. Please try again later.'
      this.alertColor = 'red'
      this.inSubmission = false
      return
    }

    this.alertMsg='Welcome Back!'
    this.alertColor= 'green'
  }
}
