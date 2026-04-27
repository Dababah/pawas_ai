import { LocalNotifications } from '@capacitor/local-notifications';

export const scheduleTaskNotification = async (title: string, deadline: string) => {
  try {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    const deadlineDate = new Date(deadline);
    // Schedule 1 hour before deadline
    const scheduleDate = new Date(deadlineDate.getTime() - 60 * 60 * 1000);

    if (scheduleDate > new Date()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Pengingat Tugas Pawas.ai',
            body: `Tugas "${title}" akan dikumpulkan dalam 1 jam!`,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: scheduleDate },
            sound: 'beep.wav',
            attachments: [],
            actionTypeId: '',
            extra: null
          }
        ]
      });
      console.log('Notification scheduled for:', scheduleDate);
    }
  } catch (e) {
    console.error('Failed to schedule notification', e);
  }
};
