import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable, of, take, tap } from "rxjs";
import { AccountService } from "../../providers/services";
import { AccountStateModel } from "../models/account/auth-store.model";
import { AccountActions } from "./account.actions";

@State<AccountStateModel>({
    name: 'account',
    defaults: {
      id: null,
      token: null,
      firstName: null,
    }
  })
  
  @Injectable()
  export class AccountState {
    @Selector()
    static token(state: AccountStateModel): string | null {
      return state.token;
    }

    @Selector()
    static firstName(state: AccountStateModel): string | null {
      return state.firstName;
    }

    @Selector()
    static isAuthenticated(state: AccountStateModel): boolean {
      return !!state.token;
    }
    @Selector()
    static getModel(state: AccountStateModel): AccountStateModel {
      return state;
    }

    constructor(private _accountService: AccountService) {}
  

  
    @Action(AccountActions.Logout)
    logout(ctx: StateContext<AccountStateModel>): void {
      ctx.patchState({
        id: null,
        token: null,
        firstName: null
      });
    }
  }