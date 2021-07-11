import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UiService } from '../shared/ui.service';
import { Events, Event, EventService } from './shared/event.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  // booleans
  isLoading:boolean         = true;

  // variables
  eventsData:Events[]       = [];
  events: Event[]           = [];

  tableData!: MatTableDataSource<Event>;
  displayedColumns 					= ['websiteName','title','eventDate','eventLocation'];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private ui              : UiService,
    private eventService    : EventService,
  ) { }

  ngOnInit(): void {
    this.fetchData();
  } 

  fetchData() {

    // fetch all events
    this.eventService.fetchEvents()
    .subscribe(result => {
        if(result.status == 'success') {

          // manage data
          this.eventsData                 = result.data;
          this.events                     = this.eventsData.map(events => events.events).reduce((prev, current) => [...prev, ...current]);

          // table
          this.tableData                  = new MatTableDataSource<Event>(this.events);
          this.tableData.paginator        = this.paginator;
          this.tableData.filterPredicate = (data:Event, filter: string): boolean => {
            let website;
            let title;
            let date;
            let location;
            if(data.websiteId) {
              website = this.getWebsiteName(parseInt(data.websiteId)).toString().toLowerCase().includes(filter);
            }
            if(data.title) {
              title = data.title.toString().toLowerCase().includes(filter);
            }
            if(data.location) {
              location = data.location.toString().toLowerCase().includes(filter);
            }
            if(data.date) {
              date = data.date.toString().toLowerCase().includes(filter);
            }
            return website || title || date || location || false;
          };
          this.isLoading                  = false;

        } else {
          this.ui.showSnackbar("Something is wrong with the API call. Please try again. If you continue to have issue please notify the tech team.", "failure");
        }
    }, err => {
      this.ui.showSnackbar("Something is wrong with the API call. Please try again. If you continue to have issue please notify the tech team.", "failure");
    });

  }

  // fetch website name by website id
  getWebsiteName(id:number) {
    let website                       = this.eventsData.find(data => data.id === id );
    if(website) {
      return website.website.replace(/(^\w+:|^)\/\//, '')
    }
    return "";
  }

  onSortData(sort: Sort) {
    let data = this.events.slice();
    if (sort.active && sort.direction !== '') {
        data = data.sort((a: Event, b: Event) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'websiteName': return this.compare(this.getWebsiteName(parseInt(a.websiteId)), this.getWebsiteName(parseInt(b.websiteId)), isAsc);
                case 'title': return this.compare(a.title, b.title, isAsc);
                case 'eventLocation': return this.compare(a.location, b.location, isAsc);
                default: return 0;
            }
        });
    }
    this.tableData = new MatTableDataSource<Event>(data);
  }

  private compare(a:string, b:string, isAsc:boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  //search
  applySearch = (event: KeyboardEvent) => {
    this.tableData.filter   = (<HTMLInputElement>event.target).value.trim().toLocaleLowerCase();
  }

}
