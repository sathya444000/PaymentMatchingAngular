export class PaymentMatching {
    constructor() {
    }
    OrderId?: string;
    SystemAmount?: number;
    ProviderAmount?: string
    Currency?: string
    Status?: string
    Resolved: boolean=false
    ResolutionSide?: string
    Actions?: string
}