import { Injectable } from '@angular/core';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { scan } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private channel: BroadcastChannel;
  private messagesSubject: Subject<{ user: string; text: string; time: string }> = new Subject();
  private messagesArray: { user: string; text: string; time: string }[] = [];
  public messages$: Observable<{ user: string; text: string; time: string }[]>;

  private alive = true;
  private saveSubscription: Subscription;

  constructor() {
    this.channel = new BroadcastChannel('swoyochat_channel');
    this.channel.onmessage = (event) => {
      const message = event.data;
      this.messagesArray.push(message);
      this.messagesSubject.next(message);
    };

    this.messages$ = this.messagesSubject.asObservable().pipe(
  scan(
    (acc: { user: string; text: string; time: string }[], val: { user: string; text: string; time: string }) =>
      [...acc, val],
    [] as { user: string; text: string; time: string }[]
  )
);

    this.saveSubscription = interval(1000)
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        localStorage.setItem('chatMessages', JSON.stringify(this.messagesArray));
      });
  }

  sendMessage(message: { user: string; text: string; time: string }) {
    this.messagesArray.push(message);
    this.messagesSubject.next(message);
    this.channel.postMessage(message);
  }
}
