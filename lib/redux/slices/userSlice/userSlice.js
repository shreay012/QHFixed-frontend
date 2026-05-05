import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoading: false,
    toast: {
      open: false,
      message: '',
      severity: 'info', // 'success' | 'error' | 'warning' | 'info'
    },
    modal: {
      open: false,
      type: null,
      data: null,
    },
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    },
    openModal: (state, action) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal.open = false;
      state.modal.type = null;
      state.modal.data = null;
    },
  },
});

export const { setLoading, showToast, hideToast, openModal, closeModal } = userSlice.actions;
export default userSlice.reducer;