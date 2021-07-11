import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";

// event interface
export interface Event {
  id            : number;
  location      : string;
  title         : string;
  websiteId     : string;
  date          : string;
}

// events interface
export interface Events {
  id            : number;
  scrapeUrl     : string;
  website       : string;
  events        : Event[];
}

// api result interface
interface fetchEventsResult {
  status        : string,
  data          : Events[]
}

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(
    private http      : HttpClient,
  ) { }

  // fetch all events 
  // /v1/events
  fetchEvents() {
    return this.http.get<fetchEventsResult>(environment.apiUrl + '/v1/events');
  } 

}
