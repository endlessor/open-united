import { BaseAction, USER_LOGGED_IN } from '../types';

export type UserState = {
  isLoggedIn: boolean,
  fullName: string,
  slug: string,
  id: string,
  roles: {product: string, role: string}[],
};

// const userId = window.localStorage.getItem("userId");
// const fullName = window.localStorage.getItem("fullName");

export const userReducer = (
  state: any = {
    isLoggedIn: false,//userId ? true : false,
    fullName: '',
    slug: '',
    username: '',
    id: null,
    claimedTask: null,
    roles: []
  },
  action: BaseAction
) => {
  switch (action.type) {
    case USER_LOGGED_IN:
      return {...state, ...action.payload};
  }
  return state;
};
