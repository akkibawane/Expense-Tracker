import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/recurringService';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  return await notificationService.getNotifications();
});

export const markReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => {
    return await notificationService.markAsRead(id);
  }
);

export const markAllReadThunk = createAsyncThunk('notifications/markAllRead', async () => {
  return await notificationService.markAllAsRead();
});

export const clearAllNotificationsThunk = createAsyncThunk(
  'notifications/clearAll',
  async () => {
    return await notificationService.clearAll();
  }
);

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotificationAction: (state, action: PayloadAction<AppNotification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(markAllReadThunk.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = 0;
      })
      .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export const { addNotificationAction } = notificationSlice.actions;
export default notificationSlice.reducer;
