import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from './payment-matching.service';
import { PaymentMatching } from './PaymentMatching'
@Component({
  selector: 'payment-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment-matching.html',
  styleUrls: ['./payment-matching.css']
})
export class PaymentMatchingComponent {

  constructor(private _PaymentService: PaymentService, private cdr: ChangeDetectorRef) {

  }
  ngOnInit() {
    this.getDetails();
  }
  systemFile: File | null = null;
  providerFile: File | null = null;
  gridData: PaymentMatching[] = []
  paymentMatchingList: PaymentMatching[] = [];
  systemFileError: boolean = false;
  providerFileError: boolean = false;
  showMessage: string = '';
  summary: string = '';
  match: number = 0
  mismatch: number = 0
  onlySys: number = 0
  onlyPro: number = 0
  isError: boolean = false;
  isGetList: boolean = false;
 selectedFilter: 'ALL' | 'YES' | 'NO' = 'ALL';
 filteredList: PaymentMatching[] = [];
  @ViewChild('systemFileInput') systemFileInput!: ElementRef;

  @ViewChild('providerFileInput') providerFileInput!: ElementRef;

  toastType: string = ''
  toastMessage: string = ''
  onSystemFileSelected(event: any) {
    this.systemFile = event.target.files[0];
  }

  onProviderFileSelected(event: any) {
    this.providerFile = event.target.files[0];
  }

  uploadFiles() {
    this.toastMessage = '';
    let valid: boolean = true;
    const formData = new FormData();
    if (!this.systemFile && !this.providerFile) {
      this.systemFileError = true;
      this.providerFileError = true;
      this.toastType='error'
      this.toastMessage = 'System and Provider files are required';
      valid = false;
    }
    else if (!this.systemFile) {
      this.toastType='error'
      this.systemFileError = true;
      this.toastMessage = 'System file is required';
      valid = false;
    }
    else if (!this.providerFile) {
      this.toastType='error'
      this.providerFileError = true;
      this.toastMessage = 'Provider file is required';
      valid = false;
    }

    if (!valid) return;
    this.toastMessage = "";
    formData.append('systemCSV', this.systemFile!);
    formData.append('providerCSV', this.providerFile!);

    this._PaymentService.addPayment(formData)
      .subscribe({
        next: (data) => {
          this.systemFileInput.nativeElement.value = '';
          this.providerFileInput.nativeElement.value = '';
          this.systemFile = null;
          this.providerFile = null;
          this.paymentMatchingList = data.result;
          let resolve: boolean = true;
          this.paymentMatchingList.forEach(x => {
            if (x.Resolved == false) {
              resolve = false;
              return;
            }
            
          })

          this.filterRecords('ALL')
          if (!resolve) {
            this.isError = true;
            this.toastType='error'
            this.toastMessage = 'Some records are not resolved. Please resolve and submit';
            this.getSummary();
          } else {
            this.toastType = "success"
            this.toastMessage = 'All Records are resolved and saved.';
            this.toastType = "success";
            this.getDetails();
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Status:', err.status);
          this.toastType = "error";
          this.toastMessage = err.error.detail;
          console.error('Message:', err.error);
          this.cdr.detectChanges();
        }
      });
  }

  submitData() {
    this.toastMessage = '';
    let gridData = this.paymentMatchingList.filter(x => !x.Resolved);
    if (gridData.length) {
      if (this.paymentMatchingList.find(x => !x.ResolutionSide)) {
        let data = this.paymentMatchingList.filter(x => !x.ResolutionSide && !x.Resolved).map(x => x.OrderId).join(',')
        this.toastType = "error";
        this.toastMessage = 'Some records are not resolved. Please resolve and submit. Order Id ' + data;
        return
      } else {
        this.toastMessage = '';
      }
      this.paymentMatchingList.forEach(x => {
        x.Resolved = x.ResolutionSide ? true : false
      })
      this._PaymentService.submitData(
        this.paymentMatchingList
      )
        .subscribe({
          next: (data) => {
             this.toastMessage = 'Records saved successfully';
             this.toastType = "success";
            this.getDetails();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.toastType = "error";
          this.toastMessage = err.error.detail;
            console.error('Status:', err.status);
            console.error('Message:', err.error);
          }
        });
    } else {
      this.isError = true;
      this.toastMessage = 'No Changes found';
      this.toastType = "error";
    }
  }

  getDetails() {
    this.isGetList = true
    this._PaymentService.getDetails()
      .subscribe({
        next: (data) => {
          this.paymentMatchingList = data.result;
          this.filterRecords('ALL')
          this.getSummary();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastType = "error";
          this.toastMessage = err.error.detail;
          console.error('Status:', err.status);
          console.error('Message:', err.error);
        }
      });
  }



  getSummary() {
    this.match = this.paymentMatchingList.filter(x => x.Status == "MATCHED").length
    this.onlySys = this.paymentMatchingList.filter(x => x.Status == "ONLYSYSTEM").length
    this.onlyPro = this.paymentMatchingList.filter(x => x.Status == "ONLYPROVIDER").length
    this.mismatch = this.paymentMatchingList.filter(x => x.Status == "AMOUNTMISMATCH").length
  }

  closeToast() {
    this.toastMessage = "";
  }

  get resolvedCount(): number {
  return this.paymentMatchingList.filter(x => x.Resolved).length;
}

get unresolvedCount(): number {
  return this.paymentMatchingList.filter(x => !x.Resolved).length;
}

filterRecords(filter: 'ALL' | 'YES' | 'NO') {
  this.selectedFilter = filter;

  switch (filter) {
    case 'YES':
      this.filteredList = this.paymentMatchingList.filter(x => x.Resolved);
      break;
    case 'NO':
      this.filteredList = this.paymentMatchingList.filter(x => !x.Resolved);
      break;
    default:
      this.filteredList = [...this.paymentMatchingList];
  }
}
}