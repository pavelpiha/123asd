@Component({
  selector: "app-tree-view",
  templateUrl: "tree-view.component.html",
  styleUrls: ["tree-view.component.scss"],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTreeModule],
})
export class TreeViewComponent {
  rawData: string[] = [];
  // private _transformer = (node: string): {}
  dataSource: string;
}
