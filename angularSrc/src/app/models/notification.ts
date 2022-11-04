export class Notification {
    public docId: string;
    public to: string;
    public createdAt: Date;
    public updatedAt: Date;
    public isSeen: Boolean;
    public type: string;
    public printCopyNo: string;
    public notificationText: string;
    public docInfo: any;
    public completionComment: string;
}