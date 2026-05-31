export class PaymentMatching {
    constructor() {
    }
    OrderId?: number;
    SystemAmount?: number;
    ProviderAmount?: string
    Currency?: string
    Status?: string
    Resolved?: boolean
    ResolutionSide?: string
    Actions?: string
}