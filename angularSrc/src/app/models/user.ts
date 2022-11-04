
export class User {
  public userName: any;
}

export interface Users {
  name: string;
  role?: Role;
}

export interface Role {
  controlled_print_coordinator: boolean;
  controlled_print_reprint: boolean;
  controlled_print_only: boolean;
  reconciliation: boolean;
  issued_print_coordinator: boolean;
  issued_print_reprint: boolean;
  issued_print_only: boolean;
  admin: boolean;

}
export interface Profile {
  name: string;
}

export interface Document {
  name: string;
}

export interface Printer {
  _id: string;
  name: string;
  status: string;
  isDeleted: boolean;
  isWhiteList: boolean;
}

export interface Reason {
  name: string;
  print: boolean;
  reprint: boolean;
  recall: boolean;
  reconcile: boolean;
}