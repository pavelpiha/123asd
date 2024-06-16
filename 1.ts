import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
/**
 * Node for to-do item
 */
export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
  count: number;
}

export class TreeData {
  id: string;
  name: string;
  count?: number;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

interface Location {
  id: string;
  name: string;
}

interface Country {
  name: string;
  count?: string;
  level?: number;
  locations: Location[];
}

interface Service {
  id: string;
  name: string;
  location_groups?: {
    total_count: string;
    countries: Country[];
  };
}

interface UniversalServiceNode {
  name: string;
  level: number;
  expandable: boolean;
  locations?: Location[];
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */

@Component({
  selector: 'ib-tree-view',
  templateUrl: 'tree-view.component.html',
  styleUrls: ['tree-view.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTreeModule],
})
export class TreeViewComponent implements OnInit {
  @Input() rawData: Service[] = [];
  // private _transformer = (node: Service | Country | Location, level: number): UniversalServiceNode => {
  //   const expandable = (node as Service).location_groups !== undefined || (node as Country).locations !== undefined;
  //   return {
  //     name: node.name,
  //     level,
  //     expandable,
  //   };
  // };

  // treeControl = new FlatTreeControl<UniversalServiceNode>(
  //   (node) => node.level,
  //   (node) => node.expandable
  // );

  // treeFlattener = new MatTreeFlattener(
  //   this._transformer,
  //   (node) => node.level,
  //   (node) => node.expandable,
  //   (node) => {
  //     if ((node as Service).location_groups) {
  //       return (node as Service).location_groups!.countries;
  //     }
  //     if ((node as Country).locations) {
  //       return (node as Country).locations;
  //     }
  //     return [];
  //   }
  // );

  private transformer: (node: Service | Country | Location, level: number) => UniversalServiceNode = (node, level) => {
    if (this.isService(node)) {
      return {
        name: node.name,
        level,
        expandable: !!node.location_groups,
      };
    } else if (this.isCountry(node)) {
      return {
        name: node.name,
        level,
        expandable: true,
        locations: node.locations,
      };
    } else {
      return {
        name: node.name,
        level,
        expandable: false,
      };
    }
  };

  treeControl: FlatTreeControl<UniversalServiceNode> = new FlatTreeControl<UniversalServiceNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener: MatTreeFlattener<Service | Country | Location, UniversalServiceNode, UniversalServiceNode> =
    new MatTreeFlattener(
      this.transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => {
        if (this.isService(node)) {
          return node.location_groups ? node.location_groups.countries : [];
        } else if (this.isCountry(node)) {
          const locations = node.locations;
          const firstLocation = locations.slice(0, 1);
          const showMoreNode =
            locations.length > 1
              ? [{ name: 'Show more', level: node.level, expandable: false, locations: [] }]
              : // ? [{ name: 'Show more', level: node.level + 1, expandable: true, locations: locations.slice(1) }]
                [];
          return [...firstLocation, ...showMoreNode];
        }
        return [];
      }
    );

  dataSource: MatTreeFlatDataSource<number | Service | Country | Location, UniversalServiceNode, UniversalServiceNode> =
    new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {}

  ngOnInit(): void {
    this.dataSource.data = this.rawData;
  }

  hasChild: Function = (_: number, node: UniversalServiceNode) => node.expandable && node.name !== 'Show more';

  isShowMore: Function = (_: number, node: UniversalServiceNode) => node.name === 'Show more';

  hasNoContent: Function = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  onLoadMoreClick(event: UniversalServiceNode): void {
    console.log('event', event);
  }

  private isService(node: Service | Country | Location): node is Service {
    return (node as Service).location_groups !== undefined;
  }

  private isCountry(node: Service | Country | Location): node is Country {
    return (node as Country).locations !== undefined;
  }
}
