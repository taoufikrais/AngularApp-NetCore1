import { Component, OnInit,Input,Output, EventEmitter ,OnDestroy  } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { PriceService } from '../../core/services/price.service';
import { TimeSerie } from '../../core/models/timeserie.model';

import { Observable } from 'rxjs/Observable';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
    selector: 'price-detail',
    templateUrl: './price-detail.component.html',
    inputs: ['detailId'],
})

export class PriceDetailComponent implements OnInit, OnDestroy  {
    timeSerie$: Observable<TimeSerie>;
    private sub: any;
    //delagate event
    @Output() eventdatabindDetail = new EventEmitter();
   
    _detailId: number = 0;
    @Input('detailId')
    set detailId(value: number) {
        this._detailId = value;
        this.databindDetail(this._detailId);
    }
    
    get detailId(): number {
        return this._detailId;
    }

    constructor(
        private service: PriceService,
        private route: ActivatedRoute,
        private router: Router,
        private bsModalRef: BsModalRef = null
    ) { 
    }

    ngOnInit() {
      this.getIdfromRouterUrl();
    }

    databindDetail(id) {
        this.timeSerie$ = this.service.getTimeSerie(id);
    }

    getIdfromRouterUrl()
    {
        this.sub = this.route.params.subscribe(params => {
            this._detailId = +params['id'];
            this.databindDetail(  this._detailId);
         });
    }

    save(timeSerie: TimeSerie) {
        this.service.save(timeSerie).then(() => this.close(true));
    }

    close(forcerefresh:boolean =false): void {
        if(this.bsModalRef.content !== undefined)
        {
            this.bsModalRef.hide();
            if(forcerefresh)
            {
              this.bsModalRef.content.router.navigated = false;
              this.bsModalRef.content.router.navigate(['/price']);
            }

        }else{
            this.router.navigate(['/price']);
        }
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
   }
}



