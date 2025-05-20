import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

const NotificationsPage = () => {
  const { notifications, notificationsLoading, fetchNotifications } = useAppContext();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notificationsLoading ? (
        <div>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-muted-foreground">No notifications found.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li key={n.id} className="border rounded p-4 bg-background">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{n.title}</span>
                <span className="text-xs text-muted-foreground">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </span>
              </div>
              <div className="text-sm">{n.message}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage; 