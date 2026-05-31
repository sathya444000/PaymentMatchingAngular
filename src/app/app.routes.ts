import { Routes } from '@angular/router';
import{PaymentMatchingComponent} from './PaymentMatch/payment-matching.components'
export const routes: Routes = [
    
    { path: '', redirectTo: 'payment', pathMatch: 'full' }, 
    {path:'payment', component: PaymentMatchingComponent }
];
