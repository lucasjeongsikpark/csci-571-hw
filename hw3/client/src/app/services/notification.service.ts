import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notifications = new BehaviorSubject<any[]>([]);

  addNotification(message: string, type: string = 'success') {
    const id = uuidv4();
    const notif = { id, message, type };
    const currentNotifs = this.notifications.value;
    this.notifications.next([...currentNotifs, notif]);
    setTimeout(() => this.removeNotification(id), 3000);
  }

  removeNotification(id: string) {
    const updatedNotifs = this.notifications.value.filter(n => n.id !== id);
    this.notifications.next(updatedNotifs);
  }
}
