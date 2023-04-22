import { Component , OnInit} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';


@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  videoOrder = '1'


  constructor(private router: Router,
              private route: ActivatedRoute,
              private clipsService : ClipService){}

  ngOnInit(): void {
    this.route.queryParams.subscribe( (params:Params) =>{
      this.videoOrder = params.sort === '2' ? params.sort : '1'
      // console.log("params: "+ params.sort);
    } )

    this.clipsService.getUserClips().subscribe(
      
    )
  }

  sort(event:Event){
    const { value } = (event.target as HTMLSelectElement)

    this.router.navigate([],{
      relativeTo: this.route,
      queryParams:{
        sort: value
      }
    })


  }
}
