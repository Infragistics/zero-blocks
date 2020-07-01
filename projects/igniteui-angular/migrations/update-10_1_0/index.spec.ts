import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 10.1.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
      };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update DropPosition.None', done => {
        const origFileContent =
            `import { Component, Injectable, ViewChild } from "@angular/core";` +
            `import { IgxGridComponent, DropPosition } from "igniteui-angular";` +
            `import { IgxColumnComponent } from "igniteui-angular";\r\n` +
            `@Component({` +
            `    providers: [RemoteService]` +
            `})` +
            `export class GridSampleComponent {` +
            `    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;` +
            `    public move() {` +
            `        const column: IgxColumnComponent = this.grid1.columns[0];` +
            `        const column2: IgxColumnComponent = this.grid1.columns[1];` +
            `        this.grid1.moveColumn(col1, col2, DropPosition.None);` +
            `    }` +
            `}`;
        const expectedFileContent =
        `import { Component, Injectable, ViewChild } from "@angular/core";` +
        `import { IgxGridComponent, DropPosition } from "igniteui-angular";` +
        `import { IgxColumnComponent } from "igniteui-angular";\r\n` +
        `@Component({` +
        `    providers: [RemoteService]` +
        `})` +
        `export class GridSampleComponent {` +
        `    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;` +
        `    public move() {` +
        `        const column: IgxColumnComponent = this.grid1.columns[0];` +
        `        const column2: IgxColumnComponent = this.grid1.columns[1];` +
        `        this.grid1.moveColumn(col1, col2, DropPosition.AfterDropTarget);` +
        `    }` +
        `}`;
        appTree.create(
            '/testSrc/appPrefix/component/drop.component.ts',
            origFileContent);

        const tree = schematicRunner.runSchematic('migration-16', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/drop.component.ts'))
            .toEqual(expectedFileContent);
        done();
    });
});
