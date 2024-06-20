@Component({
  selector: 'app-tree-view',
  templateUrl: 'tree-view.component.html',
  styleUrls: ['tree-view.component.scss'],
  standalone: true,
  imports: [MatTreeModule],
})
export class CustomViewComponent {
  rawData: string[] = [];
  private transformer = (node string) = {}
  dataSource: string;
}
