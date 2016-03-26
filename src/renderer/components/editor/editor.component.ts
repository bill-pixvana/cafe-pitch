import {Component, ElementRef, Output, EventEmitter} from 'angular2/core';
import * as _ from 'lodash';

@Component({
  selector: 'editor',
  template: `
    <div class="editor" (click)="handleClickEditor()">
      <div class="editor-line-no">
        <div *ngFor="#lineNumber of enteredLineNumbers">
          {{lineNumber}}
        </div>
      </div>
      <div class="editor-contents" contenteditable=true (input)="handleChangeContents()" (keyup)="getSelectedLineNo()" (mouseup)="getSelectedLineNo">{{text}}</div>
    </div>
  `,
  styles: [`
    .editor {
      height: 100%;
      color: #BBB;
      cursor: text;
      display: flex;
      line-height: 24px;
      overflow-y: scroll;
    }
    .editor::-webkit-scrollbar {
      display: none;
    }
    .editor-line-no {
      margin: 9px;
      width: 12px;
      div { height: 24px; }
    }
    .editor-contents {
      margin: 8px;
      outline: 0;
      width: 100%;
    }
    `
  ],
  inputs: ['text']
})
export class Editor {
  @Output('changeText') changeText = new EventEmitter();
  @Output('changeSelectedLineNo') changeSelectedLineNo = new EventEmitter();
  private enteredLineNumbers = [1];

  constructor(private el: ElementRef) { }

  private handleClickEditor() {
    this.el.nativeElement.querySelector('.editor-contents').focus();
  }

  private handleChangeContents(ev: MouseEvent) {
    // +2 because 1 origin + next line
    const lines = this.el.nativeElement.querySelectorAll('.editor-contents div');
    this.enteredLineNumbers = _.range(1, lines.length + 2);
    const text = this.el.nativeElement.querySelector('.editor-contents').innerText;
    this.changeText.emit(text);
  }

  private getSelectedLineNo() {
    let isFound = false;
    const findIndex = (nodes: Element[], target: Node, memo: number = 1): number => {
      _.each(nodes, (node: HTMLElement, index: number) => {
        if (isFound) return;
        const childDivs = _.filter(node.children, (child:HTMLElement) => child.nodeName === 'DIV');
        if (node === target) {
          isFound = true;
        } else if (childDivs.length > 0) {
          memo = findIndex(childDivs, target, memo);
        } else {
          ++memo;
        }
      });
      return memo;
    };

    const selectedNode = window.getSelection().anchorNode;
    const selectedLineDiv: Node = selectedNode.nodeName === '#text' ? selectedNode.parentElement : selectedNode;
    const contents = this.el.nativeElement.querySelector('.editor-contents');
    let selectedLineNo: number = contents === selectedLineDiv ? 1 : findIndex(contents.children, selectedLineDiv);
    this.changeSelectedLineNo.emit(selectedLineNo);
  }
}
