import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GistPrivacy} from '../constants/index.js';

interface AuthState {
  isAuthenticated: boolean;
  handle: string;
  name: string;
  profilePicUrl: string;
  private: GistPrivacy;
}

const initialState: AuthState = {
  isAuthenticated: false,
  handle: '',
  name: '',
  profilePicUrl: '',
  private: GistPrivacy.ALL,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    receiveCurrentUser: (
      state,
      action: PayloadAction<{
        isAuthenticated: boolean;
        handle?: string;
        name?: string;
        profilePicUrl?: string;
      }>,
    ) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.handle = action.payload.handle || '';
      state.name = action.payload.name || '';
      state.profilePicUrl = action.payload.profilePicUrl || '';
    },

    toggleGistPrivacy: (state) => {
      if (state.private === GistPrivacy.ALL) {
        state.private = GistPrivacy.PUBLIC;
      } else {
        state.private = GistPrivacy.ALL;
      }
    },

    setGistPrivacy: (state, action: PayloadAction<GistPrivacy>) => {
      state.private = action.payload;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.handle = '';
      state.name = '';
      state.profilePicUrl = '';
      state.private = GistPrivacy.ALL;
    },
  },
});

export const {receiveCurrentUser, toggleGistPrivacy, setGistPrivacy, logout} = authSlice.actions;
