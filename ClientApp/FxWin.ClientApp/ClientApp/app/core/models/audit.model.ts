export class AuditTrail {
    code: string;
    object: string;
    field: string;
    oldValue: string;
    newValue: string;
    userModified: string;
    operationType: string;
    modificationDate?: string;
}