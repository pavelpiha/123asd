@Component({
  selector: 'app-plane-view',
  templateUrl: 'tree-plane.component.html',
  styleUrls: ['tree-plane.component.scss'],
  standalone: true,
  imports: [MainComponentModule],
})
export class PlaneViewComponent {
  rawData: string[] = [];
  dataSource: string;
}
