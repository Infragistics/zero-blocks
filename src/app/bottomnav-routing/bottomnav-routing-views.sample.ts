import { Component, NgModule } from '@angular/core';

@Component({
    template: `
        <igx-list [allowRightPanning]="true" [allowLeftPanning]="true">
            <igx-list-item [isHeader]="true">History</igx-list-item>
            <igx-list-item igxRipple="pink" igxRippleTarget=".igx-list__item" *ngFor="let contact of contacts">
                <div class="item">
                    <igx-avatar [src]="contact.avatar" roundShape="true"></igx-avatar>
                    <div class="person">
                        <p class="name">{{contact.text}}</p>
                        <span class="phone">{{contact.phone}}</span>
                    </div>
                    <igx-icon>phone</igx-icon>
                </div>
            </igx-list-item>
        </igx-list>
    `,
    styles: [ `
        .item {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .item > [igxLabel],
        .item > .person {
            position: absolute;
            margin-left: 72px;
        }

        .person .name {
            padding: 0;
            margin: 0;
        }

        .person .phone {
            font-size: 12px;
            color: gray;
        }

        .item igx-icon {
            color: lightgray;
        }

        .item igx-icon.favorite {
            color: orange;
        }
    ` ]
})
export class BottomNavRoutingView1Component {

    contacts = [{
        avatar: 'assets/images/avatar/1.jpg',
        favorite: true,
        key: '1',
        link: '#',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        favorite: false,
        key: '2',
        link: '#',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        favorite: false,
        key: '3',
        link: '#',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        favorite: false,
        key: '4',
        link: '#',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }, {
        avatar: 'assets/images/avatar/12.jpg',
        favorite: true,
        key: '5',
        link: '#',
        phone: '573-394-9254',
        text: 'Dorothy H. Spencer'
    }, {
        avatar: 'assets/images/avatar/13.jpg',
        favorite: false,
        key: '6',
        link: '#',
        phone: '323-668-1482',
        text: 'Stephanie May'
    }, {
        avatar: 'assets/images/avatar/14.jpg',
        favorite: false,
        key: '7',
        link: '#',
        phone: '401-661-3742',
        text: 'Marianne Taylor'
    }];

}

@Component({
    template: `
        <h3>Tab 2 Content</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula. Donec
            consectetur accumsan suscipit. Praesent rutrum tellus blandit bibendum cursus. Vestibulum
            urna arcu, bibendum nec molestie ac, varius congue massa. Mauris porttitor viverra lacus.
            Donec efficitur purus id urna dapibus, vitae pharetra orci pellentesque. Vestibulum id lacus
            a magna euismod volutpat id in mi. Etiam a nunc ut tellus dictum porta. Donec in ligula a
            arcu sollicitudin finibus. Vivamus id lorem pulvinar, accumsan justo vitae, vehicula diam.
            Mauris vel quam at velit venenatis vulputate in quis nisl.</p>
    `
})
export class BottomNavRoutingView2Component {
}

@Component({
    template: `
        <h3>Tab 3 Content</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius sapien ligula. Donec
            consectetur accumsan suscipit. Praesent rutrum tellus blandit bibendum cursus. Vestibulum
            urna arcu, bibendum nec molestie ac, varius congue massa. Mauris porttitor viverra lacus.
            Donec efficitur purus id urna dapibus, vitae pharetra orci pellentesque.</p>
    `
})
export class BottomNavRoutingView3Component {
}

/**
 * @hidden
 */
@NgModule({
    declarations: [BottomNavRoutingView1Component, BottomNavRoutingView2Component, BottomNavRoutingView3Component],
    exports: [BottomNavRoutingView1Component, BottomNavRoutingView2Component, BottomNavRoutingView3Component],
    imports: []
})
export class BottomNavRoutingViewsModule {
}
