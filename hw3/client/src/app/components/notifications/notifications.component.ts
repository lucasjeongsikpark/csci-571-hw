import { Component, OnInit } from '@angular/core';

export interface Notification {
  id: number;
  type: string; // e.g., 'success', 'danger'
  message: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  ngOnInit(): void {
    // For example, subscribe to a NotificationService Observable here.
  }

  // Call this method to add a notification
  addNotification(notification: Notification): void {
    this.notifications.push(notification);
    // Remove notification after 3 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 3000);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
  }
}
